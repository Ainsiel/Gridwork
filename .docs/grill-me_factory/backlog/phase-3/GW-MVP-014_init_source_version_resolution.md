---
id: GW-MVP-014
title: Resolver source y version de fabrica para `init`
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
  - area:source-resolution
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-069
  - GQ-070
  - GQ-074
  - GQ-083
  - GQ-084
  - GQ-098
acceptance_status: ready
github_issue: null
---

# GW-MVP-014 - Resolver source y version de fabrica para `init`

## Objetivo

Implementar la resolucion de source y version de fabrica para que `gridwork init` pueda pasar de local-first a GitHub Releases verificables.

## Contexto

Fase 2 instala desde `factory/.gridwork/`. Fase 3 debe resolver que release remoto instalar, sin usar cache para decidir `latest` y sin aceptar sources ambiguos.

## Alcance incluido

- Definir default de source oficial embebido.
- Soportar `--factory-version <version>` para version exacta del source oficial.
- Soportar `--source owner/repo --factory-version <version>` como override avanzado.
- Exigir `--factory-version` cuando se usa `--source`.
- Rechazar URLs arbitrarias, branches y `main`.
- Mantener `gridwork init` sin flags como local-first mientras el paquete no tenga una release oficial publicada.
- Ignorar prereleases por defecto.
- Permitir prerelease solo con version exacta y `--allow-prerelease`.
- Escribir `source-resolution.md` y `source-resolution.json`.

## Fuera de alcance

- Descargar assets.
- Verificar checksums.
- Extraer zip.
- Resolver canales beta/canary/nightly.
- Usar cache para decidir ultimo release estable.
- Usar `gh`.

## Criterios de aceptacion

- `gridwork init --source owner/repo` sin version falla con usage error.
- `--source` rechaza URLs y strings que no sean `owner/repo`.
- `--factory-version 1.2.3` resuelve tag `factory-v1.2.3`.
- Prerelease sin `--allow-prerelease` bloquea.
- Re-run de version exacta puede reutilizar cache verificada.
- Source resolution no escribe tokens ni headers en reportes.
- Source oficial queda declarado como default; publish real sigue fuera de fase 3.

## Pruebas esperadas

- Unit tests de parser de source.
- Unit tests de tag/version.
- Unit tests de prerelease gate.
- Test de lockfile existing source/version.
- Test de reporte sin secretos.

## Archivos probables

- `packages/cli/src/config/defaults.ts`
- `packages/cli/src/init/resolve-source.ts`
- `packages/cli/src/init/source-resolution-report.ts`
- `packages/cli/test/source-resolution.test.mjs`

## Riesgos

- Resolver `latest` desde una fuente alternativa sin version exacta.
- Permitir URLs o branches que rompan trazabilidad.
- Filtrar tokens en reportes de auth o rate limit.

## Trazabilidad

- GQ-069 define source oficial embebido y override controlado.
- GQ-083 define que `init` no requiere `gh`.
- GQ-084 define que cache no decide `latest`.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/commands/init.ts,packages/cli/src/init/remote-init.ts,packages/cli/src/init/constants.ts
tests = npm test
pack_dry_run = pass
```

Decision de implementacion: `init` local-first queda como default sin flags; el camino remoto se activa con `--factory-version` y opcionalmente `--source owner/repo`.

Revision posterior GQ-102: el tag canonical de fabrica queda alineado a `factory-v<version>`.
