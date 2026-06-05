# GQ-019 - Prompts de activacion y contratos de agentes

- Estado: accepted
- Fuente: decision aceptada en GQ-018 y correccion posterior del usuario
- Pregunta origen: GQ-019
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/`, `.gridwork/workflows/`, `.gridwork/skills/`

## Pregunta

Que prompts Markdown debe generar `npx gridwork init` para que el usuario pueda activar Gridwork por chat sin mezclar contratos de agentes, workflows y skills?

## Correccion del usuario

El usuario aclara que los ejemplos anteriores estaban mal separados:

- Esos prompts parecian definiciones de contrato para agentes.
- Los contratos de agentes deben vivir en `.gridwork/agents/`.
- No se deben mezclar prompts de activacion con skills.
- Skills deben seguir viviendo como capacidades reutilizables dentro de `.gridwork/skills/`.

## Por que importa

Si el prompt contiene el rol, permisos, skills permitidas, reglas de evidencia y procedimiento completo, deja de ser un prompt de activacion y se convierte en un contrato de agente o en un workflow disfrazado.

La fabrica necesita separar claramente:

- agente: quien actua y que limites tiene;
- workflow: que proceso se sigue;
- skill: que capacidad reutilizable se aplica;
- prompt de activacion: como el usuario arranca una sesion por chat.

## Respuesta recomendada revisada

No usar `.gridwork/prompts/` como carpeta principal de contratos.

Usar prompts de activacion junto al agente que se quiere activar:

```text
.gridwork/agents/
  orchestrator/
    agent.json
    AGENT.md
    PROMPT.md
  intake-agent/
    agent.json
    AGENT.md
    PROMPT.md
  software-architect/
    agent.json
    AGENT.md
    PROMPT.md
  planner-agent/
    agent.json
    AGENT.md
    PROMPT.md
  implementer-agent/
    agent.json
    AGENT.md
    PROMPT.md
  verifier-agent/
    agent.json
    AGENT.md
    PROMPT.md
```

Donde:

- `agent.json` es el manifest estructurado del agente.
- `AGENT.md` es el contrato humano/agente: rol, responsabilidades, limites, outputs y reglas de evidencia.
- `PROMPT.md` es el texto corto que el usuario puede pasar por chat para activar ese agente.

Los workflows siguen en:

```text
.gridwork/workflows/<workflow-id>/WORKFLOW.md
.gridwork/workflows/<workflow-id>/workflow.json
```

Las skills siguen en:

```text
.gridwork/skills/<skill-id>/SKILL.md
.gridwork/skills/<skill-id>/skill.json
```

## Regla de separacion

```text
PROMPT.md activa.
AGENT.md define el contrato del agente.
WORKFLOW.md define el proceso.
SKILL.md define la capacidad reutilizable.
Policies definen reglas globales.
```

## Ejemplo correcto: `.gridwork/agents/orchestrator/PROMPT.md`

```md
# Activar Gridwork Orchestrator

Actua como el Orquestador de Gridwork para este repositorio.

Primero lee:

- `.gridwork/factory.json`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/orchestrator/agent.json`
- `.gridwork/policies/permissions.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/policies/traceability.md`

No asumas un workflow todavia.

Tu primera tarea es entender mi solicitud, identificar el workflow apropiado y decirme que archivos de Gridwork vas a usar antes de avanzar.

Si falta informacion, preguntame.
Si una accion requiere aprobacion humana, detenla y pidela.
```

Este prompt no define skills, no copia workflows y no describe el contrato completo del orquestador. Solo activa al orquestador y le dice que archivos debe leer.

## Ejemplo correcto: `.gridwork/agents/orchestrator/AGENT.md`

```md
# Orchestrator Agent

## Rol

Coordinar workflows, validar permisos, delegar tareas a agentes y exigir trazabilidad.

## Responsabilidades

- Interpretar la solicitud del usuario.
- Seleccionar el workflow adecuado.
- Validar que el agente delegado pueda actuar.
- Validar que las skills requeridas esten permitidas por agente y workflow.
- Exigir gates humanos cuando correspondan.
- Registrar decisiones, pasos y evidencias.

## Limites

- No implementar codigo directamente si debe delegarse al implementer-agent.
- No aprobar una PR si debe delegarse al verifier-agent.
- No leer secretos.
- No ejecutar acciones destructivas sin aprobacion humana.

## Salida esperada

- workflow seleccionado;
- agente responsable;
- artefactos a producir;
- riesgos;
- acciones que requieren aprobacion;
- proximo paso.
```

Este archivo si es contrato de agente. Por eso vive en `agents/`.

## Ejemplo correcto: `.gridwork/workflows/tdd-implementation/WORKFLOW.md`

```md
# Workflow: TDD Implementation

## Objetivo

Implementar una issue siguiendo TDD estricto y dejando evidencia.

## Agente principal

`implementer-agent`

## Pasos

1. Leer work order e issue.
2. Definir plan de pruebas.
3. Escribir tests primero.
4. Registrar evidencia del fallo inicial.
5. Implementar el minimo codigo necesario.
6. Ejecutar tests.
7. Refactorizar si corresponde.
8. Registrar evidencia final.
9. Preparar handoff para verificacion.

## Skills posibles

- `tdd`
- `handoff`
- `diagnose-bug`, solo si aparece un fallo durante implementacion.
```

El workflow puede mencionar skills permitidas, pero no debe copiar las instrucciones internas de cada skill.

## Ejemplo correcto: `.gridwork/skills/tdd/SKILL.md`

```md
# Skill: TDD

## Proposito

Guiar al agente por el ciclo red, green, refactor.

## Reglas

- No implementar codigo productivo antes de tener un test relevante.
- Registrar evidencia del test fallando antes de la implementacion.
- Registrar evidencia del test pasando despues de la implementacion.
- Refactorizar solo despues de tener tests pasando.
```

Este archivo define la capacidad reusable. No es prompt de activacion ni contrato completo de agente.

## Propuesta inicial aceptada

```text
prompt_model = agent_activation_prompt
primary_prompt_path = .gridwork/agents/orchestrator/PROMPT.md
agent_contract_path = .gridwork/agents/<agent-id>/AGENT.md
workflow_definition_path = .gridwork/workflows/<workflow-id>/WORKFLOW.md
skill_instruction_path = .gridwork/skills/<skill-id>/SKILL.md
global_prompts_folder_primary = false
```

## Respuesta del usuario

El usuario acepta la separacion recomendada:

- `PROMPT.md` activa.
- `AGENT.md` define el contrato del agente.
- `WORKFLOW.md` define el proceso.
- `SKILL.md` define la capacidad reutilizable.
- Los prompts no deben mezclar contratos de agentes con skills.
- Para v1, el prompt principal obligatorio sera el del orquestador.

El usuario tambien agrega una nota de diseno:

- En vez de un comando `run implementer`, conviene crear una skill que busque issues.
- Esa skill podria ser usada por el `implementer-agent` cuando el workflow lo permita.
- Este detalle se considera especifico y queda como nota para el catalogo de skills.

## Decision registrada

```text
prompt_model = agent_activation_prompt
primary_prompt_path = .gridwork/agents/orchestrator/PROMPT.md
required_agent_prompt_v1 = orchestrator_only
specialized_agent_prompts_v1 = optional
agent_contract_path = .gridwork/agents/<agent-id>/AGENT.md
workflow_definition_path = .gridwork/workflows/<workflow-id>/WORKFLOW.md
skill_instruction_path = .gridwork/skills/<skill-id>/SKILL.md
global_prompts_folder_primary = false
skill_issue_discovery_candidate = true
```

## Supuestos

- El usuario normalmente activara primero al orquestador.
- Los agentes especializados pueden tener `PROMPT.md`, pero deben rechazar trabajo directo si falta delegacion/work order.
- El orquestador puede pedir leer un workflow especifico despues de clasificar la solicitud.
- Las skills se leen solo cuando el workflow y el agente permiten usarlas.

## Riesgos

- Si `PROMPT.md` crece demasiado, volvera a duplicar contratos.
- Si `AGENT.md` contiene pasos de workflow, se mezclan responsabilidades.
- Si `WORKFLOW.md` copia skills completas, sera dificil mantener capacidades reutilizables.
- Si un agente especializado acepta trabajo sin delegacion, se debilita la gobernanza.

## Preguntas abiertas

- El nombre del contrato del agente debe ser `AGENT.md`, `CONTRACT.md` o `SYSTEM.md`?
- El prompt principal debe estar en `.gridwork/agents/orchestrator/PROMPT.md` o en `.gridwork/START.md`?
- Debe existir una carpeta `.gridwork/prompts/` solo como alias/indice, o eliminarse por completo en v1?
- Como se llamara la skill que busca issues: `issue-discovery`, `github-issue-discovery` o `work-order-discovery`?

## Artefactos a crear o actualizar

- `.gridwork/agents/<agent-id>/agent.json`
- `.gridwork/agents/<agent-id>/AGENT.md`
- `.gridwork/agents/<agent-id>/PROMPT.md`
- `.gridwork/workflows/<workflow-id>/WORKFLOW.md`
- `.gridwork/skills/<skill-id>/SKILL.md`
- `.gridwork/policies/`
- `docs/OPERATING_MODEL.md`

## Evidencia y notas

- Esta pregunta deriva del cambio de modelo: init-only + activacion por chat.
- La correccion del usuario evita que los prompts se conviertan en una mezcla de agente, workflow y skill.
