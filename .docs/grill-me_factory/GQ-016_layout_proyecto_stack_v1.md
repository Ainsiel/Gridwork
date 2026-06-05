# GQ-016 - Init sin generacion de codigo de producto

- Estado: accepted
- Fuente: stack predefinido aceptado en GQ-008 y path scopes aceptados en GQ-015
- Pregunta origen: GQ-016
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `docs/PROJECT_LAYOUT.md`

## Pregunta

Debe `npx gridwork init` generar carpetas/codigo de producto para el stack v1, como `frontend/`, `backend/`, `database/` o `docker/`?

## Por que importa

Es importante separar dos cosas:

1. La instalacion de Gridwork como fabrica.
2. La generacion o modificacion del codigo del producto.

Si `gridwork init` genera codigo de producto, el comando deja de ser solo instalacion de fabrica y empieza a tomar decisiones tecnicas fuertes. El usuario aclaro que no quiere eso.

## Respuesta recomendada

`gridwork init` no debe generar codigo de producto ni carpetas de aplicacion.

```text
repo/
  .gridwork/
  .factory/
```

Debe crear solo la definicion y runtime de la fabrica:

```text
.gridwork/
  factory.json
  agents/
  skills/
  workflows/
  policies/
  schemas/
  templates/
  stack-packs/default-fullstack/

.factory/
  runs/
  logs/
  cache/
  tmp/
```

El stack v1 significa que Gridwork trae un set predefinido de skills/policies/templates para:

```text
Next.js
Spring Boot
PostgreSQL
Docker Compose
```

Pero no crea:

```text
frontend/
backend/
database/
docker/
docker-compose.yml
```

## Mapping de workspace domains

Los domains existen como nomenclatura y policy, pero algunas rutas pueden no existir todavia. El orquestador debe validar existencia antes de actuar.

| Workspace domain | Rutas |
|---|---|
| `factory_definition` | `.gridwork/**` |
| `factory_runtime` | `.factory/**` |
| `product_docs` | `docs/**` |
| `frontend_code` | detectado o configurado, por ejemplo `frontend/**` |
| `backend_code` | detectado o configurado, por ejemplo `backend/**` |
| `database_code` | detectado o configurado, por ejemplo `database/**` o migraciones dentro de backend |
| `infra_local` | detectado o configurado, por ejemplo `docker/**`, `docker-compose.yml` |
| `github_config` | `.github/**` |
| `repo_meta` | `README.md`, `.gitignore`, archivos raiz |

## Recomendacion para uso posterior

Cuando el usuario ejecute un workflow como `ideation-from-zero`, `architecture-ddd` o `tdd-implementation`, el orquestador puede:

- detectar si existe codigo;
- pedir al usuario rutas del frontend/backend/database;
- registrar esas rutas en una configuracion;
- usar skills del stack predefinido si aplican;
- pedir confirmacion antes de crear cualquier carpeta de producto.

## Layout sugerido, solo como referencia

Si algun workflow posterior decide crear o trabajar sobre un proyecto fullstack, se puede sugerir este layout, pero no generarlo en `init`:

```text
repo/
  frontend/
  backend/
  database/
  docker/
  docker-compose.yml
```

## Respuesta del usuario

El usuario aclara:

- No quiere que `npx gridwork init` genere `frontend/`, `backend/`, `database/` ni `docker/`.
- No quiere que Gridwork genere codigo de producto durante init.
- El stack predefinido se refiere principalmente a un set de skills ya predefinidas para Next.js, Spring Boot, PostgreSQL y Docker Compose.
- Algunos agentes podran usar esos skills.
- El orquestador puede o no usar esos agentes segun el workflow.

## Decision registrada

Decision aceptada:

```text
gridwork_init_generates_product_code = false
gridwork_init_generates_frontend_backend_database_docker = false
default_stack_pack_is_skills_policies_templates_only = true
product_layout_is_detected_or_declared_later = true
orchestrator_may_use_stack_skills_conditionally = true
```

Regla:

```text
gridwork init instala la fabrica.
Los workflows posteriores pueden crear o modificar producto solo con decision explicita.
```

## Supuestos

- `gridwork init` prepara la fabrica, no el producto.
- El stack pack predefinido existe para guiar agentes, no para scaffold-ear codigo.
- El layout real del producto se detectara o declarara despues.
- Las rutas exactas de frontend/backend/database/infra pueden variar por repo.

## Riesgos

- Si no se detecta o declara layout luego, los path scopes para codigo quedaran incompletos.
- Si un workflow crea carpetas de producto sin confirmacion, contradice esta decision.
- Si las skills del stack asumen rutas fijas, fallaran en repos existentes con otra estructura.
- Si el orquestador usa skills del stack sin detectar contexto, puede aplicar recomendaciones equivocadas.

## Preguntas abiertas

- Como se detectan rutas reales de frontend/backend/database/infra?
- Debe existir un comando `gridwork project detect-layout`?
- Donde se guarda la configuracion de layout detectado?
- Que pasa si el repo esta vacio y un workflow necesita crear producto?
- El usuario aprueba creacion de carpetas durante workflows posteriores o siempre sera manual?

## Artefactos a crear o actualizar

- `docs/PROJECT_LAYOUT.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/stack-packs/default-fullstack/`
- `.gridwork/templates/project-layout-reference.md`
- `.gridwork/schemas/project-layout.schema.json`

## Evidencia y notas

- Esta decision corrige que el stack predefinido no implica scaffold de codigo.
- Protege `gridwork init` como instalacion de fabrica solamente.
- Abre la necesidad de detectar o declarar layout real en una pregunta posterior.
