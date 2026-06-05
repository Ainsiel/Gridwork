# GQ-046 - Precedencia y conflictos entre reglas de Gridwork

- Estado: accepted
- Fuente: decisiones GQ-014, GQ-015, GQ-019, GQ-022, GQ-035, GQ-041, GQ-043, GQ-044 y GQ-045
- Pregunta origen: GQ-046
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/`, `.gridwork/agents/*`, `.gridwork/workflows/*`, `.gridwork/skills/*`, `.factory/runs/<run-id>/work-orders/`

## Pregunta

Como debe resolver Gridwork un conflicto entre policies, contratos de agentes, workflows, skills y work orders?

## Por que importa

Gridwork tendra varias fuentes de reglas:

- policies globales;
- `factory.json`;
- `agent.json`;
- `AGENT.md`;
- `workflow.json`;
- `WORKFLOW.md`;
- `skill.json`;
- `SKILL.md`;
- work orders;
- aprobaciones humanas;
- prompts del usuario en el chat.

Tarde o temprano puede aparecer una contradiccion. Ejemplos:

- una skill sugiere usar `gh`, pero el agente no tiene permiso de escritura GitHub;
- un work order pide tocar backend, pero el path scope del agente solo permite frontend;
- el usuario pide hacer push, pero la politica de Git lo bloquea sin approval;
- un workflow pide handoff al cierre, pero la decision GQ-037 dice que solo es obligatorio por transferencia;
- una prueba requiere un comando no incluido en allowlist.

Sin una regla clara, el agente puede elegir la interpretacion mas comoda y saltarse gobierno.

## Respuesta recomendada

Usar tres reglas base:

```text
deny_by_default
most_restrictive_rule_wins
skills_never_expand_permissions
```

Y definir una jerarquia de autoridad para resolver conflictos.

## Jerarquia recomendada

Cuando dos reglas entren en conflicto, aplicar este orden:

```text
1. Politicas de seguridad y permisos de Gridwork
2. Path scopes y tool allowlists
3. Contrato del agente
4. Contrato del workflow
5. Work order
6. Contrato de la skill
7. Prompt operativo de la sesion
8. Preferencias inferidas por el agente
```

La regla practica:

```text
Un documento inferior puede restringir mas.
Un documento inferior no puede ampliar permisos.
```

Por ejemplo, un work order puede decir "solo toca backend", aunque el agente pueda tocar frontend y backend. Pero un work order no puede permitir `repo_meta` si el agente o policy lo prohibe.

## Regla de permisos

Permisos efectivos:

```text
effective_permissions =
  intersection(
    global_policies,
    agent_permissions,
    workflow_permissions,
    work_order_scope,
    skill_constraints
  )
```

Si la interseccion queda vacia o insuficiente, el agente debe detenerse.

## Regla de skills

Una skill:

- no eleva permisos;
- no autoriza herramientas;
- no amplia path scopes;
- no reemplaza approval gates;
- no cambia el agente responsable.

Una skill solo aporta procedimiento, criterios y artefactos.

## Regla de human gates

Una aprobacion humana puede autorizar una accion bloqueada por gate, pero debe quedar registrada.

Ejemplos:

- permitir `gh issue create`;
- permitir `gh pr comment`;
- permitir instalar una dependencia;
- permitir ampliar un path scope.

Pero si la aprobacion cambia el alcance base, debe reflejarse en el work order o policy correspondiente.

```text
approval_can_unblock_gate = true
approval_must_be_logged = true
approval_scope_change_requires_artifact_update = true
```

## Regla de contradiccion documental

Si `agent.json` y `AGENT.md` se contradicen, el agente debe tratarlo como configuracion inconsistente.

Recomendacion:

```text
structured_manifest_controls_machine_readable_fields
markdown_contract_controls_operational_instructions
conflict_requires_blocked_status
```

Ejemplo:

- `agent.json` dice que `implementer-agent` puede usar `tdd`;
- `AGENT.md` dice que no puede usar `tdd`;
- resultado: bloquear y pedir correccion, no elegir una version arbitraria.

## Regla de prompts del usuario

El prompt del usuario puede:

- aclarar objetivo;
- aprobar gates;
- cambiar prioridades;
- pedir modo interactivo;
- pedir detener o cancelar.

Pero no debe hacer que un agente ignore policies o scopes sin registrarlo como aprobacion o cambio de configuracion.

## Propuesta inicial

```text
policy_conflict_model = deny_by_default_most_restrictive_wins
skills_never_expand_permissions = true
work_order_can_narrow_scope = true
work_order_can_expand_agent_permissions = false
user_prompt_can_override_policy_silently = false
human_approval_can_unblock_gate = true
human_approval_must_be_logged = true
scope_expansion_requires_work_order_or_policy_update = true
manifest_markdown_conflict_blocks_run = true
effective_permissions_model = intersection
unknown_rule_result = blocked
```

## Pregunta para decidir

La duda clave:

```text
Quieres que Gridwork use "la regla mas restrictiva gana",
o prefieres que el orquestador pueda decidir caso a caso cuando haya conflicto?
```

Mi recomendacion: usar la regla mas restrictiva gana. El orquestador puede explicar el conflicto y proponer una correccion, pero no debe resolverlo ampliando permisos por intuicion.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar la regla mas restrictiva gana
```

## Decision registrada

```text
policy_conflict_model = deny_by_default_most_restrictive_wins
skills_never_expand_permissions = true
work_order_can_narrow_scope = true
work_order_can_expand_agent_permissions = false
user_prompt_can_override_policy_silently = false
human_approval_can_unblock_gate = true
human_approval_must_be_logged = true
scope_expansion_requires_work_order_or_policy_update = true
manifest_markdown_conflict_blocks_run = true
effective_permissions_model = intersection
unknown_rule_result = blocked
```

## Regla

```text
Ante conflicto, gana la regla mas restrictiva.
El orquestador puede explicar y proponer correccion.
El orquestador no amplia permisos por intuicion.
Las skills nunca elevan permisos.
```

## Supuestos

- Gridwork v1 se opera por prompts y archivos locales.
- No existe runner automatico que valide todo.
- Los agentes deben poder razonar sobre reglas contradictorias.
- Las approvals humanas quedan en `.factory/runs/<run-id>/approvals.jsonl`.
- Las skills no elevan permisos.

## Riesgos

- Si el orquestador decide libremente conflictos, la fabrica pierde previsibilidad.
- Si toda contradiccion bloquea, puede sentirse rigido, pero es mas seguro para v1.
- Si las approvals no se registran, no hay trazabilidad real.
- Si un work order puede ampliar permisos, se vuelve una via para saltarse policies.

## Artefactos a crear o actualizar

- `.gridwork/policies/permissions.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/policies/tool-allowlist.md`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/skill-policy.md`
- `.gridwork/policies/human-gates.md`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/agents/orchestrator/AGENT.md`

## Evidencia y notas

- Esta pregunta evita que los contratos estandar definidos en GQ-043, GQ-044 y GQ-045 se contradigan sin una salida clara.
- La recomendacion prioriza seguridad, auditabilidad y predictibilidad.
- Decision del usuario: usar deny by default y la regla mas restrictiva gana.
