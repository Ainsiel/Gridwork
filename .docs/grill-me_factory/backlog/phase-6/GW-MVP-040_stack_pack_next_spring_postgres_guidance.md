---
id: GW-MVP-040
title: Crear stack pack guidance Next.js + Spring Boot + PostgreSQL
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
  - area:stack-pack
  - area:skills
  - area:policies
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-008
  - GQ-016
  - GQ-047
  - GQ-048
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-040 - Crear stack pack guidance Next.js + Spring Boot + PostgreSQL

## Objetivo

Crear el stack pack predefinido `nextjs-springboot-postgresql` como guidance para agentes, sin generar codigo de aplicacion.

## Contexto

Gridwork v1 no instalara frontend, backend, database ni Docker. El stack pack existe para ayudar a los agentes a razonar sobre proyectos Next.js, Spring Boot, PostgreSQL y Docker Compose cuando el usuario ya tenga o cree ese codigo manualmente.

## Alcance incluido

- Crear `stack-pack.json`, `STACK.md` y README del stack pack.
- Crear policies de comandos de test y calidad.
- Crear path hints no obligatorios.
- Crear guidance DDD y vertical slice.
- Crear guidance Docker Compose sin generar `docker-compose.yml`.
- Crear templates de issue, work order, test plan, API contract y migration plan.
- Crear skills guidance-only:
  - `nextjs-frontend-guidance`;
  - `springboot-backend-guidance`;
  - `postgresql-persistence-guidance`;
  - `docker-compose-local-guidance`.

## Fuera de alcance

- Generar proyecto Next.js.
- Generar proyecto Spring Boot.
- Generar SQL productivo inicial.
- Generar Dockerfile o `docker-compose.yml`.
- Imponer rutas fijas.

## Criterios de aceptacion

- El stack pack declara que no genera codigo.
- Las rutas son hints, no reglas duras.
- Las skills del stack son guidance-only.
- Las skills del stack no elevan permisos.
- Las policies de comandos son allowlists editables manualmente.
- El stack pack ayuda a crear vertical slices fullstack verificables.

## Pruebas esperadas

- Validacion JSON de `stack-pack.json`.
- Validacion JSON de policies de comandos.
- Test documental de no generacion de codigo.
- Test de que rutas candidatas no se tratan como obligatorias.

## Archivos probables

- `factory/.gridwork/stack-packs/nextjs-springboot-postgresql/stack-pack.json`
- `factory/.gridwork/stack-packs/nextjs-springboot-postgresql/STACK.md`
- `factory/.gridwork/stack-packs/nextjs-springboot-postgresql/policies/`
- `factory/.gridwork/stack-packs/nextjs-springboot-postgresql/templates/`
- `factory/.gridwork/stack-packs/nextjs-springboot-postgresql/skills/`

## Riesgos

- Convertir guidance en scaffolding sin querer.
- Hacer el stack pack demasiado opinionado.
- Hacer que los path hints parezcan permisos.

## Trazabilidad

- GQ-047 define el contenido aceptado del stack pack.
- GQ-048 define activacion por deteccion o confirmacion.
