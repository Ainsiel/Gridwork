# GQ-040 - Ciclo de vida y estados de un run

- Estado: accepted
- Fuente: decisiones GQ-020, GQ-021, GQ-022, GQ-037, GQ-038 y GQ-039
- Pregunta origen: GQ-040
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/<run-id>/run.json`, `.gridwork/schemas/run.schema.json`, `.gridwork/policies/workflow-policy.md`, `.gridwork/policies/traceability.md`

## Pregunta

Que estados puede tener un `run` y como debe cambiar de estado durante un workflow?

## Por que importa

Ahora que Gridwork tiene IDs, eventos y archivos de trazabilidad, falta definir el ciclo de vida. Sin estados claros, un agente no sabe si una tarea:

- esta activa;
- espera al usuario;
- fue delegada;
- esta bloqueada;
- necesita verificacion;
- termino correctamente;
- debe retomarse desde un handoff.

El estado del run tambien ayuda al orquestador a decidir que agente debe actuar despues.

## Respuesta recomendada

Usar una maquina de estados simple para v1:

```text
created
active
waiting_user
delegated
waiting_verification
blocked
completed
cancelled
failed
```

No conviene tener demasiados estados al inicio. Los detalles finos pueden ir en `current_gate`, `active_agent`, `next_action` y `timeline.jsonl`.

## Estados recomendados

### `created`

El run fue creado, pero aun no empezo trabajo real.

Ejemplos:

- se preparo `run.json`;
- se asigno `run_id`;
- falta seleccionar workflow.

### `active`

Un agente esta trabajando de forma interactiva o ejecutando pasos permitidos.

Ejemplos:

- el orquestador esta haciendo intake;
- el arquitecto esta haciendo grill-me;
- el planner esta preparando backlog;
- el implementer esta ejecutando TDD.

### `waiting_user`

El run necesita una decision humana.

Ejemplos:

- aprobar uso de `gh issue create`;
- confirmar una decision arquitectonica;
- aprobar una accion de riesgo;
- responder una pregunta del grill-me.

### `delegated`

El trabajo fue delegado a un agente AFK mediante work order.

Ejemplos:

- `planner-agent` entrega trabajo al `implementer-agent`;
- `orchestrator` deja una tarea AFK preparada.

### `waiting_verification`

La implementacion termino y queda pendiente revision.

Ejemplos:

- `implementer-agent` produjo evidencia TDD;
- existe handoff hacia `verifier-agent`;
- falta ejecutar `verification-pr`.

### `blocked`

El agente no puede avanzar sin un cambio externo o una decision que aun no existe.

Ejemplos:

- falta branch `develop`;
- falta auth de GitHub CLI;
- falla una dependencia que no puede instalarse sin aprobacion;
- el scope de carpetas impide continuar.

### `completed`

El run termino con resultado aceptado.

Ejemplos:

- SDD generado y aprobado;
- arquitectura documentada;
- issues creadas;
- implementacion verificada.

### `cancelled`

El usuario decide detener el run.

### `failed`

El run termino por error no recuperable.

Ejemplos:

- corrupcion de artefactos;
- conflicto irresoluble;
- fallo repetido que no puede resolverse con el contexto disponible.

## Campos recomendados en `run.json`

```text
run_id
status
workflow_id
created_at
updated_at
active_agent
last_agent
next_agent
current_gate
next_action
blocked_reason
completion_summary
handoff_required
handoff_refs
```

## Transiciones recomendadas

```text
created -> active
active -> waiting_user
active -> delegated
active -> waiting_verification
active -> blocked
active -> completed
waiting_user -> active
delegated -> active
delegated -> waiting_verification
waiting_verification -> active
waiting_verification -> completed
blocked -> active
blocked -> cancelled
blocked -> failed
active -> cancelled
```

## Eventos relacionados

Cada cambio de estado debe registrar un evento en `timeline.jsonl`:

```text
run.status_changed
run.blocked
run.completed
run.cancelled
run.failed
approval.requested
handoff.created
verification.started
verification.completed
```

## Propuesta inicial

```text
run_lifecycle_model = simple_state_machine
run_statuses = created,active,waiting_user,delegated,waiting_verification,blocked,completed,cancelled,failed
run_status_source_of_truth = .factory/runs/<run-id>/run.json
run_status_changes_emit_events = true
run_status_detail_fields = current_gate,next_action,blocked_reason,active_agent,next_agent
workflow_specific_substates_allowed = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres una maquina de estados simple para todos los workflows,
o estados especificos por workflow?
```

Mi recomendacion: maquina de estados simple y comun para todos los workflows. Para detalles especificos, usar campos auxiliares como `current_gate`, `next_action`, `active_agent` y eventos en `timeline.jsonl`.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar una maquina de estados simple y comun para todos los workflows
```

## Decision registrada

```text
run_lifecycle_model = simple_state_machine
run_statuses = created,active,waiting_user,delegated,waiting_verification,blocked,completed,cancelled,failed
run_status_source_of_truth = .factory/runs/<run-id>/run.json
run_status_changes_emit_events = true
run_status_detail_fields = current_gate,next_action,blocked_reason,active_agent,next_agent
workflow_specific_substates_allowed = false
```

## Regla

```text
Todos los workflows comparten los mismos estados base.
Los detalles especificos viven en campos auxiliares y eventos.
```

## Supuestos

- Gridwork v1 no tiene runner automatico.
- Los agentes trabajan por prompts Markdown y archivos locales.
- `.factory/runs/<run-id>/run.json` es el estado principal del run.
- Los workflows pueden tener pasos distintos, pero comparten el mismo ciclo de vida base.

## Riesgos

- Estados demasiado genericos pueden ocultar detalles importantes si no se usan campos auxiliares.
- Estados especificos por workflow pueden complicar la fabrica demasiado pronto.
- Si no hay eventos de cambio de estado, el usuario no puede reconstruir la historia del run.
- Si `blocked` y `waiting_user` se mezclan, el agente puede pedir aprobacion cuando en realidad hay un problema tecnico.

## Artefactos a crear o actualizar

- `.gridwork/schemas/run.schema.json`
- `.gridwork/schemas/event.schema.json`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/templates/agent-log.md`
- `.gridwork/templates/handoff.md`

## Evidencia y notas

- Esta pregunta convierte trazabilidad en control operativo.
- La propuesta mantiene una base comun para todos los workflows sin bloquear detalles especificos en eventos o campos auxiliares.
- Decision del usuario: usar maquina de estados simple y comun para todos los workflows.
