# GQ-043 - Contrato estandar de agentes (`AGENT.md`)

- Estado: accepted
- Fuente: decisiones GQ-005, GQ-013, GQ-014, GQ-015, GQ-018, GQ-019, GQ-022, GQ-037, GQ-041 y GQ-042
- Pregunta origen: GQ-043
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/*/AGENT.md`, `.gridwork/agents/*/agent.json`, `.gridwork/templates/agent-contract.md`

## Pregunta

Que estructura estandar debe tener el contrato de cada agente en `AGENT.md`?

## Por que importa

Ya se decidio que los prompts de activacion no deben mezclarse con contratos de agentes. Tambien se decidio que cada agente tendra permisos, path scopes, skills y workflows permitidos.

El archivo `AGENT.md` debe ser el contrato que cualquier agente pueda leer para saber:

- cual es su responsabilidad;
- que no debe hacer;
- que workflows puede ejecutar;
- que skills puede usar;
- que carpetas puede tocar;
- que herramientas puede invocar;
- cuando debe detenerse;
- que artefactos debe producir;
- como debe transferir contexto.

Sin una estructura comun, cada agente puede interpretar sus limites de forma distinta.

## Respuesta recomendada

Usar una plantilla estandar para todos los agentes, con secciones comunes y especializacion por agente.

```text
contrato comun + reglas especificas por agente
```

La estructura comun permite consistencia. Las secciones especificas permiten que `software-architect`, `planner-agent`, `implementer-agent` y `verifier-agent` tengan responsabilidades distintas.

## Relacion entre `agent.json` y `AGENT.md`

`agent.json` debe contener metadata estructurada:

```text
agent_id
name
version
description
allowed_workflows
allowed_skills
permission_profile
path_scopes
tool_policy_refs
handoff_policy
```

`AGENT.md` debe contener el contrato operativo en lenguaje natural:

```text
rol
responsabilidades
limites
procedimiento de trabajo
gates
artefactos
criterios de calidad
```

## Secciones recomendadas para `AGENT.md`

### Identidad

Define:

```text
agent_id
nombre
proposito
modo principal
```

Ejemplo:

```text
agent_id = implementer-agent
proposito = implementar work orders bajo TDD
modo principal = AFK controlado
```

### Responsabilidades

Lista lo que el agente si puede hacer.

Ejemplo para `implementer-agent`:

```text
- Leer work orders asignados.
- Escribir tests primero.
- Implementar codigo dentro de path scopes permitidos.
- Ejecutar comandos de test allowlisted.
- Registrar evidencia TDD.
- Crear handoff hacia verifier-agent cuando corresponda.
```

### No responsabilidades

Lista lo que el agente no debe hacer aunque parezca relacionado.

Ejemplo:

```text
- No modificar arquitectura sin approval.
- No crear issues de GitHub directamente si esa accion pertenece a otra skill con gate.
- No hacer merge.
- No hacer push sin aprobacion.
- No tocar carpetas fuera de scope.
```

### Workflows permitidos

Declara workflows en los que puede participar:

```text
allowed_workflows:
  - tdd-implementation
```

### Skills permitidas

Declara skills que puede usar:

```text
allowed_skills:
  - tdd
  - diagnose-bug
  - handoff
```

Importante: usar una skill no eleva permisos.

### Path scopes

Declara dominios de carpetas permitidos.

Ejemplo:

```text
allowed_path_scopes:
  - frontend_code
  - backend_code
  - database_code

forbidden_path_scopes:
  - factory_definition
  - repo_meta
  - github_config
```

### Tool policy

Referencia politicas, no comandos inventados:

```text
.gridwork/policies/tool-allowlist.md
.gridwork/policies/github-cli-policy.md
.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
```

### Human gates

Lista situaciones donde el agente debe parar:

```text
dependency_install
unknown_test_command
github_write
path_scope_violation
architecture_change
secret_detected
destructive_action
missing_acceptance_criteria
```

### Inputs requeridos

Define que necesita para trabajar.

Ejemplo para AFK:

```text
work_order_id
run_id
path_scopes
acceptance_criteria
allowed_commands_policy
```

### Outputs esperados

Define que debe producir:

```text
agent_log
timeline_events
metrics_updates
workflow_artifacts
handoff_if_transfer
```

### Calidad y verificacion

Define criterios de calidad del agente.

Ejemplos:

- no cerrar una tarea si falta evidencia;
- no declarar tests pasados sin comando registrado;
- no modificar codigo sin scope;
- no confundir diagnostico con implementacion;
- no inventar labels de GitHub.

### Handoff

Define cuando y como entrega contexto.

Debe alinearse con GQ-037:

```text
handoff solo obligatorio cuando hay transferencia de agente o sesion
```

## Propuesta inicial

```text
agent_contract_model = standard_template_with_agent_specific_sections
agent_contract_file = AGENT.md
agent_manifest_file = agent.json
agent_contract_template_path = .gridwork/templates/agent-contract.md
agent_json_contains_structured_metadata = true
agent_md_contains_operational_contract = true
agent_contract_requires_responsibilities = true
agent_contract_requires_non_responsibilities = true
agent_contract_requires_allowed_workflows = true
agent_contract_requires_allowed_skills = true
agent_contract_requires_path_scopes = true
agent_contract_requires_tool_policy_refs = true
agent_contract_requires_human_gates = true
agent_contract_requires_inputs_outputs = true
agent_contract_requires_handoff_policy = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres una plantilla estandar comun para todos los AGENT.md,
o prefieres que cada agente tenga un contrato libre y diferente?
```

Mi recomendacion: plantilla estandar comun con secciones especificas por agente. Asi Gridwork mantiene consistencia sin perder especializacion.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar plantilla estandar comun con secciones especificas por agente
```

## Decision registrada

```text
agent_contract_model = standard_template_with_agent_specific_sections
agent_contract_file = AGENT.md
agent_manifest_file = agent.json
agent_contract_template_path = .gridwork/templates/agent-contract.md
agent_json_contains_structured_metadata = true
agent_md_contains_operational_contract = true
agent_contract_requires_responsibilities = true
agent_contract_requires_non_responsibilities = true
agent_contract_requires_allowed_workflows = true
agent_contract_requires_allowed_skills = true
agent_contract_requires_path_scopes = true
agent_contract_requires_tool_policy_refs = true
agent_contract_requires_human_gates = true
agent_contract_requires_inputs_outputs = true
agent_contract_requires_handoff_policy = true
```

## Regla

```text
Todos los agentes comparten una estructura base.
Cada agente puede especializar responsabilidades, limites y outputs.
agent.json define metadata estructurada.
AGENT.md define el contrato operativo.
```

## Supuestos

- `PROMPT.md` activa o instruye el inicio.
- `AGENT.md` define el contrato del agente.
- `agent.json` guarda metadata estructurada.
- Las skills no elevan permisos.
- Los agentes AFK necesitan reglas mas estrictas que los interactivos.

## Riesgos

- Contratos libres pueden ser expresivos, pero dificiles de auditar.
- Plantilla demasiado rigida puede generar secciones vacias o irrelevantes.
- Si `agent.json` y `AGENT.md` se contradicen, el agente debe tratarlo como un problema de configuracion.
- Si no hay no-responsabilidades explicitas, los agentes pueden expandir su scope.

## Artefactos a crear o actualizar

- `.gridwork/templates/agent-contract.md`
- `.gridwork/schemas/agent.schema.json`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/intake-agent/AGENT.md`
- `.gridwork/agents/software-architect/AGENT.md`
- `.gridwork/agents/planner-agent/AGENT.md`
- `.gridwork/agents/implementer-agent/AGENT.md`
- `.gridwork/agents/verifier-agent/AGENT.md`

## Evidencia y notas

- Esta pregunta refuerza la separacion decidida en GQ-019 entre prompt, contrato, workflow y skill.
- La recomendacion convierte a cada agente en una unidad gobernada y auditable.
- Decision del usuario: usar plantilla estandar comun con secciones especificas por agente.
