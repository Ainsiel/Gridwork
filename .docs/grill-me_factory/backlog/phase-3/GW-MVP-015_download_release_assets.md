---
id: GW-MVP-015
title: Descargar bundle y checksums desde GitHub Releases
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
  - GQ-068
  - GQ-074
  - GQ-083
  - GQ-084
acceptance_status: ready
github_issue: null
---

# GW-MVP-015 - Descargar bundle y checksums desde GitHub Releases

## Objetivo

Descargar los assets obligatorios de un release de fabrica desde GitHub Releases hacia el staging temporal del run de `init`.

## Contexto

El release de fabrica no es solo un zip. Debe contener zip, manifest, checksums y release notes. La CLI no debe requerir `gh`; usa acceso HTTP/fetch con token opcional solo en memoria.

## Alcance incluido

- Resolver metadata de release `factory-v<version>`.
- Descargar `gridwork-factory-v<version>.manifest.json`.
- Descargar `gridwork-factory-v<version>.sha256`.
- Descargar `gridwork-factory-v<version>.zip`.
- Guardar downloads temporales en `.factory/init/<init-run-id>/downloads/`.
- Usar `GITHUB_TOKEN` opcional solo en memoria.
- Registrar auth mode, no valores.
- Escribir `download-report.md` y `download-report.json`.

## Fuera de alcance

- Verificar hash.
- Extraer zip.
- Cache persistente.
- Usar GitHub CLI.
- Instalar desde cache.

## Criterios de aceptacion

- Falla si faltan assets obligatorios.
- Falla si GitHub devuelve auth/rate limit sin imprimir secretos.
- Registra cache status y nombres relativos de assets.
- No aplica archivos si falla descarga.

## Pruebas esperadas

- Tests con mock HTTP/fetch para release valido.
- Test de asset faltante.
- Test de rate limit/auth redacted.
- Test de reporte sin token.

## Archivos probables

- `packages/cli/src/init/github-release-client.ts`
- `packages/cli/src/init/download-bundle.ts`
- `packages/cli/src/init/download-report.ts`
- `packages/cli/test/download-bundle.test.mjs`

## Riesgos

- Acoplar descarga a `gh`.
- Guardar headers o tokens en reportes.
- Reintentar indefinidamente.

## Trazabilidad

- GQ-068 define assets obligatorios.
- GQ-083 define acceso HTTP sin `gh`.
- GQ-084 define reintentos y reportes de download.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/init/remote-init.ts
tests = npm test
pack_dry_run = pass
```

Decision de implementacion: los tests usan servidor HTTP local y `GRIDWORK_GITHUB_API_BASE_URL`; no dependen de GitHub real.
