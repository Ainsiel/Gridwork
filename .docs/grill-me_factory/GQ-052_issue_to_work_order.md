# GQ-052 - Conversion de issue `ready` a work order AFK

- Estado: accepted
- Fuente: decisiones GQ-021, GQ-024, GQ-041, GQ-049, GQ-050 y GQ-051
- Pregunta origen: GQ-052
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/<run-id>/work-orders/`, `.gridwork/templates/work-order.md`, `.gridwork/agents/orchestrator/AGENT.md`, `.gridwork/agents/planner-agent/AGENT.md`

## Pregunta

Como debe convertirse una issue de GitHub clasificada como `ready` en un work order AFK para el `implementer-agent`?

## Por que importa

Ya se decidio que:

- una issue GitHub no reemplaza un work order;
- `github-issue-discovery` solo lee y recomienda;
- los agentes AFK requieren work order;
- el implementer-agent debe trabajar bajo TDD;
- los path scopes y human gates deben estar claros antes de delegar.

Entonces falta definir el puente formal:

```text
issue ready -> seleccion humana/orquestador -> work order AFK -> implementer-agent
```

Sin este paso, el implementer podria empezar desde una issue ambigua o incompleta.

## Respuesta recomendada

Crear work orders desde issues `ready` solo mediante el orquestador o `planner-agent`.

```text
github-issue-discovery recomienda
orchestrator/planner-agent valida
orchestrator/planner-agent crea work order
implementer-agent ejecuta
```

La conversion debe ser local y auditable. No debe modificar GitHub por defecto.

## Inputs requeridos

```text
run_id
github_issue_ref
github_issue_url
issue_discovery_report_ref
issue_readiness = ready
github_label_catalog_ref
path_scope_policy_ref
active_stack_pack
target_agent = implementer-agent
```

Inputs opcionales:

```text
sdd_ref
architecture_refs
adr_refs
stack_layout_ref
diagnosis_ref
```

## Validaciones antes de crear work order

La issue debe tener:

- objetivo claro;
- criterios de aceptacion;
- definition of done;
- labels validas o warnings explicitos;
- scope suficientemente acotado;
- path scopes sugeridos;
- workflow recomendado;
- agente recomendado;
- ausencia de conflictos con policies.

Si falta algo critico, no se crea work order. La issue debe volver a `needs_refinement`, `needs_architecture`, `needs_approval` o `blocked`.

## Work order generado

El work order debe crearse en:

```text
.factory/runs/<run-id>/work-orders/<work-order-id>.md
```

Debe usar el template:

```text
.gridwork/templates/work-order.md
```

Metadata minima:

```yaml
work_order_id: wo_<run-short-id>_<sequence>
run_id: run_<timestamp>_<slug>
workflow_id: tdd-implementation
status: ready
source_agent: planner-agent
target_agent: implementer-agent
github_issue_refs:
  - "#42"
required_skills:
  - tdd
path_scopes:
  - frontend_code
  - backend_code
allowed_commands_policy: .gridwork/policies/tool-allowlist.md
requires_handoff: true
```

## Contenido minimo

El work order debe incluir:

```text
Objetivo
Contexto
Issue GitHub
Alcance in_scope/out_of_scope
Path scopes
Criterios de aceptacion
Casos de prueba esperados
Estrategia TDD
Comandos permitidos
Human gates
Entregables
Definition of done
```

## Approval

Recomendacion:

```text
crear work order local no requiere approval si no amplia permisos
crear work order que amplia scope requiere approval
crear work order AFK final requiere confirmacion del usuario si el agente va a trabajar sin supervision
```

Es decir, preparar un draft local puede ser automatico. Delegar AFK a implementer debe quedar confirmado.

## Estados recomendados

```text
draft
ready
assigned
in_progress
waiting_user
waiting_verification
completed
blocked
cancelled
```

Cuando el work order queda listo para el implementer:

```text
status = ready
run.status = delegated
next_agent = implementer-agent
```

## Relacion con GitHub

La conversion a work order no debe modificar la issue por defecto.

Opcional futuro:

```text
comentar issue con referencia al work order
agregar label status:in-progress
asignar agente/usuario
```

Pero en v1 eso debe requerir approval y una skill de escritura GitHub especifica.

## Propuesta inicial

```text
issue_to_work_order_creator = orchestrator_or_planner_agent
github_issue_discovery_creates_work_orders = false
work_order_creation_requires_issue_ready = true
work_order_creation_requires_acceptance_criteria = true
work_order_creation_requires_path_scopes = true
work_order_creation_requires_human_gates = true
work_order_creation_requires_tdd_strategy = true
local_work_order_draft_requires_approval = false
afk_delegation_requires_user_confirmation = true
work_order_creation_modifies_github = false
work_order_status_after_creation = ready
run_status_after_afk_delegation = delegated
```

## Pregunta para decidir

La duda clave:

```text
Quieres que crear el work order local sea automatico cuando una issue esta ready,
o que siempre requiera confirmacion humana antes de crear el archivo?
```

Mi recomendacion: permitir crear el draft local automaticamente si la issue esta `ready`, pero exigir confirmacion humana antes de delegar trabajo AFK al `implementer-agent`.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
crear draft local automaticamente si la issue esta ready
exigir confirmacion humana antes de delegar trabajo AFK al implementer-agent
```

## Decision registrada

```text
issue_to_work_order_creator = orchestrator_or_planner_agent
github_issue_discovery_creates_work_orders = false
work_order_creation_requires_issue_ready = true
work_order_creation_requires_acceptance_criteria = true
work_order_creation_requires_path_scopes = true
work_order_creation_requires_human_gates = true
work_order_creation_requires_tdd_strategy = true
local_work_order_draft_requires_approval = false
afk_delegation_requires_user_confirmation = true
work_order_creation_modifies_github = false
work_order_status_after_creation = ready
run_status_after_afk_delegation = delegated
```

## Regla

```text
Crear un draft local de work order no delega trabajo AFK.
Delegar al implementer-agent requiere confirmacion humana.
Una issue ready sigue necesitando work order.
```

## Supuestos

- `.factory/` no se versiona.
- Crear un archivo local de work order no modifica GitHub.
- Delegar trabajo AFK es una accion de mayor riesgo que crear un draft local.
- El implementer-agent no trabaja sin work order.
- El work order no puede ampliar permisos por encima de policies.

## Riesgos

- Si crear work orders siempre requiere confirmacion, el flujo puede volverse lento.
- Si delegar AFK no requiere confirmacion, se puede ejecutar trabajo no deseado.
- Si el work order se crea desde una issue incompleta, el implementer tendra que inferir demasiado.
- Si el work order modifica GitHub por defecto, se mezclan responsabilidades.

## Artefactos a crear o actualizar

- `.gridwork/templates/work-order.md`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/planner-agent/AGENT.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/skills/github-issue-discovery/SKILL.md`

## Evidencia y notas

- Esta pregunta crea el puente entre discovery de GitHub y ejecucion AFK.
- La recomendacion separa preparacion local de delegacion real al implementer.
- Decision del usuario: crear draft local automaticamente si la issue esta ready, pero confirmar antes de delegar AFK.
