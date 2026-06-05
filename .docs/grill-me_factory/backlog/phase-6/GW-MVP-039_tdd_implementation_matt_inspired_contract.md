---
id: GW-MVP-039
title: Detallar contrato TDD inspirado en Matt para implementacion AFK
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
  - area:workflows
  - area:skills
  - area:templates
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-034
  - GQ-035
  - GQ-053
  - GQ-054
  - GQ-055
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-039 - Detallar contrato TDD inspirado en Matt para implementacion AFK

## Objetivo

Definir el contrato TDD que debe seguir `implementer-agent` cuando ejecuta `tdd-implementation`.

## Contexto

El usuario pidio que este flujo se inspire en la skill TDD de Matt. Para Gridwork, la idea central es exigir tracer bullets verticales, pruebas de comportamiento mediante interfaces publicas y evidencia red/green/refactor antes de considerar una implementacion lista para verificar.

## Alcance incluido

- Definir fases red, green y refactor.
- Exigir red phase clara antes de implementar codigo.
- Exigir pruebas de comportamiento sobre interfaces publicas cuando aplique.
- Exigir tracer bullet vertical cuando el slice sea fullstack.
- Definir evidencia minima por fase.
- Definir excepciones para tareas no testeables o solo documentales.
- Definir que pasa si no hay red/green suficiente.
- Conectar el reporte TDD con `verification-pr`.

## Fuera de alcance

- Copiar literalmente una skill externa.
- Permitir shell libre.
- Permitir que el implementer cambie dependencias sin gate.
- Permitir que el verifier corrija codigo.

## Criterios de aceptacion

- El workflow bloquea si no hay work order AFK.
- El workflow bloquea si la red phase no esta definida.
- La evidencia TDD incluye test inicial fallando, implementacion minima y refactor.
- El agente debe preferir pruebas de comportamiento a pruebas de detalles internos.
- Si no puede generar red/green, marca `needs_more_evidence`.
- El verifier puede detectar falta de evidencia y devolver al implementer.
- La documentacion menciona tracer bullets verticales para slices fullstack.

## Pruebas esperadas

- Test documental de secciones TDD obligatorias.
- Test de policy: no red phase, no implementation.
- Test de evidencia: `needs_more_evidence` si falta red o green.
- Test de que comandos de test usados vienen de allowlist.

## Archivos probables

- `factory/.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `factory/.gridwork/templates/tdd-evidence.md`
- `factory/.gridwork/templates/work-order-afk.md`
- `factory/.gridwork/policies/tdd-evidence-policy.md`
- `factory/.gridwork/agents/implementer-agent/AGENT.md`
- `factory/.gridwork/agents/verifier-agent/AGENT.md`

## Riesgos

- Convertir TDD en checklist superficial.
- Hacer demasiado rigido el flujo para cambios pequenos.
- Olvidar que el stack pack solo guia comandos y no eleva permisos.

## Trazabilidad

- GQ-034 define evidencia TDD.
- GQ-053 detalla ejecucion de work orders AFK bajo TDD.
- GQ-054 y GQ-055 conectan implementer con verifier.
