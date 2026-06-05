# GQ-028 - Layout instalado por `npx gridwork init`

- Estado: accepted
- Fuente: consolidacion de decisiones GQ-002 a GQ-027
- Pregunta origen: GQ-028
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/`, `.factory/`, `.gitignore`

## Pregunta

Que debe instalar exactamente `npx gridwork init` en un repositorio para dejar lista la fabrica v1?

## Por que importa

Ya se decidio que v1 no tiene `gridwork run`. El comando `init` es el punto de instalacion de la fabrica. Por eso debe quedar claro que archivos crea, que carpetas versiona, que queda ignorado y que no debe generar.

Tambien es importante recordar una decision anterior: `init` no genera codigo de producto. No crea frontend, backend, database, Docker ni Docker Compose. Instala gobierno, agentes, workflows, skills, policies, schemas, templates y stack knowledge.

## Respuesta recomendada

`npx gridwork init` debe instalar una fabrica completa pero no intrusiva:

```text
.gridwork/
  README.md
  QUICKSTART.md
  factory.json
  agents/
  workflows/
  skills/
  stack-packs/
  policies/
  schemas/
  templates/

.factory/
  runs/
  indexes/

.gitignore
```

`.gridwork/` se versiona. `.factory/` queda en `.gitignore`.

## Layout recomendado de `.gridwork/`

```text
.gridwork/
  factory.json

  agents/
    orchestrator/
      agent.json
      AGENT.md
      PROMPT.md
    intake-agent/
      agent.json
      AGENT.md
    software-architect/
      agent.json
      AGENT.md
    planner-agent/
      agent.json
      AGENT.md
    implementer-agent/
      agent.json
      AGENT.md
    verifier-agent/
      agent.json
      AGENT.md

  workflows/
    intake-existing-code/
      workflow.json
      WORKFLOW.md
    ideation-from-zero/
      workflow.json
      WORKFLOW.md
    architecture-ddd/
      workflow.json
      WORKFLOW.md
    tdd-implementation/
      workflow.json
      WORKFLOW.md
    verification-pr/
      workflow.json
      WORKFLOW.md

  skills/
    sdd-requirements/
      skill.json
      SKILL.md
    backlog-planning/
      skill.json
      SKILL.md
    github-issue-publisher/
      skill.json
      SKILL.md
    github-issue-discovery/
      skill.json
      SKILL.md
    github-actions-cicd/
      skill.json
      SKILL.md
    html-architecture-diagrams/
      skill.json
      SKILL.md
    diagnose-bug/
      skill.json
      SKILL.md
    handoff/
      skill.json
      SKILL.md
    tdd/
      skill.json
      SKILL.md
    git-branch-management/
      skill.json
      SKILL.md
    gridwork-release-publisher/
      skill.json
      SKILL.md

  stack-packs/
    nextjs-springboot-postgresql/
      stack-pack.json
      STACK.md
      skills/
      policies/
        test-commands.json
        quality-commands.json
        path-hints.md
        vertical-slice-policy.md
        ddd-stack-guidance.md
        docker-compose-guidance.md
      templates/

  policies/
    permissions.md
    path-scopes.md
    tool-allowlist.md
    workflow-policy.md
    skill-policy.md
    traceability.md
    logging-policy.md
    security-policy.md
    human-gates.md
    github-cli-policy.md
    github-labels.json
    git-policy.md
    backlog-policy.md
    work-order-policy.md

  schemas/
    factory.schema.json
    agent.schema.json
    workflow.schema.json
    skill.schema.json
    run.schema.json
    event.schema.json
    metric.schema.json
    approval.schema.json
    work-order.schema.json
    tool-call.schema.json
    github-label-catalog.schema.json

  templates/
    idea-brief.md
    domain-notes.md
    sdd.md
    use-case.md
    test-case.md
    functional-requirements.md
    non-functional-requirements.md
    requirements-traceability-matrix.md
    architecture.md
    strategic-ddd.md
    bounded-contexts.md
    context-map.md
    domain-model.md
    aggregates.md
    domain-events.md
    api-design.md
    data-model.md
    architecture-readiness-check.md
    backlog-input-map.md
    adr.md
    github-issue.md
    issue-draft.md
    backlog-plan.md
    domain-slice-map.md
    implementation-order.md
    publish-plan.md
    published-issues.md
    intake-summary.md
    repo-context.md
    affected-areas.md
    stack-context.md
    change-brief.md
    scope-boundaries.md
    vertical-slice-candidate.md
    affected-domain-map.md
    issue-discovery-report.md
    candidate-work-orders.md
    work-order.md
    agent-contract.md
    skill-contract.md
    workflow-contract.md
    git-action-plan.md
    github-actions-plan.md
    github-actions-workflow.yml
    cicd-validation-plan.md
    init-report.md
    checksum-report.md
    extraction-report.md
    validation-report.md
    update-report.md
    apply-plan.md
    conflicts.md
    lockfile-report.md
    source-resolution-report.md
    compatibility-report.md
    gridwork-release-plan.md
    gridwork-release-notes.md
    bundle-manifest.json
    cli-release-plan.md
    cli-release-notes.md
    cli-npm-pack-report.md
    verification-report.md
    pr-comment.md
    tdd-plan.md
    tdd-evidence.md
    implementation-summary.md
    diagnosis.md
    agent-log.md
    architecture-diagram.html
```

## Layout recomendado de `.factory/`

```text
.factory/
  runs/
  indexes/
```

`init` puede crear la carpeta vacia o dejar instrucciones para que el primer run la cree. En ambos casos debe asegurar que `.factory/` este en `.gitignore`.

## Archivos que `init` no debe crear

```text
frontend/
backend/
database/
docker/
docker-compose.yml
package.json de la app
pom.xml de la app
codigo productivo
```

El stack Next.js + Spring Boot + PostgreSQL existe como conocimiento, skills, templates y policies, no como codigo generado.

## Propuesta inicial

```text
init_installs_gridwork_folder = true
init_installs_factory_runtime_folder = true
init_updates_gitignore_for_factory = true
init_generates_product_code = false
init_installs_agents = true
init_installs_workflows = true
init_installs_skills = true
init_installs_policies = true
init_installs_schemas = true
init_installs_templates = true
init_installs_default_stack_pack = nextjs_springboot_postgresql
init_requires_external_dependencies = false
```

## Pregunta para decidir

La duda principal:

```text
Quieres que `init` instale todos los agentes/skills/workflows base desde el inicio,
o prefieres que instale solo el core minimo y deje algunas skills como opcionales?
```

Mi recomendacion para v1: instalar todo el paquete base desde el inicio. Es una fabrica personal, y eso evita comandos extra de instalacion.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `npx gridwork init` debe instalar todo el paquete base desde el inicio.
- No se dejan agentes, workflows o skills base como instalacion opcional en v1.
- La fabrica personal debe quedar lista sin comandos extra.
- `init` no debe generar codigo productivo de la aplicacion.

## Decision registrada

```text
init_installs_gridwork_folder = true
init_installs_factory_runtime_folder = true
init_updates_gitignore_for_factory = true
init_generates_product_code = false
init_installs_full_base_package = true
init_installs_minimal_core_only = false
init_first_mvp_profile = minimal-mvp
init_full_v1_profile = full-v1
init_validator_uses_factory_profile = true
init_installs_gridwork_readme = true
init_installs_gridwork_quickstart = true
init_writes_project_root_docs_v1 = false
init_installs_agents = true
init_installs_workflows = true
init_installs_skills = true
init_installs_policies = true
init_installs_schemas = true
init_installs_templates = true
init_installs_default_stack_pack = nextjs_springboot_postgresql
init_requires_external_dependencies = false
```

## Regla

```text
init instala la fabrica.
init no crea la aplicacion.
init deja `.gridwork/` versionable.
init deja `.factory/` como runtime local ignorado.
El primer MVP puede instalar `minimal-mvp`.
La fabrica completa v1 instala `full-v1`.
La documentacion instalada vive dentro de `.gridwork/`.
`init` no crea docs en la raiz del proyecto destino en v1.
```

## Supuestos

- `.gridwork/` es versionado.
- `.factory/` es runtime local y queda ignorado.
- No existe `gridwork run`.
- El prompt principal vive en `.gridwork/agents/orchestrator/PROMPT.md`.
- El stack v1 es predefinido como conocimiento, no como codigo generado.

## Riesgos

- Instalar todo puede sentirse grande.
- Instalar poco puede hacer que la fabrica parezca incompleta.
- Si `init` genera codigo productivo, contradice GQ-016.
- Si `.factory/` no queda en `.gitignore`, se contamina el repositorio.

## Artefactos a crear o actualizar

- `.gridwork/`
- `.factory/`
- `.gitignore`
- `docs/PROJECT_LAYOUT.md`
- `docs/OPERATING_MODEL.md`

## Evidencia y notas

- Esta pregunta consolida decisiones previas sobre distribucion, runtime, agentes, workflows, skills, observabilidad y stack pack.
- Decision del usuario: instalar todo el paquete base en v1.
- Revision posterior: `init` tambien instala `.gridwork/policies/github-labels.json` y su schema para labels predefinidas de GitHub.
- Revision posterior: `init` tambien instala templates de `verification-report.md` y `pr-comment.md`.
- Revision posterior: `init` tambien instala templates de `tdd-plan.md` y `tdd-evidence.md`.
- Revision posterior: `init` tambien instala `.gridwork/policies/tool-allowlist.md` y `stack-packs/nextjs-springboot-postgresql/policies/test-commands.json`.
- Revision posterior: `init` tambien instala template `diagnosis.md` para artefactos de `diagnose-bug`.
- Revision posterior: `init` tambien instala template `agent-log.md` para resumen humano de runs.
- Revision posterior: `init` instala `work-order.md` como Markdown con front matter YAML para delegacion AFK.
- Revision posterior: `init` tambien instala template `agent-contract.md` para estandarizar `AGENT.md`.
- Revision posterior: `init` tambien instala template `skill-contract.md` para estandarizar `SKILL.md`.
- Revision posterior: `init` tambien instala template `workflow-contract.md` para estandarizar `WORKFLOW.md`.
- Revision posterior: el stack pack `nextjs-springboot-postgresql` instala policies, templates y skills especificas de tecnologia como guidance, sin generar codigo productivo.
- Revision posterior: `init` tambien instala templates de backlog local: `issue-draft.md`, `backlog-plan.md`, `domain-slice-map.md` e `implementation-order.md`.
- Revision posterior: `init` tambien instala templates `publish-plan.md` y `published-issues.md` para `github-issue-publisher`.
- Revision posterior: `init` tambien instala templates `issue-discovery-report.md` y `candidate-work-orders.md` para `github-issue-discovery`.
- Revision posterior: `init` tambien instala template `implementation-summary.md` para cierres del `implementer-agent`.
- Revision posterior: `init` tambien instala skill `git-branch-management` y template `git-action-plan.md`.
- Revision posterior: `init` tambien instala templates `github-actions-plan.md`, `github-actions-workflow.yml` y `cicd-validation-plan.md` para `github-actions-cicd`.
- Revision posterior: `init` tambien instala templates `idea-brief.md`, `domain-notes.md`, `functional-requirements.md`, `non-functional-requirements.md` y `requirements-traceability-matrix.md` para `ideation-from-zero` y `sdd-requirements`.
- Revision posterior: `init` tambien instala templates `strategic-ddd.md`, `bounded-contexts.md`, `context-map.md`, `domain-model.md`, `aggregates.md`, `domain-events.md`, `api-design.md`, `data-model.md`, `architecture-readiness-check.md` y `backlog-input-map.md` para `architecture-ddd`.
- Revision posterior: `init` tambien instala templates `intake-summary.md`, `repo-context.md`, `affected-areas.md`, `stack-context.md`, `change-brief.md`, `scope-boundaries.md`, `vertical-slice-candidate.md` y `affected-domain-map.md` para `intake-existing-code`.
- Revision posterior: `init` instala `.gridwork/agents/orchestrator/PROMPT.md` como loader operativo con checklist de arranque y primera respuesta obligatoria.
- Revision posterior: `init` tambien instala template `validation-report.md` para reportar validacion minima de manifests, schemas y estructura.
- Revision posterior: `init` tambien instala `.gridwork/policies/security-policy.md` para reglas de secretos, datos sensibles y redaccion.
- Revision posterior: `init` tambien instala skill `gridwork-release-publisher` y templates `gridwork-release-plan.md`, `gridwork-release-notes.md` y `bundle-manifest.json` para crear releases/tags de la fabrica Gridwork.
- Revision posterior: `init` tambien instala templates `update-report.md` y `lockfile-report.md` para reportar reparaciones y actualizaciones explicitas por version.
- Revision posterior: `init` tambien instala template `source-resolution-report.md` para reportar source, version, tag y assets resueltos antes de instalar.
- Revision posterior: `init` tambien instala template `compatibility-report.md` para reportar compatibilidad entre CLI, fabrica, schemas y contracts.
- Revision posterior: `init` tambien instala templates `cli-release-plan.md`, `cli-release-notes.md` y `cli-npm-pack-report.md` para preparar releases npm de la CLI Gridwork.
- Revision posterior: `init` tambien instala templates `init-report.md`, `checksum-report.md` y `conflicts.md` para reportes locales de instalacion, verificacion y conflictos.
- Revision posterior: `init` tambien instala template `extraction-report.md` para reportar inspeccion, staging y aplicacion segura del bundle zip.
- Revision posterior: `init` tambien instala template `apply-plan.md` para reportar creacion, actualizacion, omision, removals report-only y conflictos de archivos.
- Revision posterior GQ-087: el primer bundle MVP instala profile `minimal-mvp`; el paquete base completo corresponde al profile `full-v1`.
- Revision posterior GQ-088: `init` instala `.gridwork/README.md` y `.gridwork/QUICKSTART.md`, y no crea docs en la raiz del proyecto destino.
