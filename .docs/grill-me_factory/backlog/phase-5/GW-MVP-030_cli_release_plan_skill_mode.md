---
id: GW-MVP-030
title: Agregar modo CLI release a `gridwork-release-publisher`
phase: phase-5
status: ready
readiness: ready
implementation_status: completed
factory_profile: npm-cli-publish
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:5
  - area:npm
  - area:release
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-065
  - GQ-071
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-030 - Agregar modo CLI release a `gridwork-release-publisher`

## Objetivo

Extender la skill `gridwork-release-publisher` para preparar releases de CLI sin publicar npm directamente.

## Contexto

La skill ya prepara releases de fabrica. GQ-071 definio que tambien puede preparar release plan de CLI, pero la publicacion npm ocurre por GitHub Actions despues de un tag aprobado.

## Alcance incluido

- Agregar modo `cli-release`.
- Generar `cli-release-plan.md`.
- Generar `cli-release-notes.md`.
- Generar `cli-npm-pack-report.md`.
- Preparar comandos:
  - `git tag cli-v<version>`;
  - `git push origin cli-v<version>`.
- Dejar claro que la skill no ejecuta `npm publish`.
- Registrar approval gates para tag y push.
- Bloquear si package name/ownership/source oficial no estan confirmados.

## Fuera de alcance

- Publicar npm.
- Ejecutar GitHub Actions.
- Crear tags reales sin approval.
- Publicar fabrica.

## Criterios de aceptacion

- La skill documenta `factory-release` y `cli-release` como modos separados.
- `cli-release` no sube assets ni publica GitHub Release.
- `cli-release` no ejecuta `npm publish`.
- Los outputs viven en `.factory/runs/<run-id>/artifacts/release/`.
- Los approval gates quedan explicitos.

## Pruebas esperadas

- Validacion de `skill.json`.
- Test documental de que `npm publish` no se ejecuta por la skill.
- Test de outputs esperados en dry-run.

## Archivos probables

- `factory/.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `factory/.gridwork/skills/gridwork-release-publisher/skill.json`
- `factory/.gridwork/templates/cli-release-plan.md`
- `factory/.gridwork/templates/cli-release-notes.md`
- `factory/.gridwork/templates/cli-npm-pack-report.md`

## Riesgos

- Mezclar modo de fabrica y modo CLI.
- Hacer parecer que la skill publica npm.
- Perder approval gate para tag `cli-v`.

## Trazabilidad

- GQ-065 habilita release publisher.
- GQ-071 define modo CLI release y GitHub Actions como publicador npm.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = factory/.gridwork/skills/gridwork-release-publisher/SKILL.md,factory/.gridwork/skills/gridwork-release-publisher/skill.json
tests = npm test
```

Decision de implementacion: `gridwork-release-publisher` declara modos `factory-release` y `cli-release`; el modo CLI no ejecuta `npm publish`.
