---
id: GW-MVP-043
title: Validar full-v1 end to end sin generar codigo productivo
phase: phase-6
status: ready
readiness: ready
implementation_status: completed
factory_profile: full-v1
issue_shape: enabling-slice
suggested_agent: verifier-agent
suggested_workflow: verification-pr
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:6
  - area:factory
  - area:init
  - area:ci
  - status:needs-refinement
  - mode:assisted
  - workflow:verification-pr
  - agent:verifier
source_decisions:
  - GQ-028
  - GQ-062
  - GQ-086
  - GQ-087
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-043 - Validar full-v1 end to end sin generar codigo productivo

## Objetivo

Crear validaciones end to end para demostrar que `full-v1` se instala, valida y empaqueta sin generar codigo productivo.

## Contexto

Fase 6 puede crecer bastante. Antes de considerarla lista, debe probar que la fabrica full se comporta como contrato instalable: manifiestos validos, rutas esperadas, no product code, no comando `run`, no side effects externos.

## Alcance incluido

- Validar manifests de agentes, workflows, skills y stack packs.
- Validar inventario `full-v1`.
- Validar que `gridwork init` instala el perfil full cuando se configure.
- Validar idempotencia del perfil full.
- Validar que no se generan rutas productivas prohibidas.
- Validar que no aparece comando `gridwork run`.
- Validar que JSON/Markdown requeridos existen.
- Validar que release bundle puede incluir full-v1.

## Fuera de alcance

- Publicar release real.
- Publicar npm real.
- Ejecutar GitHub CLI contra repos remotos.
- Generar una app Next.js/Spring Boot/PostgreSQL.

## Criterios de aceptacion

- `npm test` cubre validacion de perfil full.
- `npm pack --dry-run` sigue pasando.
- `gridwork init` no sobreescribe personalizaciones.
- `full-v1` no crea frontend, backend, database ni Docker.
- El bundle de fabrica sigue verificable.
- Los errores de validacion son claros y reportables.

## Pruebas esperadas

- `e2e:full-v1-init-success`.
- `e2e:full-v1-init-idempotent`.
- `e2e:full-v1-no-product-code`.
- `e2e:full-v1-manifest-validation`.
- `e2e:factory-release-bundle-includes-full-v1`.

## Archivos probables

- `packages/cli/test/full-v1-init.test.mjs`
- `packages/cli/test/factory-full-v1-validation.test.mjs`
- `packages/cli/src/init/validation.ts`
- `factory/.gridwork/factory.json`

## Riesgos

- Que full-v1 rompa el flujo minimal.
- Que la validacion sea solo superficial.
- Que el release bundle crezca sin control.

## Trazabilidad

- GQ-062 exige validacion minima sin dependencias externas.
- GQ-086 define DoD e2e de `init`.
- GQ-087 separa perfiles instalables.
