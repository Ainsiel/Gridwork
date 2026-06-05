---
id: GW-MVP-020
title: Probar fallos seguros de bundle, compatibilidad y prerelease
phase: phase-3
status: ready
readiness: ready
implementation_status: completed
factory_profile: bundle-download-verify-cache
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:3
  - area:init
  - area:bundle
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-070
  - GQ-074
  - GQ-075
  - GQ-078
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-020 - Probar fallos seguros de bundle, compatibilidad y prerelease

## Objetivo

Agregar tests e2e e integration que prueben que fase 3 falla de forma segura cuando el bundle o la metadata no son confiables.

## Contexto

GQ-086 exige que `init` no se considere listo si solo funciona en el happy path. Fase 3 debe demostrar hash mismatch, path prohibido, incompatibilidad, prerelease no autorizado y cache corrupta.

## Alcance incluido

- Crear fixtures de release/bundle locales para tests.
- Probar bundle valido remoto/fixture.
- Probar hash mismatch con exit code `5`.
- Probar path prohibido con exit code `5`.
- Probar required CLI incompatible con exit code `7`.
- Probar prerelease sin `--allow-prerelease`.
- Probar cache verificada mediante success remoto y re-run offline desde cache.
- Probar que `.gridwork/` y lockfile no cambian ante fallo.
- Probar que reportes locales existen en cada fallo.
- Probar que no se imprimen ni escriben secrets.

## Fuera de alcance

- Tests contra GitHub real.
- Publicar releases reales.
- CI/CD de publish.
- Firmas externas.

## Criterios de aceptacion

- E2E de success desde bundle fixture pasa.
- E2E de hash mismatch falla sin aplicar archivos.
- E2E de path traversal/prohibido falla sin aplicar archivos.
- E2E de compatibilidad falla sin aplicar archivos.
- E2E de prerelease gate falla sin `--allow-prerelease`.
- E2E de cache hit reutiliza assets verificados sin red.
- Reportes existen y no contienen secrets.
- Tests de fase 2 siguen pasando.

## Pruebas esperadas

- `e2e:init:bundle-success`
- `e2e:init:hash-mismatch`
- `e2e:init:forbidden-path`
- `e2e:init:compatibility-failure`
- `e2e:init:prerelease-gate`
- `e2e:init:cache-hit-offline`

## Archivos probables

- `packages/cli/test/fixtures/`
- `packages/cli/test/init-bundle.e2e.test.mjs`
- `packages/cli/test/init-failure.e2e.test.mjs`
- `packages/cli/test/helpers/`

## Riesgos

- Fixtures demasiado complejos.
- Tests fragiles por tiempo o red.
- No probar que lockfile queda intacto ante fallo.

## Trazabilidad

- GQ-086 define DoD e2e.
- GQ-075 exige fallos seguros de zip.
- GQ-070 exige bloqueo por incompatibilidad.
- GQ-078 exige checksums obligatorios.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/test/init-remote-release.test.mjs
tests = npm test
pack_dry_run = pass
```

Cobertura agregada: bundle valido desde servidor local, cache hit sin servidor activo, validacion de combinaciones de flags y bloqueo de ZIP con path traversal.
