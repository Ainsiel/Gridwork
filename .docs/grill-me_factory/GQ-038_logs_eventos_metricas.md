# GQ-038 - Formato de logs, eventos y metricas de agentes

- Estado: accepted
- Fuente: decisiones GQ-020, GQ-021, GQ-032, GQ-033, GQ-035 y GQ-037
- Pregunta origen: GQ-038
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/<run-id>/`, `.gridwork/schemas/`, `.gridwork/policies/logging-policy.md`, `.gridwork/policies/traceability.md`

## Pregunta

Que formato deben tener los logs, eventos y metricas de los agentes en Gridwork v1?

## Por que importa

Ya se decidio que la observabilidad sera local y simple, usando archivos en `.factory/`. Ahora falta decidir la forma concreta para que sea util:

- suficientemente estructurada para auditar agentes;
- suficientemente simple para leerla sin herramientas externas;
- compatible con agentes distintos;
- segura para no registrar secretos;
- facil de versionar como plantilla, pero sin versionar el runtime.

## Respuesta recomendada

Usar un modelo hibrido:

```text
JSON/JSONL para eventos, metricas y estado
Markdown para resumen humano y reportes
```

La idea es que los agentes puedan escribir trazas estructuradas, pero que el usuario tambien pueda leer rapidamente que paso.

## Layout recomendado por run

```text
.factory/runs/<run-id>/
  run.json
  timeline.jsonl
  metrics.json
  approvals.jsonl
  tool-calls.jsonl
  agent-log.md
  handoff.md                  # solo si hubo transferencia
  artifacts/
  handoffs/                   # solo si hubo multiples transferencias
```

## Archivo `run.json`

Contiene el estado principal del run:

```text
run_id
workflow_id
status
created_at
updated_at
started_by
active_agent
participating_agents
github_issue_refs
github_pr_refs
work_order_refs
artifact_refs
current_gate
final_result
```

Debe ser facil de leer y actualizar. No debe contener logs largos.

## Archivo `timeline.jsonl`

Contiene eventos append-only. Cada linea es un JSON independiente.

Eventos recomendados:

```text
run.started
workflow.selected
agent.assigned
skill.used
work_order.created
tool.requested
tool.executed
approval.requested
approval.granted
approval.denied
test.started
test.failed
test.passed
tdd.red_recorded
tdd.green_recorded
tdd.refactor_recorded
handoff.created
verification.started
verification.completed
run.blocked
run.completed
```

Este archivo permite reconstruir que paso sin leer todos los reportes.

## Archivo `metrics.json`

Contiene contadores simples, no analitica compleja:

```text
duration_ms
agent_count
skill_count
tool_call_count
approval_count
blocked_count
test_command_count
tests_passed_count
tests_failed_count
files_created_count
files_modified_count
files_deleted_count
```

En v1 no hace falta dashboard. Basta con poder inspeccionarlo localmente.

## Archivo `tool-calls.jsonl`

Registra herramientas usadas por agentes:

```text
timestamp
agent_id
tool
command_or_action
risk_level
approval_required
approval_id
status
summary
output_ref
```

No debe guardar salidas completas si contienen ruido o datos sensibles. Debe referenciar artefactos cuando sea necesario.

## Archivo `approvals.jsonl`

Registra human gates:

```text
timestamp
approval_id
agent_id
workflow_id
request
risk_level
decision
decided_by
decision_notes
```

Esto ayuda a saber cuando un agente se detuvo y que autorizo el usuario.

## Archivo `agent-log.md`

Resumen humano del run:

```text
# Agent Log

## Contexto
## Acciones relevantes
## Decisiones
## Bloqueos
## Evidencia
## Siguiente paso
```

Este archivo no reemplaza `timeline.jsonl`. Es el resumen legible.

## Seguridad y privacidad

Los logs no deben incluir:

- tokens;
- secretos;
- passwords;
- headers sensibles;
- variables de entorno completas;
- dumps de configuracion privada;
- outputs extensos sin filtrar.

Si un comando produce salida sensible, el agente debe resumirla y marcar:

```text
output_redacted = true
```

## Propuesta inicial

```text
observability_runtime_path = .factory/runs/<run-id>/
run_state_file = run.json
event_timeline_file = timeline.jsonl
metrics_file = metrics.json
approvals_file = approvals.jsonl
tool_calls_file = tool-calls.jsonl
human_summary_file = agent-log.md
event_format = jsonl_append_only
metrics_format = json
human_log_format = markdown
logs_store_full_command_output_by_default = false
logs_allow_sensitive_data = false
dashboard_required_v1 = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres un modelo hibrido JSONL/JSON/Markdown,
o prefieres que todo sea Markdown para mantenerlo mas simple?
```

Mi recomendacion: modelo hibrido. Markdown es comodo para leer, pero JSONL/JSON permite trazabilidad real sin meter una base de datos ni dependencias externas.

## Respuesta del usuario

El usuario decide usar el modelo hibrido:

```text
JSON/JSONL para trazabilidad estructurada
Markdown para resumen humano y reportes
```

## Decision registrada

```text
observability_runtime_path = .factory/runs/<run-id>/
run_state_file = run.json
event_timeline_file = timeline.jsonl
metrics_file = metrics.json
approvals_file = approvals.jsonl
tool_calls_file = tool-calls.jsonl
human_summary_file = agent-log.md
event_format = jsonl_append_only
metrics_format = json
human_log_format = markdown
logs_store_full_command_output_by_default = false
logs_allow_sensitive_data = false
dashboard_required_v1 = false
observability_model = hybrid_jsonl_json_markdown
```

## Regla

```text
JSONL registra lo que paso.
JSON registra estado y metricas.
Markdown explica el contexto humano.
```

## Supuestos

- `.factory/` no se versiona.
- La observabilidad v1 no usa servicios externos.
- Los agentes pueden escribir archivos locales.
- La trazabilidad debe funcionar aunque el agente sea distinto.
- No existe dashboard en v1.

## Riesgos

- Solo Markdown puede ser facil de leer, pero dificil de auditar.
- Solo JSON puede ser auditable, pero incomodo para el usuario.
- Logs demasiado detallados pueden filtrar informacion sensible.
- Logs demasiado pobres no sirven para revisar una decision de agente.

## Artefactos a crear o actualizar

- `.gridwork/schemas/run.schema.json`
- `.gridwork/schemas/event.schema.json`
- `.gridwork/schemas/metric.schema.json`
- `.gridwork/schemas/approval.schema.json`
- `.gridwork/schemas/tool-call.schema.json`
- `.gridwork/templates/agent-log.md`
- `.gridwork/policies/logging-policy.md`
- `.gridwork/policies/traceability.md`

## Evidencia y notas

- Esta pregunta baja GQ-020 a un contrato operativo concreto.
- La propuesta mantiene la observabilidad simple, local y sin dependencias externas.
- Decision del usuario: usar modelo hibrido.
