import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");
const factoryRoot = resolve(root, "factory/.gridwork");

const minimalCorePaths = [
  "README.md",
  "QUICKSTART.md",
  "factory.json",
  "agents/orchestrator/PROMPT.md",
  "agents/orchestrator/AGENT.md",
  "agents/orchestrator/agent.json",
  "workflows/intake-existing-code/WORKFLOW.md",
  "workflows/intake-existing-code/workflow.json",
  "skills/handoff/SKILL.md",
  "skills/handoff/skill.json",
  "policies/security-policy.md",
  "policies/logging-policy.md",
  "policies/github-cli-policy.md",
  "policies/path-scopes.md",
  "schemas/factory.schema.json",
  "schemas/agent.schema.json",
  "schemas/workflow.schema.json",
  "schemas/skill.schema.json",
  "schemas/lockfile.schema.json",
  "templates/init-report.md",
  "templates/source-resolution-report.md",
  "templates/validation-report.md",
  "templates/compatibility-report.md",
  "templates/lockfile-report.md",
  "templates/conflicts.md",
  "templates/apply-plan.md"
];

async function fileExists(relativePath) {
  try {
    await access(resolve(factoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readFactoryManifest() {
  const json = await readFile(resolve(factoryRoot, "factory.json"), "utf8");
  return JSON.parse(json);
}

async function readJson(relativePath) {
  const json = await readFile(resolve(factoryRoot, relativePath), "utf8");
  return JSON.parse(json);
}

async function collectManifestPaths() {
  const manifest = await readFactoryManifest();
  const paths = new Set(["factory.json"]);

  for (const agent of manifest.agents) {
    paths.add(agent.manifest);
    paths.add(agent.contract);
    if (agent.prompt) {
      paths.add(agent.prompt);
    }
  }

  for (const workflow of manifest.workflows) {
    paths.add(workflow.manifest);
    paths.add(workflow.contract);
  }

  for (const skill of manifest.skills) {
    paths.add(skill.manifest);
    paths.add(skill.contract);
  }

  for (const policy of manifest.policies) {
    paths.add(policy);
  }

  for (const schema of manifest.schemas) {
    paths.add(schema);
  }

  for (const template of manifest.templates) {
    paths.add(template);
  }

  for (const stackPackRef of manifest.stackPacks ?? []) {
    paths.add(stackPackRef.manifest);
    paths.add(stackPackRef.contract);

    const stackPack = await readJson(stackPackRef.manifest);
    for (const policy of stackPack.policies ?? []) {
      paths.add(`stack-packs/${stackPack.id}/${policy}`);
    }
    for (const template of stackPack.templates ?? []) {
      paths.add(`stack-packs/${stackPack.id}/${template}`);
    }
    for (const skill of stackPack.skills ?? []) {
      paths.add(`stack-packs/${stackPack.id}/${skill}`);
      paths.add(`stack-packs/${stackPack.id}/${skill.replace(/skill\.json$/, "SKILL.md")}`);
    }
  }

  return [...paths].sort();
}

test("full-v1 factory includes the minimal core inventory", async () => {
  for (const relativePath of minimalCorePaths) {
    assert.equal(await fileExists(relativePath), true, `${relativePath} should exist`);
  }
});

test("full-v1 manifest referenced files exist", async () => {
  for (const relativePath of await collectManifestPaths()) {
    assert.equal(await fileExists(relativePath), true, `${relativePath} should exist`);
  }
});

test("full-v1 manifest referenced JSON files parse", async () => {
  for (const relativePath of await collectManifestPaths()) {
    if (!relativePath.endsWith(".json")) {
      continue;
    }

    const json = await readFile(resolve(factoryRoot, relativePath), "utf8");
    assert.doesNotThrow(() => JSON.parse(json), `${relativePath} should parse`);
  }
});

test("full-v1 factory profile is declared", async () => {
  const manifest = await readFactoryManifest();

  assert.equal(manifest.factoryProfile, "full-v1");
  assert.equal(manifest.generatedProductCode, false);
});

test("full-v1 factory contains expected agents, workflows, skills and stack pack", async () => {
  const manifest = await readFactoryManifest();

  assert.deepEqual(
    manifest.agents.map((agent) => agent.id).sort(),
    [
      "implementer-agent",
      "intake-agent",
      "orchestrator",
      "planner-agent",
      "software-architect",
      "verifier-agent"
    ]
  );

  assert.deepEqual(
    manifest.workflows.map((workflow) => workflow.id).sort(),
    [
      "architecture-ddd",
      "ideation-from-zero",
      "intake-existing-code",
      "tdd-implementation",
      "verification-pr"
    ]
  );

  assert.equal(manifest.stackPacks[0].id, "nextjs-springboot-postgresql");
  assert.equal(manifest.stackPacks[0].generatesProductCode, false);
});

test("full-v1 factory does not include product code folders", async () => {
  for (const relativePath of ["frontend", "backend", "database", "docker", "docker-compose.yml"]) {
    assert.equal(await fileExists(relativePath), false, `${relativePath} should not exist`);
  }
});

test("installed docs point to orchestrator prompt without run command", async () => {
  const quickstart = await readFile(resolve(factoryRoot, "QUICKSTART.md"), "utf8");
  const prompt = await readFile(resolve(factoryRoot, "agents/orchestrator/PROMPT.md"), "utf8");

  assert.match(quickstart, /\.gridwork\/agents\/orchestrator\/PROMPT\.md/);
  assert.doesNotMatch(prompt, /gridwork run/);
});

