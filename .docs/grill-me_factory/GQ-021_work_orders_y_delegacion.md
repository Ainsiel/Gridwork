# GQ-021 - Work orders y delegacion de tareas

- Estado: accepted
- Fuente: decisiones sobre orquestador, agentes, GitHub CLI, issue discovery y ausencia de `gridwork run`
- Pregunta origen: GQ-021
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/<run-id>/work-order.*`, `.gridwork/schemas/work-order.schema.json`

## Pregunta

Como debe el orquestador convertir una solicitud, issue de GitHub o resultado de un workflow en una tarea delegable para un agente sin usar comandos tipo `gridwork run implementer`?

## Por que importa

El usuario no quiere ejecutar agentes con comandos `run`. Entonces la delegacion debe ocurrir dentro de la sesion del orquestador.

Para que un agente como `implementer-agent` pueda trabajar AFK sin inventar contexto, necesita recibir una unidad de trabajo normalizada: un work order.

Sin work order:

- el agente puede actuar con instrucciones ambiguas;
- se pierde trazabilidad entre issue, SDD, arquitectura, tests y cambios;
- se vuelve dificil verificar si hizo lo correcto;
- el orquestador no tiene un contrato claro para delegar.

## Respuesta recomendada

Crear un modelo de `work order` local por run, obligatorio solo cuando se delega trabajo a un agente AFK.

El orquestador crea un work order cuando necesita delegar una tarea concreta a un agente AFK. En v1, el work order vive solo en `.factory/`, alineado con GQ-020:

```text
.factory/runs/RUN-20260602-001/
  work-order.json
  work-order.md
```

Donde:

- `work-order.json` es la version estructurada para validacion.
- `work-order.md` es la version legible para humanos/agentes.

## Regla central

```text
El usuario pide.
El orquestador normaliza.
Si la delegacion es AFK, el work order delega.
El agente AFK ejecuta.
La verificacion valida contra el work order cuando aplique.
```

## Cuando se crea un work order

Se crea un work order cuando:

- una issue de GitHub debe implementarse;
- el orquestador decide pasar de HITL a AFK;
- un workflow delega trabajo concreto a un agente AFK;
- el verifier devuelve cambios al implementer-agent y la correccion sera AFK.

No se requiere work order formal para:

- grill-me de ideacion;
- grill-me de arquitectura;
- intake conversacional;
- tareas asistidas donde el usuario esta presente;
- revision asistida, salvo que derive en una nueva tarea AFK.

## Relacion con GitHub issues

La issue de GitHub puede ser la fuente externa, pero no reemplaza el work order.

Ejemplo:

```text
GitHub Issue #12
  -> skill github-issue-discovery
  -> orchestrator normaliza
  -> .factory/runs/RUN-.../work-order.json
  -> implementer-agent trabaja
```

La skill `github-issue-discovery` puede:

- buscar issues candidatas;
- leer issue, labels, milestone y comentarios;
- detectar criterios de aceptacion;
- extraer constraints;
- detectar si falta informacion;
- proponer un work order normalizado.

Pero el orquestador decide si el work order queda aprobado para delegacion.

## Datos minimos de `work-order.json`

```json
{
  "workOrderId": "WO-20260602-001",
  "runId": "RUN-20260602-001",
  "status": "ready",
  "workflow": "tdd-implementation",
  "mode": "afk",
  "delegatedTo": "implementer-agent",
  "source": {
    "type": "github-issue",
    "repository": "owner/repo",
    "issueNumber": 12,
    "url": "https://github.com/owner/repo/issues/12"
  },
  "objective": "Implementar el flujo vertical descrito en la issue #12.",
  "acceptanceCriteria": [
    "El usuario puede completar el flujo end-to-end.",
    "Existen tests automatizados relevantes.",
    "No se modifican archivos fuera del scope autorizado."
  ],
  "constraints": [
    "Seguir TDD.",
    "No modificar dependencias sin aprobacion.",
    "No leer secretos.",
    "No hacer push ni merge."
  ],
  "allowedAgents": ["implementer-agent"],
  "allowedSkills": ["github-issue-discovery", "tdd", "diagnose-bug", "handoff"],
  "pathScopes": ["frontend_code", "backend_code", "database_code"],
  "requiredEvidence": [
    "test-plan",
    "failing-test-evidence",
    "passing-test-evidence",
    "changed-files",
    "handoff"
  ],
  "humanGates": [
    "dependency_changes",
    "external_side_effects",
    "scope_change"
  ]
}
```

## Datos minimos de `work-order.md`

```md
# Work Order WO-20260602-001

## Objetivo

Implementar el flujo vertical descrito en la issue #12.

## Fuente

- GitHub issue: #12
- Workflow: `tdd-implementation`
- Agente delegado: `implementer-agent`

## Criterios de aceptacion

- El usuario puede completar el flujo end-to-end.
- Existen tests automatizados relevantes.
- No se modifican archivos fuera del scope autorizado.

## Reglas

- Seguir TDD.
- No modificar dependencias sin aprobacion.
- No hacer push ni merge.
- Registrar evidencia en `.factory/runs/RUN-.../`.
```

## Propuesta inicial antes de la decision

La propuesta inicial era exigir work order para toda delegacion especializada:

```text
work_order_required_for_delegation = true
work_order_path_v1 = .factory/runs/<run-id>/
work_order_versioned_v1 = false
github_issue_is_source_not_work_order = true
orchestrator_approves_work_order_before_agent_execution = true
implementer_requires_work_order = true
verifier_reviews_against_work_order = true
```

Esta propuesta fue ajustada por el usuario. La pregunta que se decidio fue:

```text
Quieres que todo agente especializado requiera un work order formal,
o solo los agentes AFK como implementer-agent?
```

## Respuesta del usuario

El usuario decide:

- Los work orders solo se usan cuando se usan agentes AFK.
- No deben ser obligatorios para todos los agentes especializados.
- Los flujos HITL/asistidos pueden registrar contexto normal del run sin crear una orden de trabajo formal.

## Decision registrada

```text
work_order_required_for_delegation = false
work_order_required_for_afk_agents = true
work_order_path_v1 = .factory/runs/<run-id>/
work_order_versioned_v1 = false
github_issue_is_source_not_work_order = true
orchestrator_approves_work_order_before_afk_execution = true
implementer_requires_work_order_when_afk = true
hitl_and_assisted_workflows_do_not_require_work_order = true
verifier_uses_existing_work_order_when_reviewing_afk_output = true
```

## Supuestos

- El orquestador es el responsable de crear o aprobar work orders.
- En v1, los work orders son runtime local y quedan en `.factory/`.
- Una issue puede ser ambigua; el work order debe normalizarla antes de delegar.
- El implementer-agent no deberia trabajar solo con una instruccion suelta de chat.

## Riesgos

- Si todo requiere work order, algunos flujos HITL pueden sentirse pesados.
- Si solo AFK requiere work order, puede haber menos trazabilidad formal en flujos asistidos.
- Si el work order copia demasiado de la issue, se duplica informacion.
- Si el work order no registra gates, el agente puede avanzar donde deberia pedir aprobacion.

## Artefactos a crear o actualizar

- `.gridwork/schemas/work-order.schema.json`
- `.gridwork/policies/delegation-policy.md`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/skills/github-issue-discovery/`
- `.factory/runs/<run-id>/work-order.json`
- `.factory/runs/<run-id>/work-order.md`

## Evidencia y notas

- Esta pregunta reemplaza la idea de comandos como `gridwork run implementer`.
- Conecta GitHub issues, orquestador, implementador, verifier y trazabilidad local.
- Decision del usuario: v1 usa work orders solo para agentes AFK.
