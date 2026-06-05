---
id: GW-MVP-002
title: Configurar paquete CLI TypeScript con bin `gridwork`
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
  - area:cli
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-064
  - GQ-071
  - GQ-072
  - GQ-079
  - GQ-085
acceptance_status: ready
github_issue: null
---

# GW-MVP-002 - Configurar paquete CLI TypeScript con bin `gridwork`

## Objetivo

Crear el paquete CLI TypeScript inicial para que el monorepo tenga un binario `gridwork` preparado para implementar `init`.

## Contexto

Gridwork se usara con:

```text
npx gridwork init
```

La v1 no tendra `gridwork run`. El paquete CLI debe ser un bootstrapper centrado en `init`.

## Alcance incluido

- Crear `packages/cli/package.json`.
- Configurar nombre de paquete preferido `gridwork` o placeholder compatible si aun no se confirma ownership.
- Declarar bin `gridwork`.
- Crear estructura TypeScript de la CLI.
- Crear comando `init` como stub controlado o help inicial.
- Configurar build de TypeScript.
- Asegurar que el paquete no incluya `factory/.gridwork/` ni `.docs/`.

## Fuera de alcance

- Implementar descarga de releases.
- Implementar aplicacion de archivos.
- Implementar lockfile.
- Publicar en npm.
- Crear workflow de release npm.

## Criterios de aceptacion

- `packages/cli/package.json` existe.
- El paquete declara bin `gridwork`.
- TypeScript compila.
- El comando `gridwork` puede mostrar ayuda o reconocer `init`.
- No existe comando `gridwork run`.
- El package config excluye `.docs/` y `factory/.gridwork/`.

## Pruebas esperadas

- `npm run build -w packages/cli`.
- Test unitario o smoke test del parser de comando.
- `npm pack -w packages/cli --dry-run` muestra contenido esperado.

## Archivos probables

- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/tests/`

## Riesgos

- Publicar accidentalmente archivos de fabrica dentro del paquete npm.
- Crear comandos no decididos para v1.
- Acoplar la CLI a una ruta local de desarrollo.

## Trazabilidad

- GQ-064 define CLI TypeScript init-only.
- GQ-071 define publicacion npm futura.
- GQ-079 define nombre/bin del paquete.
- GQ-085 ubica este trabajo en fase 0.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_0
package_name = gridwork
bin = gridwork
init_stub = true
run_command = false
verification = npm_run_build,npm_test,npm_pack_cli_dry_run
```

Archivos principales:

- `packages/cli/package.json`
- `packages/cli/README.md`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/src/cli.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.mjs`

El dry-run final del paquete no incluye `.docs/`, `factory/.gridwork/` ni tests compilados.
