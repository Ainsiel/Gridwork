# GQ-042 - Politica de routing del orquestador

- Estado: accepted
- Fuente: decisiones GQ-004, GQ-010, GQ-011, GQ-013, GQ-018, GQ-019, GQ-021, GQ-022, GQ-040 y GQ-041
- Pregunta origen: GQ-042
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/orchestrator/`, `.gridwork/policies/workflow-policy.md`, `.gridwork/workflows/`, `.factory/runs/<run-id>/run.json`

## Pregunta

Como debe decidir el orquestador que workflow activar, que agente usar y cuando pedir aclaracion al usuario?

## Por que importa

Gridwork v1 no tendra `gridwork run`. El usuario activara el sistema leyendo el prompt del orquestador. Eso hace que el orquestador sea la pieza que:

- interpreta la solicitud inicial;
- crea o reutiliza un run;
- elige workflow;
- decide si el trabajo es interactivo o AFK;
- asigna agente;
- exige work order cuando corresponde;
- aplica human gates;
- mantiene trazabilidad local.

Si el orquestador decide solo por intuicion, la fabrica puede volverse impredecible. Si decide con reglas demasiado rigidas, puede bloquear casos reales.

## Respuesta recomendada

Usar una politica de routing semi-deterministica:

```text
decision_matrix + confidence_score + ask_user_when_unclear
```

El orquestador debe tener una matriz de decision versionada, pero puede razonar con contexto. Si la solicitud no encaja con confianza suficiente, pregunta al usuario antes de activar un workflow.

## Entradas del routing

El orquestador debe evaluar:

```text
user_intent
repo_has_existing_code
github_issue_ref
github_pr_ref
sdd_ref
architecture_ref
requested_mode
requires_afk_agent
requires_code_changes
requires_github_write
requires_architecture_decision
requires_requirements_discovery
```

## Workflows posibles

### `ideation-from-zero`

Usar cuando:

- el usuario quiere idear un proyecto desde cero;
- no hay SDD aprobado;
- la solicitud es amplia o ambigua;
- se necesita grill-me de producto/requisitos.

Agente principal:

```text
intake-agent
```

Skills tipicas:

```text
sdd-requirements
handoff
```

### `intake-existing-code`

Usar cuando:

- hay codigo existente;
- el usuario reporta bug, mejora o feature;
- aun no hay suficiente claridad para backlog o implementacion;
- se necesita diagnostico o refinamiento.

Agente principal:

```text
intake-agent
```

Skills tipicas:

```text
diagnose-bug
sdd-requirements
handoff
```

### `architecture-ddd`

Usar cuando:

- existe SDD o requisitos suficientemente claros;
- se necesita disenar arquitectura;
- se deben definir bounded contexts, agregados, APIs, base de datos o ADRs;
- se necesita grill-me de arquitectura.

Agente principal:

```text
software-architect
```

Skills tipicas:

```text
html-architecture-diagrams
backlog-planning
handoff
```

### `tdd-implementation`

Usar cuando:

- existe issue o work order claro;
- hay criterios de aceptacion;
- se requieren cambios de codigo;
- el trabajo puede delegarse a implementer-agent.

Agente principal:

```text
implementer-agent
```

Requisito:

```text
work_order_required = true
```

Skills tipicas:

```text
tdd
diagnose-bug
handoff
```

### `verification-pr`

Usar cuando:

- existe PR o cambios implementados;
- se debe revisar evidencia, tests y cumplimiento de criterios;
- se debe producir reporte local;
- opcionalmente se comenta la PR con approval.

Agente principal:

```text
verifier-agent
```

Skills tipicas:

```text
diagnose-bug
handoff
```

## Matriz de decision inicial

```text
idea_desde_cero + sin_sdd -> ideation-from-zero
codigo_existente + requerimiento_ambiguo -> intake-existing-code
sdd_existente + diseno_sistema -> architecture-ddd
issue_clara + requiere_codigo -> tdd-implementation
pr_existente + requiere_revision -> verification-pr
bug_reportado + sin_issue_clara -> intake-existing-code
bug_reportado + issue_clara + criterios -> tdd-implementation
arquitectura_pedida + sin_sdd -> ideation-from-zero primero
backlog_pedido + arquitectura_aprobada -> usar skill backlog-planning
github_issue_creation_requested -> usar skill github-issue-publisher con approval gate
```

## Confianza del routing

El orquestador debe estimar:

```text
routing_confidence = high | medium | low
```

Reglas recomendadas:

- `high`: activar workflow y explicar brevemente por que.
- `medium`: proponer workflow y pedir confirmacion si implica AFK, GitHub write o cambios de codigo.
- `low`: hacer preguntas de aclaracion antes de crear work order o delegar.

## Preguntas de aclaracion

El orquestador debe preguntar cuando falte:

- si el trabajo es para proyecto nuevo o codigo existente;
- si hay SDD, arquitectura, issue o PR;
- si el usuario quiere modo interactivo o AFK;
- que carpetas o dominios estan permitidos;
- que stack real usa el repo si no es evidente;
- si se permite crear issues o comentar PRs con `gh`.

## Reglas de delegacion

El orquestador puede delegar a un agente AFK solo si existe:

```text
workflow seleccionado
target_agent definido
work_order valido
path_scopes definidos
human_gates definidos
trazabilidad inicial creada
```

Si falta cualquiera de esos elementos, debe mantenerse interactivo y pedir aclaracion.

## Propuesta inicial

```text
orchestrator_routing_model = decision_matrix_with_confidence
orchestrator_may_reason_with_context = true
orchestrator_asks_when_confidence_low = true
orchestrator_requires_confirmation_for_medium_risk = true
orchestrator_can_create_run = true
orchestrator_can_select_workflow = true
orchestrator_can_delegate_afk_only_with_work_order = true
orchestrator_can_bypass_work_order_for_afk = false
orchestrator_default_mode = interactive
orchestrator_records_routing_decision = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el orquestador use una matriz de decision semi-deterministica,
o prefieres que decida libremente segun el contexto del chat?
```

Mi recomendacion: matriz semi-deterministica con confidence score. Le da estructura a la fabrica, pero mantiene flexibilidad para casos ambiguos.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar matriz semi-deterministica con confidence score
```

## Decision registrada

```text
orchestrator_routing_model = decision_matrix_with_confidence
orchestrator_may_reason_with_context = true
orchestrator_asks_when_confidence_low = true
orchestrator_requires_confirmation_for_medium_risk = true
orchestrator_can_create_run = true
orchestrator_can_select_workflow = true
orchestrator_can_delegate_afk_only_with_work_order = true
orchestrator_can_bypass_work_order_for_afk = false
orchestrator_default_mode = interactive
orchestrator_records_routing_decision = true
```

## Regla

```text
El orquestador decide con una matriz versionada.
El orquestador puede razonar con contexto.
Si la confianza es baja, pregunta.
Si el riesgo es medio o alto, confirma antes de actuar.
```

## Supuestos

- El orquestador se activa con `.gridwork/agents/orchestrator/PROMPT.md`.
- No existe `gridwork run` en v1.
- Los agentes AFK requieren work order.
- El usuario puede interactuar con el orquestador por chat.
- GitHub writes siempre requieren approval gate.

## Riesgos

- Routing demasiado libre puede producir flujos inconsistentes.
- Routing demasiado rigido puede frustrar solicitudes reales.
- Si no hay confidence score, el orquestador puede parecer seguro cuando no lo esta.
- Si no se registra la decision de routing, luego es dificil auditar por que se activo cierto workflow.

## Artefactos a crear o actualizar

- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/templates/work-order.md`
- `.gridwork/schemas/run.schema.json`

## Evidencia y notas

- Esta pregunta define el cerebro operativo de Gridwork v1.
- La recomendacion evita que el orquestador sea una caja negra sin convertirlo en un router inflexible.
- Decision del usuario: usar matriz semi-deterministica con confidence score.
