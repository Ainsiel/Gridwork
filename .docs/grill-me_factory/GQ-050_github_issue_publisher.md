# GQ-050 - Publicacion de issues con `github-issue-publisher`

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-024, GQ-031, GQ-041, GQ-046 y GQ-049
- Pregunta origen: GQ-050
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/github-issue-publisher/`, `.factory/runs/<run-id>/artifacts/backlog/`, GitHub Issues

## Pregunta

Como debe publicar issues reales en GitHub la skill `github-issue-publisher` usando drafts locales de `backlog-planning`?

## Por que importa

Ya se decidio que `backlog-planning` no publica directamente en GitHub. Esa separacion es buena, pero obliga a definir el contrato de `github-issue-publisher`:

- que valida antes de publicar;
- como usa `gh`;
- como pide approval;
- como respeta labels predefinidas;
- como registra los issue numbers creados;
- como evita duplicados;
- como maneja fallos parciales;
- como deja trazabilidad local.

La publicacion en GitHub es una escritura remota. Por tanto, debe ser controlada y auditable.

## Respuesta recomendada

`github-issue-publisher` debe funcionar como una skill de publicacion controlada:

```text
validate drafts -> prepare publish plan -> request approval -> execute gh issue create -> record results
```

No debe crear o modificar drafts. Su responsabilidad es publicar drafts ya preparados y registrar el resultado.

## Inputs requeridos

```text
run_id
issue_drafts_path
issue_index_path
github_label_catalog_ref
target_repository
approval_id
```

Opcionales:

```text
milestone
assignees
project
dry_run_notes
```

## Validaciones antes de approval

Antes de pedir aprobacion, debe validar:

- cada draft tiene titulo;
- cada draft tiene criterios de aceptacion;
- cada draft tiene definition of done;
- cada draft tiene labels existentes en `.gridwork/policies/github-labels.json`;
- cada draft tiene referencias Gridwork;
- cada draft tiene tamano `XS`, `S` o `M`, o riesgo explicito si es `L`;
- cada draft tiene suficiente valor verificable;
- no hay issues duplicadas dentro del set local;
- el repo GitHub esta identificado.

Si falla una validacion, la skill no debe pedir ejecucion de `gh`. Debe devolver un reporte local con bloqueos.

## Publish plan

Debe crear antes de publicar:

```text
.factory/runs/<run-id>/artifacts/backlog/publish-plan.md
.factory/runs/<run-id>/artifacts/backlog/publish-plan.json
```

El plan debe listar:

```text
draft_id
title
labels
body_file
target_repository
planned_gh_command_summary
risk_level
requires_approval
```

El plan no debe incluir secretos ni tokens.

## Approval gate

La skill debe pedir aprobacion humana antes de ejecutar `gh issue create`.

La aprobacion debe registrar:

```text
approval_id
run_id
skill_id = github-issue-publisher
target_repository
draft_count
labels_used
risk_level
decision
```

La aprobacion queda en:

```text
.factory/runs/<run-id>/approvals.jsonl
```

## Uso de GitHub CLI

Comando permitido conceptualmente:

```text
gh issue create --repo <owner/repo> --title <title> --body-file <body-file> --label <label>
```

Reglas:

- no usar labels fuera del catalogo;
- no usar comandos destructivos;
- no crear issues sin approval;
- no usar `gh` para modificar configuracion del repo;
- no publicar si `gh auth status` falla;
- no asumir repo si no esta claro.

## Resultado local

Despues de publicar, debe crear o actualizar:

```text
.factory/runs/<run-id>/artifacts/backlog/published_issue_map.json
.factory/runs/<run-id>/artifacts/backlog/published-issues.md
```

`published_issue_map.json` debe contener:

```text
draft_id
github_issue_number
github_issue_url
title
labels
published_at
approval_id
status
```

## Manejo de fallos parciales

Si se publican algunas issues y luego falla otra:

- no reintentar automaticamente sin revisar;
- registrar cuales fueron publicadas;
- marcar el run como `waiting_user` o `blocked` segun causa;
- generar reporte de fallos;
- evitar duplicar issues ya creadas.

## Duplicados

Antes de publicar, debe intentar detectar duplicados locales:

```text
same_title
same_draft_id
same_gridwork_refs
```

La deteccion remota puede ser limitada, pero si se detecta una issue existente con la misma referencia Gridwork, debe detenerse y pedir decision.

## Relacion con work orders

Despues de publicar issues, la skill no debe crear work orders automaticamente salvo que el workflow lo pida explicitamente.

Regla recomendada:

```text
published GitHub issue = backlog remoto
work order = contrato AFK local
```

El planner-agent u orquestador decide cuando convertir una issue en work order.

## Eventos de trazabilidad

Eventos recomendados:

```text
github_issue_publish.validation_started
github_issue_publish.validation_failed
github_issue_publish.plan_created
approval.requested
approval.granted
github_issue_publish.started
github_issue_publish.issue_created
github_issue_publish.failed
github_issue_publish.completed
```

## Propuesta inicial

```text
github_issue_publisher_mode = controlled_remote_write
github_issue_publisher_reads_local_drafts = true
github_issue_publisher_modifies_drafts = false
github_issue_publisher_requires_publish_plan = true
github_issue_publisher_requires_approval = true
github_issue_publisher_uses_gh_issue_create = true
github_issue_publisher_requires_label_catalog = true
github_issue_publisher_detects_local_duplicates = true
github_issue_publisher_records_published_map = true
github_issue_publisher_creates_work_orders = false
github_issue_publisher_handles_partial_failures = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `github-issue-publisher` publique todas las issue drafts aprobadas en lote,
o que publique una por una con aprobacion separada?
```

Mi recomendacion: publicar en lote pequeno con un solo approval gate para el publish plan completo. Si el set es grande o tiene issues riesgosas, dividirlo en lotes. Esto mantiene control sin hacer tedioso cada issue.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
publicar en lote pequeno con un solo approval gate para el publish plan completo
```

Si el set es grande o contiene issues riesgosas, debe dividirse en lotes.

## Decision registrada

```text
github_issue_publisher_mode = controlled_remote_write
github_issue_publisher_reads_local_drafts = true
github_issue_publisher_modifies_drafts = false
github_issue_publisher_requires_publish_plan = true
github_issue_publisher_requires_approval = true
github_issue_publisher_uses_gh_issue_create = true
github_issue_publisher_requires_label_catalog = true
github_issue_publisher_detects_local_duplicates = true
github_issue_publisher_records_published_map = true
github_issue_publisher_creates_work_orders = false
github_issue_publisher_handles_partial_failures = true
github_issue_publish_batch_mode = small_batch_single_approval
github_issue_publish_large_or_risky_batches_must_split = true
initial_gridwork_first_publish_batch = phase-0_and_phase-1_only
initial_gridwork_github_publish_requires_publish_plan = true
github_issue_publisher_requires_ready_drafts = true
```

## Regla

```text
Un publish plan aprobado puede publicar un lote pequeno de issues.
Un lote grande o riesgoso debe dividirse.
La skill publica issues, pero no crea work orders.
```

## Supuestos

- `gh` esta disponible o el workflow se bloquea con warning operativo.
- Las labels viven en `.gridwork/policies/github-labels.json`.
- Los drafts ya fueron creados por `backlog-planning`.
- Toda escritura en GitHub requiere approval.
- `.factory/` guarda la trazabilidad local.

## Riesgos

- Publicar una por una da control fino, pero puede ser lento.
- Publicar todo en lote puede crear muchos issues si el plan esta mal.
- Si no hay published map, se pierde correlacion entre drafts e issues reales.
- Si no se maneja fallo parcial, se pueden duplicar issues.

## Artefactos a crear o actualizar

- `.gridwork/skills/github-issue-publisher/SKILL.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.gridwork/templates/github-issue.md`
- `.gridwork/templates/backlog-plan.md`
- `.gridwork/schemas/approval.schema.json`
- `.gridwork/schemas/event.schema.json`

## Evidencia y notas

- Esta pregunta define el lado remoto de la planificacion de backlog.
- La recomendacion mantiene GitHub como salida aprobada, no como efecto colateral del planning.
- Decision del usuario: publicar en lote pequeno con un solo approval gate para el publish plan completo.
- Revision posterior GQ-089: el backlog inicial de Gridwork no se publica inmediatamente; el primer lote recomendado para GitHub es fase 0 y fase 1 con publish plan aprobado.
- Revision posterior GQ-092: `github-issue-publisher` solo puede publicar drafts marcados como `ready` por el review report.
