# GQ-018 - Activacion por prompts Markdown

- Estado: accepted
- Fuente: correccion del usuario posterior a GQ-017
- Pregunta origen: GQ-018
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/<agent-id>/PROMPT.md`

## Pregunta

Como se usan workflows y agentes en Gridwork v1 si no existe `gridwork run`?

## Respuesta del usuario

El usuario aclara:

- No quiere usar `gridwork run` para dar instrucciones a un agente.
- Solo quiere `npx gridwork init` para descargar/instalar la fabrica con sus agentes, skills, workflows, policies y prompts.
- Gridwork debe generar prompts Markdown de activacion.
- Los prompts de activacion no son contratos completos; los contratos viven en `.gridwork/agents/`.
- Luego el usuario pasara un prompt al agente por chat, por ejemplo:

```text
Quiero que leas este prompt usando el orquestador.
```

## Decision registrada

```text
workflow_activation_model = user_passes_prompt_md_to_agent_chat
gridwork_cli_commands_v1 = init_only
gridwork_run_command_v1 = false
primary_prompt_path = .gridwork/agents/orchestrator/PROMPT.md
agent_prompt_path = .gridwork/agents/<agent-id>/PROMPT.md
agent_contract_path = .gridwork/agents/<agent-id>/AGENT.md
manual_chat_adapter_is_primary = true
```

## Modelo de uso

```bash
npx gridwork init
```

Luego:

```text
Usuario abre o referencia:
.gridwork/agents/orchestrator/PROMPT.md
```

Y se lo entrega al agente:

```text
Quiero que leas `.gridwork/agents/orchestrator/PROMPT.md`
y actues como el orquestador de Gridwork.
```

## Regla

```text
La CLI instala.
El prompt activa al agente.
AGENT.md define el contrato del agente.
WORKFLOW.md define el proceso.
SKILL.md define la capacidad reusable.
El agente ejecuta siguiendo orquestador, workflows, skills y policies.
```

## Supuestos

- El agente que recibe el prompt tiene acceso al repo o al contenido del prompt.
- El prompt debe indicar que archivos leer primero, sin duplicar contratos completos.
- El prompt debe activar al agente y referenciar policies, no mezclar workflows ni skills.
- La trazabilidad se escribe en archivos por el agente durante la sesion.

## Riesgos

- Si el prompt es ambiguo, el agente puede saltarse el orquestador.
- Si el prompt no referencia policies, las reglas quedan debiles.
- Si cada prompt repite demasiado contexto, sera dificil mantenerlos y se mezclaran con contratos de agentes.
- Si el usuario edita prompts manualmente, se debe mantener versionado.

## Artefactos a crear o actualizar

- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/<agent-id>/PROMPT.md`
- `.gridwork/agents/<agent-id>/AGENT.md`
- `docs/OPERATING_MODEL.md`

## Evidencia y notas

- Esta decision reemplaza el supuesto anterior de runner CLI para workflows.
- El adapter principal de v1 es manual-chat.
- Revision posterior: los prompts de activacion viven junto a los agentes; `.gridwork/prompts/` deja de ser la carpeta principal de contratos.
