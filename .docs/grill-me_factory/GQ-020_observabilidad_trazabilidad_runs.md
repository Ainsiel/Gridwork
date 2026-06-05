# GQ-020 - Observabilidad, trazabilidad, logs y runs

- Estado: accepted
- Fuente: requisito inicial del usuario sobre trazabilidad, monitoreo, metricas y logs
- Pregunta origen: GQ-020
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/`, `.gridwork/policies/traceability.md`, `.gridwork/schemas/`

## Pregunta

Como debe Gridwork registrar trazabilidad, monitoreo, metricas y logs de agentes sin depender de herramientas externas complejas?

## Por que importa

La fabrica necesita ser auditable. Si un agente toma una decision, usa una skill, modifica archivos, consulta GitHub, ejecuta tests o pide aprobacion humana, debe quedar evidencia.

Pero el usuario no quiere monitoreo complejo ni dependencias externas. Por eso el modelo debe ser simple, file-based y facil de inspeccionar por humanos y agentes.

## Respuesta recomendada

Usar observabilidad basada en archivos locales dentro de `.factory/`.

La carpeta `.factory/` queda como runtime local ignorado por Git. Cada corrida de Gridwork crea un run con ID propio:

```text
.factory/
  runs/
    RUN-20260602-001/
      run.json
      summary.md
      events.jsonl
      decisions.md
      approvals.md
      metrics.json
      errors.md
      handoff.md
      agent-logs/
        orchestrator.jsonl
        implementer-agent.jsonl
        verifier-agent.jsonl
      tool-calls/
        gh.jsonl
        shell.jsonl
      artifacts/
        test-report.md
        verification-report.md
  indexes/
    runs.jsonl
    issues.jsonl
    decisions.jsonl
  cache/
    bundles/
```

## Formatos recomendados

```text
JSON = estado actual, manifests, metricas agregadas.
JSONL = eventos append-only, logs de agente, tool calls.
Markdown = resumen humano, decisiones, aprobaciones, handoff y reportes.
```

## IDs recomendados

```text
RUN-YYYYMMDD-NNN
STEP-<workflow-step-id>
AGENT-<agent-id>
DEC-YYYYMMDD-NNN
APPROVAL-YYYYMMDD-NNN
ART-YYYYMMDD-NNN
ERR-YYYYMMDD-NNN
```

## Datos minimos de `run.json`

```json
{
  "runId": "RUN-20260602-001",
  "status": "running",
  "createdAt": "2026-06-02T00:00:00Z",
  "workflow": "tdd-implementation",
  "mode": "afk",
  "userRequest": "Implement issue #12",
  "source": {
    "issue": 12,
    "repository": "owner/repo",
    "branch": "feature/issue-12"
  },
  "agents": ["orchestrator", "implementer-agent"],
  "skills": ["github-issue-discovery", "tdd", "handoff"],
  "pathScopes": ["frontend_code", "backend_code"],
  "humanGates": ["external_side_effects", "dependency_changes"],
  "artifacts": [],
  "metrics": {
    "stepsTotal": 0,
    "stepsCompleted": 0,
    "toolCalls": 0,
    "testsRun": 0,
    "approvalsRequested": 0
  }
}
```

## Eventos minimos de `events.jsonl`

Cada linea es un evento:

```json
{"type":"run_started","runId":"RUN-20260602-001","at":"2026-06-02T00:00:00Z","agent":"orchestrator"}
{"type":"workflow_selected","runId":"RUN-20260602-001","workflow":"tdd-implementation","reason":"User requested issue implementation"}
{"type":"skill_used","runId":"RUN-20260602-001","agent":"implementer-agent","skill":"tdd"}
{"type":"approval_requested","runId":"RUN-20260602-001","approvalId":"APPROVAL-20260602-001","reason":"gh issue edit has external side effect"}
```

## Metricas simples recomendadas

No hace falta dashboard en v1. Bastan metricas por run:

- duracion estimada o real;
- cantidad de pasos completados;
- cantidad de tool calls;
- skills usadas;
- aprobaciones solicitadas;
- errores;
- tests ejecutados;
- tests pasando/fallando;
- archivos modificados;
- cantidad de findings del verifier;
- resultado final: `completed`, `blocked`, `failed`, `needs-human`.

## Regla de versionado para v1

```text
.factory/ es runtime local y normalmente va en .gitignore.
En v1, los logs, metricas, runs, reportes operativos y artefactos de ejecucion quedan solo en .factory/.
No se generan reportes versionados automaticamente en docs/.
Esta regla aplica a observabilidad operativa, no a especificaciones aprobadas del producto.
```

Ejemplo:

```text
.factory/runs/RUN-.../summary.md          local, no versionado
.factory/runs/RUN-.../metrics.json        local, no versionado
.factory/runs/RUN-.../events.jsonl        local, no versionado
docs/sdd/SDD.md                           versionado, si fue aprobado como especificacion
```

## Pregunta para decidir

Mi recomendacion es aceptar este modelo:

```text
observability_model = local_file_based
runtime_trace_path = .factory/runs/
event_log_format = jsonl
state_format = json
human_report_format = markdown
factory_runtime_gitignored = true
versioned_reports_v1 = false
```

La duda importante:

```text
Aceptado por el usuario: en v1, de momento solo `.factory/`.
```

## Respuesta del usuario

El usuario acepta el modelo local y decide:

- En v1, toda la observabilidad operativa queda solo en `.factory/`.
- No se generan reportes versionados automaticos en `docs/`.
- Runs, logs, metricas, eventos, decisiones, aprobaciones y artefactos de ejecucion son runtime local.
- Documentos aprobados de producto, como SDD o arquitectura, pueden versionarse porque no son observabilidad operativa.

## Decision registrada

```text
observability_model = local_file_based
runtime_trace_path = .factory/runs/
event_log_format = jsonl
state_format = json
human_report_format = markdown
factory_runtime_gitignored = true
versioned_reports_v1 = false
runtime_artifacts_v1_path = .factory/
runtime_cache_path = .factory/cache/
approved_product_specs_can_be_versioned = true
```

## Supuestos

- `.factory/` ya fue aceptada como runtime local.
- El usuario quiere monitoreo simple, no Prometheus/Grafana ni servicios externos.
- Los agentes deben poder leer logs anteriores si el usuario lo permite.
- No se deben guardar secretos en logs.

## Riesgos

- Si se registra demasiado, los logs se vuelven ruido.
- Si se registra poco, no hay auditoria real.
- Si `.factory/` se versiona por error, puede contaminar el repo.
- Si los logs incluyen secretos, se rompe la politica de seguridad.

## Artefactos a crear o actualizar

- `.gridwork/policies/traceability.md`
- `.gridwork/policies/logging-policy.md`
- `.gridwork/schemas/run.schema.json`
- `.gridwork/schemas/event.schema.json`
- `.gridwork/schemas/metric.schema.json`
- `.factory/runs/`
- `.factory/indexes/`
- `docs/OBSERVABILITY_MODEL.md`

## Evidencia y notas

- Esta pregunta cubre el requisito inicial de trazabilidad, monitoreo, metricas y logs de agentes.
- Se mantiene alineada con la decision de no usar dependencias externas complejas.
- Revision del usuario: v1 no genera reportes versionados automaticos; todo queda de momento en `.factory/`.
- Aclaracion posterior: la regla aplica a runtime/logs; especificaciones aprobadas como SDD pueden vivir versionadas en `docs/`.
- Revision posterior GQ-084: cache local verificada vive en `.factory/cache/` y no se versiona.
