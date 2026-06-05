import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { unzipSync } from "fflate";
import {
  DEFAULT_FACTORY_SOURCE,
  EXIT_CODES,
  FACTORY_TAG_PREFIX,
  FORBIDDEN_PRODUCT_PATHS,
  INSTALLER_VERSION
} from "./constants.js";
import {
  createRunState,
  getLocalFactorySource,
  type LocalInitResult,
  runPreparedInstall,
  type RunState,
  type SourceMetadata
} from "./local-init.js";
import {
  ensureParentDirectory,
  pathExists,
  readJsonFile,
  resolveInside,
  writeJsonFile,
  writeTextFile
} from "./fs-utils.js";

interface GitHubAsset {
  name: string;
  browser_download_url?: string;
  url?: string;
}

interface GitHubRelease {
  tag_name: string;
  prerelease?: boolean;
  assets?: GitHubAsset[];
}

interface BundleManifest {
  schemaVersion?: string;
  factoryVersion?: string;
  factoryProfile?: string;
  generatedProductCode?: boolean;
  sourceCommit?: string;
  requiredCliVersion?: string;
  releaseChannel?: string;
  prerelease?: boolean;
  bundle?: {
    assetName?: string;
    sha256?: string;
  };
}

interface CachedBundleEntry {
  schemaVersion: "1.0.0";
  source: string;
  tag: string;
  version: string;
  assetName: string;
  manifestName: string;
  checksumsName: string;
  zipSha256: string;
  manifestSha256: string;
  checksumsSha256: string;
}

interface BundleAssets {
  assetName: string;
  manifestName: string;
  checksumsName: string;
  zipPath: string;
  manifestPath: string;
  checksumsPath: string;
  cacheHit: boolean;
}

interface VerificationResult {
  manifest: BundleManifest;
  zipSha256: string;
  manifestSha256: string;
  checksumsSha256: string;
}

export interface RemoteInitRequest {
  targetDir: string;
  verbose: boolean;
  source?: string;
  factoryVersion: string;
  allowPrerelease: boolean;
}

export function isValidFactoryVersion(input: string): boolean {
  const version = input.startsWith("v") ? input.slice(1) : input;
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version);
}

const MAX_ZIP_BYTES = 25 * 1024 * 1024;
const MAX_UNZIPPED_BYTES = 100 * 1024 * 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 2000;

export async function runRemoteInit(request: RemoteInitRequest): Promise<LocalInitResult> {
  const version = normalizeVersion(request.factoryVersion);
  const source = request.source ?? DEFAULT_FACTORY_SOURCE;
  const tag = `${FACTORY_TAG_PREFIX}${version}`;
  const authMode: SourceMetadata["authMode"] = process.env.GITHUB_TOKEN ? "github-token" : "none";
  const baseMetadata: SourceMetadata = {
    sourceType: "github-release",
    source,
    version,
    tag,
    authMode
  };

  const state = await createRunState(request.targetDir, getLocalFactorySource(), baseMetadata);
  await mkdir(state.reportDirAbsolute, { recursive: true });
  await writeRemotePreflightReport(state, request);

  try {
    if (isPrereleaseVersion(version) && !request.allowPrerelease) {
      await writeCompatibilityReport(
        state,
        "fail",
        "Prerelease factory versions require --allow-prerelease."
      );
      await writeRemoteFailureReport(state, EXIT_CODES.compatibilityFailed, "Prerelease version was blocked.");
      return remoteFailureResult(
        state,
        EXIT_CODES.compatibilityFailed,
        "Failure class: prerelease_not_allowed"
      );
    }

    const cache = await tryLoadCachedBundle(state, source, tag, version);
    let assets: BundleAssets;

    if (cache) {
      assets = cache;
      await writeSourceResolutionReport(state, "resolved", "cache-hit", null);
      await writeDownloadReport(state, "skipped-cache", assets, null);
      await writeCacheReport(state, "hit", assets);
    } else {
      await writeCacheReport(state, "miss", null);
      const release = await resolveRelease(state, source, tag);
      await writeSourceResolutionReport(state, "resolved", "github-release", release);
      assets = await downloadReleaseAssets(state, source, version, release);
      await writeDownloadReport(state, "downloaded", assets, null);
    }

    const verification = await verifyBundleAssets(state, assets, version);
    const compatible = checkRequiredCliVersion(verification.manifest.requiredCliVersion);

    if (!compatible.ok) {
      await writeCompatibilityReport(state, "fail", compatible.message);
      await writeRemoteFailureReport(state, EXIT_CODES.compatibilityFailed, compatible.message);
      return remoteFailureResult(state, EXIT_CODES.compatibilityFailed, "Failure class: incompatible_cli");
    }

    if ((verification.manifest.prerelease === true || verification.manifest.releaseChannel === "prerelease") && !request.allowPrerelease) {
      await writeCompatibilityReport(
        state,
        "fail",
        "Bundle manifest marks this factory as prerelease and --allow-prerelease was not provided."
      );
      await writeRemoteFailureReport(state, EXIT_CODES.compatibilityFailed, "Prerelease bundle was blocked.");
      return remoteFailureResult(
        state,
        EXIT_CODES.compatibilityFailed,
        "Failure class: prerelease_manifest_not_allowed"
      );
    }

    await writeCompatibilityReport(state, "pass", compatible.message);

    const stagingGridworkDir = await extractBundleToStaging(state, assets.zipPath);

    if (!assets.cacheHit) {
      await saveBundleToCache(state, source, tag, version, assets, verification);
    }

    state.sourceDir = stagingGridworkDir;
    state.sourceMetadata = {
      ...state.sourceMetadata,
      version,
      assetName: assets.assetName,
      releaseChannel: verification.manifest.releaseChannel ?? "stable",
      prerelease: verification.manifest.prerelease ?? false,
      sha256: verification.zipSha256,
      sourceCommit: verification.manifest.sourceCommit,
      bundleManifestHash: verification.manifestSha256,
      requiredCliVersion: verification.manifest.requiredCliVersion
    };

    return runPreparedInstall(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remote init failed.";
    const code =
      error instanceof BundleVerificationError
        ? EXIT_CODES.bundleVerificationFailed
        : EXIT_CODES.sourceResolutionFailed;
    const failureClass =
      error instanceof BundleVerificationError
        ? "Failure class: bundle_verification_failed"
        : "Failure class: source_resolution_failed";

    if (!(error instanceof BundleVerificationError)) {
      await writeSourceResolutionReport(state, "failed", "github-release", null);
      await writeDownloadReport(state, "failed", null, message);
    }

    await writeRemoteFailureReport(state, code, message);
    return remoteFailureResult(state, code, failureClass);
  }
}

async function resolveRelease(state: RunState, source: string, tag: string): Promise<GitHubRelease> {
  const apiBase = process.env.GRIDWORK_GITHUB_API_BASE_URL ?? "https://api.github.com";
  const url = `${apiBase.replace(/\/$/, "")}/repos/${source}/releases/tags/${tag}`;
  const response = await fetch(url, {
    headers: githubHeaders()
  });

  if (!response.ok) {
    throw new Error(`Could not resolve GitHub release ${source}@${tag}: HTTP ${response.status}`);
  }

  const release = (await response.json()) as GitHubRelease;

  if (release.tag_name !== tag) {
    throw new Error(`Resolved release tag mismatch: expected ${tag}, got ${release.tag_name}`);
  }

  if (release.prerelease === true) {
    state.sourceMetadata = {
      ...state.sourceMetadata,
      prerelease: true,
      releaseChannel: "prerelease"
    };
  }

  return release;
}

async function downloadReleaseAssets(
  state: RunState,
  source: string,
  version: string,
  release: GitHubRelease
): Promise<BundleAssets> {
  const expectedBaseName = `gridwork-factory-v${version}`;
  const expectedZipName = `${expectedBaseName}.zip`;
  const expectedManifestName = `${expectedBaseName}.manifest.json`;
  const expectedChecksumsName = `${expectedBaseName}.sha256`;
  const assets = release.assets ?? [];

  const zipAsset = findAsset(assets, expectedZipName);
  const manifestAsset = findAsset(assets, expectedManifestName);
  const checksumsAsset = findAsset(assets, expectedChecksumsName);

  if (!zipAsset || !manifestAsset || !checksumsAsset) {
    throw new Error(`Release ${source}@${release.tag_name} is missing required Gridwork factory assets.`);
  }

  const downloadDir = resolve(state.reportDirAbsolute, "downloads");
  await mkdir(downloadDir, { recursive: true });

  const zipPath = resolveInside(downloadDir, expectedZipName);
  const manifestPath = resolveInside(downloadDir, expectedManifestName);
  const checksumsPath = resolveInside(downloadDir, expectedChecksumsName);

  await downloadAsset(zipAsset, zipPath);
  await downloadAsset(manifestAsset, manifestPath);
  await downloadAsset(checksumsAsset, checksumsPath);

  return {
    assetName: expectedZipName,
    manifestName: expectedManifestName,
    checksumsName: expectedChecksumsName,
    zipPath,
    manifestPath,
    checksumsPath,
    cacheHit: false
  };
}

function findAsset(assets: GitHubAsset[], name: string): GitHubAsset | null {
  return assets.find((asset) => asset.name === name) ?? null;
}

async function downloadAsset(asset: GitHubAsset, targetPath: string): Promise<void> {
  const url = asset.browser_download_url ?? asset.url;

  if (!url) {
    throw new Error(`Asset ${asset.name} does not include a download URL.`);
  }

  const response = await fetch(url, {
    headers: githubHeaders(asset.browser_download_url ? undefined : "application/octet-stream")
  });

  if (!response.ok) {
    throw new Error(`Could not download ${asset.name}: HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.byteLength > MAX_ZIP_BYTES && asset.name.endsWith(".zip")) {
    throw new Error(`Bundle zip exceeds maximum size: ${asset.name}`);
  }

  await ensureParentDirectory(targetPath);
  await writeFile(targetPath, bytes);
}

async function verifyBundleAssets(
  state: RunState,
  assets: BundleAssets,
  version: string
): Promise<VerificationResult> {
  const zipSha256 = await sha256Buffer(await readFile(assets.zipPath));
  const manifestBytes = await readFile(assets.manifestPath);
  const manifestSha256 = await sha256Buffer(manifestBytes);
  const checksumsSha256 = await sha256Buffer(await readFile(assets.checksumsPath));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as BundleManifest;
  const sums = parseSha256Sums(await readFile(assets.checksumsPath, "utf8"));

  const zipExpected = sums.get(assets.assetName);
  const manifestExpected = sums.get(assets.manifestName);
  const checksumProblems: string[] = [];

  if (!zipExpected || zipExpected !== zipSha256) {
    checksumProblems.push(`Checksum mismatch for ${assets.assetName}.`);
  }

  if (!manifestExpected || manifestExpected !== manifestSha256) {
    checksumProblems.push(`Checksum mismatch for ${assets.manifestName}.`);
  }

  if (manifest.factoryVersion !== version) {
    checksumProblems.push(`Manifest factoryVersion must be ${version}.`);
  }

  if (manifest.factoryProfile !== "minimal-mvp" && manifest.factoryProfile !== "full-v1") {
    checksumProblems.push("Manifest factoryProfile must be minimal-mvp or full-v1.");
  }

  if (manifest.generatedProductCode !== false) {
    checksumProblems.push("Manifest generatedProductCode must be false.");
  }

  if (manifest.bundle?.assetName && manifest.bundle.assetName !== assets.assetName) {
    checksumProblems.push("Manifest bundle assetName does not match downloaded zip.");
  }

  if (manifest.bundle?.sha256 && manifest.bundle.sha256 !== zipSha256) {
    checksumProblems.push("Manifest bundle sha256 does not match downloaded zip.");
  }

  if (checksumProblems.length > 0) {
    await writeChecksumReport(state, "fail", checksumProblems, {
      zipSha256,
      manifestSha256,
      checksumsSha256
    });
    await writeRemoteFailureReport(
      state,
      EXIT_CODES.bundleVerificationFailed,
      checksumProblems.join(" ")
    );
    throw new BundleVerificationError(checksumProblems.join(" "));
  }

  await writeChecksumReport(state, "pass", [], {
    zipSha256,
    manifestSha256,
    checksumsSha256
  });

  return {
    manifest,
    zipSha256,
    manifestSha256,
    checksumsSha256
  };
}

async function extractBundleToStaging(state: RunState, zipPath: string): Promise<string> {
  const zipBytes = await readFile(zipPath);

  if (zipBytes.byteLength > MAX_ZIP_BYTES) {
    throw new BundleVerificationError("Bundle zip exceeds maximum allowed size.");
  }

  const entries = unzipSync(new Uint8Array(zipBytes));
  const names = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const files = names.filter((name) => !name.endsWith("/"));
  let totalBytes = 0;
  const problems: string[] = [];

  if (files.length > MAX_FILE_COUNT) {
    problems.push(`Bundle contains too many files: ${files.length}.`);
  }

  for (const name of files) {
    const bytes = entries[name];
    totalBytes += bytes.byteLength;

    if (bytes.byteLength > MAX_FILE_BYTES) {
      problems.push(`Bundle file exceeds maximum size: ${name}.`);
    }

    const pathProblem = validateZipEntryName(name);

    if (pathProblem) {
      problems.push(pathProblem);
    }
  }

  if (totalBytes > MAX_UNZIPPED_BYTES) {
    problems.push("Bundle uncompressed size exceeds maximum allowed size.");
  }

  if (!files.includes(".gridwork/factory.json")) {
    problems.push("Bundle must include .gridwork/factory.json.");
  }

  if (problems.length > 0) {
    await writeBundleInspectionReport(state, "fail", problems, files.length, totalBytes);
    await writeRemoteFailureReport(state, EXIT_CODES.bundleVerificationFailed, problems.join(" "));
    throw new BundleVerificationError(problems.join(" "));
  }

  const stagingRoot = resolve(state.reportDirAbsolute, "staging");

  for (const name of files) {
    const bytes = entries[name];
    const targetPath = resolveInside(stagingRoot, name);
    await ensureParentDirectory(targetPath);
    await writeFile(targetPath, Buffer.from(bytes));
  }

  await writeBundleInspectionReport(state, "pass", [], files.length, totalBytes);
  return resolveInside(stagingRoot, ".gridwork");
}

function validateZipEntryName(name: string): string | null {
  if (name.includes("\\") || name.startsWith("/") || /^[A-Za-z]:/.test(name)) {
    return `Bundle entry path is not portable: ${name}`;
  }

  if (name.includes("//")) {
    return `Bundle entry path contains empty segments: ${name}`;
  }

  const segments = name.split("/");

  if (segments.some((segment) => segment === ".." || segment === "")) {
    return `Bundle entry path escapes staging root: ${name}`;
  }

  if (!name.startsWith(".gridwork/")) {
    return `Bundle entry must be under .gridwork/: ${name}`;
  }

  const insideGridwork = name.slice(".gridwork/".length);
  const forbiddenRoots = [".git", ".github", ".factory", "node_modules", ...FORBIDDEN_PRODUCT_PATHS];

  for (const forbidden of forbiddenRoots) {
    if (insideGridwork === forbidden || insideGridwork.startsWith(`${forbidden}/`)) {
      return `Bundle entry is forbidden inside .gridwork/: ${name}`;
    }
  }

  return null;
}

async function tryLoadCachedBundle(
  state: RunState,
  source: string,
  tag: string,
  version: string
): Promise<BundleAssets | null> {
  const cacheDir = bundleCacheDir(state, source, tag);
  const entryPath = resolve(cacheDir, "cache-entry.json");

  if (!(await pathExists(entryPath))) {
    return null;
  }

  try {
    const entry = await readJsonFile<CachedBundleEntry>(entryPath);

    if (entry.source !== source || entry.tag !== tag || entry.version !== version) {
      return null;
    }

    const zipPath = resolve(cacheDir, "bundle.zip");
    const manifestPath = resolve(cacheDir, "manifest.json");
    const checksumsPath = resolve(cacheDir, "checksums.sha256");

    if (
      !(await pathExists(zipPath)) ||
      !(await pathExists(manifestPath)) ||
      !(await pathExists(checksumsPath))
    ) {
      return null;
    }

    const zipSha = await sha256Buffer(await readFile(zipPath));
    const manifestSha = await sha256Buffer(await readFile(manifestPath));
    const checksumsSha = await sha256Buffer(await readFile(checksumsPath));

    if (
      zipSha !== entry.zipSha256 ||
      manifestSha !== entry.manifestSha256 ||
      checksumsSha !== entry.checksumsSha256
    ) {
      return null;
    }

    return {
      assetName: entry.assetName,
      manifestName: entry.manifestName,
      checksumsName: entry.checksumsName,
      zipPath,
      manifestPath,
      checksumsPath,
      cacheHit: true
    };
  } catch {
    return null;
  }
}

async function saveBundleToCache(
  state: RunState,
  source: string,
  tag: string,
  version: string,
  assets: BundleAssets,
  verification: VerificationResult
): Promise<void> {
  const cacheDir = bundleCacheDir(state, source, tag);
  await mkdir(cacheDir, { recursive: true });

  const zipPath = resolve(cacheDir, "bundle.zip");
  const manifestPath = resolve(cacheDir, "manifest.json");
  const checksumsPath = resolve(cacheDir, "checksums.sha256");

  await copyFile(assets.zipPath, zipPath);
  await copyFile(assets.manifestPath, manifestPath);
  await copyFile(assets.checksumsPath, checksumsPath);
  await writeJsonFile(resolve(cacheDir, "cache-entry.json"), {
    schemaVersion: "1.0.0",
    source,
    tag,
    version,
    assetName: assets.assetName,
    manifestName: assets.manifestName,
    checksumsName: assets.checksumsName,
    zipSha256: verification.zipSha256,
    manifestSha256: verification.manifestSha256,
    checksumsSha256: verification.checksumsSha256
  } satisfies CachedBundleEntry);
}

function bundleCacheDir(state: RunState, source: string, tag: string): string {
  return resolve(
    state.factoryDir,
    "cache",
    "bundles",
    "github-release",
    source.replaceAll("/", "__"),
    tag
  );
}

async function writeRemotePreflightReport(state: RunState, request: RemoteInitRequest): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/preflight.json`), {
    schemaVersion: "1.0.0",
    status: "pass",
    checks: [
      {
        id: "remote_init",
        severity: "info",
        message: "Using GitHub release factory source."
      },
      {
        id: "factory_version_requested",
        severity: "info",
        message: request.factoryVersion
      }
    ]
  });
}

async function writeSourceResolutionReport(
  state: RunState,
  status: "resolved" | "failed",
  mode: "github-release" | "cache-hit",
  release: GitHubRelease | null
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/source-resolution.json`), {
    schemaVersion: "1.0.0",
    status,
    sourceType: "github-release",
    source: state.sourceMetadata.source,
    tag: state.sourceMetadata.tag,
    mode,
    releaseTag: release?.tag_name ?? null
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/source-resolution.md`),
    [
      "# Source Resolution",
      "",
      "```text",
      `status = ${status}`,
      "source_type = github-release",
      `source = ${state.sourceMetadata.source}`,
      `tag = ${state.sourceMetadata.tag}`,
      `mode = ${mode}`,
      "```",
      ""
    ].join("\n")
  );
}

async function writeDownloadReport(
  state: RunState,
  status: "downloaded" | "skipped-cache" | "failed",
  assets: BundleAssets | null,
  error: string | null
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/download-report.json`), {
    schemaVersion: "1.0.0",
    status,
    assets: assets
      ? {
          zip: basename(assets.zipPath),
          manifest: basename(assets.manifestPath),
          checksums: basename(assets.checksumsPath),
          cacheHit: assets.cacheHit
        }
      : null,
    error
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/download-report.md`),
    [
      "# Download Report",
      "",
      "```text",
      `status = ${status}`,
      `zip = ${assets?.assetName ?? ""}`,
      `cache_hit = ${assets?.cacheHit ?? false}`,
      "```",
      "",
      error ? `Error: ${error}` : "",
      ""
    ].join("\n")
  );
}

async function writeChecksumReport(
  state: RunState,
  status: "pass" | "fail",
  problems: string[],
  hashes: {
    zipSha256: string;
    manifestSha256: string;
    checksumsSha256: string;
  }
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/checksum-report.json`), {
    schemaVersion: "1.0.0",
    status,
    hashes,
    problems
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/checksum-report.md`),
    [
      "# Checksum Report",
      "",
      `status = ${status}`,
      "",
      "| Artifact | SHA256 |",
      "|---|---|",
      `| bundle | ${hashes.zipSha256} |`,
      `| manifest | ${hashes.manifestSha256} |`,
      `| checksums | ${hashes.checksumsSha256} |`,
      "",
      ...problems.map((problem) => `- ${problem}`),
      ""
    ].join("\n")
  );
}

async function writeCompatibilityReport(
  state: RunState,
  status: "pass" | "fail",
  message: string
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/compatibility-report.json`), {
    schemaVersion: "1.0.0",
    status,
    installerVersion: INSTALLER_VERSION,
    message
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/compatibility-report.md`),
    [
      "# Compatibility Report",
      "",
      "```text",
      `status = ${status}`,
      `installer_version = ${INSTALLER_VERSION}`,
      "```",
      "",
      message,
      ""
    ].join("\n")
  );
}

async function writeBundleInspectionReport(
  state: RunState,
  status: "pass" | "fail",
  problems: string[],
  fileCount: number,
  totalBytes: number
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/bundle-inspection.json`), {
    schemaVersion: "1.0.0",
    status,
    fileCount,
    totalBytes,
    problems
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/bundle-inspection.md`),
    [
      "# Bundle Inspection",
      "",
      "```text",
      `status = ${status}`,
      `file_count = ${fileCount}`,
      `total_bytes = ${totalBytes}`,
      "```",
      "",
      ...problems.map((problem) => `- ${problem}`),
      ""
    ].join("\n")
  );
}

async function writeCacheReport(
  state: RunState,
  status: "hit" | "miss",
  assets: BundleAssets | null
): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/cache-report.json`), {
    schemaVersion: "1.0.0",
    status,
    source: state.sourceMetadata.source,
    tag: state.sourceMetadata.tag,
    assetName: assets?.assetName ?? null
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/cache-report.md`),
    [
      "# Cache Report",
      "",
      "```text",
      `status = ${status}`,
      `source = ${state.sourceMetadata.source}`,
      `tag = ${state.sourceMetadata.tag}`,
      `asset = ${assets?.assetName ?? ""}`,
      "```",
      ""
    ].join("\n")
  );
}

async function writeRemoteFailureReport(state: RunState, code: number, message: string): Promise<void> {
  await writeTextFile(
    resolve(state.targetDir, state.reportPath),
    [
      "# Init Report",
      "",
      "```text",
      `init_run_id = ${state.runId}`,
      "status = failed",
      "factory_profile = unknown",
      "source_type = github-release",
      `exit_code = ${code}`,
      "```",
      "",
      message,
      ""
    ].join("\n")
  );
}

function remoteFailureResult(state: RunState, code: number, verboseLine: string): LocalInitResult {
  return {
    code,
    status: "failed",
    reportDir: state.reportDir,
    reportPath: state.reportPath,
    sourceSummary: `github-release:${state.sourceMetadata.source}@${state.sourceMetadata.tag}`,
    conflicts: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    validationErrors: 0,
    factoryProfile: "unknown",
    verboseLines: [verboseLine]
  };
}

function parseSha256Sums(content: string): Map<string, string> {
  const sums = new Map<string, string>();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(?:sha256:)?([a-fA-F0-9]{64})\s+\*?(.+)$/);

    if (!match) {
      continue;
    }

    sums.set(match[2].trim(), `sha256:${match[1].toLowerCase()}`);
  }

  return sums;
}

async function sha256Buffer(buffer: Buffer): Promise<string> {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

function normalizeVersion(input: string): string {
  const version = input.startsWith("v") ? input.slice(1) : input;

  if (!isValidFactoryVersion(input)) {
    throw new Error(`Invalid factory version: ${input}`);
  }

  return version;
}

function isPrereleaseVersion(version: string): boolean {
  return version.includes("-");
}

function checkRequiredCliVersion(requiredCliVersion: string | undefined): { ok: boolean; message: string } {
  if (!requiredCliVersion) {
    return {
      ok: true,
      message: "No requiredCliVersion was declared by the bundle manifest."
    };
  }

  const match = requiredCliVersion.match(/^>=(\d+\.\d+\.\d+)$/);

  if (!match) {
    return {
      ok: false,
      message: `Unsupported requiredCliVersion expression: ${requiredCliVersion}`
    };
  }

  if (compareVersions(INSTALLER_VERSION, match[1]) < 0) {
    return {
      ok: false,
      message: `Gridwork CLI ${INSTALLER_VERSION} does not satisfy ${requiredCliVersion}.`
    };
  }

  return {
    ok: true,
    message: `Gridwork CLI ${INSTALLER_VERSION} satisfies ${requiredCliVersion}.`
  };
}

function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number.parseInt(part, 10));
  const rightParts = right.split(".").map((part) => Number.parseInt(part, 10));

  for (let index = 0; index < 3; index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function githubHeaders(accept?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "gridwork-cli",
    Accept: accept ?? "application/vnd.github+json"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

class BundleVerificationError extends Error {}
