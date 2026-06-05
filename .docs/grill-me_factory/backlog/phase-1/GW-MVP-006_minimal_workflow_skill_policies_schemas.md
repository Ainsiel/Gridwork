---
id: GW-MVP-006
title: Crear workflow, skill, policies y schemas minimos
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
  - GQ-010
  - GQ-037
  - GQ-044
  - GQ-045
  - GQ-062
  - GQ-063
  - GQ-087
acceptance_status: ready
github_issue: null
---

# GW-MVP-006 - Crear workflow, skill, policies y schemas minimos

## Objetivo

Crear los contratos minimos de workflow, skill, policies, schemas y templates requeridos por `minimal-mvp`.

## Contexto

La fabrica minima debe demostrar que Gridwork instala algo operativo, pero sin construir toda la fabrica v1.

## Alcance incluido

- Crear workflow `intake-existing-code`.
- Crear skill `handoff`.
- Crear policies minimas:
  - `security-policy.md`
  - `logging-policy.md`
  - `github-cli-policy.md`
  - `path-scopes.md`
- Crear schemas minimos:
  - `factory.schema.json`
  - `agent.schema.json`
  - `workflow.schema.json`
  - `skill.schema.json`
  - `lockfile.schema.json`
- Crear templates minimos de `init`:
  - `init-report.md`
  - `source-resolution-report.md`
  - `validation-report.md`
  - `compatibility-report.md`
  - `lockfile-report.md`
  - `conflicts.md`
  - `apply-plan.md`

## Fuera de alcance

- Crear todos los workflows v1.
- Crear stack pack completo.
- Crear TDD implementer o verifier completos.
- Implementar validador CLI completo.

## Criterios de aceptacion

- `WORKFLOW.md` y `workflow.json` existen para `intake-existing-code`.
- `SKILL.md` y `skill.json` existen para `handoff`.
- Policies minimas existen y no contienen secretos.
- Schemas minimos parsean como JSON valido.
- Templates minimos existen.
- Skills no elevan permisos.

## Pruebas esperadas

- Parseo JSON de manifests y schemas.
- Check de existencia de archivos minimos.
- Revision de que policies no contienen placeholders de secretos reales.

## Archivos probables

- `factory/.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `factory/.gridwork/workflows/intake-existing-code/workflow.json`
- `factory/.gridwork/skills/handoff/SKILL.md`
- `factory/.gridwork/skills/handoff/skill.json`
- `factory/.gridwork/policies/*.md`
- `factory/.gridwork/schemas/*.schema.json`
- `factory/.gridwork/templates/*.md`

## Riesgos

- Sobrecargar el MVP con contratos v1 completos.
- Crear schemas que prometen mas de lo que el validador minimo puede revisar.
- Dejar templates demasiado vacios para ser utiles.

## Trazabilidad

- GQ-087 define archivos minimos.
- GQ-062 define schemas y validador minimo.
- GQ-037 define handoff.
- GQ-063 define seguridad y redaccion.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: workflow, skill, policies, schemas y templates estan limitados a `minimal-mvp`; las skills no elevan permisos; no se implementa runtime ni validador completo.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_1
workflow = intake-existing-code
skill = handoff
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Archivos principales:

- `factory/.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `factory/.gridwork/workflows/intake-existing-code/workflow.json`
- `factory/.gridwork/skills/handoff/SKILL.md`
- `factory/.gridwork/skills/handoff/skill.json`
- `factory/.gridwork/policies/security-policy.md`
- `factory/.gridwork/policies/logging-policy.md`
- `factory/.gridwork/policies/github-cli-policy.md`
- `factory/.gridwork/policies/path-scopes.md`
- `factory/.gridwork/schemas/*.schema.json`
- `factory/.gridwork/templates/*.md`
