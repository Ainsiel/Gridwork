# GQ-022 - Human gates y aprobaciones para agentes AFK

- Estado: accepted
- Fuente: decision GQ-021 sobre work orders solo para agentes AFK
- Pregunta origen: GQ-022
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/human-gates.md`, `.factory/runs/<run-id>/approvals.md`

## Pregunta

Cuando debe detenerse un agente AFK y pedir aprobacion humana antes de continuar?

## Por que importa

Un agente AFK puede avanzar sin participacion continua del usuario, pero no debe tener libertad total. Necesita reglas claras para detenerse cuando una accion aumenta riesgo, cambia alcance o produce side effects externos.

Esta pregunta define los limites operativos del AFK.

## Respuesta recomendada

Crear una policy de human gates. Un agente AFK debe detenerse y pedir aprobacion cuando encuentre cualquiera de estos casos:

```text
scope_change
dependency_change
external_side_effect
destructive_file_operation
secret_or_credentials_needed
permission_scope_violation
architecture_decision_needed
data_model_change
security_or_privacy_impact
unclear_acceptance_criteria
test_strategy_blocked
ci_or_build_failure_not_related_to_task
```

## Ejemplos

Debe pedir aprobacion si quiere:

- instalar o actualizar dependencias;
- modificar `.gridwork/**`;
- modificar archivos fuera del path scope del work order;
- eliminar archivos;
- cambiar esquema de base de datos de forma no prevista;
- cambiar arquitectura o bounded contexts;
- crear, editar o cerrar issues con `gh`;
- crear PRs o comentar en PRs;
- hacer push, merge o deploy;
- leer archivos que parezcan secretos;
- ampliar el alcance de la issue.

No necesita pedir aprobacion si:

- crea tests dentro del scope autorizado;
- modifica codigo productivo dentro del scope autorizado;
- ejecuta comandos de test permitidos por policy;
- registra logs en `.factory/`;
- crea handoff o evidencia local;
- hace lectura read-only de archivos permitidos.

## Registro de aprobaciones

Cada solicitud de aprobacion debe quedar en:

```text
.factory/runs/<run-id>/approvals.md
.factory/runs/<run-id>/events.jsonl
```

Ejemplo de `approvals.md`:

```md
# Approvals

## APPROVAL-20260602-001

- Estado: pending
- Gate: dependency_change
- Agente: implementer-agent
- Motivo: se necesita agregar una libreria para validar formularios.
- Riesgo: aumenta dependencias del frontend.
- Alternativa: implementar validacion con utilidades existentes.
- Decision del usuario: TBD
```

## Decision propuesta

```text
human_gates_required_for_afk = true
approval_log_path = .factory/runs/<run-id>/approvals.md
approval_events_path = .factory/runs/<run-id>/events.jsonl
afk_agent_must_stop_on_gate = true
afk_agent_can_continue_after_explicit_approval = true
external_side_effects_require_approval = true
dependency_changes_require_approval = true
scope_changes_require_approval = true
secrets_access_forbidden = true
```

## Pregunta para decidir

Mi recomendacion es que en v1 los agentes AFK no puedan pedir perdon despues: si aparece un gate, se detienen.

La pregunta clave:

```text
Quieres que un agente AFK pueda proponer una alternativa segura y seguir sin aprobacion,
o siempre debe detenerse cuando aparece un gate?
```

## Respuesta del usuario

El usuario acepta la recomendacion:

- En v1, si un agente AFK encuentra un gate, debe detenerse.
- No puede continuar por su cuenta aunque crea tener una alternativa segura.
- Puede proponer alternativas, explicar riesgos y pedir aprobacion, pero no ejecutar la accion gated sin aprobacion explicita.

## Decision registrada

```text
human_gates_required_for_afk = true
approval_log_path = .factory/runs/<run-id>/approvals.md
approval_events_path = .factory/runs/<run-id>/events.jsonl
afk_agent_must_stop_on_gate = true
afk_agent_may_propose_alternatives = true
afk_agent_may_execute_alternative_without_approval = false
afk_agent_can_continue_after_explicit_approval = true
external_side_effects_require_approval = true
dependency_changes_require_approval = true
scope_changes_require_approval = true
secrets_access_forbidden = true
```

## Supuestos

- En v1, los agentes AFK trabajan con work order.
- Los gates del work order y la policy global se combinan.
- Un gate no aprobado bloquea la parte riesgosa, no necesariamente todo el run.
- Leer secretos queda prohibido, no aprobable.

## Riesgos

- Si hay demasiados gates, el modo AFK pierde utilidad.
- Si hay pocos gates, el agente puede causar cambios inesperados.
- Si las aprobaciones no quedan registradas, se pierde auditoria.
- Si el agente interpreta una aprobacion ambigua como permiso amplio, se rompe la gobernanza.

## Artefactos a crear o actualizar

- `.gridwork/policies/human-gates.md`
- `.gridwork/schemas/approval.schema.json`
- `.factory/runs/<run-id>/approvals.md`
- `.factory/runs/<run-id>/events.jsonl`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/agents/implementer-agent/AGENT.md`

## Evidencia y notas

- Esta pregunta protege el modo AFK sin volverlo completamente manual.
- Conecta work orders, permisos, path scopes, GitHub CLI y trazabilidad local.
- Decision del usuario: usar la recomendacion estricta; ante un gate, el agente AFK se detiene.
