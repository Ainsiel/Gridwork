import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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

async function directoryNames(relativePath) {
  const entries = await readdir(resolve(factoryRoot, relativePath), { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
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
      "backlog-manager-agent",
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
      "backlog-management",
      "backlog-task-delivery",
      "ideation-from-zero",
      "intake-existing-code",
      "tdd-implementation",
      "verification-pr"
    ]
  );

  assert.deepEqual(
    manifest.skills.map((skill) => skill.id).sort(),
    [
      "api-contract-design",
      "architecture-decision-records",
      "architecture-grill-me",
      "architecture-pattern-selection",
      "backlog-management",
      "backlog-planning",
      "c4-html-diagrams",
      "clean-architecture",
      "design-pattern-selection",
      "diagnose-bug",
      "domain-driven-design",
      "erd-html-diagrams",
      "git-branch-management",
      "github-actions-cicd",
      "github-cli",
      "github-issue-discovery",
      "github-issue-publisher",
      "github-label-manager",
      "gridwork-release-publisher",
      "handoff",
      "html-architecture-diagrams",
      "integration-test-design",
      "integration-testing",
      "relational-data-modeling",
      "sdd-requirements",
      "tdd",
      "ubiquitous-language",
      "uml-html-diagrams"
    ]
  );

  assert.equal(manifest.stackPacks[0].id, "nextjs-springboot-postgresql");
  assert.equal(manifest.stackPacks[0].generatesProductCode, false);

  const stackPack = await readJson(manifest.stackPacks[0].manifest);
  assert.deepEqual(
    stackPack.skills.map((skill) => skill.split("/")[1]).sort(),
    [
      "docker-compose-local-guidance",
      "docker-compose-optimization",
      "dockerfile-authoring",
      "fastapi-backend-guidance",
      "fastapi-performance",
      "nextjs-frontend-guidance",
      "nextjs-performance",
      "nextjs-ui-design",
      "postgresql-performance",
      "postgresql-persistence-guidance",
      "springboot-backend-guidance",
      "springboot-performance"
    ]
  );

  for (const skillManifest of stackPack.skills) {
    const stackSkill = await readJson(`stack-packs/${manifest.stackPacks[0].id}/${skillManifest}`);
    assert.equal(stackSkill.generatesOnInit, false, `${stackSkill.id} must not generate code during init`);
    assert.equal(stackSkill.permissionsInheritedOnly, true, `${stackSkill.id} must inherit permissions`);
  }
});

test("backlog manager can inspect backlog and prepare an approved implementation handoff", async () => {
  const agent = await readJson("agents/backlog-manager-agent/agent.json");
  const workflow = await readJson("workflows/backlog-management/workflow.json");
  const skill = await readJson("skills/backlog-management/skill.json");

  assert.equal(workflow.primaryAgent, "backlog-manager-agent");
  assert.ok(agent.allowedSkills.includes("github-cli"));
  assert.ok(agent.allowedSkills.includes("github-issue-discovery"));
  assert.ok(agent.allowedSkills.includes("handoff"));
  assert.ok(skill.humanGates.includes("afk_delegation"));
  assert.ok(workflow.producedOutputs.includes("work_order_candidate"));
  assert.ok(workflow.producedOutputs.includes("implementation_handoff"));
});

test("backlog task delivery composes selection, approved implementation and verification", async () => {
  const workflow = await readJson("workflows/backlog-task-delivery/workflow.json");
  const contract = await readFile(
    resolve(factoryRoot, "workflows/backlog-task-delivery/WORKFLOW.md"),
    "utf8"
  );

  assert.equal(workflow.primaryAgent, "orchestrator");
  assert.deepEqual(workflow.participatingAgents, [
    "orchestrator",
    "backlog-manager-agent",
    "implementer-agent",
    "verifier-agent"
  ]);
  assert.ok(workflow.humanGates.includes("work_order_approval"));
  assert.ok(workflow.humanGates.includes("afk_delegation"));
  assert.ok(workflow.humanGates.includes("github_write"));
  assert.ok(workflow.producedOutputs.includes("verification_decision"));
  assert.match(contract, /backlog-management -> tdd-implementation -> verification-pr/);
  assert.match(contract, /does\s+not approve the resulting work order/);
});

test("integration testing is core and FastAPI guidance is available in the stack pack", async () => {
  const manifest = await readFactoryManifest();
  const integration = await readJson("skills/integration-testing/skill.json");
  const stackPack = await readJson(manifest.stackPacks[0].manifest);

  assert.ok(manifest.skills.some((skill) => skill.id === "integration-testing"));
  assert.ok(manifest.skills.some((skill) => skill.id === "integration-test-design"));
  assert.ok(integration.allowedWorkflows.includes("tdd-implementation"));
  assert.ok(integration.allowedWorkflows.includes("verification-pr"));
  assert.ok(stackPack.technologies.includes("fastapi"));
  assert.ok(stackPack.skills.includes("skills/fastapi-backend-guidance/skill.json"));
  assert.ok(stackPack.skills.includes("skills/fastapi-performance/skill.json"));
});

test("AFK work order template contains the contract required for backlog handoff", async () => {
  const template = await readFile(resolve(factoryRoot, "templates/work-order-afk.md"), "utf8");

  for (const required of [
    "work_order_id",
    "run_id",
    "workflow",
    "agent",
    "## Path Scopes",
    "## Acceptance Criteria",
    "## Allowed Commands",
    "## Gates",
    "## Definition Of Done"
  ]) {
    assert.match(template, new RegExp(required), `work order template should include ${required}`);
  }
});

test("full-v1 catalog registers every core agent, workflow and skill directory", async () => {
  const manifest = await readFactoryManifest();

  assert.deepEqual(
    await directoryNames("agents"),
    manifest.agents.map((entry) => entry.id).sort()
  );
  assert.deepEqual(
    await directoryNames("workflows"),
    manifest.workflows.map((entry) => entry.id).sort()
  );
  assert.deepEqual(
    await directoryNames("skills"),
    manifest.skills.map((entry) => entry.id).sort()
  );

  const stackPackRef = manifest.stackPacks[0];
  const stackPack = await readJson(stackPackRef.manifest);
  assert.deepEqual(
    await directoryNames(`stack-packs/${stackPackRef.id}/skills`),
    stackPack.skills.map((entry) => entry.split("/")[1]).sort()
  );
});

test("full-v1 agent, workflow and skill references are internally consistent", async () => {
  const manifest = await readFactoryManifest();
  const agents = new Map();
  const workflows = new Map();
  const skills = new Map();

  for (const entry of manifest.agents) {
    agents.set(entry.id, {
      entry,
      value: await readJson(entry.manifest)
    });
  }
  for (const entry of manifest.workflows) {
    workflows.set(entry.id, {
      entry,
      value: await readJson(entry.manifest)
    });
  }
  for (const entry of manifest.skills) {
    skills.set(entry.id, {
      entry,
      value: await readJson(entry.manifest)
    });
  }
  for (const stackPackRef of manifest.stackPacks ?? []) {
    const stackPack = await readJson(stackPackRef.manifest);
    for (const stackSkillManifest of stackPack.skills ?? []) {
      const manifestPath = `stack-packs/${stackPackRef.id}/${stackSkillManifest}`;
      const value = await readJson(manifestPath);
      skills.set(value.id, {
        entry: {
          id: value.id,
          manifest: manifestPath,
          contract: manifestPath.replace(/skill\.json$/, "SKILL.md")
        },
        value
      });
    }
  }

  for (const [agentId, { entry, value }] of agents) {
    for (const workflowId of value.allowedWorkflows) {
      assert.equal(workflows.has(workflowId), true, `${agentId} references missing workflow ${workflowId}`);
    }
    for (const skillId of value.allowedSkills) {
      assert.equal(skills.has(skillId), true, `${agentId} references missing skill ${skillId}`);
      assert.equal(
        skills.get(skillId).value.allowedAgents.includes(agentId),
        true,
        `${skillId} does not allow agent ${agentId}`
      );
    }
    for (const policyRef of value.policyRefs) {
      assert.equal(
        await fileExists(resolve(factoryRoot, dirname(entry.manifest), policyRef)),
        true,
        `${agentId} references missing policy ${policyRef}`
      );
    }
  }

  for (const [workflowId, { value }] of workflows) {
    assert.equal(agents.has(value.primaryAgent), true, `${workflowId} references missing primary agent`);
    assert.equal(
      agents.get(value.primaryAgent).value.allowedWorkflows.includes(workflowId),
      true,
      `${value.primaryAgent} does not allow primary workflow ${workflowId}`
    );
    for (const agentId of value.participatingAgents) {
      assert.equal(agents.has(agentId), true, `${workflowId} references missing agent ${agentId}`);
    }
    for (const skillId of value.allowedSkills) {
      assert.equal(skills.has(skillId), true, `${workflowId} references missing skill ${skillId}`);
      assert.equal(
        skills.get(skillId).value.allowedWorkflows.includes(workflowId),
        true,
        `${skillId} does not allow workflow ${workflowId}`
      );
      assert.equal(
        skills.get(skillId).value.allowedAgents.some((agentId) => value.participatingAgents.includes(agentId)),
        true,
        `${workflowId} has no participating agent allowed to use ${skillId}`
      );
    }
  }

  for (const [skillId, { entry, value }] of skills) {
    for (const agentId of value.allowedAgents) {
      assert.equal(agents.has(agentId), true, `${skillId} references missing agent ${agentId}`);
    }
    for (const workflowId of value.allowedWorkflows) {
      assert.equal(workflows.has(workflowId), true, `${skillId} references missing workflow ${workflowId}`);
    }
    for (const policyRef of value.toolPolicyRefs ?? []) {
      assert.equal(
        await fileExists(resolve(factoryRoot, dirname(entry.manifest), policyRef)),
        true,
        `${skillId} references missing tool policy ${policyRef}`
      );
    }
  }
});

test("all core and stack skills contain actionable instructions", async () => {
  const manifest = await readFactoryManifest();
  const contracts = manifest.skills.map((entry) => entry.contract);

  for (const stackPackRef of manifest.stackPacks ?? []) {
    const stackPack = await readJson(stackPackRef.manifest);
    for (const skillManifest of stackPack.skills ?? []) {
      contracts.push(`stack-packs/${stackPackRef.id}/${skillManifest.replace(/skill\.json$/, "SKILL.md")}`);
    }
  }

  for (const contract of contracts) {
    const content = await readFile(resolve(factoryRoot, contract), "utf8");
    const meaningfulLines = content.split(/\r?\n/).filter((line) => line.trim()).length;

    assert.ok(meaningfulLines >= 18, `${contract} should contain substantive instructions`);
    assert.match(
      content,
      /## (Procedure|Workflow|Execution Shape|Process|Start By Detecting|Recommended Factory Command)/,
      `${contract} should define an actionable execution section`
    );
  }
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

test("workflow usage guide covers every workflow with examples and approval guidance", async () => {
  const manifest = await readFactoryManifest();
  const guide = await readFile(resolve(factoryRoot, "docs/WORKFLOW_GUIDE.md"), "utf8");
  const quickstart = await readFile(resolve(factoryRoot, "QUICKSTART.md"), "utf8");

  for (const workflow of manifest.workflows) {
    assert.match(guide, new RegExp(workflow.id), `guide should cover ${workflow.id}`);
  }

  assert.match(guide, /## End-To-End Examples/);
  assert.match(guide, /## Useful Approval Phrases/);
  assert.match(guide, /Approve AFK delegation/);
  assert.match(quickstart, /\.gridwork\/docs\/WORKFLOW_GUIDE\.md/);
});

test("architecture diagram template is self-contained", async () => {
  const template = await readFile(resolve(factoryRoot, "templates/architecture-diagram.html"), "utf8");

  assert.match(template, /<!doctype html>/i);
  assert.doesNotMatch(template, /https?:\/\//i);
  assert.doesNotMatch(template, /<script[^>]+src=/i);
  assert.doesNotMatch(template, /<link[^>]+href=/i);
});
