# GQ-024 - Backlog, issues y vertical slices

- Estado: accepted
- Fuente: requisitos iniciales sobre backlog planning, GitHub issues, DDD y vertical slices
- Pregunta origen: GQ-024
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/backlog-planning/`, `.gridwork/skills/github-issue-publisher/`, `.gridwork/skills/github-issue-discovery/`, `.gridwork/templates/issue.md`

## Pregunta

Como debe Gridwork crear issues de backlog para que sean vertical slices completos, trazables y utiles para agentes AFK?

## Por que importa

El usuario quiere que las issues no sean tareas horizontales aisladas como "crear tabla", "crear endpoint" o "crear pantalla". Deben ser slices verticales testeables, desde frontend hasta backend y base de datos cuando aplique.

Esto es clave porque el `implementer-agent` trabajara AFK con TDD y necesita issues suficientemente completas para crear work orders claros.

## Respuesta recomendada

La skill `backlog-planning` debe generar issues como vertical slices orientados a casos de uso.

Cada issue deberia incluir:

- objetivo de usuario o caso de uso;
- contexto DDD: dominio, bounded context, agregado o entidad relevante;
- alcance frontend/backend/database si aplica;
- criterios de aceptacion;
- casos de prueba esperados;
- path scopes sugeridos;
- dependencias;
- riesgos;
- etiquetas;
- agente sugerido;
- modo sugerido: HITL, assisted o AFK;
- trazabilidad hacia SDD, ADRs y arquitectura.

## Formato recomendado de issue

```md
# [Domain] Implementar <caso de uso>

## Objetivo

Como <tipo de usuario>, quiero <accion>, para <beneficio>.

## Trazabilidad

- SDD: `<referencia>`
- Caso de uso: `<UC-XXX>`
- ADRs relacionadas: `<ADR-XXX>`
- Bounded context: `<contexto>`

## Alcance vertical

- Frontend: `<pantallas/componentes/rutas>`
- Backend: `<apis/servicios/casos de uso>`
- Database: `<tablas/migraciones/repositorios>`
- Infra/local: `<si aplica>`

## Criterios de aceptacion

- `<criterio 1>`
- `<criterio 2>`
- `<criterio 3>`

## Casos de prueba esperados

- Unit tests: `<esperados>`
- Integration tests: `<esperados>`
- E2E/UI tests: `<esperados si aplica>`

## Restricciones

- Seguir DDD.
- Seguir TDD.
- No modificar dependencias sin aprobacion.
- No tocar archivos fuera del scope.

## Delegacion sugerida

- Workflow: `tdd-implementation`
- Agente: `implementer-agent`
- Skills: `tdd`, `handoff`, `diagnose-bug`
- Modo: `afk` solo si criterios y scope estan completos.
```

## Anti-patrones

Gridwork debe evitar issues como:

```text
Crear tabla users
Crear endpoint POST /users
Crear componente LoginForm
Agregar validacion
```

En su lugar, debe agruparlas en un slice:

```text
Implementar registro de usuario end-to-end
```

## Publicacion en GitHub

La skill `backlog-planning` genera las issues candidatas como vertical slices.

La creacion real de issues en el repositorio debe delegarse a una skill separada:

```text
github-issue-publisher
```

Esta skill usa GitHub CLI de forma gobernada, especialmente:

```bash
gh issue create
```

Como publicar issues tiene side effects externos, en v1 requiere aprobacion humana.

Modelo recomendado:

```text
backlog-planning genera drafts locales
usuario revisa
orquestador pide aprobacion para publicar
si se aprueba, github-issue-publisher usa gh issue create
issues reales quedan creadas en GitHub
```

Los drafts locales viven en `.factory/` en v1:

```text
.factory/runs/RUN-.../artifacts/backlog/
  ISSUE-DRAFT-001.md
  ISSUE-DRAFT-002.md
```

## Propuesta inicial

```text
issue_model = vertical_slice
issue_source = sdd_architecture_adr_domain_model
issue_drafts_path_v1 = .factory/runs/<run-id>/artifacts/backlog/
issue_drafts_versioned_v1 = false
github_issue_publish_requires_approval = true
github_issue_publish_tool = gh
horizontal_task_issues_discouraged = true
issue_must_include_acceptance_criteria = true
issue_must_include_test_expectations = true
issue_must_include_traceability = true
issue_must_include_path_scopes = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que backlog-planning solo genere drafts locales en `.factory/`,
o que despues de tu aprobacion tambien pueda publicar issues en GitHub con `gh issue create`?
```

## Respuesta del usuario

El usuario decide:

- Gridwork debe crear las issues en el repositorio.
- Para crear issues en el repo se debe usar una skill.
- Esta capacidad debe mantenerse separada y gobernada.

## Decision registrada

```text
issue_model = vertical_slice
issue_source = sdd_architecture_adr_domain_model
issue_drafts_path_v1 = .factory/runs/<run-id>/artifacts/backlog/
issue_drafts_versioned_v1 = false
initial_gridwork_backlog_drafts_path = .docs/grill-me_factory/backlog/
initial_gridwork_backlog_drafts_versioned = true
github_issue_creation_in_repo_v1 = true
github_issue_publish_skill = github-issue-publisher
github_issue_publish_requires_approval = true
github_issue_publish_tool = gh
github_issue_publish_command = gh issue create
horizontal_task_issues_discouraged = true
issue_must_include_acceptance_criteria = true
issue_must_include_test_expectations = true
issue_must_include_traceability = true
issue_must_include_path_scopes = true
```

## Regla

```text
backlog-planning disena las issues.
github-issue-publisher las crea en GitHub.
GitHub CLI ejecuta la accion.
El orquestador valida policy, gates y aprobacion.
```

## Supuestos

- La arquitectura DDD y el SDD existen antes de backlog planning cuando el proyecto nace desde cero.
- Para proyectos existentes, intake puede producir insumos mas pequenos.
- Publicar en GitHub requiere aprobacion por ser side effect externo.
- Las issues deben estar preparadas para work orders AFK cuando aplique.

## Riesgos

- Issues demasiado grandes pueden ser dificiles de implementar AFK.
- Issues demasiado pequenas pueden romper el criterio de vertical slice.
- Si no hay trazabilidad, el verifier no sabe contra que validar.
- Si se publican issues sin revision, se llena el backlog de trabajo mal definido.

## Artefactos a crear o actualizar

- `.gridwork/skills/backlog-planning/SKILL.md`
- `.gridwork/skills/backlog-planning/skill.json`
- `.gridwork/skills/github-issue-publisher/SKILL.md`
- `.gridwork/skills/github-issue-publisher/skill.json`
- `.gridwork/templates/github-issue.md`
- `.gridwork/policies/backlog-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.factory/runs/<run-id>/artifacts/backlog/`

## Evidencia y notas

- Esta pregunta conecta la arquitectura DDD con la implementacion AFK.
- Mantiene GitHub CLI como herramienta gobernada con aprobacion para side effects.
- Decision del usuario: Gridwork debe crear issues reales en el repo mediante una skill.
- Revision posterior: las labels usadas por las issues deben salir de `.gridwork/policies/github-labels.json`.
- Revision posterior GQ-085: el backlog inicial de Gridwork debe organizarse como vertical slices alineadas al roadmap MVP, empezando por `init` + fabrica minima instalable.
- Revision posterior GQ-089: el backlog inicial de implementacion de Gridwork usa drafts locales en `.docs/grill-me_factory/backlog/`; los backlogs operativos normales siguen usando `.factory/`.
