---
id: GW-MVP-016
title: Verificar SHA256 y manifest del bundle
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
  - GQ-068
  - GQ-070
  - GQ-078
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-016 - Verificar SHA256 y manifest del bundle

## Objetivo

Validar la integridad y compatibilidad del release antes de abrir o aplicar el zip.

## Contexto

La CLI debe verificar manifest, checksums, version, release channel, prerelease, compatibilidad de CLI y hash del zip antes de extraer.

## Alcance incluido

- Parsear `gridwork-factory-v<version>.manifest.json`.
- Parsear `gridwork-factory-v<version>.sha256`.
- Verificar que el zip coincide con hash del manifest.
- Verificar que el zip coincide con `SHA256SUMS.txt`.
- Verificar hash del manifest contra `SHA256SUMS.txt` cuando aplique.
- Verificar `factoryVersion`, `assetName`, `releaseChannel` y `prerelease`.
- Verificar `required_cli_version` contra version del CLI.
- Escribir `checksum-report.json`.
- Escribir `compatibility-report.md` y `compatibility-report.json`.
- Bloquear con exit code correcto ante hash mismatch o incompatibilidad.

## Fuera de alcance

- Extraer zip.
- Descargar assets.
- Firmas externas GPG/Sigstore/cosign.
- Migraciones automaticas.

## Criterios de aceptacion

- Hash mismatch bloquea antes de extraer.
- Manifest faltante o invalido bloquea.
- `SHA256SUMS.txt` faltante o invalido bloquea.
- `required_cli_version` incompatible bloquea.
- Prerelease sin `--allow-prerelease` bloquea.
- Reports no contienen secrets ni paths absolutos.
- Lockfile no se actualiza si falla.

## Pruebas esperadas

- Unit test de parseo `SHA256SUMS.txt`.
- Unit test de hash mismatch.
- Unit test de manifest invalido.
- Unit test de prerelease gate.
- Unit test de compatibilidad de CLI/schema.
- E2E de fallo seguro sin aplicar archivos.

## Archivos probables

- `packages/cli/src/init/verify-bundle.ts`
- `packages/cli/src/init/checksum-report.ts`
- `packages/cli/src/init/compatibility.ts`
- `packages/cli/src/init/compatibility-report.ts`
- `packages/cli/test/verify-bundle.test.mjs`

## Riesgos

- Instalar antes de verificar.
- Tratar incompatibilidad como warning.
- Depender de firmas externas no decididas para v1.

## Trazabilidad

- GQ-068 define manifest y checksums obligatorios.
- GQ-070 define compatibilidad estricta.
- GQ-078 define checksums + provenance, sin firmas externas v1.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/init/remote-init.ts,packages/cli/src/init/local-init.ts
tests = npm test
pack_dry_run = pass
```

Decision de implementacion: fase 3 soporta `requiredCliVersion` con expresion `>=x.y.z`; expresiones mas complejas fallan de forma estricta.
