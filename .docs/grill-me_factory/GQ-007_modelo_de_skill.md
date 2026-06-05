# GQ-007 - Modelo de skill

- Estado: accepted
- Fuente: decisiones aceptadas en GQ-005 y GQ-006
- Pregunta origen: GQ-007
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/`

## Pregunta

Como debe definirse una skill en Gridwork para que sea reutilizable, versionable, limitada por permisos y utilizable por distintos agentes?

## Por que importa

Las skills son el mecanismo principal para especializar la fabrica. Si las skills son solo prompts sueltos, sera dificil gobernarlas, probarlas y reutilizarlas. Si son demasiado complejas, la fabrica pierde simplicidad.

El usuario tambien quiere poder agregar skills especificas por stack despues de instalar Gridwork.

## Respuesta recomendada

Definir una skill como una carpeta versionada con manifest + instrucciones + recursos opcionales.

Estructura recomendada:

```text
.gridwork/skills/tdd/
  skill.json
  SKILL.md
  examples.md
  schemas/
  scripts/
```

`skill.json` define metadata, triggers, permisos requeridos, agentes que pueden usarla, workflows compatibles y outputs esperados.

`SKILL.md` contiene las instrucciones humanas/agente.

Scripts y schemas son opcionales.

## Ejemplo de `skill.json`

```json
{
  "id": "tdd",
  "version": "0.1.0",
  "name": "Test Driven Development",
  "description": "Guia al agente por un ciclo red-green-refactor para implementar una tarea con tests primero.",
  "triggers": ["tdd", "tests first", "red-green-refactor", "implementation"],
  "allowedAgents": ["implementer"],
  "allowedWorkflows": ["tdd-implementation"],
  "requiredPermissions": {
    "readRepo": true,
    "writeFiles": true,
    "runTests": true
  },
  "forbiddenPermissions": {
    "deploy": true,
    "readSecrets": true
  },
  "outputs": [
    "test-plan",
    "failing-test-evidence",
    "passing-test-evidence",
    "changed-files",
    "refactor-notes"
  ],
  "evidenceRequired": true
}
```

## Reglas recomendadas

- Una skill no otorga permisos por si sola.
- Una skill solo declara permisos requeridos.
- El orquestador cruza permisos de workflow + agente + skill.
- Una skill puede ser usada por varios agentes solo si esta declarado.
- Las skills especificas de stack viven en stack packs.
- Las skills deben tener version.
- Las skills deben tener triggers claros.
- Las skills con scripts deben declarar comandos permitidos.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Una skill sera una carpeta versionada.
- La skill tendra `skill.json` como manifest.
- La skill tendra `SKILL.md` como instrucciones.
- Podra tener recursos opcionales como examples, schemas y scripts.
- La skill no otorga permisos por si sola; el orquestador cruza permisos de workflow, agente y skill.

## Decision registrada

Decision aceptada:

```text
skill_model = versioned_folder_with_manifest_and_instructions
skill_manifest = skill.json
skill_instructions = SKILL.md
skill_cannot_grant_permissions = true
orchestrator_validates_workflow_agent_skill_permissions = true
```

Regla:

```text
La skill declara capacidades y requisitos.
El orquestador decide si puede usarse.
```

## Supuestos

- La skill base puede ser Markdown-first.
- La parte ejecutable es opcional.
- `npx gridwork init` puede validar `skill.json` contra un schema al instalar o actualizar la fabrica.
- Durante el uso, el orquestador/agente debe leer el manifest antes de aplicar la skill.
- Las skills de terceros deben instalarse con cuidado y policy.

## Riesgos

- Skills sin manifests seran dificiles de auditar.
- Skills con permisos implicitos pueden romper seguridad.
- Skills demasiado genericas pueden ser inutiles.
- Skills especificas de stack pueden contaminar el core si no viven en stack packs.

## Preguntas abiertas

- Las skills externas se podran instalar desde npm, GitHub o solo local?
- Una skill puede traer scripts ejecutables?
- Como se aprueba una skill nueva creada por workflow?
- Las skills deben tener tests/evals?

## Artefactos a crear o actualizar

- `.gridwork/skills/`
- `.gridwork/schemas/skill.schema.json`
- `.gridwork/policies/skill-policy.md`
- `docs/SKILL_MODEL.md`
- `docs/STACK_EXTENSION_MODEL.md`

## Evidencia y notas

- Inspirado en las skills de `.example/.agents/skills`, especialmente `grill-me`, `to-issues`, `tdd`, `diagnose`, `review` y `write-a-skill`.
- A diferencia de esas skills, Gridwork deberia agregar manifest explicito para permisos, agentes y workflows.
