---
id: GW-MVP-011
title: Implementar idempotencia y estrategia de conflictos
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
  - GQ-029
  - GQ-066
  - GQ-074
  - GQ-076
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-011 - Implementar idempotencia y estrategia de conflictos

## Objetivo

Hacer que `gridwork init` pueda ejecutarse varias veces sin duplicar estado ni sobrescribir personalizaciones.

## Contexto

La fabrica es personal y editable. `init` debe reparar faltantes y actualizar solo archivos seguros, usando hashes del lockfile. Si un archivo fue modificado por el usuario o no tiene owner conocido, se debe tratar como conflicto conservador.

## Alcance incluido

- Calcular apply plan comparando source local, `.gridwork/` y `.gridwork-lock.json`.
- Clasificar archivos como `create`, `unchanged`, `update_safe`, `conflict_modified`, `conflict_unknown_owner`, `skipped`.
- Crear archivos faltantes.
- No sobrescribir archivos modificados por el usuario.
- No sobrescribir archivos existentes que no estan en lockfile.
- Guardar candidatos en `.factory/init/<init-run-id>/candidates/`.
- Escribir `conflicts.md` y `conflicts.json` si hay conflictos.
- Salir con exit code `8` cuando un conflicto bloquea.
- No actualizar lockfile si hay conflicto bloqueante.

## Fuera de alcance

- Eliminar archivos removidos de release.
- `--force`.
- Merge automatico de personalizaciones.
- Resolver conflictos interactivos.

## Criterios de aceptacion

- Re-run sin cambios sale con code `0`.
- Re-run no duplica reportes ni `.gitignore`.
- Si falta un archivo instalado, `init` lo repara.
- Si un archivo instalado fue modificado, `init` no lo pisa.
- Si existe un archivo unknown con path del bundle, `init` no lo pisa.
- Los candidatos de conflicto quedan en `.factory/init/<init-run-id>/candidates/`.
- El lockfile no cambia ante conflicto bloqueante.

## Pruebas esperadas

- E2E de re-run idempotente.
- E2E de reparacion de archivo faltante.
- E2E de conflicto por archivo modificado.
- E2E de unknown owner.
- Test de exit code `8`.
- Test de candidatos y `conflicts.md`.

## Archivos probables

- `packages/cli/src/init/apply-plan.ts`
- `packages/cli/src/init/apply-files.ts`
- `packages/cli/src/init/conflicts.ts`
- `packages/cli/src/init/exit-codes.ts`
- `packages/cli/test/init-conflicts.test.mjs`

## Riesgos

- Aplicar cambios antes de detectar todos los conflictos.
- Dejar lockfile actualizado con instalacion incompleta.
- Hacer conflictos demasiado agresivos y bloquear reparaciones simples.

## Trazabilidad

- GQ-076 define la estrategia con hashes.
- GQ-074 define mensajes y exit code de conflicto.
- GQ-086 exige e2e de conflicto seguro.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: no-overwrite, candidatos, conflictos, exit code `8` y lockfile sin cambios ante bloqueo quedan verificables.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_2
rerun_idempotent = true
conflict_exit_code = 8
conflict_candidates_path = .factory/init/<init-run-id>/candidates/
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Los tests cubren re-run idempotente, reparacion de archivo faltante, conflicto por archivo personalizado, candidatos y lockfile sin cambios ante conflicto.
