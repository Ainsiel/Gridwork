# GQ-010 - Modelo de workflows

- Estado: accepted
- Fuente: alcance de multiples workflows aceptado en GQ-001
- Pregunta origen: GQ-010
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/`

## Pregunta

Como debe Gridwork definir multiples workflows como ideacion, arquitectura DDD, implementacion TDD y verificacion PR si la activacion ocurre por prompts Markdown y no por `gridwork run`?

## Por que importa

El usuario quiere varios flujos de trabajo con agentes, skills, reglas, permisos y trazabilidad. Si los workflows son prompts libres sin estructura, se pierde control. Si son codigo rigido ejecutado por CLI, Gridwork contradice la decision de v1: init-only + prompts Markdown.

## Respuesta recomendada

Definir workflows como manifests declarativos versionados, con pasos, agentes, skills, gates, permisos requeridos, outputs y criterios de cierre.

Cada workflow deberia tener:

- `workflow.json` como manifest machine-readable;
- `WORKFLOW.md` como descripcion humana;
- templates opcionales;
- schemas opcionales;
- policy overrides opcionales, sin poder escalar permisos globales.

Estructura:

```text
.gridwork/workflows/ideation-from-zero/
  workflow.json
  WORKFLOW.md
  templates/
  schemas/
```

## Ejemplo de `workflow.json`

```json
{
  "id": "tdd-implementation",
  "version": "0.1.0",
  "mode": "afk",
  "description": "Implementa una issue usando TDD, evidencia y validacion.",
  "requires": {
    "workOrder": true,
    "issue": true,
    "traceability": true
  },
  "steps": [
    {
      "id": "read-issue",
      "agent": "orchestrator",
      "skills": [],
      "outputs": ["issue-summary"]
    },
    {
      "id": "write-failing-test",
      "agent": "implementer",
      "skills": ["tdd"],
      "outputs": ["failing-test-evidence"]
    },
    {
      "id": "implement-code",
      "agent": "implementer",
      "skills": ["tdd"],
      "outputs": ["changed-files"]
    },
    {
      "id": "run-tests",
      "agent": "implementer",
      "skills": ["tdd"],
      "outputs": ["passing-test-evidence"]
    },
    {
      "id": "verify",
      "agent": "verifier",
      "skills": ["review"],
      "outputs": ["verification-report"]
    }
  ],
  "gates": {
    "requiresTestsPassing": true,
    "requiresEvidence": true,
    "requiresNoScopeCreep": true
  },
  "permissions": {
    "externalSideEffects": false,
    "deploy": false,
    "readSecrets": false
  }
}
```

## Workflows iniciales recomendados

```text
01-intake-existing-code
02-ideation-from-zero
03-architecture-ddd
04-tdd-implementation
05-verification-pr
```

Capacidades relacionadas como `sdd-requirements`, `backlog-planning`, `github-actions-cicd`, `diagnose-bug` y `handoff` son skills, no workflows base.

Workflows diferidos para versiones futuras:

```text
create-skill
create-stack-pack
install-skill
install-stack-pack
```

## Reglas recomendadas

- Todo workflow tiene ID y version.
- Todo workflow define modo: `hitl`, `afk`, `assisted`.
- Todo workflow declara agentes y skills permitidas.
- Todo workflow declara outputs esperados.
- Todo workflow declara gates de cierre.
- El orquestador registra cada step.
- Un workflow no puede aumentar permisos globales.
- Un workflow puede pedir aprobacion humana.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Los workflows se definiran como carpetas versionadas.
- Cada workflow puede tener `workflow.json` como manifest estructurado.
- Cada workflow tendra `WORKFLOW.md` para humanos y agentes.
- Revision posterior: los workflows no deben generar contratos de agente como prompts. El usuario activa al orquestador con `.gridwork/agents/orchestrator/PROMPT.md`, y el orquestador lee el `WORKFLOW.md` correspondiente.
- Los workflows declararan pasos, agentes, skills, permisos, gates, outputs y criterios de cierre.
- Los workflows de creacion/instalacion dinamica de skills y stack packs quedan diferidos para versiones futuras.
- Revision posterior: la CLI v1 no ejecuta workflows con `gridwork run`.

## Decision registrada

Decision aceptada:

```text
workflow_model = versioned_prompt_playbook
workflow_manifest = workflow.json_optional
workflow_human_instructions = WORKFLOW.md
workflow_activation_prompt = delegated_by_orchestrator_agent_prompt
workflow_can_define_steps_agents_skills_gates_outputs = true
workflow_cannot_escalate_global_permissions = true
gridwork_run_command_v1 = false
```

Regla:

```text
WORKFLOW.md define la guia humana/agente del proceso.
El prompt del agente activa al orquestador por chat.
workflow.json puede ayudar a validar estructura, pero no implica ejecucion por CLI en v1.
```

## Supuestos

- La CLI TypeScript no interpreta workflows para ejecutarlos en v1.
- El agente lee prompts Markdown y actua como orquestador.
- `WORKFLOW.md` sirve para humanos y agentes.
- Los workflows pueden ser extendidos por stack packs.
- Los workflows pueden estar deshabilitados.

## Riesgos

- Workflows demasiado declarativos pueden no capturar logica compleja.
- Workflows demasiado imperativos pueden acoplarse al runner.
- Si los gates no son claros, se cierran tareas sin evidencia.
- Si los workflows no tienen version, se pierde reproducibilidad.

## Preguntas abiertas

- Los workflows pueden llamar subworkflows?
- Como se resuelven overrides de stack packs?
- Que workflows vienen instalados por defecto en `gridwork init`?
- El workflow de CI/CD debe estar disabled por defecto?

## Artefactos a crear o actualizar

- `.gridwork/workflows/`
- `.gridwork/schemas/workflow.schema.json`
- `.gridwork/policies/workflow-policy.md`
- `docs/WORKFLOW_MODEL.md`
- `docs/ORCHESTRATOR_ARCHITECTURE.md`

## Evidencia y notas

- Inspirado en la fabrica destilada, que separa workflows de agentes y rules.
- Inspirado en la fabrica basica, que ejecuta un ciclo de fases con gates y artefactos.
- Adaptado a Gridwork como modelo declarativo ejecutable por TypeScript.
