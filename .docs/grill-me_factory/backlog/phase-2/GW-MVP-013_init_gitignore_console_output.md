---
id: GW-MVP-013
title: Actualizar `.gitignore` y salida de consola de `init`
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
  - GQ-003
  - GQ-028
  - GQ-074
  - GQ-086
  - GQ-088
acceptance_status: ready
github_issue: null
---

# GW-MVP-013 - Actualizar `.gitignore` y salida de consola de `init`

## Objetivo

Cerrar la experiencia de `gridwork init` local-first con `.gitignore`, consola breve, exit codes y `--verbose`.

## Contexto

`.gridwork/` y `.gridwork-lock.json` son versionables. `.factory/` es runtime local y debe quedar ignorado. La consola debe ser breve y apuntar a quickstart, prompt del orquestador y reportes.

## Alcance incluido

- Crear o actualizar `.gitignore`.
- Asegurar entrada `.factory/` sin duplicados.
- No ignorar `.gridwork/`.
- No ignorar `.gridwork-lock.json`.
- Imprimir resumen corto de exito.
- Imprimir ruta de `.gridwork/QUICKSTART.md`.
- Imprimir ruta de `.gridwork/agents/orchestrator/PROMPT.md`.
- Imprimir ruta de reportes `.factory/init/<init-run-id>/`.
- Implementar `--verbose` como salida extra segura.
- Rechazar `--json`, `--silent` y `--force` en v1 como usage error.
- Mantener exit codes documentados para success, usage, validation, conflict y filesystem failure.

## Fuera de alcance

- Modo JSON de consola.
- Modo silent.
- Flag force.
- Integracion con GitHub remoto.
- Publicacion de reportes versionados.

## Criterios de aceptacion

- `.gitignore` contiene `.factory/` despues de init.
- Re-run no duplica `.factory/`.
- `.gridwork/` no queda ignorado por init.
- `.gridwork-lock.json` no queda ignorado por init.
- Salida exitosa contiene quickstart, prompt y reports path.
- `--verbose` no imprime secretos.
- `--json`, `--silent` y `--force` salen con code `2`.
- Errores imprimen path de reporte cuando existe.

## Pruebas esperadas

- E2E de `.gitignore` creado.
- E2E de `.gitignore` existente sin duplicados.
- Test de consola en exito.
- Test de consola en conflicto.
- Test de usage errors para flags no soportados.
- Test de `--verbose` sin secretos.

## Archivos probables

- `packages/cli/src/init/gitignore.ts`
- `packages/cli/src/init/console-output.ts`
- `packages/cli/src/init/exit-codes.ts`
- `packages/cli/test/init-output.test.mjs`
- `packages/cli/test/init-gitignore.test.mjs`

## Riesgos

- Ignorar accidentalmente `.gridwork/` o lockfile.
- Duplicar entradas de `.gitignore`.
- Imprimir demasiada informacion en consola.
- Aceptar `--force` antes de tener una estrategia segura.

## Trazabilidad

- GQ-003 define `.gridwork/` versionado y `.factory/` runtime local.
- GQ-074 define consola breve y exit codes.
- GQ-088 exige apuntar al quickstart y al prompt del orquestador.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: `.factory/` ignorado, `.gridwork/` versionable, consola breve, `--verbose` y flags no soportados quedan verificables.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_2
gitignore_factory_runtime = true
verbose_flag = true
unsupported_force_json_silent = usage_error
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

La consola de exito apunta a `.gridwork/QUICKSTART.md`, `.gridwork/agents/orchestrator/PROMPT.md`, `.gridwork-lock.json` y `.factory/init/<init-run-id>/`.
