# GQ-087 - Inventario de archivos instalados por la fabrica

- Estado: accepted
- Fuente: decisiones GQ-003, GQ-004, GQ-011, GQ-013, GQ-019, GQ-028, GQ-043, GQ-044, GQ-045, GQ-047, GQ-061, GQ-062, GQ-063, GQ-085 y GQ-086
- Pregunta origen: GQ-087
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `factory/.gridwork/`, bundle de fabrica, `npx gridwork init`, schemas, templates, policies, agentes, workflows, skills

## Pregunta

Que archivos exactos debe traer la fabrica instalada por `npx gridwork init`?

La duda concreta:

```text
Cual es el inventario minimo instalable del MVP,
y cual es el inventario completo esperado para Gridwork v1?
```

## Por que importa

GQ-085 decidio construir el MVP por rebanadas verticales. GQ-086 decidio que `init` debe probarse e2e.

Para eso necesitamos saber que instala realmente el bundle:

```text
factory/.gridwork/ -> bundle -> npx gridwork init -> .gridwork/
```

Si no hay inventario, el MVP puede crecer sin control o quedarse demasiado vacio. El inventario tambien sirve para:

- tests e2e;
- validacion de bundle;
- lockfile;
- package/release notes;
- backlog inicial;
- DoD de `init`.

## Opciones

### Opcion A - Inventario unico completo desde el primer MVP

El primer bundle incluye todos los agentes, workflows, skills, stack pack, schemas y templates v1.

Ventajas:

- instala una fabrica mas completa desde el inicio;
- reduce trabajo de expansion posterior;
- muestra la vision completa de Gridwork.

Desventajas:

- retrasa el primer `init` usable;
- aumenta superficie de validacion;
- hace mas dificil testear el MVP;
- puede forzar contratos aun inmaduros.

### Opcion B - Inventario minimo solamente

El primer bundle incluye solo lo necesario para probar `init`.

Ventajas:

- rapido;
- facil de validar;
- reduce riesgo inicial.

Desventajas:

- la fabrica instalada puede sentirse demasiado vacia;
- obliga a definir otro inventario despues;
- puede dejar ambiguo el camino hacia v1.

### Opcion C - Dos inventarios versionados

Definir dos niveles:

```text
minimal_installable_factory
full_v1_factory
```

El MVP instala el inventario minimo, pero el documento deja definido el inventario completo esperado de v1.

Ventajas:

- permite avanzar con MVP;
- mantiene clara la vision final;
- ayuda a escribir tests por fases;
- evita sobredisenar el primer corte;
- permite que `init` e2e tenga expectativas estables.

Desventajas:

- requiere mantener dos listas;
- algunas rutas existiran despues, no en el primer bundle;
- el validador debe saber en que profile esta.

## Respuesta recomendada

Usar Opcion C:

```text
factory_inventory_model = minimal_mvp_plus_full_v1
```

Definir:

- inventario minimo instalable para MVP;
- inventario completo para v1;
- profile de validacion:

```text
factory_profile = minimal-mvp | full-v1
```

El primer MVP debe validar `minimal-mvp`. La expansion posterior valida `full-v1`.

## Inventario minimo MVP

La fabrica minima debe instalar:

```text
.gridwork/
  README.md
  QUICKSTART.md
  factory.json
  agents/
    orchestrator/
      PROMPT.md
      AGENT.md
      agent.json
  workflows/
    intake-existing-code/
      WORKFLOW.md
      workflow.json
  skills/
    handoff/
      SKILL.md
      skill.json
  policies/
    security-policy.md
    logging-policy.md
    github-cli-policy.md
    path-scopes.md
  schemas/
    factory.schema.json
    agent.schema.json
    workflow.schema.json
    skill.schema.json
    lockfile.schema.json
  templates/
    init-report.md
    source-resolution-report.md
    validation-report.md
    compatibility-report.md
    lockfile-report.md
    conflicts.md
    apply-plan.md
```

## Reglas del inventario minimo

El inventario minimo debe:

- activar al orquestador por `PROMPT.md`;
- incluir contratos basicos de agente/workflow/skill;
- incluir policies de seguridad y logging;
- incluir path scopes basicos;
- incluir templates requeridos por `init`;
- incluir schemas minimos parseables;
- no incluir codigo productivo;
- no incluir frontend/backend/database/docker;
- no requerir GitHub configurado;
- no requerir stack detectado;
- no depender de agentes AFK.

## Inventario completo v1

La fabrica completa v1 debe incluir:

```text
.gridwork/
  README.md
  QUICKSTART.md
  factory.json
  agents/
    orchestrator/
    intake-agent/
    software-architect/
    planner-agent/
    implementer-agent/
    verifier-agent/
  workflows/
    intake-existing-code/
    ideation-from-zero/
    architecture-ddd/
    tdd-implementation/
    verification-pr/
  skills/
    handoff/
    diagnose-bug/
    tdd/
    sdd-requirements/
    backlog-planning/
    github-issue-publisher/
    github-issue-discovery/
    github-actions-cicd/
    html-architecture-diagrams/
    gridwork-release-publisher/
  stack-packs/
    nextjs-springboot-postgresql/
  policies/
    security-policy.md
    logging-policy.md
    traceability.md
    github-cli-policy.md
    github-labels.json
    path-scopes.md
    backlog-policy.md
    git-policy.md
    test-command-policy.md
  schemas/
    factory.schema.json
    agent.schema.json
    workflow.schema.json
    skill.schema.json
    stack-pack.schema.json
    work-order.schema.json
    run.schema.json
    event.schema.json
    metric.schema.json
    tool-call.schema.json
    approval.schema.json
    lockfile.schema.json
  templates/
    init-report.md
    source-resolution-report.md
    download-report.md
    cache-report.md
    validation-report.md
    compatibility-report.md
    checksum-report.md
    lockfile-report.md
    conflicts.md
    apply-plan.md
    work-order.md
    github-issue.md
    verification-report.md
    handoff.md
    factory-release-plan.md
    factory-release-notes.md
    cli-release-plan.md
    cli-release-notes.md
```

Cada agente/workflow/skill debe tener:

```text
AGENT.md + agent.json
WORKFLOW.md + workflow.json
SKILL.md + skill.json
```

segun corresponda.

## Profiles de validacion

`factory.json` debe declarar:

```json
{
  "factoryProfile": "minimal-mvp"
}
```

o:

```json
{
  "factoryProfile": "full-v1"
}
```

El validador debe usar el profile para decidir que archivos son obligatorios.

## Propuesta inicial

```text
factory_inventory_model = minimal_mvp_plus_full_v1
factory_profile_field = factoryProfile
factory_profile_minimal_mvp = minimal-mvp
factory_profile_full_v1 = full-v1
minimal_mvp_requires_orchestrator_prompt = true
minimal_mvp_requires_installed_readme = true
minimal_mvp_requires_installed_quickstart = true
minimal_mvp_requires_orchestrator_agent_contract = true
minimal_mvp_requires_one_workflow = intake-existing-code
minimal_mvp_requires_one_skill = handoff
minimal_mvp_requires_core_policies = true
minimal_mvp_requires_core_schemas = true
minimal_mvp_requires_init_templates = true
minimal_mvp_generates_product_code = false
full_v1_requires_all_base_agents = true
full_v1_requires_all_base_workflows = true
full_v1_requires_all_base_skills = true
full_v1_requires_default_stack_pack_guidance = true
validator_uses_factory_profile = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres definir un unico inventario completo desde el primer MVP,
o separar inventario minimo instalable y inventario completo v1?
```

Mi recomendacion: separar ambos. El MVP instala `minimal-mvp`; v1 completa apunta a `full-v1`. Asi `init` puede probarse temprano sin perder la vision de fabrica completa.

## Respuesta del usuario

El usuario acepta la recomendacion:

- separar inventario minimo MVP e inventario completo v1;
- el primer MVP valida `minimal-mvp`;
- la fabrica completa v1 valida `full-v1`;
- `factory.json` debe declarar `factoryProfile`;
- el validador debe usar el profile para decidir archivos obligatorios;
- el inventario minimo no genera codigo productivo;
- full v1 incluye agentes, workflows, skills y stack pack base.

## Decision registrada

```text
factory_inventory_model = minimal_mvp_plus_full_v1
factory_profile_field = factoryProfile
factory_profile_minimal_mvp = minimal-mvp
factory_profile_full_v1 = full-v1
minimal_mvp_requires_orchestrator_prompt = true
minimal_mvp_requires_orchestrator_agent_contract = true
minimal_mvp_requires_one_workflow = intake-existing-code
minimal_mvp_requires_one_skill = handoff
minimal_mvp_requires_core_policies = true
minimal_mvp_requires_core_schemas = true
minimal_mvp_requires_init_templates = true
minimal_mvp_generates_product_code = false
full_v1_requires_all_base_agents = true
full_v1_requires_all_base_workflows = true
full_v1_requires_all_base_skills = true
full_v1_requires_default_stack_pack_guidance = true
validator_uses_factory_profile = true
```

## Regla

```text
La fabrica tiene dos inventarios: `minimal-mvp` y `full-v1`.
`minimal-mvp` es suficiente para probar `init` y activar el orquestador.
`full-v1` contiene todos los agentes, workflows, skills, policies, schemas, templates y stack pack base.
`factory.json` declara `factoryProfile`.
El validador usa `factoryProfile` para decidir archivos obligatorios.
Ningun profile genera codigo productivo.
```

## Supuestos

- El primer MVP se enfoca en instalar algo real y activable.
- La fabrica completa v1 se expande despues de validar `init`.
- El validador puede soportar perfiles.
- El bundle instala `.gridwork/`, no codigo productivo.

## Riesgos

- Si el minimo es demasiado pequeno, no demuestra valor.
- Si el minimo es demasiado grande, retrasa el MVP.
- Si no hay profile, el validador no sabra que exigir.
- Si el inventario completo no se documenta, la expansion v1 puede quedar difusa.

## Artefactos a crear o actualizar

- `factory/.gridwork/factory.json`
- `factory/.gridwork/agents/`
- `factory/.gridwork/workflows/`
- `factory/.gridwork/skills/`
- `factory/.gridwork/policies/`
- `factory/.gridwork/schemas/`
- `factory/.gridwork/templates/`
- `docs/FACTORY_INVENTORY.md`
- `packages/cli/src/validation/minimal-validator.ts`

## Evidencia y notas

- Esta pregunta concreta que instala `init`.
- Complementa GQ-019: separa PROMPT, AGENT, WORKFLOW y SKILL.
- Complementa GQ-028: `init` instala fabrica, no codigo productivo.
- Complementa GQ-085: el primer MVP usa inventario minimo.
- Complementa GQ-086: acceptance tests deben assertar el inventario minimo.
- Decision del usuario: aceptar inventario separado `minimal-mvp` / `full-v1` con profile de validacion.
- Revision posterior GQ-088: el inventario `minimal-mvp` incluye `.gridwork/README.md` y `.gridwork/QUICKSTART.md`.
