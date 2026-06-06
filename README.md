# Gridwork

Gridwork is a personal, agent-agnostic software factory installed inside an existing repository. It provides an orchestrator, specialized agents, reusable skills, governed workflows, policies, templates, and local traceability without generating product code during installation.

Gridwork is operated through your coding agent chat. The TypeScript CLI only bootstraps and updates the factory; there is no `gridwork run` command.

## Quickstart

Requirements:

```text
Node.js >= 20
an existing or new Git repository
a coding agent capable of reading repository files
```

Install the published factory into the current repository:

```bash
npx gridwork@latest init --factory-version 0.1.0 --source Ainsiel/Gridwork
```

Then open:

```text
.gridwork/agents/orchestrator/PROMPT.md
```

Paste or reference that prompt in your coding agent chat and describe the work you want to perform. The orchestrator will propose a workflow, responsible agent, missing context, and approval gates before acting.

## What Init Installs

```text
.gridwork/                  versioned factory definitions
  agents/                   agent manifests, responsibilities and permissions
  workflows/                interactive, AFK and hybrid playbooks
  skills/                   reusable operational and architecture capabilities
  stack-packs/              optional technology-specific skills
  policies/                 permissions, security and human gates
  templates/                reports, architecture documents and work orders
  schemas/                  versioned JSON contracts

.gridwork-lock.json         installed source, version and file hashes
.factory/                   ignored local runtime reports and artifacts
```

Installation does not create a frontend, backend, database, Dockerfile, Compose file, or other application code. After installation, an authorized agent may modify confirmed project paths only through an approved workflow and work order.

## Factory Model

### Agents

| Agent | Responsibility |
|---|---|
| Orchestrator | Routes requests, delegates work, and enforces policies |
| Intake Agent | Refines ideas, bugs, and changes through interactive grill-me sessions |
| Software Architect | Designs DDD architecture and selects optional architecture skills |
| Planner Agent | Creates vertical-slice backlog drafts and governed GitHub plans |
| Implementer Agent | Executes approved AFK work orders using TDD |
| Verifier Agent | Reviews scope, behavior, evidence, and policy compliance |

### Workflows

| Workflow | Mode | Purpose |
|---|---|---|
| `intake-existing-code` | interactive | Refine bugs, improvements, and features for an existing codebase |
| `ideation-from-zero` | interactive | Turn a product idea into structured requirements and an SDD |
| `architecture-ddd` | interactive | Design the system from an approved SDD |
| `tdd-implementation` | AFK | Implement an approved work order through RED, GREEN, and REFACTOR |
| `verification-pr` | hybrid | Verify implementation evidence before merge decisions |

### Skills

The full factory currently contains:

```text
25 core skills
10 stack-pack skills
35 actionable skills total
```

Core capabilities include:

- requirements, use cases, test cases, and SDD traceability;
- adaptive architecture grill-me sessions;
- ubiquitous language, DDD, Clean Architecture, APIs, relational data models, ADRs, and pattern selection;
- optional self-contained HTML diagrams for C4, MER/ERD, and UML;
- vertical-slice backlog planning and governed GitHub issue operations;
- diagnosis, TDD, verification, Git branch management, and release planning;
- GitHub Actions CI/CD design.

The included `nextjs-springboot-postgresql` stack pack provides:

- Next.js architecture guidance, UI design, and performance analysis;
- Spring Boot architecture guidance and performance analysis;
- PostgreSQL persistence and performance guidance;
- Dockerfile authoring, Docker Compose local environments, and Compose optimization.

Stack skills detect project versions and conventions before use. They never expand permissions or install dependencies without approval.

## Governance And Traceability

Gridwork follows a deny-by-default permission model:

- skills never raise agent permissions;
- project and infrastructure paths must be detected or confirmed;
- AFK implementation requires an approved work order;
- commands must be allowlisted;
- Git operations, GitHub writes, dependency changes, and architecture decisions use explicit human gates;
- agents do not read real secret values;
- handoffs are created only when responsibility moves to another agent or session;
- runtime reports, decisions, metrics, and sanitized logs live under `.factory/`.

## Repository Layout

```text
packages/cli/               TypeScript npm CLI
factory/.gridwork/          installable full-v1 factory source
.docs/grill-me_factory/     design decisions and implementation history
.github/workflows/          source CI and trusted npm publishing
```

## Development

Install dependencies and validate the source repository:

```bash
npm ci
npm run build
npm test
npm run pack:cli:dry-run
```

Test `init` from this source repository:

```bash
node packages/cli/dist/index.js init
```

Prepare release artifacts without publishing:

```bash
node packages/cli/dist/index.js release factory --dry-run \
  --factory-version <version> \
  --source Ainsiel/Gridwork \
  --source-commit <commit-sha>

node packages/cli/dist/index.js release cli --dry-run \
  --source Ainsiel/Gridwork \
  --source-commit <commit-sha> \
  --confirm-package-ownership \
  --confirm-official-source
```

Release commands generate local plans and artifacts only. Remote tags, GitHub Releases, workflow execution, and npm publishing remain separate approval-gated actions.

## Current Status

```text
cli = gridwork@0.1.0 published on npm
factory = factory-v0.1.0 published on GitHub
factory_profile = full-v1
generated_product_code = false
agents = 6
workflows = 5
core_skills = 25
stack_skills = 10
```

The current next validation gate is end-to-end dogfooding of the expanded factory in a separate sandbox repository.
