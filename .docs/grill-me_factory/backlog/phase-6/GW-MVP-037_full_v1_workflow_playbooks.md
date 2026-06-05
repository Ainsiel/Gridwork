---
id: GW-MVP-037
title: Crear playbooks full-v1 de workflows base
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
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-010
  - GQ-011
  - GQ-045
  - GQ-058
  - GQ-059
  - GQ-060
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-037 - Crear playbooks full-v1 de workflows base

## Objetivo

Crear contratos y playbooks operativos para los workflows base de Gridwork v1.

## Contexto

Los workflows coordinan sesiones o ejecuciones. En v1 no existe `gridwork run`; el usuario activa el orquestador con un prompt Markdown y el orquestador decide que workflow aplicar.

## Alcance incluido

- Crear `WORKFLOW.md` y `workflow.json` para:
  - `intake-existing-code`;
  - `ideation-from-zero`;
  - `architecture-ddd`;
  - `tdd-implementation`;
  - `verification-pr`.
- Declarar modo: `hitl`, `assisted` o `afk`.
- Definir entradas, salidas, fases, gates y artefactos.
- Definir cuando se usa cada skill.
- Definir transiciones entre workflows.
- Definir criterios de cierre y evidencia requerida.
- Declarar que CI/CD no es workflow de agentes.

## Fuera de alcance

- Agregar workflow `cicd-release`.
- Agregar comando CLI para ejecutar agentes.
- Publicar issues o PRs reales sin aprobacion.
- Implementar producto final.

## Criterios de aceptacion

- Cada workflow tiene contrato completo.
- `ideation-from-zero` puede cerrar usando `sdd-requirements`.
- `architecture-ddd` toma SDD y produce diseno, ADRs y diagramas HTML cuando aplica.
- `architecture-ddd` puede cerrar usando `backlog-planning`.
- `tdd-implementation` exige work order AFK antes de empezar.
- `verification-pr` produce reporte local obligatorio.
- Los workflows documentan donde guardar outputs en `.factory/`.

## Pruebas esperadas

- Validacion JSON de cada `workflow.json`.
- Test documental de secciones obligatorias en `WORKFLOW.md`.
- Test de que solo `tdd-implementation` queda como `afk`.
- Test de que no existe workflow `cicd-release`.

## Archivos probables

- `factory/.gridwork/workflows/intake-existing-code/`
- `factory/.gridwork/workflows/ideation-from-zero/`
- `factory/.gridwork/workflows/architecture-ddd/`
- `factory/.gridwork/workflows/tdd-implementation/`
- `factory/.gridwork/workflows/verification-pr/`
- `factory/.gridwork/docs/WORKFLOW_CATALOG.md`

## Riesgos

- Duplicar instrucciones de skills dentro de workflows.
- Dejar demasiadas decisiones implicitas para el orquestador.
- Permitir modo AFK donde el usuario debe decidir.

## Trazabilidad

- GQ-011 define workflows base y skills relacionadas.
- GQ-045 define el contrato estandar de workflow.
- GQ-058, GQ-059 y GQ-060 detallan los flujos conversacionales principales.
