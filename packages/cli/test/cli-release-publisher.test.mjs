import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const cliEntrypoint = resolve(root, "packages/cli/dist/index.js");
const source = "acme/gridwork-factory";

function runCli(args) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [cliEntrypoint, ...args], {
      cwd: root,
      env: {
        ...process.env
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

function artifactsDirFrom(output) {
  const match = output.match(/Artifacts: ([^\r\n]+)/);
  assert.ok(match, "output should include artifacts path");
  return match[1];
}

test("cli release dry-run creates release plan and pack report without publishing", async () => {
  const result = await runCli([
    "release",
    "cli",
    "--dry-run",
    "--source",
    source,
    "--source-commit",
    "abc123",
    "--confirm-package-ownership",
    "--confirm-official-source"
  ]);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Gridwork CLI release dry-run prepared\./);
  assert.match(result.stdout, /Tag: cli-v0\.1\.0/);
  assert.match(result.stdout, /Dist tag: latest/);
  assert.equal(result.stderr, "");

  const artifactsDir = artifactsDirFrom(result.stdout);
  const validation = await jsonFile(resolve(root, artifactsDir, "cli-release-validation.json"));
  const releasePlan = await fileText(resolve(root, artifactsDir, "cli-release-plan.md"));
  const packReport = await fileText(resolve(root, artifactsDir, "cli-npm-pack-report.md"));
  const publishCommands = await fileText(resolve(root, artifactsDir, "cli-publish-commands.md"));

  assert.equal(validation.status, "pass");
  assert.match(releasePlan, /tag = cli-v0\.1\.0/);
  assert.match(releasePlan, /publish = not_executed/);
  assert.match(packReport, /dist\/index\.js/);
  assert.doesNotMatch(packReport, /\.factory\//);
  assert.doesNotMatch(packReport, /factory\/\.gridwork/);
  assert.match(publishCommands, /git tag cli-v0\.1\.0/);
  assert.match(publishCommands, /git push origin cli-v0\.1\.0/);
  assert.doesNotMatch(publishCommands, /^npm publish/m);
  await assert.rejects(() => readFile(resolve(root, artifactsDir, "publish-result.md"), "utf8"));
});

test("cli release dry-run blocks missing ownership confirmations and placeholder source", async () => {
  const result = await runCli([
    "release",
    "cli",
    "--dry-run",
    "--source",
    "gridwork/gridwork",
    "--source-commit",
    "abc123"
  ]);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /Gridwork CLI release dry-run blocked\./);
  assert.match(result.stderr, /Package ownership must be confirmed/);
  assert.match(result.stderr, /Official factory source must be confirmed/);
  assert.match(result.stderr, /default placeholder/);

  const artifactsDir = artifactsDirFrom(result.stderr);
  const validation = await jsonFile(resolve(root, artifactsDir, "cli-release-validation.json"));

  assert.equal(validation.status, "blocked");
});

test("cli release command rejects publish mode", async () => {
  const result = await runCli(["release", "cli", "--source", source]);

  assert.equal(result.code, 2);
  assert.match(result.stderr, /Only --dry-run is supported for CLI release publishing in v1/);
});
