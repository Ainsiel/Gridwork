---
id: GW-MVP-023
title: Construir bundle de fabrica en dry-run local
phase: phase-4
status: ready
readiness: ready
implementation_status: completed
factory_profile: factory-release-publisher
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:4
  - area:release
  - area:bundle
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-067
  - GQ-068
  - GQ-075
  - GQ-087
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-023 - Construir bundle de fabrica en dry-run local

## Objetivo

Crear el proceso local que empaqueta `factory/.gridwork/` como `gridwork-factory-v<version>.zip`, sin publicar y sin incluir runtime, repo source ni codigo productivo.

## Contexto

Fase 3 ya consume un ZIP con raiz `.gridwork/`. Fase 4 debe producir ese ZIP desde la fuente real `factory/.gridwork/` y dejar evidencia local antes de cualquier publish.

## Alcance incluido

- Leer solo desde `factory/.gridwork/`.
- Crear bundle en `.factory/runs/<run-id>/artifacts/release/`.
- Incluir raiz `.gridwork/` dentro del zip.
- Excluir:
  - `.factory/`;
  - `.git/`;
  - `node_modules/`;
  - `packages/`;
  - `.docs/`;
  - `docs/`;
  - `dist/`;
  - `coverage/`;
  - secretos o archivos temporales.
- Rechazar symlinks.
- Rechazar paths no portables.
- Aplicar limites de tamano y conteo compatibles con fase 3.
- Crear reporte de inventario del bundle.

## Fuera de alcance

- Subir el bundle a GitHub.
- Generar checksums.
- Crear tag.
- Validar el bundle contra `gridwork init`.

## Criterios de aceptacion

- El bundle contiene `.gridwork/factory.json`.
- El bundle no contiene `.factory/`, `.git/`, `node_modules/`, `.docs/` ni codigo productivo.
- El builder falla si encuentra symlink o path inseguro.
- El builder genera un inventario deterministico.
- El ZIP se puede inspeccionar antes de publicar.
- No se escriben artefactos fuera de `.factory/runs/<run-id>/artifacts/release/`.

## Pruebas esperadas

- Test de bundle valido.
- Test de exclusion de rutas prohibidas.
- Test de symlink bloqueado.
- Test de paths normalizados con `/`.
- Test de determinismo de inventario.

## Archivos probables

- `packages/cli/src/release/build-factory-bundle.ts`
- `packages/cli/src/release/path-safety.ts`
- `packages/cli/test/factory-bundle-builder.test.mjs`
- `factory/.gridwork/templates/factory-bundle-inventory.md`

## Riesgos

- Incluir archivos del repo fuente que no pertenecen a la fabrica.
- Incluir `.factory/` con logs o datos locales.
- Producir un ZIP que fase 3 no pueda instalar.

## Trazabilidad

- GQ-067 define que la fuente publicable es `factory/.gridwork/`.
- GQ-068 define que el ZIP solo contiene `.gridwork/`.
- GQ-075 define seguridad de ZIP.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/factory-release.ts,packages/cli/src/commands/release.ts
tests = npm test
```

Decision de implementacion: el builder escribe el ZIP en `.factory/runs/<run-id>/artifacts/release/` y no publica nada.
