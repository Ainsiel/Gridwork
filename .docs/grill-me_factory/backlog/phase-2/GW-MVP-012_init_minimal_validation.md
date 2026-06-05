---
id: GW-MVP-012
title: Validar inventario `minimal-mvp` durante `init`
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
  - GQ-062
  - GQ-074
  - GQ-086
  - GQ-087
  - GQ-096
acceptance_status: ready
github_issue: null
---

# GW-MVP-012 - Validar inventario `minimal-mvp` durante `init`

## Objetivo

Implementar una validacion minima para asegurar que la fabrica local-first instalada cumple el profile `minimal-mvp`.

## Contexto

Los JSON Schemas existen como contratos, pero fase 2 no debe implementar un motor completo de JSON Schema. El CLI solo necesita validar estructura, parseo JSON, campos requeridos y referencias basicas.

## Alcance incluido

- Parsear `.gridwork/factory.json`.
- Validar `factoryProfile = minimal-mvp`.
- Validar existencia de rutas obligatorias de `minimal-mvp`.
- Parsear `agent.json`, `workflow.json`, `skill.json` y schemas minimos.
- Validar que el prompt del orquestador existe.
- Validar que README y QUICKSTART existen.
- Validar que no hay carpetas productivas instaladas.
- Validar que paths del inventario quedan dentro de `.gridwork/`.
- Escribir `validation-report.md` y `validation.json`.
- Salir con exit code `6` ante error bloqueante de validacion.

## Fuera de alcance

- Implementar JSON Schema completo.
- Validar `full-v1`.
- Validar stack packs.
- Validar workflows avanzados.
- Validar bundles zip remotos.

## Criterios de aceptacion

- Una instalacion valida `minimal-mvp` pasa validation.
- Un `factory.json` invalido bloquea.
- Un JSON manifest invalido bloquea.
- Una ruta obligatoria faltante bloquea.
- Un path fuera de `.gridwork/` bloquea.
- Presencia de `frontend/`, `backend/`, `database/`, `docker/` o `docker-compose.yml` falla.
- `validation-report.md` explica errores y warnings.

## Pruebas esperadas

- Unit tests de required paths.
- Unit tests de JSON parse.
- E2E de instalacion valida.
- E2E o integration test de manifest invalido.
- Test de carpeta productiva prohibida.
- Test de exit code `6`.

## Archivos probables

- `packages/cli/src/init/validate-minimal-factory.ts`
- `packages/cli/src/init/validation-report.ts`
- `packages/cli/test/init-validation.test.mjs`

## Riesgos

- Validar demasiado poco y aceptar fabrica rota.
- Validar demasiado y bloquear ediciones manuales razonables.
- Confundir schemas como contratos con runtime validator completo.

## Trazabilidad

- GQ-062 define validacion minima sin dependencias externas.
- GQ-087 define inventario `minimal-mvp`.
- GQ-086 exige validation assertions en e2e.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: validacion minima, profile `minimal-mvp`, parseo JSON y ausencia de codigo productivo quedan dentro del alcance local-first.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_2
minimal_validation_enabled = true
validation_exit_code = 6
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

La validacion comprueba inventario `minimal-mvp`, parseo JSON, `factoryProfile`, `generatedProductCode = false` y ausencia de rutas productivas dentro de `.gridwork/`.
