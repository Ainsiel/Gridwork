# GQ-049 - Pipeline de `backlog-planning` hacia issues

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-024, GQ-026, GQ-031, GQ-041, GQ-042, GQ-047 y GQ-048
- Pregunta origen: GQ-049
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/backlog-planning/`, `.gridwork/skills/github-issue-publisher/`, `.factory/runs/<run-id>/artifacts/backlog/`, GitHub Issues

## Pregunta

Como debe convertir la skill `backlog-planning` el SDD y la arquitectura DDD en issues vertical slices listas para GitHub?

## Por que importa

El flujo deseado por el usuario es:

```text
idea -> grill-me -> SDD -> arquitectura DDD -> backlog planning -> issues -> implementer-agent
```

Ya se decidio que las issues deben ser vertical slices y que la creacion real en GitHub usa `gh` con approval gate. Falta definir el pipeline exacto:

- que documentos consume;
- como agrupa dominios y features;
- como decide vertical slices;
- como evita issues demasiado grandes;
- como usa labels predefinidas;
- cuando crea drafts locales;
- cuando llama a `github-issue-publisher`;
- como prepara work orders para implementacion AFK.

## Respuesta recomendada

Separar `backlog-planning` en dos fases:

```text
1. planificacion local del backlog
2. publicacion opcional en GitHub con approval gate
```

`backlog-planning` debe crear drafts locales y metadata de trazabilidad. La creacion real de issues debe delegarse a `github-issue-publisher`.

## Inputs requeridos

Inputs recomendados:

```text
sdd_ref
architecture_refs
adr_refs
domain_model_refs
api_design_refs
database_design_refs
stack_layout_ref
github_label_catalog_ref
run_id
workflow_id
```

No todos los proyectos tendran todos los documentos, pero `backlog-planning` debe exigir suficiente claridad para crear issues verificables.

## Outputs locales

`backlog-planning` debe producir:

```text
.factory/runs/<run-id>/artifacts/backlog/
  backlog-plan.md
  issue-drafts/
    issue-001.md
    issue-002.md
  issue-index.json
  domain-slice-map.md
  implementation-order.md
```

Si se aprueba publicar en GitHub, `github-issue-publisher` registra referencias:

```text
github_issue_refs
published_issue_map.json
```

## Regla de vertical slice

Cada issue debe ser una unidad verificable de valor:

```text
frontend + api + dominio + persistencia + tests cuando aplique
```

No todas las issues tienen que tocar todas las capas, pero no deben dividirse horizontalmente solo por comodidad.

Ejemplo malo:

```text
Crear todas las entidades JPA
Crear todos los endpoints
Crear toda la UI
```

Ejemplo bueno:

```text
Como usuario, puedo registrar una direccion de envio y verla reflejada en checkout.
```

## Tamano de issues

Cada issue debe clasificarse:

```text
size: XS | S | M | L
```

Regla recomendada:

- `XS`: cambio pequeno y muy acotado.
- `S`: una slice pequena con tests claros.
- `M`: slice completa razonable.
- `L`: demasiado grande para implementar directo; debe dividirse si es posible.

`backlog-planning` no debe publicar issues `L` sin marcar riesgo o proponer division.

## Campos de issue draft

Cada draft debe contener:

```text
title
summary
domain
bounded_context
user_value
acceptance_criteria
test_cases
path_scope_suggestions
required_skills
dependencies
labels
definition_of_done
implementation_notes
verification_notes
gridwork_refs
```

## Labels

Las labels deben salir de:

```text
.gridwork/policies/github-labels.json
```

Regla:

```text
Los agentes no inventan labels.
Si falta una label, proponen agregarla al catalogo.
```

## Relacion con work orders

Una issue publicada no reemplaza el work order AFK.

Pipeline recomendado:

```text
issue draft -> issue GitHub aprobada -> work order AFK -> implementer-agent
```

El work order debe referenciar la issue:

```text
github_issue_refs:
  - "#42"
```

## Orden de implementacion

`implementation-order.md` debe proponer una secuencia:

```text
foundation slices
core domain slices
integration slices
hardening slices
```

Debe evitar planificar demasiada infraestructura antes de valor verificable.

## Approval gates

`backlog-planning` debe detenerse si:

- faltan requisitos clave;
- falta arquitectura suficiente;
- una issue queda demasiado grande;
- se quieren crear issues reales en GitHub;
- se necesita agregar labels nuevas;
- se necesita cambiar path scopes;
- hay dependencia entre dominios no resuelta.

## Propuesta inicial

```text
backlog_planning_mode = local_first_then_optional_github_publish
backlog_planning_outputs_local_drafts = true
backlog_planning_publishes_github_directly = false
github_issue_publisher_creates_real_issues = true
github_issue_creation_requires_approval = true
issues_must_be_vertical_slices = true
large_issues_require_split_or_risk = true
labels_must_use_catalog = true
issue_drafts_path = .factory/runs/<run-id>/artifacts/backlog/issue-drafts/
issue_index_path = .factory/runs/<run-id>/artifacts/backlog/issue-index.json
published_issue_map_path = .factory/runs/<run-id>/artifacts/backlog/published_issue_map.json
github_issue_does_not_replace_work_order = true
initial_gridwork_backlog_uses_docs_path = true
initial_gridwork_backlog_path = .docs/grill-me_factory/backlog/
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `backlog-planning` solo cree drafts locales
y que otra skill publique en GitHub,
o quieres que `backlog-planning` tambien publique issues reales?
```

Mi recomendacion: `backlog-planning` crea drafts locales y planifica; `github-issue-publisher` publica issues reales con approval gate. Asi separas planificacion de escritura en GitHub.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
backlog-planning crea drafts locales
github-issue-publisher publica issues reales con approval gate
```

## Decision registrada

```text
backlog_planning_mode = local_first_then_optional_github_publish
backlog_planning_outputs_local_drafts = true
backlog_planning_publishes_github_directly = false
github_issue_publisher_creates_real_issues = true
github_issue_creation_requires_approval = true
issues_must_be_vertical_slices = true
large_issues_require_split_or_risk = true
labels_must_use_catalog = true
issue_drafts_path = .factory/runs/<run-id>/artifacts/backlog/issue-drafts/
issue_index_path = .factory/runs/<run-id>/artifacts/backlog/issue-index.json
published_issue_map_path = .factory/runs/<run-id>/artifacts/backlog/published_issue_map.json
github_issue_does_not_replace_work_order = true
initial_gridwork_backlog_uses_docs_path = true
initial_gridwork_backlog_path = .docs/grill-me_factory/backlog/
```

## Regla

```text
backlog-planning disena y deja drafts.
github-issue-publisher escribe en GitHub.
Toda escritura en GitHub requiere approval gate.
Una issue publicada no reemplaza el work order AFK.
```

## Supuestos

- GitHub CLI puede usarse con approval gate.
- Las labels estan en `.gridwork/policies/github-labels.json`.
- Las issues deben ser vertical slices.
- Los work orders siguen siendo obligatorios para agentes AFK.
- El stack pack puede aportar guidance, pero no permisos.

## Riesgos

- Si `backlog-planning` publica directo, mezcla diseno de backlog con escritura remota.
- Si solo crea drafts, hay un paso extra, pero es mas seguro y auditable.
- Si las issues no son vertical slices, el implementer puede terminar haciendo trabajo horizontal dificil de verificar.
- Si las labels se inventan, el repo de GitHub pierde consistencia.

## Artefactos a crear o actualizar

- `.gridwork/skills/backlog-planning/SKILL.md`
- `.gridwork/skills/github-issue-publisher/SKILL.md`
- `.gridwork/templates/github-issue.md`
- `.gridwork/templates/work-order.md`
- `.gridwork/policies/backlog-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.gridwork/workflows/architecture-ddd/WORKFLOW.md`

## Evidencia y notas

- Esta pregunta conecta arquitectura DDD con planificacion ejecutable.
- La recomendacion evita mezclar backlog design con operaciones remotas de GitHub.
- Decision del usuario: separar backlog planning local de publicacion real en GitHub.
- Revision posterior GQ-085: cuando se genere el backlog de implementacion de Gridwork, `implementation-order.md` debe seguir las fases del roadmap MVP por rebanadas verticales.
- Revision posterior GQ-089: el backlog inicial de Gridwork se genera como drafts locales versionables en `.docs/grill-me_factory/backlog/` antes de publicar issues reales.
