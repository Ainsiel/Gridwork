# GQ-039 - IDs, correlacion y trazabilidad entre runs, work orders y artefactos

- Estado: accepted
- Fuente: decisiones GQ-020, GQ-021, GQ-024, GQ-032, GQ-037 y GQ-038
- Pregunta origen: GQ-039
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/`, `.gridwork/schemas/run.schema.json`, `.gridwork/schemas/work-order.schema.json`, `.gridwork/policies/traceability.md`

## Pregunta

Como se deben nombrar y correlacionar los `runs`, `work orders`, artefactos, issues y PRs para que Gridwork tenga trazabilidad clara?

## Por que importa

Ya se decidio que Gridwork usara observabilidad local con JSONL/JSON/Markdown. Para que eso sea util, cada agente necesita poder responder:

- de que run viene este archivo;
- que work order estaba ejecutando;
- que issue de GitHub lo origino;
- que PR lo contiene;
- que agente lo produjo;
- que workflow estaba activo;
- que evidencias estan relacionadas.

Si los IDs son ambiguos, los logs existen pero no cuentan una historia coherente.

## Respuesta recomendada

Usar IDs legibles, estables y con prefijo semantico:

```text
run_YYYYMMDD_HHMMSS_<short-topic>
wo_<run-short-id>_<sequence>
artifact_<type>_<sequence>
approval_<run-short-id>_<sequence>
handoff_<source>_to_<target>_<sequence>
```

Ejemplo:

```text
run_20260603_153012_checkout-bug
wo_153012_001
artifact_diagnosis_001
approval_153012_001
handoff_implementer-to-verifier_001
```

## Correlacion recomendada

Cada archivo estructurado debe incluir los campos minimos de correlacion:

```text
run_id
workflow_id
agent_id
skill_ids
work_order_id
github_issue_refs
github_pr_refs
artifact_refs
created_at
updated_at
```

No todos los campos seran obligatorios en todos los contextos, pero `run_id`, `workflow_id` y `agent_id` deben estar presentes en eventos producidos por agentes.

## Estructura de carpetas recomendada

```text
.factory/runs/
  run_20260603_153012_checkout-bug/
    run.json
    timeline.jsonl
    metrics.json
    approvals.jsonl
    tool-calls.jsonl
    agent-log.md
    work-orders/
      wo_153012_001.md
      wo_153012_002.md
    artifacts/
      diagnose/
        artifact_diagnosis_001.md
      tdd/
        artifact_tdd-evidence_001.md
      verification/
        artifact_verification-report_001.md
    handoffs/
      handoff_implementer-to-verifier_001.md
```

## Relacion con GitHub

Las issues y PRs no deben reemplazar los IDs locales. Deben ser referencias externas.

Ejemplo:

```text
github_issue_refs = ["#42"]
github_pr_refs = ["#51"]
```

Si una issue de GitHub se crea desde Gridwork, debe incluir una referencia local:

```text
gridwork_run_id: run_20260603_153012_checkout-bug
gridwork_work_order_id: wo_153012_001
```

Esto permite conectar el backlog remoto con la trazabilidad local.

## Slugs

El `<short-topic>` del `run_id` debe ser:

- corto;
- kebab-case;
- sin datos sensibles;
- derivado del objetivo del usuario o de la issue;
- estable durante el run.

Ejemplos:

```text
checkout-bug
create-auth-sdd
architecture-billing
issue-42-profile-page
```

## Propuesta inicial

```text
run_id_format = run_YYYYMMDD_HHMMSS_<short-topic>
work_order_id_format = wo_<run-short-id>_<sequence>
artifact_id_format = artifact_<type>_<sequence>
approval_id_format = approval_<run-short-id>_<sequence>
handoff_id_format = handoff_<source>_to_<target>_<sequence>
ids_are_human_readable = true
ids_include_sensitive_data = false
github_refs_are_external_refs = true
github_issues_include_gridwork_refs_when_created_by_gridwork = true
events_require_run_id_workflow_id_agent_id = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres IDs legibles con fecha y slug,
o IDs mas cortos/aleatorios tipo UUID?
```

Mi recomendacion: IDs legibles con fecha, hora y slug corto. Para una fabrica personal son mas faciles de leer, buscar y depurar. UUID puede quedar como alternativa futura si aparece concurrencia fuerte o integraciones externas mas complejas.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar IDs legibles con fecha, hora y slug corto
```

## Decision registrada

```text
run_id_format = run_YYYYMMDD_HHMMSS_<short-topic>
work_order_id_format = wo_<run-short-id>_<sequence>
artifact_id_format = artifact_<type>_<sequence>
approval_id_format = approval_<run-short-id>_<sequence>
handoff_id_format = handoff_<source>_to_<target>_<sequence>
ids_are_human_readable = true
ids_include_sensitive_data = false
github_refs_are_external_refs = true
github_issues_include_gridwork_refs_when_created_by_gridwork = true
events_require_run_id_workflow_id_agent_id = true
uuid_ids_required_v1 = false
```

## Regla

```text
Los IDs deben ayudar a leer la historia del trabajo.
Los IDs no deben incluir informacion sensible.
GitHub referencia a Gridwork, pero no reemplaza la trazabilidad local.
```

## Supuestos

- Gridwork v1 es una fabrica personal.
- `.factory/` no se versiona.
- Los agentes pueden crear carpetas locales por run.
- GitHub issues/PRs son referencias externas, no la fuente unica de trazabilidad.
- No hay base de datos de observabilidad en v1.

## Riesgos

- IDs demasiado humanos pueden colisionar si se crean muchos runs a la vez.
- IDs puramente aleatorios son dificiles de leer en una sesion de chat.
- Incluir slugs con datos sensibles puede filtrar informacion.
- Si GitHub se vuelve la unica referencia, se pierde trazabilidad local cuando no hay conexion o no existe repo remoto.

## Artefactos a crear o actualizar

- `.gridwork/policies/traceability.md`
- `.gridwork/schemas/run.schema.json`
- `.gridwork/schemas/work-order.schema.json`
- `.gridwork/schemas/event.schema.json`
- `.gridwork/templates/work-order.md`
- `.gridwork/templates/github-issue.md`
- `.gridwork/templates/handoff.md`

## Evidencia y notas

- Esta pregunta hace que el modelo hibrido de observabilidad sea correlacionable.
- La propuesta prioriza legibilidad humana porque Gridwork v1 se opera por chat y archivos locales.
- Decision del usuario: usar IDs legibles con fecha, hora y slug corto.
