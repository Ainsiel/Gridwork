import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXIT_CODES,
  FACTORY_SOURCE_LABEL,
  FORBIDDEN_PRODUCT_PATHS,
  FULL_FACTORY_JSON_FILES,
  FULL_FACTORY_REQUIRED_FILES,
  INSTALLER_PACKAGE_NAME,
  INSTALLER_VERSION,
  LOCKFILE_PATH,
  MINIMAL_FACTORY_JSON_FILES,
  MINIMAL_FACTORY_REQUIRED_FILES
} from "./constants.js";
import {
  ensureParentDirectory,
  isDirectory,
  listFiles,
  pathExists,
  readJsonFile,
  resolveInside,
  sha256File,
  writeJsonFile,
  writeTextFile
} from "./fs-utils.js";

type ApplyAction =
  | "create"
  | "update_safe"
  | "unchanged"
  | "conflict_modified"
  | "conflict_unknown_owner";

interface FactoryManifest {
  id: string;
  version: string;
  schemaVersion: string;
  factoryProfile: string;
  generatedProductCode: boolean;
}

export interface SourceMetadata {
  sourceType: "local-source" | "github-release";
  source: string;
  version: string;
  authMode: "none" | "github-token";
  tag?: string;
  assetName?: string;
  releaseChannel?: string;
  prerelease?: boolean;
  sha256?: string;
  sourceCommit?: string;
  bundleManifestHash?: string;
  requiredCliVersion?: string;
}

interface LockfileEntry {
  path: string;
  sha256: string;
  source: string;
}

interface GridworkLockfile {
  lockfileVersion: string;
  factory: {
    sourceType: string;
    source: string;
    version: string;
    factoryProfile: string;
    schemaVersion: string;
    tag?: string;
    assetName?: string;
    releaseChannel?: string;
    prerelease?: boolean;
    sha256?: string;
    sourceCommit?: string;
    bundleManifestHash?: string;
  };
  installer: {
    package: string;
    version: string;
  };
  compatibility: {
    requiredCliVersion: string;
    status: string;
  };
  resolution: {
    authMode: string;
  };
  files: LockfileEntry[];
}

interface ApplyPlanItem {
  action: ApplyAction;
  path: string;
  sourcePath: string;
  sourceHash: string;
  currentHash: string | null;
  previousHash: string | null;
  candidatePath: string | null;
}

interface ValidationResult {
  status: "pass" | "fail";
  results: Array<{
    id: string;
    severity: "error" | "info";
    target: string;
    message: string;
    blocking: boolean;
  }>;
}

export interface LocalInitResult {
  code: number;
  status: "installed" | "already-installed" | "repaired" | "failed" | "conflict";
  reportDir: string;
  reportPath: string;
  sourceSummary: string;
  conflicts: number;
  created: number;
  updated: number;
  unchanged: number;
  validationErrors: number;
  factoryProfile: string;
  verboseLines: string[];
}

export interface RunState {
  targetDir: string;
  sourceDir: string;
  sourceMetadata: SourceMetadata;
  gridworkDir: string;
  factoryDir: string;
  reportDir: string;
  reportDirAbsolute: string;
  reportPath: string;
  runId: string;
}

export interface LocalInitOptions {
  targetDir: string;
  verbose: boolean;
}

const moduleDir = dirname(fileURLToPath(import.meta.url));

export function getLocalFactorySource(): string {
  return resolve(moduleDir, "../../../../factory/.gridwork");
}

export async function runLocalInit(options: LocalInitOptions): Promise<LocalInitResult> {
  const state = await createRunState(options.targetDir, getLocalFactorySource(), {
    sourceType: "local-source",
    source: FACTORY_SOURCE_LABEL,
    version: "local",
    authMode: "none"
  });

  await mkdir(state.reportDirAbsolute, { recursive: true });
  await writeLocalInitialReports(state);
  return runPreparedInstall(state);
}

export async function runPreparedInstall(state: RunState): Promise<LocalInitResult> {
  try {
    await mkdir(state.reportDirAbsolute, { recursive: true });

    const sourceFiles = await listFiles(state.sourceDir);
    const manifest = await readJsonFile<FactoryManifest>(resolve(state.sourceDir, "factory.json"));
    const previousLockfile = await readLockfile(resolve(state.targetDir, LOCKFILE_PATH));
    const plan = await buildApplyPlan(state, sourceFiles, previousLockfile);

    await writeApplyPlanReport(state, plan);

    const conflicts = plan.filter((item) => item.action.startsWith("conflict"));
    if (conflicts.length > 0) {
      await writeConflictReports(state, conflicts);
      await writeLockfileReport(state, "not_updated", "Conflicts blocked lockfile update.");
      await writeInitReport(state, {
        status: "conflict",
        message: "Gridwork init stopped due to conflicts.",
        plan,
        validation: null,
        factoryProfile: manifest.factoryProfile
      });

      return summarizeResult(state, "conflict", EXIT_CODES.fileConflictBlocked, plan, null, manifest.factoryProfile);
    }

    await applyPlan(state, plan);

    const validation = await validateMinimalFactory(state.gridworkDir);
    await writeValidationReport(state, validation);

    if (validation.status === "fail") {
      await writeLockfileReport(state, "not_updated", "Validation failed.");
      await writeInitReport(state, {
        status: "failed",
        message: "Gridwork init failed validation.",
        plan,
        validation,
        factoryProfile: manifest.factoryProfile
      });

      return summarizeResult(state, "failed", EXIT_CODES.validationFailed, plan, validation, manifest.factoryProfile);
    }

    await updateGitignore(resolve(state.targetDir, ".gitignore"));

    const lockfile = await createLockfile(state, sourceFiles, manifest);
    await writeJsonFile(resolve(state.targetDir, LOCKFILE_PATH), lockfile);
    await writeLockfileReport(state, "updated", "Lockfile is consistent with installed files.");
    await writeInitReport(state, {
      status: "success",
      message: "Gridwork init completed.",
      plan,
      validation,
      factoryProfile: manifest.factoryProfile
    });

    const status = getSuccessStatus(plan);
    return summarizeResult(state, status, EXIT_CODES.success, plan, validation, manifest.factoryProfile);
  } catch {
    await writeInitReport(state, {
      status: "failed",
      message: "Gridwork init failed due to a filesystem or internal error.",
      plan: [],
      validation: null,
      factoryProfile: "unknown"
    });

    return {
      code: EXIT_CODES.filesystemApplyFailed,
      status: "failed",
      reportDir: state.reportDir,
      reportPath: state.reportPath,
      sourceSummary: sourceSummary(state.sourceMetadata),
      conflicts: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      validationErrors: 0,
      factoryProfile: "unknown",
      verboseLines: ["Failure class: filesystem_apply_failed"]
    };
  }
}

export function formatConsoleResult(result: LocalInitResult, verbose: boolean): string {
  if (result.code === EXIT_CODES.fileConflictBlocked) {
    return [
      "Gridwork init stopped due to conflicts.",
      "",
      `Conflicts: ${result.conflicts}`,
      `Report: ${result.reportDir}/conflicts.md`,
      `Candidates: ${result.reportDir}/candidates/`,
      "",
      "No conflicting files were overwritten."
    ].join("\n");
  }

  if (result.code === EXIT_CODES.validationFailed) {
    return [
      "Gridwork init failed.",
      "",
      "Reason: factory validation failed",
      `Exit code: ${result.code}`,
      `Report: ${result.reportDir}/validation-report.md`,
      "",
      "Lockfile was not updated."
    ].join("\n");
  }

  if (result.code === EXIT_CODES.sourceResolutionFailed) {
    return [
      "Gridwork init failed.",
      "",
      "Reason: source resolution or download failed",
      `Exit code: ${result.code}`,
      `Report: ${result.reportPath}`
    ].join("\n");
  }

  if (result.code === EXIT_CODES.bundleVerificationFailed) {
    return [
      "Gridwork init failed.",
      "",
      "Reason: bundle verification failed",
      `Exit code: ${result.code}`,
      `Report: ${result.reportPath}`
    ].join("\n");
  }

  if (result.code === EXIT_CODES.compatibilityFailed) {
    return [
      "Gridwork init failed.",
      "",
      "Reason: compatibility check failed",
      `Exit code: ${result.code}`,
      `Report: ${result.reportPath}`
    ].join("\n");
  }

  if (result.code !== EXIT_CODES.success) {
    return [
      "Gridwork init failed.",
      "",
      "Reason: filesystem apply failed",
      `Exit code: ${result.code}`,
      `Report: ${result.reportPath}`
    ].join("\n");
  }

  const headline =
    result.status === "already-installed"
      ? "Gridwork already installed."
      : result.status === "repaired"
        ? "Gridwork repaired."
        : "Gridwork installed.";

  const lines = [
    headline,
    "",
    `Factory profile: ${result.factoryProfile}`,
    `Source: ${result.sourceSummary}`,
    "Definition folder: .gridwork/",
    "Runtime folder: .factory/",
    `Lockfile: ${LOCKFILE_PATH}`,
    `Reports: ${result.reportDir}`,
    "Quickstart: .gridwork/QUICKSTART.md",
    "Prompt: .gridwork/agents/orchestrator/PROMPT.md",
    "",
    "Next step:",
    "Tell your agent: \"Lee .gridwork/agents/orchestrator/PROMPT.md y actua como el orquestador de Gridwork.\""
  ];

  if (verbose) {
    lines.push("", "Verbose:", ...result.verboseLines);
  }

  return lines.join("\n");
}

export async function validateMinimalFactory(gridworkDir: string): Promise<ValidationResult> {
  const results: ValidationResult["results"] = [];

  for (const relativePath of MINIMAL_FACTORY_REQUIRED_FILES) {
    const target = `.gridwork/${relativePath}`;
    const exists = await pathExists(resolveInside(gridworkDir, relativePath));
    results.push({
      id: "required_file_exists",
      severity: exists ? "info" : "error",
      target,
      message: exists ? "Required file exists." : "Required file is missing.",
      blocking: !exists
    });
  }

  for (const relativePath of MINIMAL_FACTORY_JSON_FILES) {
    const target = `.gridwork/${relativePath}`;
    try {
      await readJsonFile(resolveInside(gridworkDir, relativePath));
      results.push({
        id: "json_parse",
        severity: "info",
        target,
        message: "JSON parses.",
        blocking: false
      });
    } catch {
      results.push({
        id: "json_parse",
        severity: "error",
        target,
        message: "JSON does not parse.",
        blocking: true
      });
    }
  }

  try {
    const manifest = await readJsonFile<FactoryManifest>(resolveInside(gridworkDir, "factory.json"));
    const validProfile = manifest.factoryProfile === "minimal-mvp" || manifest.factoryProfile === "full-v1";
    const noProductCode = manifest.generatedProductCode === false;

    results.push({
      id: "factory_profile",
      severity: validProfile ? "info" : "error",
      target: ".gridwork/factory.json",
      message: validProfile ? `factoryProfile is ${manifest.factoryProfile}.` : "factoryProfile must be minimal-mvp or full-v1.",
      blocking: !validProfile
    });

    results.push({
      id: "generated_product_code",
      severity: noProductCode ? "info" : "error",
      target: ".gridwork/factory.json",
      message: noProductCode ? "generatedProductCode is false." : "generatedProductCode must be false.",
      blocking: !noProductCode
    });

    if (manifest.factoryProfile === "full-v1") {
      await validateFullFactoryInventory(gridworkDir, results);
    }
  } catch {
    // The JSON parse result above already records the blocking error.
  }

  for (const relativePath of FORBIDDEN_PRODUCT_PATHS) {
    const exists = await pathExists(resolveInside(gridworkDir, relativePath));
    results.push({
      id: "no_product_code_in_factory",
      severity: exists ? "error" : "info",
      target: `.gridwork/${relativePath}`,
      message: exists ? "Product code path must not exist in installed factory." : "Product code path is absent.",
      blocking: exists
    });
  }

  return {
    status: results.some((result) => result.blocking) ? "fail" : "pass",
    results
  };
}

async function validateFullFactoryInventory(
  gridworkDir: string,
  results: ValidationResult["results"]
): Promise<void> {
  for (const relativePath of FULL_FACTORY_REQUIRED_FILES) {
    const target = `.gridwork/${relativePath}`;
    const exists = await pathExists(resolveInside(gridworkDir, relativePath));
    results.push({
      id: "full_v1_required_file_exists",
      severity: exists ? "info" : "error",
      target,
      message: exists ? "Full-v1 required file exists." : "Full-v1 required file is missing.",
      blocking: !exists
    });
  }

  for (const relativePath of FULL_FACTORY_JSON_FILES) {
    const target = `.gridwork/${relativePath}`;
    try {
      await readJsonFile(resolveInside(gridworkDir, relativePath));
      results.push({
        id: "full_v1_json_parse",
        severity: "info",
        target,
        message: "Full-v1 JSON parses.",
        blocking: false
      });
    } catch {
      results.push({
        id: "full_v1_json_parse",
        severity: "error",
        target,
        message: "Full-v1 JSON does not parse.",
        blocking: true
      });
    }
  }
}

export async function createRunState(
  targetDir: string,
  sourceDir: string,
  sourceMetadata: SourceMetadata
): Promise<RunState> {
  const factoryDir = resolve(targetDir, ".factory");
  const runId = await createInitRunId(resolve(factoryDir, "init"));
  const reportDir = `.factory/init/${runId}`;

  return {
    targetDir,
    sourceDir,
    sourceMetadata,
    gridworkDir: resolve(targetDir, ".gridwork"),
    factoryDir,
    reportDir,
    reportDirAbsolute: resolve(targetDir, reportDir),
    reportPath: `${reportDir}/init-report.md`,
    runId
  };
}

async function createInitRunId(initRoot: string): Promise<string> {
  const now = new Date();
  const base = [
    now.getFullYear().toString().padStart(4, "0"),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getDate().toString().padStart(2, "0"),
    "-",
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
    "-init"
  ].join("");

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index.toString().padStart(2, "0")}`;
    if (!(await pathExists(resolve(initRoot, candidate)))) {
      return candidate;
    }
  }

  return `${base}-overflow`;
}

async function writeLocalInitialReports(state: RunState): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/preflight.json`), {
    schemaVersion: "1.0.0",
    status: "pass",
    checks: [
      {
        id: "local_first_init",
        severity: "info",
        message: "Using local factory source."
      }
    ]
  });

  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/source-resolution.json`), {
    schemaVersion: "1.0.0",
    status: "resolved",
    sourceType: "local-source",
    source: FACTORY_SOURCE_LABEL
  });

  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/source-resolution.md`),
    [
      "# Source Resolution",
      "",
      "```text",
      "status = resolved",
      "source_type = local-source",
      `source = ${FACTORY_SOURCE_LABEL}`,
      "```",
      ""
    ].join("\n")
  );
}

async function readLockfile(path: string): Promise<GridworkLockfile | null> {
  if (!(await pathExists(path))) {
    return null;
  }

  try {
    return await readJsonFile<GridworkLockfile>(path);
  } catch {
    return null;
  }
}

async function buildApplyPlan(
  state: RunState,
  sourceFiles: string[],
  previousLockfile: GridworkLockfile | null
): Promise<ApplyPlanItem[]> {
  const lockEntries = new Map<string, LockfileEntry>();

  for (const entry of previousLockfile?.files ?? []) {
    lockEntries.set(entry.path, entry);
  }

  const plan: ApplyPlanItem[] = [];

  for (const relativeSourcePath of sourceFiles) {
    const sourcePath = resolveInside(state.sourceDir, relativeSourcePath);
    const installedPath = `.gridwork/${relativeSourcePath}`;
    const targetPath = resolveInside(state.targetDir, installedPath);
    const sourceHash = await sha256File(sourcePath);
    const targetExists = await pathExists(targetPath);

    if (!targetExists) {
      plan.push({
        action: "create",
        path: installedPath,
        sourcePath,
        sourceHash,
        currentHash: null,
        previousHash: lockEntries.get(installedPath)?.sha256 ?? null,
        candidatePath: null
      });
      continue;
    }

    const currentHash = await sha256File(targetPath);
    const previousHash = lockEntries.get(installedPath)?.sha256 ?? null;

    if (!previousHash) {
      plan.push({
        action: "conflict_unknown_owner",
        path: installedPath,
        sourcePath,
        sourceHash,
        currentHash,
        previousHash,
        candidatePath: `${state.reportDir}/candidates/${installedPath}`
      });
      continue;
    }

    if (currentHash === sourceHash) {
      plan.push({
        action: "unchanged",
        path: installedPath,
        sourcePath,
        sourceHash,
        currentHash,
        previousHash,
        candidatePath: null
      });
      continue;
    }

    if (currentHash === previousHash) {
      plan.push({
        action: "update_safe",
        path: installedPath,
        sourcePath,
        sourceHash,
        currentHash,
        previousHash,
        candidatePath: null
      });
      continue;
    }

    plan.push({
      action: "conflict_modified",
      path: installedPath,
      sourcePath,
      sourceHash,
      currentHash,
      previousHash,
      candidatePath: `${state.reportDir}/candidates/${installedPath}`
    });
  }

  return plan;
}

async function applyPlan(state: RunState, plan: ApplyPlanItem[]): Promise<void> {
  for (const item of plan) {
    if (item.action !== "create" && item.action !== "update_safe") {
      continue;
    }

    const targetPath = resolveInside(state.targetDir, item.path);
    await ensureParentDirectory(targetPath);
    await copyFile(item.sourcePath, targetPath);
  }
}

async function writeApplyPlanReport(state: RunState, plan: ApplyPlanItem[]): Promise<void> {
  const serializablePlan = plan.map((item) => ({
    action: item.action,
    path: item.path,
    sourceHash: item.sourceHash,
    currentHash: item.currentHash,
    previousHash: item.previousHash,
    candidatePath: item.candidatePath
  }));

  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/apply-plan.json`), {
    schemaVersion: "1.0.0",
    status: plan.some((item) => item.action.startsWith("conflict")) ? "blocked" : "planned",
    actions: serializablePlan
  });

  const rows = serializablePlan.map((item) =>
    `| ${item.action} | ${item.path} | ${item.candidatePath ?? ""} |`
  );
  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/apply-plan.md`),
    [
      "# Apply Plan",
      "",
      "| Action | Path | Candidate |",
      "|---|---|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

async function writeConflictReports(state: RunState, conflicts: ApplyPlanItem[]): Promise<void> {
  for (const conflict of conflicts) {
    if (!conflict.candidatePath) {
      continue;
    }

    const candidateAbsolutePath = resolveInside(state.targetDir, conflict.candidatePath);
    await ensureParentDirectory(candidateAbsolutePath);
    await copyFile(conflict.sourcePath, candidateAbsolutePath);
  }

  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/conflicts.json`), {
    schemaVersion: "1.0.0",
    status: "conflicts-found",
    conflicts: conflicts.map((conflict) => ({
      path: conflict.path,
      type: conflict.action,
      expectedHash: conflict.previousHash,
      currentHash: conflict.currentHash,
      candidateHash: conflict.sourceHash,
      candidatePath: conflict.candidatePath
    }))
  });

  const rows = conflicts.map((conflict) =>
    `| ${conflict.path} | ${conflict.action} | ${conflict.candidatePath ?? ""} |`
  );
  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/conflicts.md`),
    [
      "# Conflicts",
      "",
      "No conflicting files were overwritten.",
      "",
      "| Path | Type | Candidate |",
      "|---|---|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

async function writeValidationReport(state: RunState, validation: ValidationResult): Promise<void> {
  await writeJsonFile(resolve(state.targetDir, `${state.reportDir}/validation.json`), {
    schemaVersion: "1.0.0",
    status: validation.status,
    results: validation.results
  });

  const rows = validation.results.map((result) =>
    `| ${result.id} | ${result.severity} | ${result.target} | ${result.message} | ${result.blocking} |`
  );
  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/validation-report.md`),
    [
      "# Validation Report",
      "",
      `status = ${validation.status}`,
      "",
      "| ID | Severity | Target | Message | Blocking |",
      "|---|---|---|---|---|",
      ...rows,
      ""
    ].join("\n")
  );
}

async function writeLockfileReport(state: RunState, status: string, message: string): Promise<void> {
  await writeTextFile(
    resolve(state.targetDir, `${state.reportDir}/lockfile-report.md`),
    [
      "# Lockfile Report",
      "",
      "```text",
      `lockfile_path = ${LOCKFILE_PATH}`,
      `status = ${status}`,
      "```",
      "",
      message,
      ""
    ].join("\n")
  );
}

async function writeInitReport(
  state: RunState,
  input: {
    status: "success" | "failed" | "conflict";
    message: string;
    plan: ApplyPlanItem[];
    validation: ValidationResult | null;
    factoryProfile: string;
  }
): Promise<void> {
  const created = input.plan.filter((item) => item.action === "create").length;
  const updated = input.plan.filter((item) => item.action === "update_safe").length;
  const unchanged = input.plan.filter((item) => item.action === "unchanged").length;
  const conflicts = input.plan.filter((item) => item.action.startsWith("conflict")).length;
  const validationErrors = input.validation?.results.filter((item) => item.blocking).length ?? 0;

  await writeTextFile(
    resolve(state.targetDir, state.reportPath),
    [
      "# Init Report",
      "",
      "```text",
      `init_run_id = ${state.runId}`,
      `status = ${input.status}`,
      `factory_profile = ${input.factoryProfile}`,
      `source_type = ${state.sourceMetadata.sourceType}`,
      "```",
      "",
      "## Summary",
      "",
      input.message,
      "",
      "## Counts",
      "",
      "```text",
      `created = ${created}`,
      `updated = ${updated}`,
      `unchanged = ${unchanged}`,
      `conflicts = ${conflicts}`,
      `validation_errors = ${validationErrors}`,
      "```",
      "",
      "## Next Step",
      "",
      "Open `.gridwork/QUICKSTART.md`.",
      ""
    ].join("\n")
  );
}

async function createLockfile(
  state: RunState,
  sourceFiles: string[],
  manifest: FactoryManifest
): Promise<GridworkLockfile> {
  const entries: LockfileEntry[] = [];

  for (const relativeSourcePath of sourceFiles) {
    const installedPath = `.gridwork/${relativeSourcePath}`;
    entries.push({
      path: installedPath,
      sha256: await sha256File(resolveInside(state.gridworkDir, relativeSourcePath)),
      source: state.sourceMetadata.sourceType
    });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));

  return {
    lockfileVersion: "1.0.0",
    factory: {
      sourceType: state.sourceMetadata.sourceType,
      source: state.sourceMetadata.source,
      version: state.sourceMetadata.version === "local" ? manifest.version : state.sourceMetadata.version,
      factoryProfile: manifest.factoryProfile,
      schemaVersion: manifest.schemaVersion,
      tag: state.sourceMetadata.tag,
      assetName: state.sourceMetadata.assetName,
      releaseChannel: state.sourceMetadata.releaseChannel,
      prerelease: state.sourceMetadata.prerelease,
      sha256: state.sourceMetadata.sha256,
      sourceCommit: state.sourceMetadata.sourceCommit,
      bundleManifestHash: state.sourceMetadata.bundleManifestHash
    },
    installer: {
      package: INSTALLER_PACKAGE_NAME,
      version: INSTALLER_VERSION
    },
    compatibility: {
      requiredCliVersion: state.sourceMetadata.requiredCliVersion ?? "local-first",
      status: "compatible"
    },
    resolution: {
      authMode: state.sourceMetadata.authMode
    },
    files: entries
  };
}

async function updateGitignore(gitignorePath: string): Promise<void> {
  const desiredEntry = ".factory/";
  let content = "";

  if (await pathExists(gitignorePath)) {
    content = await readFile(gitignorePath, "utf8");
  }

  const lines = content.split(/\r?\n/).filter((line, index, list) => {
    return !(index === list.length - 1 && line === "");
  });
  const hasFactoryEntry = lines.some((line) => line.trim() === desiredEntry || line.trim() === ".factory");

  if (!hasFactoryEntry) {
    lines.push(desiredEntry);
  }

  await writeFile(gitignorePath, `${lines.join("\n")}\n`, "utf8");
}

function getSuccessStatus(plan: ApplyPlanItem[]): LocalInitResult["status"] {
  const created = plan.filter((item) => item.action === "create").length;
  const updated = plan.filter((item) => item.action === "update_safe").length;

  if (created === 0 && updated === 0) {
    return "already-installed";
  }

  if (updated > 0 || plan.some((item) => item.previousHash !== null && item.action === "create")) {
    return "repaired";
  }

  return "installed";
}

function summarizeResult(
  state: RunState,
  status: LocalInitResult["status"],
  code: number,
  plan: ApplyPlanItem[],
  validation: ValidationResult | null,
  factoryProfile: string
): LocalInitResult {
  const created = plan.filter((item) => item.action === "create").length;
  const updated = plan.filter((item) => item.action === "update_safe").length;
  const unchanged = plan.filter((item) => item.action === "unchanged").length;
  const conflicts = plan.filter((item) => item.action.startsWith("conflict")).length;
  const validationErrors = validation?.results.filter((item) => item.blocking).length ?? 0;

  return {
    code,
    status,
    reportDir: state.reportDir,
    reportPath: state.reportPath,
    sourceSummary: sourceSummary(state.sourceMetadata),
    conflicts,
    created,
    updated,
    unchanged,
    validationErrors,
    factoryProfile,
    verboseLines: [
      `created = ${created}`,
      `updated = ${updated}`,
      `unchanged = ${unchanged}`,
      `conflicts = ${conflicts}`,
      `validation_errors = ${validationErrors}`,
      `factory_profile = ${factoryProfile}`,
      `source = ${sourceSummary(state.sourceMetadata)}`
    ]
  };
}

function sourceSummary(sourceMetadata: SourceMetadata): string {
  if (sourceMetadata.sourceType === "github-release") {
    return `github-release:${sourceMetadata.source}@${sourceMetadata.tag ?? sourceMetadata.version}`;
  }

  return "local-source";
}

export async function assertLocalFactorySourceExists(): Promise<boolean> {
  return isDirectory(getLocalFactorySource());
}
