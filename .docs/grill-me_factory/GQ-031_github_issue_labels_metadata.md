# GQ-031 - Labels y metadata de issues de GitHub

- Estado: accepted
- Fuente: decisiones GQ-024 sobre issues vertical slice y skills `github-issue-publisher` / `github-issue-discovery`
- Pregunta origen: GQ-031
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/github-issue-publisher/`, `.gridwork/skills/github-issue-discovery/`, `.gridwork/policies/backlog-policy.md`, `.gridwork/policies/github-labels.json`

## Pregunta

Que labels, metadata y convenciones debe usar Gridwork al crear issues de GitHub para que luego los agentes puedan buscarlas, filtrarlas y convertirlas en work orders?

## Por que importa

Gridwork va a crear issues reales en GitHub. Si esas issues no tienen una metadata consistente, el `implementer-agent` y la skill `github-issue-discovery` tendran que adivinar que issue esta lista, a que dominio pertenece, que modo requiere y si puede trabajarse AFK.

La metadata tambien ayuda al usuario a ver rapidamente el backlog.

## Respuesta recomendada

Usar una taxonomia minima de labels, sin sobrecargar GitHub.

Labels recomendados:

```text
gridwork
type:feature
type:bug
type:improvement
slice:vertical
mode:afk-ready
mode:hitl
mode:assisted
status:ready
status:needs-refinement
status:blocked
domain:<domain>
workflow:tdd-implementation
agent:implementer
```

Ejemplo:

```text
gridwork
type:feature
slice:vertical
mode:afk-ready
status:ready
domain:auth
workflow:tdd-implementation
agent:implementer
```

## Metadata dentro del body

Ademas de labels, el body de la issue debe incluir una seccion estructurada:

```md
## Gridwork Metadata

- Domain: `auth`
- Bounded context: `identity-access`
- Workflow: `tdd-implementation`
- Suggested agent: `implementer-agent`
- Suggested mode: `afk`
- Path scopes: `frontend_code`, `backend_code`, `database_code`
- Source SDD: `docs/sdd/SDD.md#UC-001`
- Source architecture: `docs/architecture/bounded-contexts.md`
- ADRs: `ADR-001`, `ADR-003`
```

Esto evita depender solo de labels, que a veces son demasiado cortos.

## Creacion de labels

Crear labels en GitHub tambien es side effect externo. Por lo tanto:

```text
github-issue-publisher puede usar labels existentes.
Si faltan labels, debe pedir aprobacion antes de crearlos.
```

Puede existir una skill futura:

```text
github-label-manager
```

Pero en v1 puede quedar diferida si queremos mantenerlo simple.

## Propuesta inicial

```text
github_issue_labels_enabled = true
github_issue_label_taxonomy = minimal_gridwork_taxonomy
github_issue_body_metadata_required = true
github_issue_domain_label_required = true
github_issue_status_label_required = true
github_issue_mode_label_required = true
github_issue_workflow_label_required = true
github_issue_agent_label_optional = true
github_issue_publisher_can_apply_existing_labels = true
github_issue_publisher_can_create_missing_labels_without_approval = false
github_label_manager_skill_candidate = true
github_issue_label_catalog_gridwork_mvp_extension_enabled = true
github_issue_label_catalog_gridwork_mvp_phase_labels = phase:0,phase:1
github_issue_label_catalog_gridwork_mvp_area_labels = area:source-repo,area:cli,area:factory,area:ci,area:docs
github_issue_label_catalog_gridwork_mvp_slice_label = slice:enabling
```

## Pregunta para decidir

La duda clave:

```text
Quieres que Gridwork use labels con prefijos como `domain:auth`, `mode:afk-ready`,
o prefieres labels mas simples tipo `auth`, `afk-ready`, `ready`?
```

Mi recomendacion: usar prefijos. Son un poco mas largos, pero evitan ambiguedad y son mas faciles de filtrar para agentes.

## Catalogo JSON de labels

Las labels deben estar predefinidas en un JSON versionado para que los agentes no inventen labels.

Ruta recomendada:

```text
.gridwork/policies/github-labels.json
```

Ejemplo:

```json
{
  "schemaVersion": "1.0",
  "labels": [
    {
      "name": "gridwork",
      "color": "5319e7",
      "description": "Issue managed by Gridwork.",
      "category": "system",
      "required": true
    },
    {
      "name": "type:feature",
      "color": "0e8a16",
      "description": "New product capability.",
      "category": "type",
      "required": false
    },
    {
      "name": "type:bug",
      "color": "d73a4a",
      "description": "Bug or regression.",
      "category": "type",
      "required": false
    },
    {
      "name": "type:improvement",
      "color": "fbca04",
      "description": "Improvement to existing behavior.",
      "category": "type",
      "required": false
    },
    {
      "name": "slice:vertical",
      "color": "1d76db",
      "description": "End-to-end vertical slice.",
      "category": "slice",
      "required": true
    },
    {
      "name": "mode:afk-ready",
      "color": "0e8a16",
      "description": "Ready for AFK agent execution.",
      "category": "mode",
      "required": false
    },
    {
      "name": "mode:hitl",
      "color": "fbca04",
      "description": "Requires human-in-the-loop work.",
      "category": "mode",
      "required": false
    },
    {
      "name": "mode:assisted",
      "color": "c5def5",
      "description": "Agent-assisted work with human gates.",
      "category": "mode",
      "required": false
    },
    {
      "name": "status:ready",
      "color": "0e8a16",
      "description": "Ready for planning or execution.",
      "category": "status",
      "required": false
    },
    {
      "name": "status:needs-refinement",
      "color": "fbca04",
      "description": "Needs more definition before execution.",
      "category": "status",
      "required": false
    },
    {
      "name": "status:blocked",
      "color": "d73a4a",
      "description": "Blocked by missing input or decision.",
      "category": "status",
      "required": false
    },
    {
      "name": "workflow:tdd-implementation",
      "color": "bfdadc",
      "description": "Issue intended for the TDD implementation workflow.",
      "category": "workflow",
      "required": false
    },
    {
      "name": "agent:implementer",
      "color": "bfd4f2",
      "description": "Suggested for implementer-agent.",
      "category": "agent",
      "required": false
    }
  ],
  "projectLabels": [
    {
      "name": "domain:auth",
      "color": "c2e0c6",
      "description": "Authentication and identity domain.",
      "category": "domain",
      "required": false
    }
  ]
}
```

Reglas del catalogo:

- Los agentes solo pueden aplicar labels presentes en `github-labels.json`.
- `domain:<domain>` tambien debe registrarse en el JSON antes de usarse.
- Si una label necesaria no existe en el JSON, el agente debe pedir aprobacion para actualizar el catalogo.
- Si una label existe en el JSON pero no existe en GitHub, crearla requiere aprobacion porque es side effect externo.
- `github-issue-publisher` lee el catalogo antes de crear issues.
- `github-issue-discovery` usa el catalogo para filtrar issues.

## Supuestos

- GitHub sera el issue tracker inicial.
- `github-issue-publisher` crea issues despues de aprobacion.
- `github-issue-discovery` necesita filtros claros para encontrar trabajo listo.
- Crear labels faltantes requiere aprobacion por ser side effect externo.
- Los agentes no deben inventar labels fuera del catalogo JSON.

## Riesgos

- Demasiados labels pueden ensuciar el repo.
- Labels sin prefijos pueden ser ambiguos.
- Si la metadata solo vive en el body, filtrar issues es mas dificil.
- Si todo vive en labels, se pierde detalle de trazabilidad.
- Si el catalogo JSON no se actualiza, los agentes pueden quedar bloqueados al necesitar labels nuevas.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Usar labels con prefijos.
- Las labels deben estar predefinidas en un JSON.
- Los agentes deben usar labels predefinidas, no inventadas.

## Decision registrada

```text
github_issue_labels_enabled = true
github_issue_label_taxonomy = prefixed_gridwork_taxonomy
github_issue_label_catalog_path = .gridwork/policies/github-labels.json
github_issue_labels_from_catalog_only = true
github_issue_body_metadata_required = true
github_issue_domain_label_required = true
github_issue_domain_labels_must_be_registered = true
github_issue_status_label_required = true
github_issue_mode_label_required = true
github_issue_workflow_label_required = true
github_issue_agent_label_optional = true
github_issue_publisher_reads_label_catalog = true
github_issue_discovery_reads_label_catalog = true
github_issue_publisher_can_apply_existing_labels = true
github_issue_publisher_can_create_missing_labels_without_approval = false
github_label_manager_skill_candidate = true
```

## Artefactos a crear o actualizar

- `.gridwork/policies/backlog-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.gridwork/schemas/github-label-catalog.schema.json`
- `.gridwork/skills/github-issue-publisher/SKILL.md`
- `.gridwork/skills/github-issue-discovery/SKILL.md`
- `.gridwork/templates/github-issue.md`
- `.gridwork/skills/github-label-manager/` (candidata diferida)

## Evidencia y notas

- Esta pregunta conecta backlog, publicacion de issues, discovery, work orders y agentes AFK.
- Decision del usuario: labels con prefijos y catalogo JSON predefinido para que los agentes no inventen labels.
- Revision posterior GQ-091: el catalogo se amplia con labels minimas `phase:*`, `area:*` y `slice:enabling` para el backlog inicial de Gridwork.
