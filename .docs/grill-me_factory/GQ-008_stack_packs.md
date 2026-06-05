# GQ-008 - Stack packs

- Estado: accepted
- Fuente: alcance stack-agnostic aceptado en GQ-001, modelo de skill aceptado en GQ-007 y correccion del usuario en GQ-008/GQ-009
- Pregunta origen: GQ-008
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/stack-packs/`

## Pregunta

Como debe Gridwork agregar conocimiento especifico de un stack tecnologico sin contaminar el core agnostico de la fabrica?

## Por que importa

El usuario quiere que Gridwork pueda evolucionar hacia una fabrica reutilizable, pero para el MVP prefiere un stack predefinido y concreto. Esto reduce complejidad inicial y permite validar workflows, agentes, trazabilidad y CI/CD antes de abrir extension dinamica de stacks.

Si el core conoce demasiado de Next.js, FastAPI, Laravel o .NET, deja de ser agnostico. Si no conoce nada y no puede extenderse, queda demasiado generico.

## Respuesta recomendada

Usar un stack pack predefinido en v1.

El concepto `stack-packs` se conserva como estructura interna, pero en el MVP no se habilita instalacion dinamica ni creacion automatica de nuevos stack packs.

Stack inicial de v1:

```text
frontend = Next.js
backend = Spring Boot
database = PostgreSQL
runtime = Docker Compose
```

Importante: este stack inicial no significa que `gridwork init` genere codigo, carpetas de producto o un scaffold de Next.js/Spring Boot/PostgreSQL. Significa que Gridwork instala un set predefinido de skills, policies, templates y guias para trabajar con ese stack cuando el usuario lo necesite.

Un stack pack es una carpeta versionada que agrega:

- skills especificas del stack;
- workflows especializados;
- comandos permitidos;
- convenciones de arquitectura;
- reglas de test;
- patrones de DDD aplicables;
- plantillas;
- heuristicas de deteccion;
- restricciones y riesgos.

Estructura recomendada:

```text
.gridwork/stack-packs/default-fullstack/
  stack-pack.json
  README.md
  skills/
    nextjs-frontend/
    springboot-backend/
    postgresql-database/
    docker-compose-runtime/
  workflows/
    fullstack-feature-slice.md
  policies/
    allowed-commands.json
    testing-policy.md
    architecture-defaults.md
  templates/
    frontend-spec.md
    backend-api-spec.md
    database-spec.md
    docker-compose-spec.md
```

## Ejemplo de `stack-pack.json`

```json
{
  "id": "default-fullstack",
  "version": "0.1.0",
  "name": "Default Fullstack: Next.js + Spring Boot + PostgreSQL",
  "detect": {
    "files": ["docker-compose.yml"],
    "frontend": ["package.json", "next.config.ts"],
    "backend": ["pom.xml", "build.gradle"],
    "database": ["postgres"]
  },
  "addsSkills": [
    "nextjs-frontend",
    "springboot-backend",
    "postgresql-database",
    "docker-compose-runtime"
  ],
  "addsWorkflows": [
    "fullstack-feature-slice"
  ],
  "allowedCommands": [
    "docker compose up",
    "docker compose down",
    "docker compose build",
    "docker compose logs",
    "npm test",
    "npm run lint",
    "./mvnw test",
    "./gradlew test"
  ],
  "dddGuidance": {
    "boundedContexts": "modelar dominios en backend y reflejar casos de uso en frontend",
    "apiDesign": "usar contratos por vertical slice",
    "database": "PostgreSQL como persistencia relacional principal"
  }
}
```

## Flujo propuesto

```bash
npx gridwork init
```

`gridwork init` instala el stack pack predefinido `default-fullstack`.

Si el usuario quiere cambiarlo despues, lo hara manualmente editando `.gridwork/stack-packs/`, `.gridwork/skills/`, `.gridwork/workflows/` y policies relacionadas.

## Reglas recomendadas

- El core no debe depender de un stack pack.
- Un stack pack no puede modificar permisos globales sin aprobacion.
- Un stack pack puede declarar permisos requeridos, no otorgarlos.
- Un stack pack puede agregar skills y workflows.
- Un stack pack debe tener version.
- El orquestador debe registrar que stack packs influyeron en cada run.
- En v1 no hay instalacion dinamica de stack packs.
- En v1 los cambios de stack se hacen manualmente despues de `gridwork init`.

## Respuesta del usuario

Revision actual del usuario:

- En el MVP no se crearan skills o stacks dinamicamente.
- Gridwork tendra un stack predefinido.
- Stack inicial: Next.js frontend, Spring Boot backend, PostgreSQL base de datos y Docker Compose.
- Este stack predefinido es un set de skills/policies/templates, no generacion de codigo.
- Si el usuario quiere cambiar el stack despues de instalar Gridwork, lo hara manualmente.
- La idea de stack packs puede quedar como estructura interna, pero no como feature dinamica inicial.

## Decision registrada

Decision aceptada revisada:

```text
stack_extension_model = predefined_stack_pack_for_v1
stack_packs_path = .gridwork/stack-packs/
default_stack_pack = default-fullstack
default_frontend = nextjs
default_backend = springboot
default_database = postgresql
default_runtime = docker_compose
gridwork_init_generates_product_code = false
default_stack_pack_is_skills_and_policies_only = true
stack_pack_cannot_grant_global_permissions = true
dynamic_stack_pack_installation = false
dynamic_stack_pack_creation = false
manual_stack_modification_after_init = true
```

Regla:

```text
El core define la fabrica.
El stack pack predefinido especializa la v1 para trabajar con Next.js + Spring Boot + PostgreSQL + Docker Compose, pero no scaffold-ea codigo del producto.
El orquestador valida si puede usarse.
```

## Supuestos

- Cada repo tendra un stack pack predefinido en v1.
- El stack pack debe ser seguro para commitear.
- No habra stack packs externos dinamicos en v1.
- El stack se puede modificar manualmente despues de `gridwork init`.

## Riesgos

- Si el stack pack cambia reglas globales, rompe el core.
- Si no hay allowed commands, agentes podrian ejecutar comandos riesgosos.
- Si el stack predefinido queda demasiado rigido, puede limitar proyectos futuros.
- Si la modificacion manual no tiene convenciones claras, puede romper workflows.

## Preguntas abiertas

- Que estructura exacta tendra el proyecto generado: monorepo, carpetas `frontend/` y `backend/`, u otra?
- El stack pack predefinido creara archivos de proyecto o solo reglas de fabrica?
- Que comandos Docker Compose estaran permitidos?
- Que testing defaults tendran Next.js y Spring Boot?
- Como se documenta una modificacion manual del stack?

## Artefactos a crear o actualizar

- `.gridwork/stack-packs/`
- `.gridwork/schemas/stack-pack.schema.json`
- `.gridwork/policies/stack-pack-policy.md`
- `.gridwork/stack-packs/default-fullstack/`
- `docs/STACK_EXTENSION_MODEL.md`
- `docs/TECH_STACK.md`

## Evidencia y notas

- Esta decision vuelve el MVP mas concreto y reduce complejidad.
- Gridwork conserva una estructura que podria volver a ser extensible mas adelante.
- Es compatible con el modelo de skills aceptado en GQ-007.
