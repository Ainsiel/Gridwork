---
id: GW-MVP-032
title: Validar npm pack y seguridad del paquete CLI
phase: phase-5
status: ready
readiness: ready
implementation_status: completed
factory_profile: npm-cli-publish
issue_shape: enabling-slice
suggested_agent: verifier-agent
suggested_workflow: verification-pr
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:5
  - area:npm
  - area:supply-chain
  - area:cli
  - status:needs-refinement
  - mode:assisted
  - workflow:verification-pr
  - agent:verifier
source_decisions:
  - GQ-071
  - GQ-073
  - GQ-078
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-032 - Validar npm pack y seguridad del paquete CLI

## Objetivo

Proteger el paquete npm para que incluya solo lo necesario y no filtre fabrica, docs internas, runtime local, tests o secretos.

## Contexto

`npm pack --dry-run` ya pasa, pero fase 5 debe convertir eso en contrato automatizable antes de publish real.

## Alcance incluido

- Ejecutar `npm pack -w packages/cli --dry-run`.
- Validar tarball contents esperados.
- Bloquear si incluye:
  - `.factory/`;
  - `.docs/`;
  - `factory/.gridwork/`;
  - tests;
  - fixtures;
  - source maps si se decide excluirlos en publish final;
  - secretos;
  - postinstall/preinstall scripts.
- Generar `cli-npm-pack-report.md`.
- Registrar package size y file count.
- Validar `bin.gridwork`.

## Fuera de alcance

- Publicar npm.
- Cambiar package name.
- Publicar fabrica.

## Criterios de aceptacion

- Pack report lista archivos incluidos.
- Pack report no contiene secretos.
- Package no incluye runtime `.factory/`.
- Package no incluye fabrica local.
- Package no incluye `.docs/`.
- Package no tiene install scripts.
- Bin `gridwork` apunta a `dist/index.js`.

## Pruebas esperadas

- Test de package metadata.
- Test de allowlist de tarball contents.
- Test de rechazo de scripts lifecycle peligrosos.
- Test de no inclusion de factory/docs/runtime.

## Archivos probables

- `packages/cli/package.json`
- `packages/cli/src/release/validate-npm-pack.ts`
- `packages/cli/test/cli-pack-validation.test.mjs`
- `factory/.gridwork/templates/cli-npm-pack-report.md`

## Riesgos

- Inflar el paquete npm.
- Filtrar `.factory/` o docs internas.
- Publicar scripts lifecycle inesperados.

## Trazabilidad

- GQ-071 exige pack dry-run.
- GQ-073 exige CI con pack validation.
- GQ-078 cubre supply chain v1.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/cli-release.ts,packages/cli/test/cli-release-publisher.test.mjs
tests = npm test
```

Decision de implementacion: el dry-run genera `cli-npm-pack-report.md` con inventario previsto y bloquea rutas prohibidas.
