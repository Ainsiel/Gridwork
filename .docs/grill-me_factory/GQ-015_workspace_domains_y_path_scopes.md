# GQ-015 - Workspace domains y path scopes

- Estado: accepted
- Fuente: requisito agregado durante GQ-014
- Pregunta origen: GQ-015
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/path-scopes.md`

## Pregunta

Como debe Gridwork nombrar y gobernar los dominios de carpetas donde cada agente puede leer, crear, modificar o eliminar archivos?

## Por que importa

Los permisos por agente no bastan si no estan acotados por rutas. Por ejemplo, `implementer-agent` puede escribir codigo, pero no deberia poder modificar `.gridwork/policies/` ni borrar ADRs. `software-architect` puede escribir arquitectura, pero no deberia tocar codigo de produccion.

Esto permite que el orquestador bloquee acciones peligrosas antes de ejecutarlas.

## Nomenclatura recomendada

Usar dos conceptos:

```text
workspace_domain = nombre logico de una zona del repo
path_scope = reglas concretas de read/create/update/delete sobre rutas
```

Ejemplo:

```text
domain: factory_definition
paths:
  - .gridwork/**
```

```text
domain: source_code
paths:
  - frontend/**
  - backend/**
```

## Workspace domains recomendados

| Domain | Rutas tipicas | Descripcion |
|---|---|---|
| `factory_definition` | `.gridwork/**` | Definicion versionada de Gridwork: agentes, skills, workflows, policies, schemas. |
| `factory_runtime` | `.factory/**` | Runs, logs, cache, artifacts y memoria operativa local. |
| `product_docs` | `docs/**` | SDD, arquitectura, ADRs, backlog, reportes versionables. |
| `frontend_code` | `frontend/**` | Codigo Next.js. |
| `backend_code` | `backend/**` | Codigo Spring Boot. |
| `database_code` | `database/**`, `db/**`, `migrations/**` | Migraciones, seeds y scripts de PostgreSQL. |
| `infra_local` | `docker-compose.yml`, `docker/**` | Docker Compose y configuracion local. |
| `github_config` | `.github/**` | GitHub Actions, workflows y configuracion GitHub versionada. |
| `repo_meta` | `.gitignore`, `README.md`, `package.json`, `pom.xml`, `build.gradle` | Archivos raiz y metadatos del repo. |

## Acciones recomendadas

```text
read
create
update
delete
append
execute
```

Regla:

```text
delete siempre requiere permiso explicito.
execute siempre requiere allowlist.
update de .gridwork siempre requiere gate.
```

## Matriz inicial recomendada

| Agente | factory_definition | factory_runtime | product_docs | frontend_code | backend_code | database_code | infra_local | github_config | repo_meta |
|---|---|---|---|---|---|---|---|---|---|
| `orchestrator` | read | create/update | read/create/update | read | read | read | read | read | read |
| `intake-agent` | read | append | read/create/update | read | read | read | read | read | read |
| `software-architect` | read | append | read/create/update | read | read | read | read/update-gate | read/update-gate | read |
| `planner-agent` | read | append | read/create/update | read | read | read | read | read | read |
| `implementer-agent` | read | append | read/update-limited | read/create/update | read/create/update | read/create/update-gate | read/update-gate | read | read/update-gate |
| `verifier-agent` | read | append | read/create/update-report | read | read | read | read | read | read |

## Reglas recomendadas

- Ningun agente puede borrar archivos sin permiso explicito y gate humano.
- `.gridwork/**` es read-only para todos en v1, salvo workflows manuales de configuracion.
- `.factory/**` es escrito principalmente por el orquestador; otros agentes registran via orquestador.
- `software-architect` puede proponer cambios a infraestructura o GitHub Actions, pero requiere gate.
- `implementer-agent` puede modificar `frontend/**`, `backend/**` y partes de database bajo issue/work order.
- `verifier-agent` no modifica codigo; escribe reportes de verificacion.
- `planner-agent` prepara issues/backlog en docs y usa `gh` solo bajo policy.

## Respuesta del usuario

El usuario acepta la nomenclatura:

- `workspace_domain` como nombre logico de una zona del repo.
- `path_scope` como reglas concretas sobre rutas y acciones.

## Decision registrada

Decision aceptada:

```text
filesystem_governance_model = workspace_domain_plus_path_scope
workspace_domain = logical_repo_zone
path_scope = route_actions_policy
delete_requires_human_gate = true
execute_requires_allowlist = true
gridwork_definition_update_requires_gate = true
```

Regla:

```text
Cada accion de agente sobre archivos debe validarse contra capability permissions y path scopes.
```

## Supuestos

- El proyecto v1 tendra estructura compatible con Next.js, Spring Boot, PostgreSQL y Docker Compose.
- Las rutas exactas podran ajustarse despues de definir layout.
- El orquestador valida path scopes antes de ejecutar tool calls.
- Las restricciones por ruta aplican incluso si la skill pide mas permisos.

## Riesgos

- Si los path scopes son demasiado restrictivos, los agentes se bloquearan en tareas validas.
- Si son demasiado amplios, pierden valor de seguridad.
- Si no se distingue `update` de `delete`, se puede borrar informacion importante.
- Si `.gridwork/` se modifica sin gate, se puede alterar la gobernanza de la fabrica.

## Preguntas abiertas

- La estructura de codigo sera `frontend/` y `backend/`?
- Donde viviran migraciones PostgreSQL?
- Quien puede modificar `.github/workflows/*.yml`?
- `implementer-agent` puede modificar `docker-compose.yml` con gate?

## Artefactos a crear o actualizar

- `.gridwork/policies/path-scopes.md`
- `.gridwork/schemas/path-scope.schema.json`
- `.gridwork/policies/permissions.md`
- `.gridwork/agents/**`
- `docs/PROJECT_LAYOUT.md`
- `docs/AGENT_PERMISSIONS.md`

## Evidencia y notas

- Esta decision baja los permisos desde capacidades abstractas a recursos concretos del repo.
- Ayuda a proteger `.gridwork/`, `.github/`, infraestructura y documentos de arquitectura.
