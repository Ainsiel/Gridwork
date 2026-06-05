---
id: GW-MVP-035
title: Definir inventario `full-v1` de la fabrica instalada
phase: phase-6
status: ready
readiness: ready
implementation_status: completed
factory_profile: full-v1
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:6
  - area:factory
  - area:docs
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-028
  - GQ-087
  - GQ-088
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-035 - Definir inventario `full-v1` de la fabrica instalada

## Objetivo

Definir el inventario completo que debe instalar Gridwork cuando la fabrica pase de `minimal-mvp` a `full-v1`.

## Contexto

Las fases 0 a 5 dejaron el mecanismo de instalacion, verificacion y release. Fase 6 debe describir que contiene la fabrica real: agentes, workflows, skills, policies, templates, stack pack y documentacion operativa.

## Alcance incluido

- Crear o actualizar el manifiesto de perfil `full-v1`.
- Declarar todos los directorios esperados bajo `factory/.gridwork/`.
- Separar inventario minimo de inventario full.
- Incluir agentes, workflows, skills, policies, templates, schemas, docs y stack packs.
- Mantener la regla de no generar codigo productivo.
- Definir reglas para validar archivos obligatorios y opcionales.
- Dejar trazabilidad de que cada grupo viene de una decision GQ.

## Fuera de alcance

- Implementar el contenido final de cada agente, workflow o skill.
- Generar frontend, backend, database, Dockerfile o `docker-compose.yml`.
- Cambiar el contrato de descarga por `npx gridwork init`.
- Agregar comandos tipo `gridwork run`.

## Criterios de aceptacion

- Existe un inventario `full-v1` verificable.
- `minimal-mvp` sigue siendo un perfil valido.
- El inventario lista archivos obligatorios con rutas estables.
- El inventario no incluye codigo de producto.
- `gridwork init` puede validar el perfil full sin depender de herramientas externas.
- La documentacion explica que el stack pack es guidance, no scaffold.

## Pruebas esperadas

- Test de inventario `full-v1` con todos los archivos esperados.
- Test de que `minimal-mvp` no se rompe.
- Test de que rutas de producto prohibidas no aparecen en el inventario.
- Validacion JSON de manifests relacionados.

## Archivos probables

- `factory/.gridwork/factory.json`
- `factory/.gridwork/docs/FACTORY_PROFILE.md`
- `factory/.gridwork/schemas/factory-profile.schema.json`
- `packages/cli/test/factory-profile-validation.test.mjs`

## Riesgos

- Hacer que `full-v1` sea demasiado grande sin validacion incremental.
- Mezclar el perfil full con codigo de aplicacion.
- Romper la compatibilidad de bundles ya verificables.

## Trazabilidad

- GQ-028 define lo que instala `init`.
- GQ-087 separa `minimal-mvp` y `full-v1`.
- GQ-105 abre la expansion full-v1.
