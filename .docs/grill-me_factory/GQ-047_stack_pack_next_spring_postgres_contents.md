# GQ-047 - Contenido del stack pack Next.js + Spring Boot + PostgreSQL

- Estado: accepted
- Fuente: decisiones GQ-008, GQ-009, GQ-016, GQ-028, GQ-035, GQ-041, GQ-044 y GQ-046
- Pregunta origen: GQ-047
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/stack-packs/nextjs-springboot-postgresql/`

## Pregunta

Que debe incluir exactamente el stack pack predefinido de Next.js + Spring Boot + PostgreSQL en Gridwork v1?

## Por que importa

Ya se decidio que `npx gridwork init` no genera codigo productivo:

- no crea frontend;
- no crea backend;
- no crea database;
- no crea Docker;
- no crea `docker-compose.yml`.

Pero tambien se decidio que v1 trae un stack predefinido como conocimiento y gobierno. Entonces hay que precisar que instala ese stack pack para ayudar a los agentes sin contaminar el proyecto.

El stack pack debe servir para que los agentes sepan trabajar mejor con ese stack cuando el repo ya tenga codigo o cuando el usuario lo cree manualmente.

## Respuesta recomendada

El stack pack debe incluir:

```text
conocimiento del stack
path scope hints
test command policies
quality check policies
DDD guidance
vertical slice guidance
templates de issues y work orders especificos del stack
skills complementarias del stack
```

No debe incluir codigo de aplicacion.

## Layout recomendado

```text
.gridwork/stack-packs/
  nextjs-springboot-postgresql/
    stack-pack.json
    STACK.md
    README.md
    policies/
      test-commands.json
      quality-commands.json
      path-hints.md
      vertical-slice-policy.md
      ddd-stack-guidance.md
      docker-compose-guidance.md
    templates/
      github-issue-fullstack-slice.md
      work-order-fullstack-slice.md
      test-plan-fullstack-slice.md
      api-contract.md
      database-migration-plan.md
    skills/
      nextjs-frontend-guidance/
        skill.json
        SKILL.md
      springboot-backend-guidance/
        skill.json
        SKILL.md
      postgresql-persistence-guidance/
        skill.json
        SKILL.md
      docker-compose-local-guidance/
        skill.json
        SKILL.md
```

## `STACK.md`

Debe explicar como piensa Gridwork este stack:

```text
frontend = Next.js
backend = Spring Boot
database = PostgreSQL
local_environment = Docker Compose recomendado pero no generado
architecture_style = DDD + vertical slices
```

Tambien debe aclarar:

```text
El stack pack no asume rutas fijas.
El orquestador debe detectar o preguntar las rutas reales.
```

## Policies recomendadas

### `test-commands.json`

Define comandos de test permitidos por tecnologia.

Ejemplos conceptuales:

```text
frontend_test
frontend_lint
backend_test
backend_verify
database_migration_check
docker_compose_config
```

Los comandos concretos deben ser allowlisted y ajustables manualmente por proyecto.

### `quality-commands.json`

Define comandos de calidad permitidos, separados de test.

Ejemplos:

```text
frontend_typecheck
frontend_lint
backend_static_checks
backend_format_check
```

Si el comando no existe en el repo o no esta en allowlist, el agente no lo inventa.

### `path-hints.md`

Ayuda al orquestador a detectar layout real.

Ejemplos:

```text
frontend candidates = apps/web, frontend, web, client
backend candidates = apps/api, backend, api, server
database candidates = database, db, infra/db, migrations
docker candidates = docker, infra, docker-compose.yml
```

Son pistas, no reglas duras.

### `vertical-slice-policy.md`

Define como dividir issues fullstack:

```text
UI/API/domain/persistence/tests en una misma issue cuando sea razonable
no dividir horizontalmente por capas si rompe verificabilidad
cada issue debe tener criterios de aceptacion y pruebas
```

### `ddd-stack-guidance.md`

Explica como aplicar DDD al stack:

```text
bounded contexts
aggregates
application services
domain services
repositories
DTOs/API contracts
database schema per domain or module cuando aplique
```

No debe imponer una arquitectura unica. Debe guiar al arquitecto y planner.

### `docker-compose-guidance.md`

Explica buenas practicas para entorno local, pero no genera Docker.

Debe cubrir:

```text
PostgreSQL local
variables de entorno
healthchecks
migraciones
redes y puertos
separacion dev/prod
```

## Skills complementarias del stack

### `nextjs-frontend-guidance`

Apoya decisiones de frontend:

- estructura de componentes;
- rutas/pages/app router segun repo;
- manejo de formularios;
- llamadas a API;
- tests frontend;
- accesibilidad basica;
- integracion con vertical slices.

### `springboot-backend-guidance`

Apoya decisiones backend:

- capas de aplicacion;
- controladores;
- servicios;
- validacion;
- manejo de errores;
- tests unitarios e integracion;
- separacion de dominio.

### `postgresql-persistence-guidance`

Apoya decisiones de datos:

- migraciones;
- indices;
- constraints;
- transacciones;
- repositorios;
- test de persistencia;
- compatibilidad con DDD.

### `docker-compose-local-guidance`

Apoya entorno local:

- revisar compose existente;
- proponer mejoras;
- diagnosticar servicios;
- no desplegar;
- no generar infraestructura sin aprobacion.

## Que no debe incluir

```text
codigo Next.js
codigo Spring Boot
SQL productivo inicial
Dockerfile
docker-compose.yml
package.json de aplicacion
pom.xml de aplicacion
scripts de build de aplicacion
```

## Propuesta inicial

```text
stack_pack_id = nextjs-springboot-postgresql
stack_pack_generates_product_code = false
stack_pack_contains_stack_knowledge = true
stack_pack_contains_test_command_policy = true
stack_pack_contains_quality_command_policy = true
stack_pack_contains_path_hints = true
stack_pack_contains_vertical_slice_guidance = true
stack_pack_contains_ddd_guidance = true
stack_pack_contains_docker_compose_guidance = true
stack_pack_contains_stack_specific_skills = true
stack_pack_skills = nextjs-frontend-guidance,springboot-backend-guidance,postgresql-persistence-guidance,docker-compose-local-guidance
stack_pack_paths_are_hints_not_hard_rules = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el stack pack incluya skills especificas por tecnologia,
o solo policies/templates para mantenerlo mas liviano?
```

Mi recomendacion: incluir skills especificas por tecnologia, pero mantenerlas como guidance y no como permisos. Esto ayuda mucho al implementer, architect y verifier sin generar codigo ni acoplar el core.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
incluir skills especificas por tecnologia como guidance
```

## Decision registrada

```text
stack_pack_id = nextjs-springboot-postgresql
stack_pack_generates_product_code = false
stack_pack_contains_stack_knowledge = true
stack_pack_contains_test_command_policy = true
stack_pack_contains_quality_command_policy = true
stack_pack_contains_path_hints = true
stack_pack_contains_vertical_slice_guidance = true
stack_pack_contains_ddd_guidance = true
stack_pack_contains_docker_compose_guidance = true
stack_pack_contains_stack_specific_skills = true
stack_pack_skills = nextjs-frontend-guidance,springboot-backend-guidance,postgresql-persistence-guidance,docker-compose-local-guidance
stack_pack_skills_are_guidance_only = true
stack_pack_skills_expand_permissions = false
stack_pack_paths_are_hints_not_hard_rules = true
```

## Regla

```text
El stack pack ayuda a los agentes.
El stack pack no genera codigo.
El stack pack no impone rutas fijas.
Las skills del stack son guidance y no elevan permisos.
```

## Supuestos

- El stack pack v1 es predefinido.
- No hay instalacion dinamica de stacks en v1.
- El usuario puede cambiar manualmente el stack pack despues de `init`.
- El orquestador pregunta o detecta rutas reales.
- Las skills del stack no elevan permisos.

## Riesgos

- Si el stack pack trae solo policies, puede quedarse corto para agentes tecnicos.
- Si trae demasiadas skills, puede sentirse grande.
- Si las rutas se tratan como reglas duras, fallara en repos reales con layouts distintos.
- Si se genera codigo, se contradice GQ-016 y GQ-028.

## Artefactos a crear o actualizar

- `.gridwork/stack-packs/nextjs-springboot-postgresql/stack-pack.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/STACK.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/quality-commands.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/path-hints.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/vertical-slice-policy.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/ddd-stack-guidance.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/docker-compose-guidance.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/templates/`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/skills/`

## Evidencia y notas

- Esta pregunta baja la decision de stack predefinido a contenido instalable.
- La recomendacion mantiene el stack pack util para agentes sin convertirlo en un generador de aplicacion.
- Decision del usuario: incluir skills especificas por tecnologia como guidance.
