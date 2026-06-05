---
id: GW-MVP-005
title: Crear prompt y contrato minimo del orquestador
phase: phase-1
status: ready
readiness: ready
implementation_status: completed
factory_profile: minimal-mvp
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:1
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-018
  - GQ-019
  - GQ-043
  - GQ-061
  - GQ-087
acceptance_status: ready
github_issue: null
---

# GW-MVP-005 - Crear prompt y contrato minimo del orquestador

## Objetivo

Crear los archivos minimos para activar el orquestador por chat y definir su contrato operativo.

## Contexto

Gridwork v1 no usa `gridwork run`. El usuario activa la fabrica pasando el prompt del orquestador al agente por chat.

## Alcance incluido

- Crear `factory/.gridwork/agents/orchestrator/PROMPT.md`.
- Crear `factory/.gridwork/agents/orchestrator/AGENT.md`.
- Crear `factory/.gridwork/agents/orchestrator/agent.json`.
- El prompt debe ser loader operativo, no contrato completo.
- El contrato debe declarar rol, responsabilidades, limites y primera respuesta esperada.
- El orquestador debe referenciar `factory.json`, policies, workflows y skills.

## Fuera de alcance

- Crear prompts para agentes especializados.
- Implementar adapters automaticos.
- Crear runtime de agentes.
- Crear workflows completos v1.

## Criterios de aceptacion

- `PROMPT.md` existe y apunta a los archivos que el orquestador debe leer.
- `AGENT.md` existe y define contrato minimo del orquestador.
- `agent.json` existe y parsea como JSON valido.
- `PROMPT.md` no duplica el contenido completo de `AGENT.md`.
- El prompt no menciona `gridwork run`.
- El primer paso recomendado es entender la solicitud antes de crear run.

## Pruebas esperadas

- Revision de contenido para separar `PROMPT.md` y `AGENT.md`.
- Parseo JSON de `agent.json`.
- Check textual de que no aparece `gridwork run`.

## Archivos probables

- `factory/.gridwork/agents/orchestrator/PROMPT.md`
- `factory/.gridwork/agents/orchestrator/AGENT.md`
- `factory/.gridwork/agents/orchestrator/agent.json`

## Riesgos

- Convertir el prompt en un contrato gigante.
- Dejar el contrato demasiado ambiguo.
- Mezclar workflows o skills dentro del prompt.

## Trazabilidad

- GQ-018 y GQ-019 separan prompts, agentes, workflows y skills.
- GQ-061 define el prompt del orquestador.
- GQ-043 define estructura de contrato de agente.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: el prompt queda como loader operativo, `AGENT.md` conserva el contrato, `agent.json` mantiene metadata estructurada y no se introduce `gridwork run`.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_1
orchestrator_prompt_model = operational_loader_with_bootstrap_checklist
run_command = false
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Archivos principales:

- `factory/.gridwork/agents/orchestrator/PROMPT.md`
- `factory/.gridwork/agents/orchestrator/AGENT.md`
- `factory/.gridwork/agents/orchestrator/agent.json`
