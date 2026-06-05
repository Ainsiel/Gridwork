---
id: GW-MVP-033
title: Definir dist-tags npm y politica prerelease de CLI
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
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-071
  - GQ-082
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-033 - Definir dist-tags npm y politica prerelease de CLI

## Objetivo

Evitar que una CLI prerelease se publique accidentalmente como `latest`.

## Contexto

GQ-082 permite prereleases de forma controlada. Para npm, una version prerelease debe usar dist-tag `next`, no `latest`.

## Alcance incluido

- Definir `latest` para versiones stable.
- Definir `next` para versiones prerelease.
- Bloquear prerelease sin approval explicito.
- Bloquear prerelease con dist-tag `latest`.
- Registrar dist-tag en release plan.
- Registrar dist-tag en workflow.
- Documentar comando de instalacion prerelease.

## Fuera de alcance

- Publicar prerelease real.
- Gestionar canales beta/canary/nightly.
- Publicar fabrica.

## Criterios de aceptacion

- Stable SemVer usa dist-tag `latest`.
- Prerelease SemVer usa dist-tag `next`.
- Prerelease exige approval.
- Workflow no publica prerelease con `latest`.
- Docs distinguen install stable y prerelease.

## Pruebas esperadas

- Test de version stable -> `latest`.
- Test de prerelease -> `next`.
- Test de prerelease sin approval bloqueado.
- Test de prerelease con `latest` bloqueado.

## Archivos probables

- `.github/workflows/publish-cli.yml`
- `packages/cli/src/release/cli-dist-tag.ts`
- `packages/cli/test/cli-dist-tag.test.mjs`
- `docs/CLI_PUBLISH_PROCESS.md`

## Riesgos

- Romper usuarios con una prerelease publicada como latest.
- Documentar canales que v1 no soporta.
- Mezclar prerelease de CLI con prerelease de fabrica.

## Trazabilidad

- GQ-082 define prereleases controlados.
- GQ-071 define `next` para prerelease CLI.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/cli-release.ts,.github/workflows/publish-cli.yml
tests = npm test
```

Decision de implementacion: stable usa `latest`; prerelease usa `next` y requiere `--allow-prerelease`.
