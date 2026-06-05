# GQ-051 - Descubrimiento de issues con `github-issue-discovery`

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-024, GQ-031, GQ-041, GQ-046, GQ-049 y GQ-050
- Pregunta origen: GQ-051
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/github-issue-discovery/`, `.factory/runs/<run-id>/artifacts/issues/`, GitHub Issues

## Pregunta

Como debe encontrar, filtrar y preparar issues de GitHub la skill `github-issue-discovery` para que puedan convertirse en work orders de implementacion?

## Por que importa

El usuario decidio que no existira `gridwork run`. En vez de ejecutar un comando tipo `run implementer`, el agente implementador puede usar una skill que busque issues y luego trabajar desde un work order.

Eso significa que `github-issue-discovery` debe:

- consultar issues con `gh`;
- filtrar por labels predefinidas;
- identificar issues listas para implementacion;
- evitar issues ambiguas;
- crear un reporte local;
- proponer cuales convertir en work orders;
- no modificar GitHub sin approval.

Esta skill conecta el backlog remoto con el runtime local de Gridwork.

## Respuesta recomendada

Separar discovery de preparacion AFK:

```text
github-issue-discovery = leer, filtrar, rankear y reportar issues
work-order creation = responsabilidad del orquestador o planner-agent
```

La skill no debe asignar issues, cerrar issues, comentar ni modificar GitHub por defecto. Debe operar principalmente en modo read-only.

## Inputs requeridos

```text
run_id
target_repository
github_label_catalog_ref
filters
active_stack_pack
path_scope_policy_ref
```

Filtros posibles:

```text
labels
state
milestone
assignee
domain
type
priority
ready_for_implementation
```

## Uso de GitHub CLI

Comandos permitidos conceptualmente:

```text
gh issue list --repo <owner/repo> --state open --label <label> --json ...
gh issue view <number> --repo <owner/repo> --json ...
```

Reglas:

- solo lectura por defecto;
- no comentar issues;
- no editar labels;
- no asignar issues;
- no cerrar issues;
- no crear work orders sin pasar por el orquestador o planner-agent.

## Reporte local

Debe crear:

```text
.factory/runs/<run-id>/artifacts/issues/
  issue-discovery-report.md
  issue-discovery.json
  candidate-work-orders.md
```

`issue-discovery.json` debe incluir:

```text
issue_number
issue_url
title
labels
state
milestone
assignees
gridwork_refs
readiness
missing_information
recommended_agent
recommended_workflow
path_scope_suggestions
```

## Readiness

Cada issue debe clasificarse:

```text
ready
needs_refinement
needs_architecture
needs_approval
blocked
```

### `ready`

La issue tiene:

- objetivo claro;
- criterios de aceptacion;
- definition of done;
- labels validas;
- scope razonable;
- suficiente informacion para crear work order.

### `needs_refinement`

La issue requiere aclaracion de requisitos o criterios.

### `needs_architecture`

La issue implica decision tecnica o arquitectura no resuelta.

### `needs_approval`

La issue requiere autorizacion humana antes de work order.

### `blocked`

La issue no puede avanzar por dependencia, falta de contexto o conflicto de policies.

## Candidate work orders

La skill puede proponer candidatos:

```text
issue #42 -> candidate work order for implementer-agent
issue #43 -> needs refinement before work order
issue #44 -> send to software-architect first
```

Pero no debe crear work orders automaticamente si falta aprobacion o si el orquestador no lo pide.

## Labels

Debe validar labels contra:

```text
.gridwork/policies/github-labels.json
```

Si una issue tiene labels desconocidas:

- no falla necesariamente;
- las registra como warning;
- recomienda normalizacion.

No debe inventar labels ni editarlas.

## Relacion con `tdd-implementation`

Pipeline recomendado:

```text
github-issue-discovery
-> candidate-work-orders.md
-> orquestador/planner-agent selecciona issue
-> work order AFK
-> implementer-agent usa tdd-implementation
```

El implementer-agent no debe empezar cambios de codigo solo con una issue. Necesita work order.

## Propuesta inicial

```text
github_issue_discovery_mode = read_only_by_default
github_issue_discovery_uses_gh_issue_list = true
github_issue_discovery_uses_gh_issue_view = true
github_issue_discovery_can_modify_github = false
github_issue_discovery_creates_work_orders = false
github_issue_discovery_outputs_local_report = true
github_issue_discovery_outputs_candidate_work_orders = true
github_issue_readiness_values = ready,needs_refinement,needs_architecture,needs_approval,blocked
github_issue_discovery_requires_label_catalog = true
issue_ready_does_not_bypass_work_order = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `github-issue-discovery` sea solo lectura y recomendacion,
o que tambien pueda crear work orders automaticamente para issues ready?
```

Mi recomendacion: solo lectura y recomendacion en v1. Puede producir `candidate-work-orders.md`, pero la creacion del work order debe hacerla el orquestador o planner-agent con el contexto y approval correctos.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
github-issue-discovery opera en modo solo lectura y recomendacion
```

Puede producir `candidate-work-orders.md`, pero no crea work orders automaticamente.

## Decision registrada

```text
github_issue_discovery_mode = read_only_by_default
github_issue_discovery_uses_gh_issue_list = true
github_issue_discovery_uses_gh_issue_view = true
github_issue_discovery_can_modify_github = false
github_issue_discovery_creates_work_orders = false
github_issue_discovery_outputs_local_report = true
github_issue_discovery_outputs_candidate_work_orders = true
github_issue_readiness_values = ready,needs_refinement,needs_architecture,needs_approval,blocked
github_issue_discovery_requires_label_catalog = true
issue_ready_does_not_bypass_work_order = true
```

## Regla

```text
github-issue-discovery lee y recomienda.
github-issue-discovery no escribe en GitHub.
github-issue-discovery no crea work orders.
Una issue ready no reemplaza un work order AFK.
```

## Supuestos

- GitHub CLI puede usarse para lectura.
- Las labels estan predefinidas en `.gridwork/policies/github-labels.json`.
- Los agentes AFK requieren work order.
- Una issue GitHub no reemplaza un work order.
- Las escrituras en GitHub requieren approval gate.

## Riesgos

- Si crea work orders automaticamente, puede delegar issues ambiguas.
- Si solo reporta, hay un paso adicional, pero mantiene control.
- Si ignora labels desconocidas sin reportarlas, se pierde consistencia.
- Si una issue lista salta directo al implementer, se rompe el contrato AFK.

## Artefactos a crear o actualizar

- `.gridwork/skills/github-issue-discovery/SKILL.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/templates/work-order.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/planner-agent/AGENT.md`
- `.gridwork/agents/implementer-agent/AGENT.md`

## Evidencia y notas

- Esta pregunta conecta issues reales con delegacion AFK sin agregar un comando `gridwork run`.
- La recomendacion mantiene GitHub discovery en modo seguro y auditable.
- Decision del usuario: solo lectura y recomendacion en v1.
