import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { zipSync } from "fflate";
import {
  FACTORY_TAG_PREFIX,
  FORBIDDEN_PRODUCT_PATHS,
  INSTALLER_VERSION,
  PLACEHOLDER_FACTORY_SOURCE
} from "../init/constants.js";
import {
  ensureParentDirectory,
  listFiles,
  pathExists,
  readJsonFile,
  resolveInside,
  writeJsonFile,
  writeTextFile
} from "../init/fs-utils.js";
import { validateMinimalFactory } from "../init/local-init.js";
import { isValidFactoryVersion } from "../init/remote-init.js";

interface FactoryManifest {
  id: string;
  version: string;
  schemaVersion: string;
  factoryProfile: string;
  generatedProductCode: boolean;
}

interface ValidationEntry {
  id: string;
  severity: "info" | "error";
  message: string;
  blocking: boolean;
}

interface ReleaseAssetNames {
  zip: string;
  manifest: string;
  checksums: string;
  releaseNotes: string;
}

export interface FactoryReleaseDryRunOptions {
  targetDir: string;
  factoryDir: string;
  version: string;
  source: string;
  sourceCommit?: string;
  allowPrerelease: boolean;
}

export interface FactoryReleaseDryRunResult {
  code: number;
  status: "prepared" | "blocked";
  runId: string;
  artifactsDir: string;
  tag: string;
  assetNames: ReleaseAssetNames;
  blockers: string[];
  warnings: string[];
}

const RELEASE_MODE = "manual_gh_release";

export async function prepareFactoryReleaseDryRun(
  options: FactoryReleaseDryRunOptions
): Promise<FactoryReleaseDryRunResult> {
  const version = normalizeVersion(options.version);
  const prerelease = isPrereleaseVersion(version);
  const releaseChannel = prerelease ? "prerelease" : "stable";
  const tag = `${FACTORY_TAG_PREFIX}${version}`;
  const assetBase = `gridwork-factory-v${version}`;
  const assetNames = {
    zip: `${assetBase}.zip`,
    manifest: `${assetBase}.manifest.json`,
    checksums: `${assetBase}.sha256`,
    releaseNotes: `${assetBase}.release-notes.md`
  };
  const runId = await createReleaseRunId(resolve(options.targetDir, ".factory", "runs"));
  const artifactsDir = `.factory/runs/${runId}/artifacts/release`;
  const artifactsDirAbsolute = resolve(options.targetDir, artifactsDir);
  const factoryDir = resolve(options.targetDir, options.factoryDir);
  const validation: ValidationEntry[] = [];

  await mkdir(artifactsDirAbsolute, { recursive: true });

  const sourceCommit = options.sourceCommit ?? (await detectGitCommit(options.targetDir));

  validateReleaseInputs({
    source: options.source,
    sourceCommit,
    prerelease,
    allowPrerelease: options.allowPrerelease,
    validation
  });

  if (!(await pathExists(factoryDir))) {
    validation.push({
      id: "factory_dir_exists",
      severity: "error",
      message: `Factory source does not exist: ${options.factoryDir}`,
      blocking: true
    });
  }

  const minimalValidation = await validateMinimalFactory(factoryDir);
  for (const result of minimalValidation.results) {
    validation.push({
      id: `minimal_${result.id}`,
      severity: result.blocking ? "error" : "info",
      message: `${result.target}: ${result.message}`,
      blocking: result.blocking
    });
  }

  const manifest = await readJsonFile<FactoryManifest>(resolveInside(factoryDir, "factory.json"));
  const sourceFiles = await listFiles(factoryDir);
  const pathProblems = validateFactoryPaths(sourceFiles);

  for (const problem of pathProblems) {
    validation.push({
      id: "bundle_path_safety",
      severity: "error",
      message: problem,
      blocking: true
    });
  }

  const zipBytes = await createFactoryZip(factoryDir, sourceFiles);
  const zipPath = resolveInside(artifactsDirAbsolute, assetNames.zip);
  await writeFile(zipPath, zipBytes);
  const zipSha256 = sha256(zipBytes);

  const releaseNotes = createReleaseNotes({
    version,
    tag,
    releaseChannel,
    prerelease,
    source: options.source,
    sourceCommit,
    factoryProfile: manifest.factoryProfile
  });
  const releaseNotesPath = resolveInside(artifactsDirAbsolute, assetNames.releaseNotes);
  await writeTextFile(releaseNotesPath, releaseNotes);
  const releaseNotesSha256 = sha256(Buffer.from(releaseNotes, "utf8"));

  const releaseManifest = {
    schemaVersion: "1.0.0",
    bundleFormat: "gridwork-factory-zip",
    factoryId: manifest.id,
    factoryVersion: version,
    factoryProfile: manifest.factoryProfile,
    generatedProductCode: manifest.generatedProductCode,
    releaseChannel,
    prerelease,
    source: options.source,
    sourceCommit,
    sourceTag: tag,
    releaseMode: RELEASE_MODE,
    assetName: assetNames.zip,
    requiredCliVersion: `>=${INSTALLER_VERSION}`,
    compatibleSchemaVersions: [manifest.schemaVersion],
    bundle: {
      assetName: assetNames.zip,
      sha256: zipSha256,
      root: ".gridwork/",
      fileCount: sourceFiles.length
    },
    assets: {
      zip: assetNames.zip,
      manifest: assetNames.manifest,
      checksums: assetNames.checksums,
      releaseNotes: assetNames.releaseNotes
    }
  };
  const manifestContent = `${JSON.stringify(releaseManifest, null, 2)}\n`;
  const manifestPath = resolveInside(artifactsDirAbsolute, assetNames.manifest);
  await writeTextFile(manifestPath, manifestContent);
  const manifestSha256 = sha256(Buffer.from(manifestContent, "utf8"));

  const checksumsContent = [
    `${zipSha256.slice("sha256:".length)}  ${assetNames.zip}`,
    `${manifestSha256.slice("sha256:".length)}  ${assetNames.manifest}`,
    `${releaseNotesSha256.slice("sha256:".length)}  ${assetNames.releaseNotes}`,
    ""
  ].join("\n");
  await writeTextFile(resolveInside(artifactsDirAbsolute, assetNames.checksums), checksumsContent);

  await writeBundleInventory(artifactsDirAbsolute, sourceFiles);
  await writeReleasePlan(artifactsDirAbsolute, {
    version,
    tag,
    source: options.source,
    sourceCommit,
    releaseChannel,
    prerelease,
    artifactsDir,
    assetNames
  });
  await writePublishCommands(artifactsDirAbsolute, {
    tag,
    source: options.source,
    prerelease,
    assetNames
  });

  const blockers = validation.filter((entry) => entry.blocking).map((entry) => entry.message);
  const warnings = sourceCommit === "unknown-dry-run" ? ["Source commit could not be detected."] : [];

  await writeValidationReports(artifactsDirAbsolute, validation, blockers, warnings);

  return {
    code: blockers.length > 0 ? 1 : 0,
    status: blockers.length > 0 ? "blocked" : "prepared",
    runId,
    artifactsDir,
    tag,
    assetNames,
    blockers,
    warnings
  };
}

export function formatFactoryReleaseDryRunResult(result: FactoryReleaseDryRunResult): string {
  const headline =
    result.status === "prepared"
      ? "Gridwork factory release dry-run prepared."
      : "Gridwork factory release dry-run blocked.";
  const lines = [
    headline,
    "",
    `Tag: ${result.tag}`,
    `Artifacts: ${result.artifactsDir}`,
    `Bundle: ${result.assetNames.zip}`,
    `Manifest: ${result.assetNames.manifest}`,
    `Checksums: ${result.assetNames.checksums}`,
    "Publish: not executed",
    "",
    "Next gate:",
    "Review publish-commands.md and approve explicitly before any remote command is executed."
  ];

  if (result.blockers.length > 0) {
    lines.push("", "Blockers:", ...result.blockers.map((blocker) => `- ${blocker}`));
  }

  if (result.warnings.length > 0) {
    lines.push("", "Warnings:", ...result.warnings.map((warning) => `- ${warning}`));
  }

  return lines.join("\n");
}

function validateReleaseInputs(input: {
  source: string;
  sourceCommit: string;
  prerelease: boolean;
  allowPrerelease: boolean;
  validation: ValidationEntry[];
}): void {
  if (input.source === PLACEHOLDER_FACTORY_SOURCE) {
    input.validation.push({
      id: "source_not_placeholder",
      severity: "error",
      message: "Release publish plan is blocked while source is the default placeholder.",
      blocking: true
    });
  }

  if (input.prerelease && !input.allowPrerelease) {
    input.validation.push({
      id: "prerelease_requires_approval",
      severity: "error",
      message: "Prerelease versions require --allow-prerelease.",
      blocking: true
    });
  }

  if (!input.sourceCommit || input.sourceCommit === "unknown-dry-run") {
    input.validation.push({
      id: "source_commit_known",
      severity: "error",
      message: "Source commit must be known before publishing a factory release.",
      blocking: true
    });
  }
}

function validateFactoryPaths(files: string[]): string[] {
  const problems: string[] = [];
  const forbiddenRoots = [
    ".factory",
    ".git",
    ".github",
    "node_modules",
    ".docs",
    "packages",
    "dist",
    "coverage",
    ...FORBIDDEN_PRODUCT_PATHS
  ];

  for (const file of files) {
    if (file.includes("\\") || file.startsWith("/") || /^[A-Za-z]:/.test(file)) {
      problems.push(`Factory path is not portable: ${file}`);
      continue;
    }

    const segments = file.split("/");

    if (segments.some((segment) => segment === ".." || segment === "")) {
      problems.push(`Factory path is unsafe: ${file}`);
      continue;
    }

    for (const forbidden of forbiddenRoots) {
      if (file === forbidden || file.startsWith(`${forbidden}/`)) {
        problems.push(`Factory path is forbidden in release bundle: ${file}`);
      }
    }

    if (segments.some((segment) => segment === ".env" || segment.endsWith(".pem") || segment.endsWith(".key"))) {
      problems.push(`Factory path looks like a secret and cannot be bundled: ${file}`);
    }
  }

  return problems;
}

async function createFactoryZip(factoryDir: string, files: string[]): Promise<Buffer> {
  const entries: Record<string, Uint8Array> = {};

  for (const file of files) {
    const sourcePath = resolveInside(factoryDir, file);
    entries[`.gridwork/${file}`] = new Uint8Array(await readFile(sourcePath));
  }

  return Buffer.from(zipSync(entries, { level: 9 }));
}

async function writeBundleInventory(artifactsDir: string, files: string[]): Promise<void> {
  const rows = files.map((file) => `| .gridwork/${file} |`);
  await writeTextFile(
    resolve(artifactsDir, "factory-bundle-inventory.md"),
    [
      "# Factory Bundle Inventory",
      "",
      "| Path |",
      "|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

async function writeReleasePlan(
  artifactsDir: string,
  input: {
    version: string;
    tag: string;
    source: string;
    sourceCommit: string;
    releaseChannel: string;
    prerelease: boolean;
    artifactsDir: string;
    assetNames: ReleaseAssetNames;
  }
): Promise<void> {
  await writeTextFile(
    resolve(artifactsDir, "factory-release-plan.md"),
    [
      "# Factory Release Plan",
      "",
      "```text",
      `version = ${input.version}`,
      `tag = ${input.tag}`,
      `source = ${input.source}`,
      `source_commit = ${input.sourceCommit}`,
      `release_channel = ${input.releaseChannel}`,
      `prerelease = ${input.prerelease}`,
      `release_mode = ${RELEASE_MODE}`,
      `artifacts = ${input.artifactsDir}`,
      "publish = not_executed",
      "```",
      "",
      "## Assets",
      "",
      `- ${input.assetNames.zip}`,
      `- ${input.assetNames.manifest}`,
      `- ${input.assetNames.checksums}`,
      `- ${input.assetNames.releaseNotes}`,
      "",
      "## Approval Gate",
      "",
      "Remote commands require explicit human approval.",
      ""
    ].join("\n")
  );
}

async function writePublishCommands(
  artifactsDir: string,
  input: {
    tag: string;
    source: string;
    prerelease: boolean;
    assetNames: ReleaseAssetNames;
  }
): Promise<void> {
  const prereleaseFlag = input.prerelease ? " --prerelease" : "";
  const releaseCreate = [
    "gh release create",
    input.tag,
    input.assetNames.zip,
    input.assetNames.manifest,
    input.assetNames.checksums,
    input.assetNames.releaseNotes,
    `--repo ${input.source}`,
    `--notes-file ${input.assetNames.releaseNotes}${prereleaseFlag}`
  ].join(" ");

  await writeTextFile(
    resolve(artifactsDir, "publish-commands.md"),
    [
      "# Publish Commands",
      "",
      "These commands are prepared only. They were not executed.",
      "",
      "```bash",
      `git tag ${input.tag}`,
      `git push origin ${input.tag}`,
      releaseCreate,
      `gh release view ${input.tag} --repo ${input.source}`,
      "```",
      "",
      "## Approval Gates",
      "",
      "- `git tag` requires explicit approval.",
      "- `git push` requires explicit approval.",
      "- `gh release create` requires explicit approval.",
      "- Asset upload requires explicit approval.",
      ""
    ].join("\n")
  );
}

async function writeValidationReports(
  artifactsDir: string,
  validation: ValidationEntry[],
  blockers: string[],
  warnings: string[]
): Promise<void> {
  const status = blockers.length > 0 ? "blocked" : "pass";
  await writeJsonFile(resolve(artifactsDir, "factory-release-validation.json"), {
    schemaVersion: "1.0.0",
    status,
    blockers,
    warnings,
    results: validation
  });

  const rows = validation.map((entry) =>
    `| ${entry.id} | ${entry.severity} | ${entry.blocking} | ${entry.message} |`
  );
  await writeTextFile(
    resolve(artifactsDir, "factory-release-validation.md"),
    [
      "# Factory Release Validation",
      "",
      `status = ${status}`,
      "",
      "| ID | Severity | Blocking | Message |",
      "|---|---|---|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

function createReleaseNotes(input: {
  version: string;
  tag: string;
  releaseChannel: string;
  prerelease: boolean;
  source: string;
  sourceCommit: string;
  factoryProfile: string;
}): string {
  return [
    `# Gridwork Factory ${input.version}`,
    "",
    "```text",
    `tag = ${input.tag}`,
    `source = ${input.source}`,
    `source_commit = ${input.sourceCommit}`,
    `factory_profile = ${input.factoryProfile}`,
    `release_channel = ${input.releaseChannel}`,
    `prerelease = ${input.prerelease}`,
    "```",
    "",
    "## Install",
    "",
    "```bash",
    `npx gridwork init --factory-version ${input.version} --source ${input.source}`,
    "```",
    "",
    "## Notes",
    "",
    "- Dry-run generated release notes.",
    "- Review generated assets before publishing.",
    ""
  ].join("\n");
}

async function createReleaseRunId(runsRoot: string): Promise<string> {
  const now = new Date();
  const base = [
    now.getFullYear().toString().padStart(4, "0"),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
    "-",
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
    "-factory-release"
  ].join("");

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index.toString().padStart(2, "0")}`;
    if (!(await pathExists(resolve(runsRoot, candidate)))) {
      return candidate;
    }
  }

  return `${base}-overflow`;
}

async function detectGitCommit(targetDir: string): Promise<string> {
  try {
    const { stdout } = await promisify(execFile)("git", ["rev-parse", "HEAD"], {
      cwd: targetDir
    });
    return stdout.trim() || "unknown-dry-run";
  } catch {
    return "unknown-dry-run";
  }
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

function sha256(buffer: Buffer): string {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

export function relativePathFromTarget(targetDir: string, absolutePath: string): string {
  return relative(targetDir, absolutePath).split(sep).join("/");
}
