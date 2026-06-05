---
id: GW-MVP-036
title: Crear contratos full-v1 de agentes base
phase: phase-6
status: ready
readiness: ready
implementation_status: completed
factory_profile: full-v1
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:6
  - area:agents
  - area:factory
  - area:policies
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-005
  - GQ-013
  - GQ-014
  - GQ-015
  - GQ-043
  - GQ-046
  - GQ-061
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-036 - Crear contratos full-v1 de agentes base

## Objetivo

Crear contratos declarativos para los agentes base de Gridwork v1.

## Contexto

El usuario acepto un roster de seis agentes: `orchestrator`, `intake-agent`, `software-architect`, `planner-agent`, `implementer-agent` y `verifier-agent`. Cada agente debe tener responsabilidades, limites, permisos y path scopes claros.

## Alcance incluido

- Crear `agent.json` y `AGENT.md` para cada agente base.
- Mantener `PROMPT.md` obligatorio solo para `orchestrator`.
- Definir responsabilidades, entradas, salidas, limites y errores de cada agente.
- Declarar skills permitidas por agente.
- Declarar workflows donde puede participar cada agente.
- Declarar path scopes permitidos, prohibidos y condicionados.
- Incluir reglas de handoff solo para transferencia de agente o sesion.
- Mantener el modelo agnostico a proveedor de agente.

## Fuera de alcance

- Crear adapters de ejecucion nuevos.
- Permitir que agentes hagan push, PR, merge o deploy sin aprobacion.
- Hacer que `verifier-agent` corrija codigo en v1.
- Convertir skills en permisos.

## Criterios de aceptacion

- Los seis agentes tienen contrato completo.
- `orchestrator` no implementa codigo.
- `implementer-agent` no crea issues, no publica PR y no hace merge.
- `verifier-agent` revisa y reporta, pero no modifica codigo.
- `planner-agent` prepara backlog y puede usar publisher solo con approval gate.
- Cada contrato referencia policies de permisos y precedencia.
- Las skills permitidas no elevan permisos del agente.

## Pruebas esperadas

- Validacion JSON de cada `agent.json`.
- Test documental de que cada `AGENT.md` contiene secciones obligatorias.
- Test de que ningun agente declara permisos fuera de su scope.
- Test de precedencia: deny by default y regla mas restrictiva gana.

## Archivos probables

- `factory/.gridwork/agents/orchestrator/agent.json`
- `factory/.gridwork/agents/orchestrator/AGENT.md`
- `factory/.gridwork/agents/orchestrator/PROMPT.md`
- `factory/.gridwork/agents/intake-agent/`
- `factory/.gridwork/agents/software-architect/`
- `factory/.gridwork/agents/planner-agent/`
- `factory/.gridwork/agents/implementer-agent/`
- `factory/.gridwork/agents/verifier-agent/`
- `factory/.gridwork/docs/AGENTS.md`

## Riesgos

- Hacer contratos demasiado largos y dificiles de aplicar.
- Duplicar logica de workflows dentro de agentes.
- Permitir que un agente use una skill como atajo para elevar permisos.

## Trazabilidad

- GQ-013 acepta el roster base.
- GQ-014 y GQ-015 gobiernan permisos y dominios de carpetas.
- GQ-043 define la estructura estandar de `AGENT.md`.
