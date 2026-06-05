# GQ-005 - Modelo de agente agnostico

- Estado: accepted
- Fuente: alcance aceptado en GQ-001 y manifest aceptado en GQ-004
- Pregunta origen: GQ-005
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/`

## Pregunta

Como debe definirse un agente para que Gridwork pueda utilizar Codex, Claude, OpenAI, agentes locales u otros, sin quedar acoplado a un proveedor especifico?

## Por que importa

El usuario quiere una fabrica agnostica a agentes. Para lograrlo, Gridwork no debe definir agentes como "una llamada a Claude" o "una llamada a Codex", sino como un contrato de responsabilidad, permisos, skills, inputs, outputs y evidencias.

Luego un adapter traduce ese contrato al agente real.

## Respuesta recomendada

Definir cada agente como una carpeta declarativa versionada.

Un agente en Gridwork deberia ser:

```text
agent.json + AGENT.md + PROMPT.md opcional
```

El contrato del agente debe incluir:

```text
rol + responsabilidades + permisos + skills permitidas + workflows donde participa + input schema + output schema + reglas de evidencia
```

No deberia ser:

```text
proveedor LLM especifico
```

Ejemplo de `agent.json`:

```json
{
  "id": "implementer",
  "version": "0.1.0",
  "role": "Implementa issues siguiendo TDD y restricciones del workflow.",
  "providerBinding": "adapter-selected-at-runtime",
  "allowedSkills": [
    "tdd",
    "diagnose",
    "apply-change",
    "handoff"
  ],
  "allowedWorkflows": [
    "tdd-implementation"
  ],
  "permissions": {
    "readRepo": true,
    "writeFiles": true,
    "runTests": true,
    "createIssues": false,
    "createPullRequests": false,
    "pushBranches": false,
    "deploy": false,
    "readSecrets": false
  },
  "gates": {
    "requiresWorkOrder": true,
    "requiresIssue": true,
    "requiresTraceability": true,
    "requiresValidation": true
  },
  "inputSchema": ".gridwork/schemas/agent-input.schema.json",
  "outputSchema": ".gridwork/schemas/agent-output.schema.json",
  "evidence": [
    "tests-written",
    "tests-failed-before-implementation",
    "tests-passed-after-implementation",
    "files-changed",
    "traceability-updated"
  ]
}
```

## Respuesta del usuario

El usuario acepta la recomendacion:

- Los agentes se definiran como manifests declarativos versionados en `.gridwork/agents/`.
- Cada agente puede vivir como carpeta con `agent.json`, `AGENT.md` y `PROMPT.md`.
- Un agente no sera un proveedor especifico como Codex, Claude u OpenAI.
- El agente define rol, responsabilidades, permisos, skills permitidas, workflows, schemas y evidencia.
- `AGENT.md` contiene el contrato humano/agente.
- `PROMPT.md` solo activa al agente por chat y le indica que lea su contrato.
- El adapter conecta el agente declarativo con el proveedor real.
- El adapter no puede aumentar permisos.

## Decision registrada

Decision aceptada:

```text
agent_model = declarative_provider_agnostic_manifest
agent_definitions_path = .gridwork/agents/
agent_contract_file = AGENT.md
agent_activation_prompt_file = PROMPT.md
provider_binding = adapter_selected_at_runtime
adapter_cannot_escalate_permissions = true
```

Regla:

```text
El agente define que puede hacer.
El adapter define como se ejecuta.
El orquestador valida permisos antes de delegar.
```

## Supuestos

- El agente declarativo no sabe que proveedor lo ejecuta.
- El adapter del proveedor no puede cambiar permisos.
- El orquestador valida permisos antes de llamar al agente.
- Todo agente debe producir salida estructurada y evidencia.

## Riesgos

- Si el agente se define por proveedor, Gridwork deja de ser agnostico.
- Si los permisos viven solo en prompts, no son auditables.
- Si el adapter puede cambiar reglas, se rompe la gobernanza.
- Si los outputs no tienen schema, se dificulta la trazabilidad.

## Preguntas abiertas

- Los agentes se definiran como carpetas con JSON + Markdown, o como archivos planos?
- Todos los agentes tendran `PROMPT.md` o solo los que puedan activarse directamente?
- Donde se guarda la asignacion entre agente declarativo y provider real?
- Puede un agente tener varios providers posibles?
- Como se registra que provider ejecuto una corrida concreta?

## Artefactos a crear o actualizar

- `.gridwork/agents/orchestrator/agent.json`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/agents/intake-agent/agent.json`
- `.gridwork/agents/software-architect/agent.json`
- `.gridwork/agents/planner-agent/agent.json`
- `.gridwork/agents/implementer-agent/agent.json`
- `.gridwork/agents/verifier-agent/agent.json`
- `.gridwork/schemas/agent.schema.json`
- `.gridwork/policies/permissions.md`
- `docs/AGENT_MODEL.md`

## Evidencia y notas

- La fabrica destilada define agentes por rol y responsabilidad.
- La fabrica basica define agentes como clases Python, pero para Gridwork conviene elevarlos a contratos declarativos.
- Las skills revisadas funcionan mejor si los agentes tienen allowed skills explicitas.
