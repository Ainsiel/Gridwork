# GQ-037 - Alcance y formato de la skill `handoff`

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-020, GQ-021, GQ-032, GQ-033 y GQ-036
- Pregunta origen: GQ-037
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/handoff/`, `.gridwork/templates/handoff.md`, `.factory/runs/<run-id>/handoff.md`

## Pregunta

Que debe contener la skill `handoff` y cuando debe ser obligatoria?

## Por que importa

Gridwork sera usado por chat, prompts Markdown y agentes que pueden trabajar AFK. Eso significa que el contexto se puede perder entre sesiones, agentes, revisiones o compactaciones.

`handoff` es la skill que evita que cada agente tenga que redescubrir el estado del trabajo. Debe resumir lo importante sin duplicar todos los logs.

## Respuesta recomendada

Hacer que `handoff` sea obligatorio cuando hay transferencia:

```text
cuando hay transferencia entre agentes
cuando hay transferencia entre sesiones
```

No debe generarse en cada mini-paso ni por defecto al final de todo workflow, porque eso crea ruido. Debe aparecer cuando cambia la responsabilidad o cuando el trabajo queda en un punto que alguien mas puede continuar en otra sesion.

## Casos obligatorios

### Transferencia entre agentes

Ejemplos:

- `planner-agent` entrega issues/work orders al `implementer-agent`;
- `implementer-agent` entrega evidencia al `verifier-agent`;
- `verifier-agent` devuelve findings al `implementer-agent`;
- `orchestrator` transfiere un trabajo desde discovery hacia arquitectura.

### Transferencia entre sesiones

Cuando una sesion termina y el trabajo debe continuar despues, el handoff debe dejar:

- que se hizo;
- que quedo pendiente;
- que artefactos existen;
- que decision humana falta, si aplica;
- cual seria el siguiente paso.

### Antes de verificacion

Antes de que `verifier-agent` revise una PR o una implementacion, el implementer debe entregar un handoff. Asi el verifier no depende solo de la issue o de los commits.

## Contenido recomendado

El archivo `.factory/runs/<run-id>/handoff.md` debe contener:

```text
run_id
workflow_id
status
source_agent
target_agent
user_request_summary
current_decision
work_order_refs
github_issue_refs
github_pr_refs
files_created
files_modified
files_deleted
artifacts
commands_executed_summary
tests_executed_summary
tdd_evidence_refs
verification_refs
architecture_refs
sdd_refs
decisions_made
human_gates_triggered
risks
blocked_items
next_steps
```

## Ubicacion recomendada

```text
.factory/runs/<run-id>/handoff.md
```

Si existen multiples transferencias dentro de un mismo run, se pueden crear handoffs especificos:

```text
.factory/runs/<run-id>/handoffs/
  001-planner-to-implementer.md
  002-implementer-to-verifier.md
  003-verifier-to-implementer.md
```

El archivo raiz `handoff.md` puede quedar como el ultimo resumen vigente del run.

## Seguridad

`handoff` no debe incluir:

- secretos;
- tokens;
- logs completos;
- dumps extensos de consola;
- datos sensibles del usuario;
- contenido que no sea necesario para continuar el trabajo.

Debe enlazar o resumir artefactos, no duplicarlos.

## Propuesta inicial

```text
handoff_required_for_agent_transfer = true
handoff_required_at_run_end = true
handoff_required_before_verification = true
handoff_required_for_every_step = false
handoff_path = .factory/runs/<run-id>/handoff.md
handoff_transfer_path = .factory/runs/<run-id>/handoffs/<sequence>-<source>-to-<target>.md
handoff_contains_sensitive_data = false
handoff_summarizes_not_duplicates_logs = true
handoff_skill_outputs_markdown = true
handoff_template_path = .gridwork/templates/handoff.md
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `handoff` sea obligatorio al final de todo workflow,
o solo cuando hay transferencia de agente/sesion?
```

Mi recomendacion: obligatorio en transferencias, antes de verificacion y al cierre del run. No obligatorio en cada paso interno.

## Respuesta del usuario

El usuario decide:

```text
solo cuando hay transferencia de agente/sesion
```

Esto significa que `handoff` no debe ser obligatorio por el simple hecho de terminar un workflow. Solo se exige cuando el contexto debe pasar a otro agente o a otra sesion.

## Decision registrada

```text
handoff_required_for_agent_transfer = true
handoff_required_for_session_transfer = true
handoff_required_at_run_end = false
handoff_required_before_verification = true
handoff_required_for_every_step = false
handoff_path = .factory/runs/<run-id>/handoff.md
handoff_transfer_path = .factory/runs/<run-id>/handoffs/<sequence>-<source>-to-<target>.md
handoff_contains_sensitive_data = false
handoff_summarizes_not_duplicates_logs = true
handoff_skill_outputs_markdown = true
handoff_template_path = .gridwork/templates/handoff.md
```

## Regla

```text
handoff aparece cuando alguien mas debe continuar.
handoff no aparece por rutina en cada cierre de workflow.
```

## Supuestos

- `.factory/` es runtime local y no se versiona.
- Los agentes AFK necesitan mas trazabilidad que los agentes interactivos.
- El handoff no reemplaza logs, metricas ni reportes; los conecta.
- La fabrica v1 usa prompts Markdown, no un runner automatico.

## Riesgos

- Si `handoff` no se exige en transferencias, se puede perder contexto entre agentes.
- Si `handoff` se genera en cada paso, se vuelve ruido operativo.
- Si el handoff copia logs completos, puede filtrar informacion sensible.
- Si el handoff no referencia issues, PRs o artefactos, pierde utilidad.

## Artefactos a crear o actualizar

- `.gridwork/skills/handoff/SKILL.md`
- `.gridwork/skills/handoff/skill.json`
- `.gridwork/templates/handoff.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/policies/traceability.md`

## Evidencia y notas

- Esta pregunta conecta observabilidad local, delegacion AFK y revision de PRs.
- La prioridad es continuidad operativa sin convertir cada paso en burocracia.
- Decision del usuario: handoff obligatorio solo cuando hay transferencia de agente o sesion.
