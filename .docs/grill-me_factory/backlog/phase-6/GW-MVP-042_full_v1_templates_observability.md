---
id: GW-MVP-042
title: Completar templates y observabilidad local full-v1
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
  - area:templates
  - area:observability
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-020
  - GQ-021
  - GQ-033
  - GQ-037
  - GQ-038
  - GQ-039
  - GQ-040
  - GQ-041
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-042 - Completar templates y observabilidad local full-v1

## Objetivo

Crear templates y contratos de observabilidad local para runs, work orders, reportes, metricas, logs y handoffs.

## Contexto

El usuario quiere trazabilidad, monitoreo, metricas y logs sin complejidad externa. En v1 todo vive en `.factory/` como JSONL, JSON y Markdown, salvo documentos aprobados que el workflow decida versionar.

## Alcance incluido

- Crear templates para work order AFK.
- Crear templates para run summary y run state.
- Crear templates para eventos JSONL y metricas JSON.
- Crear template de evidencia TDD.
- Crear template de reporte de verifier.
- Crear template de comentario GitHub resumido.
- Crear template de handoff para transferencia de agente o sesion.
- Crear templates de issue draft y publish plan.
- Crear guidance para HTML diagrams cuando aplica.

## Fuera de alcance

- Crear dashboard web.
- Versionar automaticamente `.factory/`.
- Guardar secretos o logs sensibles.
- Hacer handoff obligatorio en cada cierre de workflow.

## Criterios de aceptacion

- Los templates cubren runs HITL, assisted y AFK.
- Los work orders AFK usan Markdown con front matter YAML.
- Los eventos tienen correlacion con `run_id` y `work_order_id`.
- Los reportes de verifier tienen formato local completo.
- Los comentarios GitHub son resumenes seguros.
- Los handoffs se usan solo cuando hay transferencia.
- `.factory/` sigue ignorado por Git.

## Pruebas esperadas

- Test documental de templates obligatorios.
- Validacion de JSON examples.
- Test de que templates no contienen valores secretos.
- Test de que paths de `.factory/` no se versionan automaticamente.

## Archivos probables

- `factory/.gridwork/templates/work-order-afk.md`
- `factory/.gridwork/templates/run-summary.md`
- `factory/.gridwork/templates/run-state.json`
- `factory/.gridwork/templates/event.jsonl`
- `factory/.gridwork/templates/metrics.json`
- `factory/.gridwork/templates/tdd-evidence.md`
- `factory/.gridwork/templates/verifier-report.md`
- `factory/.gridwork/templates/github-pr-comment.md`
- `factory/.gridwork/templates/handoff.md`

## Riesgos

- Crear demasiados templates sin uso real.
- Hacer logs demasiado verbosos.
- Exponer informacion sensible en reportes o comentarios.

## Trazabilidad

- GQ-020 define observabilidad local file-based.
- GQ-038 define modelo hibrido JSONL/JSON/Markdown.
- GQ-041 define contrato de work order AFK.
