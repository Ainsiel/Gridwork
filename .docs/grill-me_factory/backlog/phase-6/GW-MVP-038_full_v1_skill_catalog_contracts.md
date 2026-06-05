---
id: GW-MVP-038
title: Crear catalogo full-v1 de skills base
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
  - area:skills
  - area:factory
  - area:github
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-007
  - GQ-011
  - GQ-044
  - GQ-049
  - GQ-050
  - GQ-051
  - GQ-057
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-038 - Crear catalogo full-v1 de skills base

## Objetivo

Crear el catalogo de skills base que necesita Gridwork full-v1.

## Contexto

Las skills son capacidades reutilizables. No son agentes, no son workflows y no elevan permisos. Un agente puede usar una skill solo si su contrato, workflow y policies lo permiten.

## Alcance incluido

- Crear `skill.json` y `SKILL.md` para:
  - `sdd-requirements`;
  - `backlog-planning`;
  - `github-actions-cicd`;
  - `github-cli`;
  - `github-issue-publisher`;
  - `github-issue-discovery`;
  - `html-architecture-diagrams`;
  - `diagnose-bug`;
  - `handoff`.
- Mantener `gridwork-release-publisher` como skill existente.
- Definir entradas, salidas, restricciones, permisos requeridos y failure modes.
- Definir que skills pueden generar drafts y cuales pueden tocar GitHub con approval.
- Definir templates relacionados.
- Evitar que una skill duplique el contrato de un agente.

## Fuera de alcance

- Crear instalador dinamico de skills.
- Crear stack packs dinamicos.
- Ejecutar `gh` sin approval gate cuando haya side effects.
- Permitir que `diagnose-bug` modifique codigo por si sola.

## Criterios de aceptacion

- Cada skill tiene manifiesto e instrucciones completas.
- Las skills documentan agentes recomendados y workflows compatibles.
- `sdd-requirements` genera SDD desde outputs de ideacion.
- `backlog-planning` genera drafts locales antes de publicar.
- `github-issue-publisher` publica solo con plan aprobado.
- `github-issue-discovery` es solo lectura y no delega automaticamente.
- `github-actions-cicd` opera en modo `draft-only` por defecto.
- `handoff` se usa solo en transferencia de agente o sesion.

## Pruebas esperadas

- Validacion JSON de cada `skill.json`.
- Test documental de secciones obligatorias en `SKILL.md`.
- Test de que ninguna skill declara permisos mayores que su agente.
- Test de que comandos `gh` con side effects requieren approval.

## Archivos probables

- `factory/.gridwork/skills/sdd-requirements/`
- `factory/.gridwork/skills/backlog-planning/`
- `factory/.gridwork/skills/github-actions-cicd/`
- `factory/.gridwork/skills/github-cli/`
- `factory/.gridwork/skills/github-issue-publisher/`
- `factory/.gridwork/skills/github-issue-discovery/`
- `factory/.gridwork/skills/html-architecture-diagrams/`
- `factory/.gridwork/skills/diagnose-bug/`
- `factory/.gridwork/skills/handoff/`
- `factory/.gridwork/docs/SKILL_CATALOG.md`

## Riesgos

- Crear skills demasiado genericas.
- Mezclar side effects de GitHub con generacion de drafts.
- Hacer que una skill parezca un agente.

## Trazabilidad

- GQ-007 define el modelo de skill.
- GQ-011 separa workflows de skills.
- GQ-044 define la estructura estandar de `SKILL.md`.
