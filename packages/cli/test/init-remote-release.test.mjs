import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { zipSync } from "fflate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const cliEntrypoint = resolve(root, "packages/cli/dist/index.js");
const factoryRoot = resolve(root, "factory/.gridwork");
const source = "acme/gridwork-factory";

async function createTempRepo() {
  return mkdtemp(join(tmpdir(), "gridwork-remote-init-"));
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

async function listFactoryFiles() {
  const files = [];

  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = resolve(dir, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        files.push(relative(factoryRoot, absolutePath).split(sep).join("/"));
      }
    }
  }

  await visit(factoryRoot);
  return files.sort((a, b) => a.localeCompare(b));
}

async function createBundle(version, extraEntries = {}) {
  const files = {};

  for (const relativePath of await listFactoryFiles()) {
    files[`.gridwork/${relativePath}`] = new Uint8Array(await readFile(resolve(factoryRoot, relativePath)));
  }

  for (const [path, content] of Object.entries(extraEntries)) {
    files[path] = new TextEncoder().encode(content);
  }

  const zipBytes = Buffer.from(zipSync(files));
  const assetBase = `gridwork-factory-v${version}`;
  const zipName = `${assetBase}.zip`;
  const manifestName = `${assetBase}.manifest.json`;
  const checksumsName = `${assetBase}.sha256`;
  const zipSha256 = sha256(zipBytes);
  const manifest = Buffer.from(
    `${JSON.stringify(
      {
        schemaVersion: "1.0.0",
        factoryVersion: version,
        factoryProfile: "full-v1",
        generatedProductCode: false,
        requiredCliVersion: ">=0.0.0",
        releaseChannel: "stable",
        sourceCommit: "abc123",
        bundle: {
          assetName: zipName,
          sha256: zipSha256
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  const checksums = Buffer.from(
    [
      `${zipSha256.slice("sha256:".length)}  ${zipName}`,
      `${sha256(manifest).slice("sha256:".length)}  ${manifestName}`,
      ""
    ].join("\n"),
    "utf8"
  );

  return {
    version,
    zipName,
    manifestName,
    checksumsName,
    assets: {
      [zipName]: zipBytes,
      [manifestName]: manifest,
      [checksumsName]: checksums
    }
  };
}

async function withReleaseServer(bundle, callback) {
  const server = createServer((request, response) => {
    const url = request.url ?? "/";
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    if (url === `/repos/${source}/releases/tags/factory-v${bundle.version}`) {
      const body = JSON.stringify({
        tag_name: `factory-v${bundle.version}`,
        prerelease: false,
        assets: [
          {
            name: bundle.zipName,
            browser_download_url: `${baseUrl}/assets/${bundle.zipName}`
          },
          {
            name: bundle.manifestName,
            browser_download_url: `${baseUrl}/assets/${bundle.manifestName}`
          },
          {
            name: bundle.checksumsName,
            browser_download_url: `${baseUrl}/assets/${bundle.checksumsName}`
          }
        ]
      });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(body);
      return;
    }

    const assetName = url.startsWith("/assets/") ? decodeURIComponent(url.slice("/assets/".length)) : "";
    const asset = bundle.assets[assetName];

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
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    return await callback(baseUrl);
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
}

function sha256(buffer) {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

test("init installs a verified GitHub release bundle and reuses cache", async () => {
  const repo = await createTempRepo();
  const bundle = await createBundle("0.1.0");
  const args = ["--factory-version", "0.1.0", "--source", source];

  await withReleaseServer(bundle, async (apiBase) => {
    const result = await runInit(repo, args, {
      GRIDWORK_GITHUB_API_BASE_URL: apiBase,
      GITHUB_TOKEN: "super-secret-token-for-test"
    });

    assert.equal(result.code, 0);
    assert.match(result.stdout, /Gridwork installed\./);
    assert.match(result.stdout, /Source: github-release:acme\/gridwork-factory@factory-v0\.1\.0/);

    const reportDir = reportDirFrom(result.stdout);
    const lockfile = await jsonFile(resolve(repo, ".gridwork-lock.json"));

    assert.equal(lockfile.factory.sourceType, "github-release");
    assert.equal(lockfile.factory.source, source);
    assert.equal(lockfile.factory.version, "0.1.0");
    assert.equal(lockfile.factory.tag, "factory-v0.1.0");
    assert.match(lockfile.factory.sha256, /^sha256:/);

    await readFile(resolve(repo, `${reportDir}/source-resolution.json`), "utf8");
    await readFile(resolve(repo, `${reportDir}/download-report.json`), "utf8");
    await readFile(resolve(repo, `${reportDir}/checksum-report.json`), "utf8");
    await readFile(resolve(repo, `${reportDir}/compatibility-report.json`), "utf8");
    await readFile(resolve(repo, `${reportDir}/bundle-inspection.json`), "utf8");
    await readFile(resolve(repo, `${reportDir}/cache-report.json`), "utf8");

    const reports = await readReports(repo, reportDir);
    assert.doesNotMatch(reports, /super-secret-token-for-test/);
  });

  const cachedRun = await runInit(repo, args, {
    GRIDWORK_GITHUB_API_BASE_URL: "http://127.0.0.1:9"
  });

  assert.equal(cachedRun.code, 0);
  assert.match(cachedRun.stdout, /Gridwork already installed\./);

  const cachedReportDir = reportDirFrom(cachedRun.stdout);
  const cacheReport = await jsonFile(resolve(repo, `${cachedReportDir}/cache-report.json`));

  assert.equal(cacheReport.status, "hit");
});

test("init rejects release bundles with unsafe zip entries", async () => {
  const repo = await createTempRepo();
  const bundle = await createBundle("0.2.0", {
    "../owned.txt": "must not be written"
  });

  await withReleaseServer(bundle, async (apiBase) => {
    const result = await runInit(repo, ["--factory-version", "0.2.0", "--source", source], {
      GRIDWORK_GITHUB_API_BASE_URL: apiBase
    });

    assert.equal(result.code, 5);
    assert.match(result.stderr, /Reason: bundle verification failed/);
    await assert.rejects(() => readFile(resolve(repo, "owned.txt"), "utf8"));
    await assert.rejects(() =>
      readFile(
        resolve(repo, ".factory/cache/bundles/github-release/acme__gridwork-factory/factory-v0.2.0/cache-entry.json"),
        "utf8"
      )
    );

    const reportDir = reportDirFrom(result.stderr);
    const inspection = await jsonFile(resolve(repo, `${reportDir}/bundle-inspection.json`));

    assert.equal(inspection.status, "fail");
    assert.ok(inspection.problems.some((problem) => problem.includes("escapes staging root")));
  });
});

test("init remote flags validate required combinations", async () => {
  const repo = await createTempRepo();
  const missingVersion = await runInit(repo, ["--source", source]);
  const badSource = await runInit(repo, ["--factory-version", "0.1.0", "--source", "https://example.com/repo"]);

  assert.equal(missingVersion.code, 2);
  assert.match(missingVersion.stderr, /--source requires --factory-version/);
  assert.equal(badSource.code, 2);
  assert.match(badSource.stderr, /Invalid source/);

  await rm(repo, { recursive: true, force: true });
});
