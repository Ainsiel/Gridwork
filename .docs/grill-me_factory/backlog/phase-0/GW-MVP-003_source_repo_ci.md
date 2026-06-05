---
id: GW-MVP-003
title: Configurar CI base del repositorio fuente
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
  - area:ci
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-071
  - GQ-072
  - GQ-073
  - GQ-085
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-003 - Configurar CI base del repositorio fuente

## Objetivo

Crear un workflow base de GitHub Actions para validar build, tests y empaquetado seco del paquete CLI.

## Contexto

El CI del repositorio fuente debe proteger el monorepo antes de publicar releases de fabrica o CLI.

## Alcance incluido

- Crear `.github/workflows/ci.yml`.
- Ejecutar `npm ci`.
- Ejecutar `npm run build`.
- Ejecutar `npm test`.
- Ejecutar `npm pack -w packages/cli --dry-run` cuando el paquete CLI exista.
- Documentar que CI no publica releases.

## Fuera de alcance

- Publicar npm.
- Crear releases de fabrica.
- Ejecutar deploy.
- Crear workflows de CD.
- Ejecutar tests e2e completos de `init` si fase 2 aun no existe.

## Criterios de aceptacion

- Existe workflow `ci.yml`.
- CI usa Node >=20.
- CI falla si build o tests fallan.
- CI no publica npm ni GitHub Releases.
- CI puede ejecutarse con el monorepo actual sin pasos remotos innecesarios.

## Pruebas esperadas

- Validacion local de comandos CI principales.
- Revision de YAML para confirmar que no hay publish steps.
- Si hay CLI package, `npm pack -w packages/cli --dry-run`.

## Archivos probables

- `.github/workflows/ci.yml`
- `package.json`
- `packages/cli/package.json`

## Riesgos

- CI demasiado estricto antes de tener tests reales.
- CI demasiado laxo y sin proteccion util.
- Confundir CI con release/publish.

## Trazabilidad

- GQ-073 define el contrato de CI.
- GQ-071 separa CI de publish npm.
- GQ-086 exige package contents check para `init` MVP.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_0
ci_publishes = false
node_version = 20
verification = npm_run_build,npm_test,npm_pack_cli_dry_run
```

Archivo principal:

- `.github/workflows/ci.yml`

El workflow ejecuta `npm ci`, `npm run build`, `npm test` y `npm pack -w packages/cli --dry-run`.
