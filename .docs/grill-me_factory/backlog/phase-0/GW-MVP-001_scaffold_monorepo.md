---
id: GW-MVP-001
title: Scaffold monorepo Gridwork con npm workspaces
phase: phase-0
status: ready
readiness: ready
implementation_status: completed
factory_profile: source-repo
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:0
  - area:source-repo
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-067
  - GQ-072
  - GQ-073
  - GQ-085
acceptance_status: ready
github_issue: null
---

# GW-MVP-001 - Scaffold monorepo Gridwork con npm workspaces

## Objetivo

Crear la estructura inicial del repositorio fuente de Gridwork para alojar la CLI, la fabrica instalable y la documentacion de desarrollo.

## Contexto

Gridwork se implementara como monorepo v1. La CLI vive en `packages/cli/` y la fabrica versionable vive en `factory/.gridwork/`.

## Alcance incluido

- Crear `package.json` raiz con `private: true`.
- Configurar npm workspaces.
- Crear estructura base `packages/cli/`.
- Crear estructura base `factory/.gridwork/`.
- Crear estructura base `docs/`.
- Agregar scripts root para `build` y `test`.
- Dejar README minimo de desarrollo si no existe.

## Fuera de alcance

- Implementar `gridwork init`.
- Descargar bundles desde GitHub Releases.
- Crear agentes, workflows o skills completos.
- Publicar paquete npm.
- Generar codigo productivo de apps externas.

## Criterios de aceptacion

- El root `package.json` existe y declara npm workspaces.
- El root package es privado.
- `packages/cli/` existe como workspace.
- `factory/.gridwork/` existe como ubicacion de la fabrica fuente.
- Los scripts root `build` y `test` existen aunque inicialmente deleguen a workspaces o placeholders realistas.
- No se agrega dependencia a pnpm, yarn o bun.

## Pruebas esperadas

- `npm install` o `npm ci` puede ejecutarse cuando exista lockfile.
- `npm run build` no falla por ausencia de script.
- `npm test` no falla por ausencia de script.

## Archivos probables

- `package.json`
- `package-lock.json`
- `packages/cli/package.json`
- `factory/.gridwork/`
- `docs/`
- `README.md`

## Riesgos

- Crear estructura demasiado grande antes de validar el MVP.
- Mezclar documentos del grill-me con documentos publicos del repo fuente.
- Introducir package managers no decididos.

## Trazabilidad

- GQ-067 define monorepo v1.
- GQ-072 define npm workspaces y Node >=20.
- GQ-085 ubica este trabajo en fase 0.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_0
verification = npm_install,npm_run_build,npm_test,npm_pack_cli_dry_run
```

Archivos principales:

- `package.json`
- `package-lock.json`
- `README.md`
- `docs/README.md`
- `factory/.gridwork/.gitkeep`
- `.gitignore`
