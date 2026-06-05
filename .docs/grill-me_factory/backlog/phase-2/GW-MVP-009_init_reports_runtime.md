---
id: GW-MVP-009
title: Crear reportes locales de `init` en `.factory/init/`
phase: phase-2
status: ready
readiness: ready
implementation_status: completed
factory_profile: local-first-init
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:2
  - area:init
  - area:cli
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-020
  - GQ-038
  - GQ-074
  - GQ-086
  - GQ-088
acceptance_status: ready
github_issue: null
---

# GW-MVP-009 - Crear reportes locales de `init` en `.factory/init/`

## Objetivo

Hacer que cada ejecucion de `gridwork init` cree reportes locales en `.factory/init/<init-run-id>/`.

## Contexto

La consola debe ser breve y los detalles deben vivir en reportes locales. En fase 2 no hay descarga ni cache, pero el init local-first igual debe dejar evidencia auditable.

## Alcance incluido

- Crear un `init-run-id` legible y deterministico en formato local.
- Crear `.factory/init/<init-run-id>/`.
- Escribir `init-report.md`.
- Escribir `preflight.json`.
- Escribir `source-resolution.md` y `source-resolution.json` usando `sourceType = local-source`.
- Escribir `validation-report.md` y `validation.json` cuando se ejecute validacion.
- Escribir `apply-plan.md` y `apply-plan.json` cuando se calcule aplicacion.
- Escribir `lockfile-report.md` cuando se cree o mantenga lockfile.
- Redactar cualquier dato sensible antes de escribir reportes.

## Fuera de alcance

- Reportes de download, cache, checksum o extraction de bundles remotos.
- Reportes versionados en `docs/`.
- Dashboard de metricas.
- Logs de agentes completos.

## Criterios de aceptacion

- Cada `gridwork init` crea un nuevo directorio en `.factory/init/`.
- `init-report.md` existe aunque el comando termine con warning o error controlado.
- Los reportes no contienen tokens, headers `Authorization` ni valores de `GITHUB_TOKEN` o `GH_TOKEN`.
- Los reportes usan rutas relativas, no paths absolutos del usuario.
- La consola imprime el path del reporte principal.

## Pruebas esperadas

- Test e2e de instalacion nueva con reportes creados.
- Test de re-run con un nuevo directorio de reportes.
- Test de redaccion de secrets en reportes simulados.
- Test de que reportes no contienen paths absolutos del workspace temporal.

## Archivos probables

- `packages/cli/src/init/init-run.ts`
- `packages/cli/src/init/reports.ts`
- `packages/cli/src/init/redaction.ts`
- `packages/cli/test/init-reports.test.mjs`

## Riesgos

- Guardar rutas absolutas o datos sensibles.
- Hacer reportes demasiado verbosos.
- Mezclar reportes de fases futuras con local-first.

## Trazabilidad

- GQ-020 define observabilidad local en `.factory/`.
- GQ-074 define consola breve y reportes detallados.
- GQ-086 exige assertions de reportes en e2e.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: reportes locales, redaccion, consola breve y runtime `.factory/` quedan alineados con las decisiones aceptadas.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_2
reports_path = .factory/init/<init-run-id>/
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Reportes implementados en fase 2:

- `init-report.md`
- `preflight.json`
- `source-resolution.md`
- `source-resolution.json`
- `apply-plan.md`
- `apply-plan.json`
- `validation-report.md`
- `validation.json`
- `lockfile-report.md`
- `conflicts.md`
- `conflicts.json`
- `candidates/`
