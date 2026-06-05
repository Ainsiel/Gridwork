---
id: GW-MVP-019
title: Implementar cache local verificada para version exacta
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
  - area:cache
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-020
  - GQ-077
  - GQ-084
acceptance_status: ready
github_issue: null
---

# GW-MVP-019 - Implementar cache local verificada para version exacta

## Objetivo

Guardar y reutilizar bundles verificados en `.factory/cache/bundles/` para versiones exactas, sin cache global ni offline completo.

## Contexto

La cache ayuda a reparar versiones bloqueadas o reinstalar una version exacta ya descargada. No decide `latest` y no reemplaza checksums ni lockfile.

## Alcance incluido

- Crear estructura `.factory/cache/bundles/github-release/<owner>__<repo>/factory-v<version>/`.
- Guardar zip, manifest, checksums y `cache-entry.json` solo despues de verificar hash e inspeccionar el ZIP correctamente.
- Reusar cache si source, version, tag, asset y hashes coinciden.
- Permitir reinstall de version exacta si cache existe.
- Permitir install de version exacta si cache existe y verifica.
- No usar cache para resolver latest.
- Escribir `cache-report.md` y `cache-report.json`.
- No guardar tokens, headers ni paths absolutos.

## Fuera de alcance

- Cache global en home.
- Flag `--offline`.
- Limpieza automatica de cache.
- Cache de latest.

## Criterios de aceptacion

- Cache hit solo ocurre con version exacta y hash verificado.
- Cache miss descarga o falla segun disponibilidad de red.
- Cache no contiene secrets.
- Cache no se commitea.
- Cache report indica hit/miss y razon.
- Offline limitado funciona si se solicita la misma version exacta y cache verificada existe.

## Pruebas esperadas

- Unit test de cache key.
- Test de cache hit verificado.
- Test de cache miss.
- Test de cache corrupta rechazada.
- Test de no latest from cache.
- Test de reportes sin secrets.

## Archivos probables

- `packages/cli/src/init/cache.ts`
- `packages/cli/src/init/cache-report.ts`
- `packages/cli/test/cache.test.mjs`
- `.gitignore`

## Riesgos

- Instalar cache corrupta.
- Cache decidir latest.
- Escribir datos sensibles en cache metadata.

## Trazabilidad

- GQ-084 define cache local verificada.
- GQ-077 mantiene lockfile como fuente de version exacta.
- GQ-020 mantiene runtime local en `.factory/`.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/init/remote-init.ts
tests = npm test
pack_dry_run = pass
```

Decision de implementacion: cache usa nombres internos estables (`bundle.zip`, `manifest.json`, `checksums.sha256`), conserva los nombres originales en `cache-entry.json` y solo se guarda si el bundle pasa inspeccion de staging.
