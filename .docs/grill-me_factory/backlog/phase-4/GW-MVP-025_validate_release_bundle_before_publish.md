---
id: GW-MVP-025
title: Validar bundle de release antes de publicar
phase: phase-4
status: ready
readiness: ready
implementation_status: completed
factory_profile: factory-release-publisher
issue_shape: enabling-slice
suggested_agent: verifier-agent
suggested_workflow: verification-pr
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:4
  - area:release
  - area:bundle
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:verification-pr
  - agent:verifier
source_decisions:
  - GQ-062
  - GQ-068
  - GQ-073
  - GQ-086
  - GQ-100
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-025 - Validar bundle de release antes de publicar

## Objetivo

Agregar una validacion pre-publish que demuestre que los artefactos de fase 4 son consumibles por el `gridwork init` de fase 3 antes de crear tag o GitHub Release.

## Contexto

El release publisher no debe publicar solo porque pudo crear archivos. Debe verificar que el bundle pasa las mismas reglas que el instalador aplica al descargarlo.

## Alcance incluido

- Validar inventario de `factory/.gridwork/`.
- Validar ZIP inspeccionando entradas.
- Validar manifest y checksums.
- Validar `requiredCliVersion`.
- Validar prerelease rules.
- Validar que el bundle se puede instalar en un repo temporal de prueba.
- Registrar reporte local de pre-publish.
- Bloquear publish plan si falla cualquier check critico.

## Fuera de alcance

- Publicar release real.
- Ejecutar checks contra GitHub real.
- Hacer merge o push.

## Criterios de aceptacion

- Un bundle valido pasa pre-publish.
- Hash mismatch falla.
- Path prohibido falla.
- Manifest incompatible falla.
- Prerelease sin marca explicita falla.
- El reporte local explica que bloqueo el release.
- No se generan comandos de publish aprobables si la validacion falla.

## Pruebas esperadas

- E2E de bundle valido en repo temporal.
- Test de hash mismatch.
- Test de path prohibido.
- Test de manifest incompatible.
- Test de prerelease mal marcado.
- Test de reporte local sin secretos.

## Archivos probables

- `packages/cli/src/release/validate-factory-release.ts`
- `packages/cli/test/factory-release-validation.test.mjs`
- `factory/.gridwork/templates/factory-release-validation.md`
- `.factory/runs/<run-id>/artifacts/release/factory-release-validation.json`

## Riesgos

- Publicar assets que el CLI no puede instalar.
- Validar un contrato distinto al del instalador real.
- Tratar errores de compatibilidad como warnings.

## Trazabilidad

- GQ-062 define validacion de manifests y schemas.
- GQ-086 exige fallo seguro.
- GQ-100 implemento consumo verificable.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/factory-release.ts,packages/cli/test/factory-release-publisher.test.mjs
tests = npm test
```

Decision de implementacion: el test e2e genera una release dry-run y luego la instala con `gridwork init` usando un servidor HTTP local.
