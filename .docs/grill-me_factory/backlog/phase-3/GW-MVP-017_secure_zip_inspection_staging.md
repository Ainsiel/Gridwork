---
id: GW-MVP-017
title: Inspeccionar y extraer zip seguro a staging
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
  - GQ-075
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-017 - Inspeccionar y extraer zip seguro a staging

## Objetivo

Seleccionar y encapsular una dependencia minima de zip para inspeccionar y extraer bundles a staging de forma segura.

## Contexto

V1 mantiene zip como formato. La CLI puede usar una dependencia runtime minima y auditada; no debe usar herramientas del sistema ni parser zip propio.

## Alcance incluido

- Elegir dependencia zip con mini auditoria documentada.
- Agregar la dependencia al paquete CLI si pasa criterios.
- Listar entradas antes de escribir.
- Rechazar paths absolutos.
- Rechazar `..` y traversal.
- Rechazar entradas fuera de `.gridwork/`.
- Rechazar `.factory/`, `.git/`, `.github/`, `node_modules/` y rutas productivas prohibidas dentro de `.gridwork/`.
- No aceptar symlinks desde fuentes filesystem; en ZIP se inspeccionan entradas regulares expuestas por la dependencia.
- Aplicar limites de tamano y conteo defensivos.
- Extraer a `.factory/init/<init-run-id>/staging/.gridwork/`.
- Escribir `bundle-inspection.md` y `bundle-inspection.json`.

## Fuera de alcance

- Descargar zip.
- Verificar hash.
- Aplicar a `.gridwork/`.
- Soportar herramientas del sistema.
- Firmas externas.

## Criterios de aceptacion

- Zip valido se extrae solo a staging.
- Path traversal bloquea.
- Path absoluto bloquea.
- `.factory/`, `.git/`, `.github/`, `node_modules/` o rutas productivas dentro del zip bloquean.
- Symlinks de filesystem bloquean por `listFiles`; deteccion de metadata symlink ZIP queda fuera del wrapper de `fflate` usado en v1.
- Zip sin `.gridwork/factory.json` bloquea.
- Limites defensivos bloquean zip excesivo.
- No se toca `.gridwork/` si extraction falla.

## Pruebas esperadas

- Mini auditoria de dependencia en docs o test notes.
- Tests de zip valido.
- Tests de traversal, absolute path y forbidden paths.
- Test de symlink en source filesystem si aplica.
- Test de limites.
- Test de staging only.

## Archivos probables

- `packages/cli/package.json`
- `packages/cli/src/init/extract-bundle.ts`
- `packages/cli/src/init/path-safety.ts`
- `packages/cli/src/init/extraction-report.ts`
- `packages/cli/test/extract-bundle.test.mjs`

## Riesgos

- Dependencia zip grande o poco mantenida.
- Escribir fuera de staging.
- Aceptar symlinks o entradas raras.

## Trazabilidad

- GQ-075 define zip con dependencia minima auditada.
- GQ-068 define que el zip solo contiene `.gridwork/`.
- GQ-086 exige fallo seguro de bundle invalido.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
zip_dependency = fflate
implemented_files = packages/cli/package.json,packages/cli/src/init/remote-init.ts
tests = npm test
pack_dry_run = pass
```

Mini auditoria: `fflate` es una dependencia runtime pequena para zip/unzip en JavaScript, evita herramientas del sistema y permite inspeccionar nombres de entradas antes de escribir a staging.
