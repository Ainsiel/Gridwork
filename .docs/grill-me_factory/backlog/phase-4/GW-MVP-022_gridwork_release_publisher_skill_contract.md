---
id: GW-MVP-022
title: Crear contrato de skill `gridwork-release-publisher`
phase: phase-4
status: ready
readiness: ready
implementation_status: completed
factory_profile: factory-release-publisher
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:4
  - area:release
  - area:factory
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-012
  - GQ-065
  - GQ-081
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-022 - Crear contrato de skill `gridwork-release-publisher`

## Objetivo

Definir la skill que prepara releases de fabrica de Gridwork, con modo default dry-run/plan y publicacion real solo bajo approval explicito.

## Contexto

La fabrica v1 se instalara desde releases verificables. Fase 4 debe crear una skill de mantenimiento que pueda preparar release plan, bundle, manifest, checksums, release notes y comandos `gh`, sin publicar por defecto.

## Alcance incluido

- Crear `SKILL.md` y `skill.json` para `gridwork-release-publisher`.
- Definir permisos:
  - lectura de `factory/.gridwork/`;
  - escritura de artefactos en `.factory/runs/<run-id>/artifacts/release/`;
  - preparacion de comandos `git` y `gh`;
  - ejecucion de `git tag`, `git push` y `gh release create` solo con approval.
- Definir inputs obligatorios:
  - version objetivo;
  - release channel;
  - source commit;
  - publish mode;
  - prerelease flag si aplica.
- Definir outputs obligatorios:
  - release plan;
  - bundle;
  - manifest;
  - checksums;
  - release notes;
  - publish commands.
- Definir gates humanos.
- Definir que no publica npm.

## Fuera de alcance

- Ejecutar una publicacion real.
- Crear GitHub Actions de publish automatico.
- Publicar npm.
- Crear merge automatico.

## Criterios de aceptacion

- La skill existe con contrato claro y manifiesto JSON.
- El default mode es `plan_and_prepare`.
- Los comandos remotos quedan en un publish plan, no se ejecutan sin approval.
- La skill declara que no puede mergear ni publicar npm.
- La skill registra secreto/redaccion como regla obligatoria.
- La skill depende de policies existentes de Git/GitHub CLI y no las contradice.

## Pruebas esperadas

- Test o validacion de `skill.json` parseable.
- Test de inventario minimo de skill.
- Test documental de que no hay comandos de publish automatico en default mode.
- Revision de que approvals aparecen como gates explicitos.

## Archivos probables

- `factory/.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `factory/.gridwork/skills/gridwork-release-publisher/skill.json`
- `factory/.gridwork/policies/github-cli-policy.md`
- `factory/.gridwork/policies/security-policy.md`
- `factory/.gridwork/templates/factory-release-plan.md`

## Riesgos

- Que la skill parezca una automatizacion de publish por defecto.
- Permitir acciones remotas sin gate.
- Mezclar release de fabrica con release de CLI/npm.

## Trazabilidad

- GQ-065 define la skill y sus gates.
- GQ-081 define `manual_gh_release` como autoridad v1.
- GQ-012 y GQ-056 gobiernan comandos Git/GitHub.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = factory/.gridwork/skills/gridwork-release-publisher/SKILL.md,factory/.gridwork/skills/gridwork-release-publisher/skill.json
tests = npm test
```

Decision de implementacion: la skill queda en modo `plan_and_prepare`; no ejecuta comandos remotos sin approval explicito.
