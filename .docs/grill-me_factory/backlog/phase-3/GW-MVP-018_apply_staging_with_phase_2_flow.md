---
id: GW-MVP-018
title: Aplicar staging usando el flujo existente de fase 2
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
  - area:cli
  - area:bundle
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-076
  - GQ-077
  - GQ-086
  - GQ-098
acceptance_status: ready
github_issue: null
---

# GW-MVP-018 - Aplicar staging usando el flujo existente de fase 2

## Objetivo

Reutilizar el apply plan, no-overwrite, lockfile, validacion y reportes de fase 2 para aplicar una fabrica extraida desde staging.

## Contexto

Fase 2 ya instala desde source local. Fase 3 debe generalizar la fuente de archivos: local source o staging de bundle verificado. La estrategia de conflictos y lockfile no debe duplicarse.

## Alcance incluido

- Abstraer la fuente instalable como `factorySourceDir`.
- Permitir que fase 2 use `factory/.gridwork/`.
- Permitir que fase 3 use `.factory/init/<init-run-id>/staging/.gridwork/`.
- Mantener apply plan existente.
- Mantener candidatos de conflicto.
- Mantener validacion `minimal-mvp`.
- Actualizar lockfile con metadata remota cuando source es GitHub Release.
- No actualizar lockfile si apply, validation o compatibility falla.
- Mantener `.gitignore` e idempotencia.

## Fuera de alcance

- Descargar, verificar o extraer zip.
- Resolver source.
- Cache.
- Migraciones.

## Criterios de aceptacion

- Local-first sigue pasando tests existentes.
- Staging valido aplica igual que local source.
- Conflictos desde staging bloquean y crean candidatos.
- Lockfile remoto registra source, tag, asset, hash y manifest hash.
- Falla de validation no deja lockfile actualizado.

## Pruebas esperadas

- Tests de regresion fase 2.
- Integration test aplicando desde staging fixture.
- Test de lockfile con metadata remota.
- Test de conflicto desde staging.

## Archivos probables

- `packages/cli/src/init/local-init.ts`
- `packages/cli/src/init/apply-files.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/test/apply-staging.test.mjs`

## Riesgos

- Duplicar logica de apply.
- Romper local-first existente.
- Escribir lockfile con metadata incompleta.

## Trazabilidad

- GQ-076 define no-overwrite con hashes.
- GQ-077 define lockfile.
- GQ-098 implemento fase 2 local-first.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/init/local-init.ts,packages/cli/src/init/remote-init.ts
tests = npm test
pack_dry_run = pass
```

Decision de implementacion: `local-init.ts` expone `runPreparedInstall` y `createRunState`; el origen local y el staging remoto comparten apply plan, validacion, conflictos, `.gitignore` y lockfile.
