import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import {
  DEFAULT_FACTORY_SOURCE,
  EXIT_CODES,
  INSTALLER_PACKAGE_NAME
} from "../init/constants.js";
import {
  listFiles,
  pathExists,
  readJsonFile,
  writeJsonFile,
  writeTextFile
} from "../init/fs-utils.js";
import { isValidFactoryVersion } from "../init/remote-init.js";

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  type?: string;
  bin?: Record<string, string>;
  files?: string[];
  scripts?: Record<string, string>;
}

interface ValidationEntry {
  id: string;
  severity: "info" | "error";
  message: string;
  blocking: boolean;
}

export interface CliReleaseDryRunOptions {
  targetDir: string;
  source: string;
  sourceCommit?: string;
  confirmPackageOwnership: boolean;
  confirmOfficialSource: boolean;
  allowPrerelease: boolean;
}

export interface CliReleaseDryRunResult {
  code: number;
  status: "prepared" | "blocked";
  runId: string;
  artifactsDir: string;
  tag: string;
  version: string;
  distTag: "latest" | "next";
  blockers: string[];
  warnings: string[];
}

const CLI_TAG_PREFIX = "cli-v";
const PACKAGE_DIR = "packages/cli";
const LIFECYCLE_SCRIPTS = ["preinstall", "install", "postinstall"];
const FORBIDDEN_PACKAGE_PATHS = [
  ".factory/",
  ".docs/",
  "factory/",
  "test/",
  "node_modules/",
  "src/",
  ".git/",
  ".github/"
];

export async function prepareCliReleaseDryRun(
  options: CliReleaseDryRunOptions
): Promise<CliReleaseDryRunResult> {
  const packageDir = resolve(options.targetDir, PACKAGE_DIR);
  const packageJsonPath = resolve(packageDir, "package.json");
  const packageJson = await readJsonFile<PackageJson>(packageJsonPath);
  const version = normalizeVersion(packageJson.version);
  const prerelease = isPrereleaseVersion(version);
  const distTag = prerelease ? "next" : "latest";
  const tag = `${CLI_TAG_PREFIX}${version}`;
  const runId = await createReleaseRunId(resolve(options.targetDir, ".factory", "runs"));
  const artifactsDir = `.factory/runs/${runId}/artifacts/release`;
  const artifactsDirAbsolute = resolve(options.targetDir, artifactsDir);
  const validation: ValidationEntry[] = [];
  const sourceCommit = options.sourceCommit ?? (await detectGitCommit(options.targetDir));

  await mkdir(artifactsDirAbsolute, { recursive: true });

  validateInputs({
    options,
    sourceCommit,
    prerelease,
    validation
  });
  validatePackageJson(packageJson, validation);

  const predictedFiles = await predictedPackageFiles(packageDir, packageJson, validation);
  validatePackageFiles(predictedFiles, validation);

  const blockers = validation.filter((entry) => entry.blocking).map((entry) => entry.message);
  const warnings = sourceCommit === "unknown-dry-run" ? ["Source commit could not be detected."] : [];

  await writeCliReleasePlan(artifactsDirAbsolute, {
    packageName: packageJson.name,
    version,
    tag,
    distTag,
    source: options.source,
    sourceCommit,
    artifactsDir
  });
  await writeCliReleaseNotes(artifactsDirAbsolute, {
    packageName: packageJson.name,
    version,
    tag,
    distTag,
    source: options.source,
    sourceCommit
  });
  await writeCliPackReport(artifactsDirAbsolute, {
    packageName: packageJson.name,
    version,
    predictedFiles
  });
  await writeCliPublishCommands(artifactsDirAbsolute, {
    tag,
    packageName: packageJson.name,
    distTag
  });
  await writeCliValidationReports(artifactsDirAbsolute, validation, blockers, warnings);

  return {
    code: blockers.length > 0 ? 1 : EXIT_CODES.success,
    status: blockers.length > 0 ? "blocked" : "prepared",
    runId,
    artifactsDir,
    tag,
    version,
    distTag,
    blockers,
    warnings
  };
}

export function formatCliReleaseDryRunResult(result: CliReleaseDryRunResult): string {
  const headline =
    result.status === "prepared"
      ? "Gridwork CLI release dry-run prepared."
      : "Gridwork CLI release dry-run blocked.";
  const lines = [
    headline,
    "",
    `Tag: ${result.tag}`,
    `Version: ${result.version}`,
    `Dist tag: ${result.distTag}`,
    `Artifacts: ${result.artifactsDir}`,
    "Publish: not executed",
    "",
    "Next gate:",
    "Review cli-publish-commands.md and approve explicitly before creating or pushing the tag."
  ];

  if (result.blockers.length > 0) {
    lines.push("", "Blockers:", ...result.blockers.map((blocker) => `- ${blocker}`));
  }

  if (result.warnings.length > 0) {
    lines.push("", "Warnings:", ...result.warnings.map((warning) => `- ${warning}`));
  }

  return lines.join("\n");
}

function validateInputs(input: {
  options: CliReleaseDryRunOptions;
  sourceCommit: string;
  prerelease: boolean;
  validation: ValidationEntry[];
}): void {
  if (!input.options.confirmPackageOwnership) {
    input.validation.push({
      id: "package_ownership_confirmed",
      severity: "error",
      message: "Package ownership must be confirmed before a CLI release can be published.",
      blocking: true
    });
  }

  if (!input.options.confirmOfficialSource) {
    input.validation.push({
      id: "official_source_confirmed",
      severity: "error",
      message: "Official factory source must be confirmed before a CLI release can be published.",
      blocking: true
    });
  }

  if (input.options.source === DEFAULT_FACTORY_SOURCE) {
    input.validation.push({
      id: "official_source_not_placeholder",
      severity: "error",
      message: "CLI publish plan is blocked while source is the default placeholder.",
      blocking: true
    });
  }

  if (input.prerelease && !input.options.allowPrerelease) {
    input.validation.push({
      id: "prerelease_requires_approval",
      severity: "error",
      message: "Prerelease CLI versions require --allow-prerelease.",
      blocking: true
    });
  }

  if (!input.sourceCommit || input.sourceCommit === "unknown-dry-run") {
    input.validation.push({
      id: "source_commit_known",
      severity: "error",
      message: "Source commit must be known before publishing a CLI release.",
      blocking: true
    });
  }
}

function validatePackageJson(packageJson: PackageJson, validation: ValidationEntry[]): void {
  if (packageJson.name !== INSTALLER_PACKAGE_NAME && !packageJson.name.endsWith("/gridwork")) {
    validation.push({
      id: "package_name_allowed",
      severity: "error",
      message: `Package name must be ${INSTALLER_PACKAGE_NAME} or an approved scoped gridwork package.`,
      blocking: true
    });
  }

  if (packageJson.bin?.gridwork !== "./dist/index.js") {
    validation.push({
      id: "bin_gridwork",
      severity: "error",
      message: "bin.gridwork must point to ./dist/index.js.",
      blocking: true
    });
  }

  for (const scriptName of LIFECYCLE_SCRIPTS) {
    if (packageJson.scripts?.[scriptName]) {
      validation.push({
        id: "no_install_lifecycle_scripts",
        severity: "error",
        message: `Package must not define lifecycle script ${scriptName}.`,
        blocking: true
      });
    }
  }

  if (!packageJson.files?.includes("dist")) {
    validation.push({
      id: "files_include_dist",
      severity: "error",
      message: "Package files must include dist.",
      blocking: true
    });
  }
}

async function predictedPackageFiles(
  packageDir: string,
  packageJson: PackageJson,
  validation: ValidationEntry[]
): Promise<string[]> {
  const files = new Set<string>(["package.json"]);

  for (const entry of packageJson.files ?? []) {
    const absolutePath = resolve(packageDir, entry);

    if (!(await pathExists(absolutePath))) {
      validation.push({
        id: "package_file_entry_exists",
        severity: "error",
        message: `Package files entry is missing: ${entry}`,
        blocking: true
      });
      continue;
    }

    if (entry === "dist") {
      for (const relativeFile of await listFiles(absolutePath)) {
        files.add(`dist/${relativeFile}`);
      }
      continue;
    }

    files.add(entry);
  }

  return Array.from(files).sort((a, b) => a.localeCompare(b));
}

function validatePackageFiles(files: string[], validation: ValidationEntry[]): void {
  for (const file of files) {
    for (const forbidden of FORBIDDEN_PACKAGE_PATHS) {
      if (file === forbidden.slice(0, -1) || file.startsWith(forbidden)) {
        validation.push({
          id: "package_file_forbidden",
          severity: "error",
          message: `Package must not include forbidden path: ${file}`,
          blocking: true
        });
      }
    }
  }
}

async function writeCliReleasePlan(
  artifactsDir: string,
  input: {
    packageName: string;
    version: string;
    tag: string;
    distTag: string;
    source: string;
    sourceCommit: string;
    artifactsDir: string;
  }
): Promise<void> {
  await writeTextFile(
    resolve(artifactsDir, "cli-release-plan.md"),
    [
      "# CLI Release Plan",
      "",
      "```text",
      `package_name = ${input.packageName}`,
      `version = ${input.version}`,
      `tag = ${input.tag}`,
      `dist_tag = ${input.distTag}`,
      `source = ${input.source}`,
      `source_commit = ${input.sourceCommit}`,
      `artifacts = ${input.artifactsDir}`,
      "publish = not_executed",
      "```",
      "",
      "## Approval Gate",
      "",
      "Creating or pushing `cli-v<version>` requires explicit human approval.",
      "npm publish is performed only by GitHub Actions after an approved tag.",
      ""
    ].join("\n")
  );
}

async function writeCliReleaseNotes(
  artifactsDir: string,
  input: {
    packageName: string;
    version: string;
    tag: string;
    distTag: string;
    source: string;
    sourceCommit: string;
  }
): Promise<void> {
  await writeTextFile(
    resolve(artifactsDir, "cli-release-notes.md"),
    [
      `# Gridwork CLI ${input.version}`,
      "",
      "```text",
      `package_name = ${input.packageName}`,
      `tag = ${input.tag}`,
      `dist_tag = ${input.distTag}`,
      `source = ${input.source}`,
      `source_commit = ${input.sourceCommit}`,
      "```",
      "",
      "## Install",
      "",
      "```bash",
      `npx ${input.packageName} init`,
      "```",
      "",
      "## Notes",
      "",
      "- Dry-run generated CLI release notes.",
      "- Review package ownership, source and workflow before publishing.",
      ""
    ].join("\n")
  );
}

async function writeCliPackReport(
  artifactsDir: string,
  input: {
    packageName: string;
    version: string;
    predictedFiles: string[];
  }
): Promise<void> {
  const rows = input.predictedFiles.map((file) => `| ${file} |`);
  await writeTextFile(
    resolve(artifactsDir, "cli-npm-pack-report.md"),
    [
      "# CLI npm Pack Report",
      "",
      "```text",
      `package_name = ${input.packageName}`,
      `version = ${input.version}`,
      `file_count = ${input.predictedFiles.length}`,
      "npm_pack_publish = not_executed",
      "```",
      "",
      "| File |",
      "|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

async function writeCliPublishCommands(
  artifactsDir: string,
  input: {
    tag: string;
    packageName: string;
    distTag: string;
  }
): Promise<void> {
  await writeTextFile(
    resolve(artifactsDir, "cli-publish-commands.md"),
    [
      "# CLI Publish Commands",
      "",
      "These commands are prepared only. They were not executed.",
      "",
      "```bash",
      `git tag ${input.tag}`,
      `git push origin ${input.tag}`,
      "# GitHub Actions publish-cli.yml publishes npm after the approved tag.",
      "```",
      "",
      "## Expected npm publish",
      "",
      "```text",
      `package = ${input.packageName}`,
      `dist_tag = ${input.distTag}`,
      "publisher = github_actions",
      "local_npm_publish = forbidden",
      "```",
      ""
    ].join("\n")
  );
}

async function writeCliValidationReports(
  artifactsDir: string,
  validation: ValidationEntry[],
  blockers: string[],
  warnings: string[]
): Promise<void> {
  const status = blockers.length > 0 ? "blocked" : "pass";
  await writeJsonFile(resolve(artifactsDir, "cli-release-validation.json"), {
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
    resolve(artifactsDir, "cli-release-validation.md"),
    [
      "# CLI Release Validation",
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
    "-cli-release"
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
    throw new Error(`Invalid CLI version: ${input}`);
  }

  return version;
}

function isPrereleaseVersion(version: string): boolean {
  return version.includes("-");
}
