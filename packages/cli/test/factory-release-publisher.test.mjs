import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const cliEntrypoint = resolve(root, "packages/cli/dist/index.js");
const source = "acme/gridwork-factory";

function runCli(cwd, args, extraEnv = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [cliEntrypoint, ...args], {
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

async function createTempRepo() {
  return mkdtemp(join(tmpdir(), "gridwork-release-install-"));
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

async function withReleaseServer(artifactsDir, version, callback) {
  const assetBase = `gridwork-factory-v${version}`;
  const tag = `factory-v${version}`;
  const assets = {
    [`${assetBase}.zip`]: await readFile(resolve(root, artifactsDir, `${assetBase}.zip`)),
    [`${assetBase}.manifest.json`]: await readFile(resolve(root, artifactsDir, `${assetBase}.manifest.json`)),
    [`${assetBase}.sha256`]: await readFile(resolve(root, artifactsDir, `${assetBase}.sha256`)),
    [`${assetBase}.release-notes.md`]: await readFile(
      resolve(root, artifactsDir, `${assetBase}.release-notes.md`)
    )
  };
  const server = createServer((request, response) => {
    const url = request.url ?? "/";
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    if (url === `/repos/${source}/releases/tags/${tag}`) {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          tag_name: tag,
          prerelease: false,
          assets: Object.keys(assets).map((name) => ({
            name,
            browser_download_url: `${baseUrl}/assets/${name}`
          }))
        })
      );
      return;
    }

    const assetName = url.startsWith("/assets/") ? decodeURIComponent(url.slice("/assets/".length)) : "";
    const asset = assets[assetName];

    if (asset) {
      response.writeHead(200, { "Content-Type": "application/octet-stream" });
      response.end(asset);
      return;
    }

    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("not found");
  });

  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));

  try {
    return await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

test("factory release dry-run creates installable assets and publish plan", async () => {
  const version = "0.4.0";
  const result = await runCli(root, [
    "release",
    "factory",
    "--dry-run",
    "--factory-version",
    version,
    "--source",
    source,
    "--source-commit",
    "abc123"
  ]);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /Gridwork factory release dry-run prepared\./);
  assert.match(result.stdout, /Tag: factory-v0\.4\.0/);
  assert.equal(result.stderr, "");

  const artifactsDir = artifactsDirFrom(result.stdout);
  const assetBase = `gridwork-factory-v${version}`;
  const manifest = await jsonFile(resolve(root, artifactsDir, `${assetBase}.manifest.json`));
  const validation = await jsonFile(resolve(root, artifactsDir, "factory-release-validation.json"));
  const publishCommands = await fileText(resolve(root, artifactsDir, "publish-commands.md"));
  const checksums = await fileText(resolve(root, artifactsDir, `${assetBase}.sha256`));

  assert.equal(manifest.sourceTag, `factory-v${version}`);
  assert.equal(manifest.bundle.assetName, `${assetBase}.zip`);
  assert.equal(manifest.releaseMode, "manual_gh_release");
  assert.equal(validation.status, "pass");
  assert.match(checksums, new RegExp(`${assetBase}\\.zip`));
  assert.match(checksums, new RegExp(`${assetBase}\\.manifest\\.json`));
  assert.match(publishCommands, new RegExp(`git tag factory-v${version}`));
  assert.match(publishCommands, /gh release create factory-v0\.4\.0/);
  await assert.rejects(() => readFile(resolve(root, artifactsDir, "publish-result.md"), "utf8"));

  await withReleaseServer(artifactsDir, version, async (apiBase) => {
    const repo = await createTempRepo();
    const init = await runCli(repo, ["init", "--factory-version", version, "--source", source], {
      GRIDWORK_GITHUB_API_BASE_URL: apiBase
    });

    assert.equal(init.code, 0);
    assert.match(init.stdout, /Gridwork installed\./);
    assert.match(init.stdout, /github-release:acme\/gridwork-factory@factory-v0\.4\.0/);
    await readFile(resolve(repo, ".gridwork/factory.json"), "utf8");
  });
});

test("factory release dry-run blocks placeholder source", async () => {
  const result = await runCli(root, [
    "release",
    "factory",
    "--dry-run",
    "--factory-version",
    "0.5.0",
    "--source",
    "gridwork/gridwork",
    "--source-commit",
    "abc123"
  ]);

  assert.equal(result.code, 1);
  assert.match(result.stderr, /Gridwork factory release dry-run blocked\./);
  assert.match(result.stderr, /default placeholder/);
});

test("factory release command rejects publish mode and prerelease without approval", async () => {
  const publish = await runCli(root, [
    "release",
    "factory",
    "--factory-version",
    "0.6.0",
    "--source",
    source
  ]);
  const prerelease = await runCli(root, [
    "release",
    "factory",
    "--dry-run",
    "--factory-version",
    "0.6.0-beta.1",
    "--source",
    source
  ]);

  assert.equal(publish.code, 2);
  assert.match(publish.stderr, /Only --dry-run is supported/);
  assert.equal(prerelease.code, 2);
  assert.match(prerelease.stderr, /Prerelease factory versions require --allow-prerelease/);
});
