# GQ-061 - `PROMPT.md` del orquestador

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-004, GQ-018, GQ-019, GQ-020, GQ-021, GQ-022, GQ-040, GQ-042, GQ-046 y GQ-060
- Pregunta origen: GQ-061
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/orchestrator/PROMPT.md`, `.gridwork/agents/orchestrator/AGENT.md`, `.gridwork/policies/`, `.factory/runs/<run-id>/`

## Pregunta

Que debe contener exactamente `.gridwork/agents/orchestrator/PROMPT.md` para que el usuario pueda pegarlo o referenciarlo en el chat y activar Gridwork sin mezclar contratos de agentes, workflows ni skills?

## Por que importa

Gridwork v1 no tiene `gridwork run`. El punto de activacion real es el prompt del orquestador. Si ese prompt es demasiado corto, el agente puede actuar sin cargar reglas importantes. Si es demasiado largo, empieza a duplicar `AGENT.md`, `WORKFLOW.md`, `SKILL.md` y policies.

El prompt debe ser una puerta de entrada, no toda la fabrica.

## Respuesta recomendada

Usar un `PROMPT.md` como loader operativo con checklist de arranque.

Debe contener:

```text
1. instruccion de activacion
2. archivos que debe leer primero
3. reglas de no actuar antes de rutear
4. formato de primera respuesta
5. recordatorio de approvals y trazabilidad
```

No debe copiar contratos completos de agentes, workflows o skills.

## Contenido recomendado

### 1. Identidad de activacion

Debe indicar:

```text
Actua como el Orquestador de Gridwork para este repositorio.
```

El prompt no debe redefinir todo el rol. El rol completo vive en:

```text
.gridwork/agents/orchestrator/AGENT.md
```

### 2. Archivos que debe leer primero

Orden recomendado:

```text
.gridwork/factory.json
.gridwork/agents/orchestrator/agent.json
.gridwork/agents/orchestrator/AGENT.md
.gridwork/policies/permissions.md
.gridwork/policies/path-scopes.md
.gridwork/policies/workflow-policy.md
.gridwork/policies/skill-policy.md
.gridwork/policies/human-gates.md
.gridwork/policies/traceability.md
.gridwork/policies/logging-policy.md
.gridwork/policies/tool-allowlist.md
```

Si la solicitud menciona GitHub, tambien debe leer:

```text
.gridwork/policies/github-cli-policy.md
.gridwork/policies/github-labels.json
.gridwork/policies/git-policy.md
```

Si la solicitud implica stack, debe revisar el stack pack confirmado o candidato:

```text
.gridwork/stack-packs/<stack-pack-id>/STACK.md
```

### 3. Reglas antes de actuar

El prompt debe decir que el orquestador:

- no asume workflow;
- no modifica codigo al activarse;
- no crea work orders AFK sin confirmacion;
- no ejecuta writes de GitHub sin approval;
- no ignora path scopes;
- no inventa labels;
- no usa skills hasta que el workflow y el agente las permitan;
- no lee secretos ni imprime informacion sensible;
- pregunta si la confianza del routing es baja.

### 4. Primera respuesta obligatoria

Despues de leer los archivos base, el orquestador debe responder con:

```text
gridwork_loaded = true | false
factory_id = <id>
detected_request_type = <tipo inicial>
routing_confidence = high | medium | low
proposed_workflow = <workflow-id | pending>
proposed_agent = <agent-id | pending>
mode = interactive | afk_candidate
files_loaded = [...]
policies_loaded = [...]
missing_context = [...]
approval_gates_detected = [...]
next_step = <pregunta o accion propuesta>
```

Esto hace que el usuario vea como esta pensando el orquestador antes de que la fabrica avance.

### 5. Creacion de run

El prompt debe permitir dos comportamientos:

```text
si la solicitud es clara -> crear run local despues de explicar el routing
si la solicitud es ambigua -> preguntar antes de crear artefactos extensos
```

En ambos casos, si se crea un run, debe usar el formato decidido:

```text
.factory/runs/run_YYYYMMDD_HHMMSS_<short-topic>/
```

### 6. Activacion de workflows

El prompt solo debe indicar que el orquestador selecciona un workflow y luego lee su `WORKFLOW.md`.

No debe copiar el contenido de:

```text
.gridwork/workflows/<workflow-id>/WORKFLOW.md
```

### 7. Delegacion

El prompt debe recordar:

```text
delegacion_afk_requires_work_order = true
delegacion_afk_requires_user_confirmation = true
```

Si el flujo es interactivo, el orquestador puede seguir conversando sin work order.

Si el flujo requiere implementacion AFK, debe producir o validar un work order antes de delegar.

## Ejemplo de estructura de `PROMPT.md`

```md
# Activar Gridwork Orchestrator

Actua como el Orquestador de Gridwork para este repositorio.

Primero lee los archivos base de Gridwork:

- `.gridwork/factory.json`
- `.gridwork/agents/orchestrator/agent.json`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/policies/permissions.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/skill-policy.md`
- `.gridwork/policies/human-gates.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/policies/logging-policy.md`
- `.gridwork/policies/tool-allowlist.md`

No asumas un workflow todavia.
No modifiques codigo al activarte.
No delegues trabajo AFK sin work order y confirmacion humana.
No ejecutes acciones de GitHub con escritura sin approval.

Despues de leer los archivos, responde con:

- archivos cargados;
- solicitud entendida;
- workflow propuesto;
- agente propuesto;
- confidence score;
- gates humanos detectados;
- siguiente pregunta o siguiente accion propuesta.

Si falta informacion, preguntame antes de continuar.
```

## Propuesta inicial

```text
orchestrator_prompt_model = operational_loader_with_bootstrap_checklist
orchestrator_prompt_duplicates_contracts = false
orchestrator_prompt_loads_base_files = true
orchestrator_prompt_requires_first_response_summary = true
orchestrator_prompt_can_create_run_after_routing = true
orchestrator_prompt_creates_run_immediately_on_activation = false
orchestrator_prompt_requires_routing_before_workflow = true
orchestrator_prompt_requires_approval_gates_reminder = true
orchestrator_prompt_required_v1 = true
specialized_agent_prompts_required_v1 = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el `PROMPT.md` del orquestador sea solo un texto minimo de activacion,
o que sea un loader operativo con checklist de archivos, primera respuesta obligatoria
y reglas basicas antes de actuar?
```

Mi recomendacion: loader operativo con checklist de arranque, pero sin duplicar contratos. Es el punto justo: suficientemente concreto para que el agente arranque bien, pero mantenible porque el detalle sigue viviendo en `AGENT.md`, `WORKFLOW.md`, `SKILL.md` y policies.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `.gridwork/agents/orchestrator/PROMPT.md` debe ser un loader operativo.
- Debe incluir checklist de archivos base a leer.
- Debe exigir una primera respuesta estructurada.
- Debe recordar reglas basicas antes de actuar.
- No debe duplicar contratos completos de agentes, workflows, skills ni policies.
- No debe crear runs inmediatamente al activarse si la solicitud es ambigua.

## Decision registrada

```text
orchestrator_prompt_model = operational_loader_with_bootstrap_checklist
orchestrator_prompt_duplicates_contracts = false
orchestrator_prompt_loads_base_files = true
orchestrator_prompt_requires_first_response_summary = true
orchestrator_prompt_can_create_run_after_routing = true
orchestrator_prompt_creates_run_immediately_on_activation = false
orchestrator_prompt_requires_routing_before_workflow = true
orchestrator_prompt_requires_approval_gates_reminder = true
orchestrator_prompt_required_v1 = true
specialized_agent_prompts_required_v1 = false
```

## Regla

```text
PROMPT.md activa.
PROMPT.md no reemplaza contratos.
El orquestador primero carga reglas.
El orquestador luego explica routing.
El orquestador crea run solo despues de entender la solicitud.
```

## Supuestos

- El usuario normalmente activa Gridwork por el orquestador.
- El agente de chat puede leer los archivos del repo o recibir referencias a ellos.
- El prompt principal obligatorio en v1 es solo el del orquestador.
- Los prompts de agentes especializados son opcionales.
- No existe comando `gridwork run`.

## Riesgos

- Un prompt minimo puede dejar demasiadas decisiones implicitas.
- Un prompt largo puede duplicar contratos y quedarse desactualizado.
- Crear runs inmediatamente al activar puede llenar `.factory/` de sesiones inutiles.
- No exigir una primera respuesta estructurada puede hacer opaco el routing.

## Artefactos a crear o actualizar

- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/templates/agent-log.md`
- `.factory/runs/<run-id>/`

## Evidencia y notas

- Esta pregunta profundiza GQ-018 y GQ-019 sin cambiar la separacion aceptada: `PROMPT.md` activa, `AGENT.md` contrata, `WORKFLOW.md` procesa y `SKILL.md` capacita.
- La recomendacion hace que el primer contacto con Gridwork sea auditable y predecible.
- Decision del usuario: aceptar loader operativo con checklist de arranque y primera respuesta obligatoria.
- Revision posterior GQ-088: `.gridwork/QUICKSTART.md` debe apuntar a este prompt como primer paso de activacion.
