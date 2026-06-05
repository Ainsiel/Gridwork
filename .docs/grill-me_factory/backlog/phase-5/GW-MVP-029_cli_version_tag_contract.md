---
id: GW-MVP-029
title: Definir versionado y tag `cli-v<version>`
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
  - area:cli
  - area:release
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

# GW-MVP-029 - Definir versionado y tag `cli-v<version>`

## Objetivo

Alinear la version de `packages/cli/package.json` con el tag de publicacion npm `cli-v<version>`.

## Contexto

La fabrica usa tags `factory-v<version>` y la CLI usa tags `cli-v<version>`. Las versiones son independientes y no deben mezclarse.

## Alcance incluido

- Validar SemVer de `packages/cli/package.json`.
- Definir tag esperado `cli-v<package.version>`.
- Bloquear publish si el tag no coincide con la version.
- Bloquear publish si la version npm ya existe.
- Bloquear publish si el tag local/remoto ya existe.
- Definir prerelease CLI como capacidad controlada.
- Definir dist-tag:
  - stable usa `latest`;
  - prerelease usa `next`.

## Fuera de alcance

- Crear tag real.
- Push de tag.
- Publicar npm.
- Versionar fabrica.

## Criterios de aceptacion

- Tag esperado se deriva solo de `packages/cli/package.json`.
- `cli-v<version>` no se confunde con `factory-v<version>`.
- Version prerelease exige dist-tag `next`.
- Version stable no usa `next` por defecto.
- El release plan indica si tag/version ya existen.

## Pruebas esperadas

- Test de SemVer valido.
- Test de tag derivado.
- Test de prerelease -> dist-tag `next`.
- Test de stable -> dist-tag `latest`.
- Test de mismatch tag/version bloqueado.

## Archivos probables

- `packages/cli/package.json`
- `packages/cli/src/release/cli-release.ts`
- `packages/cli/test/cli-release-plan.test.mjs`
- `factory/.gridwork/templates/cli-release-plan.md`

## Riesgos

- Reutilizar una version npm.
- Crear tag con version distinta al package.
- Mezclar version de fabrica y CLI.

## Trazabilidad

- GQ-071 define `cli-v<version>`.
- GQ-082 define prerelease con dist-tag `next`.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/cli-release.ts,packages/cli/test/cli-release-publisher.test.mjs
tests = npm test
```

Decision de implementacion: el tag se deriva de `packages/cli/package.json` como `cli-v<version>` y stable usa dist-tag `latest`.
