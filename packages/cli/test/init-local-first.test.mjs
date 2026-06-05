import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { validateMinimalFactory } from "../dist/init/local-init.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const cliEntrypoint = resolve(root, "packages/cli/dist/index.js");

async function createTempRepo() {
  return mkdtemp(join(tmpdir(), "gridwork-init-"));
}

function runInit(cwd, args = [], extraEnv = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [cliEntrypoint, "init", ...args], {
      cwd,
      env: {
        ...process.env,
        ...extraEnv
      }
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      resolveRun({ code, stdout, stderr });
    });
  });
}

async function fileText(path) {
  return readFile(path, "utf8");
}

async function jsonFile(path) {
  return JSON.parse(await fileText(path));
}

function reportDirFrom(output) {
  const match = output.match(/Reports?: ([^\r\n]+)/);
  assert.ok(match, "output should include reports path");
  return match[1].endsWith(".md") ? dirname(match[1]) : match[1];
}

async function countFactoryIgnoreEntries(repo) {
  const gitignore = await fileText(resolve(repo, ".gitignore"));
  return gitignore.split(/\r?\n/).filter((line) => line.trim() === ".factory/").length;
}

async function readReports(repo, reportDir) {
  const rootDir = resolve(repo, reportDir);
  const chunks = [];

  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = resolve(dir, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        chunks.push(await fileText(absolutePath));
      }
    }
  }

  await visit(rootDir);
  return chunks.join("\n");
}

test("init installs the full-v1 factory into a temporary repo", async () => {
  const repo = await createTempRepo();
  const result = await runInit(repo, [], {
    GITHUB_TOKEN: "super-secret-token-for-test"
  });

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Gridwork installed\./);
  assert.match(result.stdout, /Quickstart: \.gridwork\/QUICKSTART\.md/);
  assert.match(result.stdout, /Prompt: \.gridwork\/agents\/orchestrator\/PROMPT\.md/);
  assert.equal(result.stderr, "");

  const reportDir = reportDirFrom(result.stdout);
  const lockfile = await jsonFile(resolve(repo, ".gridwork-lock.json"));
  const factory = await jsonFile(resolve(repo, ".gridwork/factory.json"));

  assert.equal(factory.factoryProfile, "full-v1");
  assert.equal(lockfile.factory.sourceType, "local-source");
  assert.equal(lockfile.factory.factoryProfile, "full-v1");
  assert.ok(lockfile.files.length > 0);
  assert.ok(lockfile.files.every((entry) => entry.path.startsWith(".gridwork/")));
  assert.ok(lockfile.files.every((entry) => entry.sha256.startsWith("sha256:")));
  assert.ok(lockfile.files.every((entry) => !entry.path.includes("\\")));

  assert.equal(await countFactoryIgnoreEntries(repo), 1);
  await assert.rejects(() => readFile(resolve(repo, "frontend"), "utf8"));
  await assert.rejects(() => readFile(resolve(repo, "backend"), "utf8"));
  await readFile(resolve(repo, ".gridwork/agents/orchestrator/PROMPT.md"), "utf8");
  await readFile(resolve(repo, `${reportDir}/init-report.md`), "utf8");
  await readFile(resolve(repo, `${reportDir}/source-resolution.json`), "utf8");
  await readFile(resolve(repo, `${reportDir}/validation.json`), "utf8");
  await readFile(resolve(repo, `${reportDir}/apply-plan.json`), "utf8");
  await readFile(resolve(repo, `${reportDir}/lockfile-report.md`), "utf8");

  const reports = await readReports(repo, reportDir);
  assert.doesNotMatch(reports, /super-secret-token-for-test/);
  assert.doesNotMatch(reports, new RegExp(repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("init re-run is idempotent", async () => {
  const repo = await createTempRepo();
  const first = await runInit(repo);
  const second = await runInit(repo);

  assert.equal(first.code, 0);
  assert.equal(second.code, 0);
  assert.match(second.stdout, /Gridwork already installed\./);
  assert.equal(await countFactoryIgnoreEntries(repo), 1);

  const reportRuns = await readdir(resolve(repo, ".factory/init"));
  assert.equal(reportRuns.length, 2);
});

test("init repairs missing installed files", async () => {
  const repo = await createTempRepo();
  const first = await runInit(repo);
  assert.equal(first.code, 0);

  await unlink(resolve(repo, ".gridwork/QUICKSTART.md"));
  const second = await runInit(repo);

  assert.equal(second.code, 0);
  assert.match(second.stdout, /Gridwork repaired\./);
  assert.match(await fileText(resolve(repo, ".gridwork/QUICKSTART.md")), /Gridwork Quickstart/);
});

test("init blocks conflicts and preserves customized files", async () => {
  const repo = await createTempRepo();
  const first = await runInit(repo);
  assert.equal(first.code, 0);

  const originalLockfile = await fileText(resolve(repo, ".gridwork-lock.json"));
  await writeFile(resolve(repo, ".gridwork/README.md"), "# My Custom Factory\n", "utf8");

  const second = await runInit(repo);

  assert.equal(second.code, 8);
  assert.match(second.stderr, /Gridwork init stopped due to conflicts\./);
  assert.equal(await fileText(resolve(repo, ".gridwork/README.md")), "# My Custom Factory\n");
  assert.equal(await fileText(resolve(repo, ".gridwork-lock.json")), originalLockfile);

  const reportDir = reportDirFrom(second.stderr);
  await readFile(resolve(repo, `${reportDir}/conflicts.md`), "utf8");
  assert.match(await fileText(resolve(repo, `${reportDir}/candidates/.gridwork/README.md`)), /Gridwork Factory/);
});

test("init rejects unsupported v1 flags", async () => {
  const repo = await createTempRepo();
  const result = await runInit(repo, ["--force"]);

  assert.equal(result.code, 2);
  assert.match(result.stderr, /Unsupported init option: --force/);
  await assert.rejects(() => readdir(resolve(repo, ".factory")));
});

test("factory validation reports blocking errors", async () => {
  const repo = await createTempRepo();
  const gridwork = resolve(repo, ".gridwork");
  await rm(gridwork, { recursive: true, force: true });
  await mkdir(gridwork, { recursive: true });
  await writeFile(resolve(gridwork, "factory.json"), "{ invalid", "utf8");

  const result = await validateMinimalFactory(gridwork);

  assert.equal(result.status, "fail");
  assert.ok(result.results.some((entry) => entry.id === "json_parse" && entry.blocking));
});
