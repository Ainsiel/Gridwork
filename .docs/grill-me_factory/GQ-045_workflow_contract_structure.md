# GQ-045 - Contrato estandar de workflows (`WORKFLOW.md`)

- Estado: accepted
- Fuente: decisiones GQ-010, GQ-011, GQ-019, GQ-022, GQ-040, GQ-041, GQ-042, GQ-043 y GQ-044
- Pregunta origen: GQ-045
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/*/WORKFLOW.md`, `.gridwork/workflows/*/workflow.json`, `.gridwork/templates/workflow-contract.md`

## Pregunta

Que estructura estandar debe tener el contrato de cada workflow en `WORKFLOW.md`?

## Por que importa

Ya se decidio que:

- `PROMPT.md` activa;
- `AGENT.md` contrata agentes;
- `SKILL.md` capacita;
- `WORKFLOW.md` define procesos.

Entonces `WORKFLOW.md` debe ser el playbook operativo de cada flujo. Debe explicar como se pasa de un estado inicial a un resultado verificable, sin mezclar responsabilidades de agentes ni detalles internos de skills.

Sin una estructura comun, cada workflow podria tener pasos, gates y outputs escritos de forma distinta, lo que haria mas dificil auditar la fabrica.

## Respuesta recomendada

Usar una plantilla estandar comun para todos los workflows:

```text
workflow.json = metadata estructurada
WORKFLOW.md = playbook operativo
```

La plantilla debe permitir pasos especificos por workflow, pero mantener secciones comunes para trazabilidad, gates, inputs, outputs y agentes participantes.

## Relacion entre `workflow.json` y `WORKFLOW.md`

`workflow.json` debe contener:

```text
workflow_id
name
version
description
mode
primary_agent
participating_agents
allowed_skills
required_inputs
produced_outputs
artifact_paths
human_gates
github_capabilities
requires_work_order
```

`WORKFLOW.md` debe contener:

```text
proposito
cuando usar
cuando no usar
precondiciones
entradas
agentes participantes
skills usadas
fases
gates
artefactos
criterios de finalizacion
trazabilidad
handoff
fallos y bloqueos
```

## Secciones recomendadas para `WORKFLOW.md`

### Proposito

Explica que transforma el workflow.

Ejemplo:

```text
`architecture-ddd` transforma un SDD aprobado en documentos de arquitectura DDD, ADRs, diseno de APIs, modelo de datos y backlog planificable.
```

### Cuando usar

Define condiciones de activacion.

Ejemplo:

```text
Usar `tdd-implementation` cuando exista un work order AFK con criterios de aceptacion claros y path scopes definidos.
```

### Cuando no usar

Define limites del workflow.

Ejemplo:

```text
No usar `tdd-implementation` para descubrir requisitos ambiguos.
No usar `verification-pr` para implementar correcciones directamente.
```

### Precondiciones

Lista lo que debe existir antes de iniciar.

Ejemplos:

```text
run_id
workflow_id
active_agent
input_docs
path_scopes
human_gates
github_refs
work_order_id
```

No todas aplican a todos los workflows, pero cada workflow debe declarar sus precondiciones.

### Agentes participantes

Define agente principal y agentes secundarios.

Ejemplo:

```text
primary_agent = software-architect
supporting_agents = planner-agent
```

### Skills usadas

Lista skills permitidas en el workflow.

Ejemplo:

```text
allowed_skills:
  - html-architecture-diagrams
  - backlog-planning
  - handoff
```

### Fases

Cada workflow debe describir sus fases.

Ejemplo para `architecture-ddd`:

```text
1. Leer SDD y restricciones.
2. Ejecutar grill-me de arquitectura.
3. Definir dominios y bounded contexts.
4. Disenar APIs, persistencia e integraciones.
5. Crear ADRs.
6. Generar diagramas HTML si aplica.
7. Preparar insumos para backlog-planning.
```

### Human gates

Cada workflow debe declarar donde se detiene.

Ejemplos:

- decision arquitectonica irreversible;
- escritura en GitHub;
- cambio de dependencias;
- comando fuera de allowlist;
- scope insuficiente;
- falta de criterios de aceptacion;
- cambio fuera del SDD aprobado.

### Artefactos

Debe listar archivos que produce.

Ejemplos:

```text
.factory/runs/<run-id>/artifacts/
docs/sdd/
docs/architecture/
docs/adr/
.factory/runs/<run-id>/work-orders/
```

La regla de versionado depende de cada artefacto:

- drafts y runtime en `.factory/`;
- documentos aprobados versionables en `docs/`;
- configuracion de fabrica en `.gridwork/`.

### Criterios de finalizacion

Define que significa terminar.

Ejemplo:

```text
El workflow termina cuando todos los artefactos requeridos existen,
los gates pendientes estan resueltos,
la decision final esta registrada
y el run queda en estado compatible con el siguiente paso.
```

### Trazabilidad

Cada workflow debe registrar:

```text
workflow.selected
workflow.started
workflow.phase_started
workflow.phase_completed
workflow.completed
workflow.blocked
```

Tambien debe actualizar `run.json`, `timeline.jsonl`, `metrics.json` y `agent-log.md` cuando aplique.

### Handoff

Debe alinearse con GQ-037:

```text
handoff solo obligatorio cuando hay transferencia de agente o sesion
```

Si el workflow transfiere responsabilidad, debe producir handoff.

### Fallos y bloqueos

Debe explicar que hacer si no puede continuar:

```text
status = blocked
blocked_reason = <reason>
next_action = <user_or_agent_action>
```

## Workflows base que usan esta plantilla

```text
intake-existing-code
ideation-from-zero
architecture-ddd
tdd-implementation
verification-pr
```

## Propuesta inicial

```text
workflow_contract_model = standard_template_with_workflow_specific_phases
workflow_contract_file = WORKFLOW.md
workflow_manifest_file = workflow.json
workflow_contract_template_path = .gridwork/templates/workflow-contract.md
workflow_json_contains_structured_metadata = true
workflow_md_contains_operational_playbook = true
workflow_contract_requires_purpose = true
workflow_contract_requires_when_to_use = true
workflow_contract_requires_when_not_to_use = true
workflow_contract_requires_preconditions = true
workflow_contract_requires_agents = true
workflow_contract_requires_skills = true
workflow_contract_requires_phases = true
workflow_contract_requires_human_gates = true
workflow_contract_requires_artifacts = true
workflow_contract_requires_completion_criteria = true
workflow_contract_requires_traceability = true
workflow_contract_requires_handoff_policy = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres una plantilla estandar comun para todos los WORKFLOW.md,
o prefieres que cada workflow tenga estructura libre segun su proceso?
```

Mi recomendacion: plantilla estandar comun con fases especificas por workflow. Asi cada flujo mantiene su identidad, pero todos son gobernables, trazables y faciles de comparar.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar plantilla estandar comun con fases especificas por workflow
```

## Decision registrada

```text
workflow_contract_model = standard_template_with_workflow_specific_phases
workflow_contract_file = WORKFLOW.md
workflow_manifest_file = workflow.json
workflow_contract_template_path = .gridwork/templates/workflow-contract.md
workflow_json_contains_structured_metadata = true
workflow_md_contains_operational_playbook = true
workflow_contract_requires_purpose = true
workflow_contract_requires_when_to_use = true
workflow_contract_requires_when_not_to_use = true
workflow_contract_requires_preconditions = true
workflow_contract_requires_agents = true
workflow_contract_requires_skills = true
workflow_contract_requires_phases = true
workflow_contract_requires_human_gates = true
workflow_contract_requires_artifacts = true
workflow_contract_requires_completion_criteria = true
workflow_contract_requires_traceability = true
workflow_contract_requires_handoff_policy = true
```

## Regla

```text
Todos los workflows comparten una estructura base.
Cada workflow especializa sus fases, gates y artefactos.
workflow.json define metadata estructurada.
WORKFLOW.md define el playbook operativo.
```

## Supuestos

- No existe `gridwork run` en v1.
- El orquestador selecciona workflows mediante routing con confidence score.
- Los agentes AFK requieren work order.
- Las skills no elevan permisos.
- Los workflows pueden producir artefactos en `.factory/` y documentos aprobados en `docs/`.

## Riesgos

- Workflows libres pueden ser expresivos, pero dificiles de auditar.
- Workflows demasiado rigidos pueden no ajustarse bien a discovery, arquitectura e implementacion al mismo tiempo.
- Si un workflow no declara gates, puede ejecutar acciones que deberian esperar al usuario.
- Si un workflow no declara outputs, el siguiente agente no sabe que consumir.

## Artefactos a crear o actualizar

- `.gridwork/templates/workflow-contract.md`
- `.gridwork/schemas/workflow.schema.json`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `.gridwork/workflows/ideation-from-zero/WORKFLOW.md`
- `.gridwork/workflows/architecture-ddd/WORKFLOW.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`

## Evidencia y notas

- Esta pregunta completa la separacion de GQ-019 entre prompts, agentes, workflows y skills.
- La recomendacion hace que los workflows sean playbooks auditables, no instrucciones aisladas.
- Decision del usuario: usar plantilla estandar comun con fases especificas por workflow.
