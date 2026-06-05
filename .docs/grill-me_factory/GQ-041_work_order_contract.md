# GQ-041 - Contrato de work orders para agentes AFK

- Estado: accepted
- Fuente: decisiones GQ-021, GQ-022, GQ-024, GQ-034, GQ-035, GQ-037, GQ-039 y GQ-040
- Pregunta origen: GQ-041
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.factory/runs/<run-id>/work-orders/`, `.gridwork/templates/work-order.md`, `.gridwork/schemas/work-order.schema.json`, `.gridwork/policies/work-order-policy.md`

## Pregunta

Que debe contener un `work order` para delegar una tarea a un agente AFK?

## Por que importa

Los agentes AFK no deben depender de instrucciones vagas ni de memoria de chat. El `work order` es el contrato operativo que dice:

- que debe hacer el agente;
- que no debe hacer;
- que archivos puede tocar;
- que skills debe usar;
- que comandos puede ejecutar;
- que criterios de aceptacion debe cumplir;
- que evidencia debe producir;
- cuando debe detenerse y pedir aprobacion.

Si el work order es incompleto, el agente implementador puede hacer cambios fuera de scope o producir codigo dificil de verificar.

## Respuesta recomendada

Definir un contrato de work order en Markdown, con metadata estructurada al inicio.

La metadata puede ser tipo front matter para que sea facil de leer por humanos y tambien parseable por agentes:

```yaml
work_order_id: wo_153012_001
run_id: run_20260603_153012_checkout-bug
workflow_id: tdd-implementation
status: ready
source_agent: planner-agent
target_agent: implementer-agent
created_at: 2026-06-03T15:30:12-04:00
github_issue_refs:
  - "#42"
github_pr_refs: []
required_skills:
  - tdd
  - diagnose-bug
path_scopes:
  - frontend_code
  - backend_code
allowed_commands_policy: .gridwork/policies/tool-allowlist.md
requires_handoff: true
```

## Secciones recomendadas

### Objetivo

Debe explicar el resultado esperado en una frase clara.

Ejemplo:

```text
Corregir el bug que impide completar checkout cuando el usuario aplica un cupon valido.
```

### Contexto

Debe incluir referencias relevantes:

- resumen del requerimiento;
- issue de GitHub;
- SDD si aplica;
- ADRs si aplica;
- arquitectura si aplica;
- diagnostico previo si existe.

### Alcance

Debe separar:

```text
in_scope
out_of_scope
```

Esto evita que el agente mejore cosas relacionadas pero no pedidas.

### Path scopes

Debe declarar dominios de carpetas permitidos.

Ejemplo:

```text
allowed_path_scopes:
  - frontend_code
  - backend_code

forbidden_path_scopes:
  - factory_definition
  - github_config
  - repo_meta
```

El agente no debe crear, modificar ni borrar archivos fuera de los scopes autorizados.

### Criterios de aceptacion

Debe listar criterios verificables.

Ejemplo:

```text
- El usuario puede aplicar un cupon valido durante checkout.
- Un cupon expirado muestra error controlado.
- La respuesta del backend no filtra informacion interna.
- Existe test de regresion para el bug reportado.
```

### Estrategia TDD

Para implementacion, debe exigir:

```text
red
green
refactor
```

Tambien debe indicar que la evidencia se guarda en:

```text
.factory/runs/<run-id>/artifacts/tdd/
```

### Comandos permitidos

El work order no debe inventar comandos. Debe referenciar:

```text
.gridwork/policies/tool-allowlist.md
.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
```

Si falta un comando necesario, el agente debe detenerse y pedir aprobacion o una ampliacion manual de allowlist.

### Human gates

Debe listar condiciones de parada.

Ejemplos:

- requiere instalar dependencia;
- necesita ejecutar comando no permitido;
- necesita tocar carpetas fuera de scope;
- requiere cambiar arquitectura;
- no puede reproducir el bug;
- el test esperado no puede escribirse con la informacion disponible;
- encuentra datos sensibles.

### Entregables

Debe declarar artefactos esperados:

```text
code_changes
tdd_evidence
agent_log
handoff_if_transfer
verification_notes
```

### Definicion de done

Debe decir cuando se considera terminado.

Ejemplo:

```text
La tarea esta done cuando los criterios de aceptacion estan cubiertos,
los tests permitidos pasan,
la evidencia TDD esta registrada
y existe handoff hacia verifier-agent si la tarea pasa a verificacion.
```

## Estados del work order

Estados recomendados:

```text
draft
ready
assigned
in_progress
waiting_user
waiting_verification
completed
blocked
cancelled
```

El estado del work order puede ser mas especifico que el del run, pero debe mapearse al estado del run.

## Propuesta inicial

```text
work_order_format = markdown_with_yaml_front_matter
work_order_required_for_afk_agents = true
work_order_path = .factory/runs/<run-id>/work-orders/<work-order-id>.md
work_order_statuses = draft,ready,assigned,in_progress,waiting_user,waiting_verification,completed,blocked,cancelled
work_order_requires_objective = true
work_order_requires_scope = true
work_order_requires_path_scopes = true
work_order_requires_acceptance_criteria = true
work_order_requires_human_gates = true
work_order_requires_tdd_strategy_for_implementation = true
work_order_requires_allowed_commands_policy = true
work_order_requires_done_definition = true
work_order_can_include_github_issue_refs = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que los work orders sean Markdown con front matter YAML,
o prefieres que sean JSON puro para hacerlos mas estrictos?
```

Mi recomendacion: Markdown con front matter YAML. Es suficientemente estructurado para agentes, pero sigue siendo facil de leer, editar y revisar por ti en el IDE.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar Markdown con front matter YAML
```

## Decision registrada

```text
work_order_format = markdown_with_yaml_front_matter
work_order_required_for_afk_agents = true
work_order_path = .factory/runs/<run-id>/work-orders/<work-order-id>.md
work_order_statuses = draft,ready,assigned,in_progress,waiting_user,waiting_verification,completed,blocked,cancelled
work_order_requires_objective = true
work_order_requires_scope = true
work_order_requires_path_scopes = true
work_order_requires_acceptance_criteria = true
work_order_requires_human_gates = true
work_order_requires_tdd_strategy_for_implementation = true
work_order_requires_allowed_commands_policy = true
work_order_requires_done_definition = true
work_order_can_include_github_issue_refs = true
work_order_json_pure_required = false
```

## Regla

```text
Un work order AFK es contrato, no sugerencia.
La metadata va en YAML front matter.
La explicacion operativa va en Markdown.
```

## Supuestos

- Los work orders solo son obligatorios para agentes AFK.
- `.factory/` no se versiona.
- Las issues de GitHub pueden originar work orders, pero no los reemplazan.
- El implementer-agent debe seguir TDD.
- Las skills no elevan permisos.

## Riesgos

- Si el work order es solo Markdown libre, puede quedar ambiguo.
- Si el work order es JSON puro, sera menos comodo de escribir y revisar manualmente.
- Si no incluye path scopes, el agente puede tocar zonas no autorizadas.
- Si no incluye criterios de aceptacion, el verifier tendra que inferir que significa done.
- Si no incluye human gates, el agente puede avanzar donde deberia detenerse.

## Artefactos a crear o actualizar

- `.gridwork/templates/work-order.md`
- `.gridwork/schemas/work-order.schema.json`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/agents/planner-agent/AGENT.md`
- `.gridwork/agents/implementer-agent/AGENT.md`

## Evidencia y notas

- Esta pregunta convierte la delegacion AFK en un contrato verificable.
- La recomendacion mantiene equilibrio entre estructura y facilidad de uso manual.
- Decision del usuario: usar Markdown con front matter YAML.
