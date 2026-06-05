# GQ-044 - Contrato estandar de skills (`SKILL.md`)

- Estado: accepted
- Fuente: decisiones GQ-007, GQ-011, GQ-019, GQ-022, GQ-034, GQ-035, GQ-036, GQ-037, GQ-041 y GQ-043
- Pregunta origen: GQ-044
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/*/SKILL.md`, `.gridwork/skills/*/skill.json`, `.gridwork/templates/skill-contract.md`

## Pregunta

Que estructura estandar debe tener el contrato de cada skill en `SKILL.md`?

## Por que importa

Gridwork tendra skills reutilizables como:

- `tdd`;
- `diagnose-bug`;
- `handoff`;
- `sdd-requirements`;
- `backlog-planning`;
- `github-issue-publisher`;
- `github-issue-discovery`;
- `github-actions-cicd`;
- `html-architecture-diagrams`.

Una skill no debe ser una instruccion suelta. Debe ser una capacidad reutilizable con limites claros:

- cuando se usa;
- cuando no se usa;
- que inputs requiere;
- que outputs produce;
- que artefactos crea;
- que permisos no puede elevar;
- que human gates activa;
- que agentes pueden usarla;
- que workflows la consumen.

## Respuesta recomendada

Usar una plantilla estandar para todas las skills:

```text
skill.json = metadata estructurada
SKILL.md = instrucciones operativas y contrato de uso
```

La plantilla debe ser comun, pero permitir secciones especificas por tipo de skill.

## Relacion entre `skill.json` y `SKILL.md`

`skill.json` debe contener:

```text
skill_id
name
version
description
category
allowed_agents
allowed_workflows
required_inputs
produced_outputs
artifact_paths
tool_policy_refs
human_gates
permissions_inherited_only
```

`SKILL.md` debe contener:

```text
proposito
cuando usar
cuando no usar
procedimiento
inputs
outputs
artefactos
gates
errores y bloqueos
ejemplos
```

## Secciones recomendadas para `SKILL.md`

### Proposito

Explica que capacidad entrega la skill.

Ejemplo:

```text
La skill `tdd` guia al implementer-agent para trabajar en ciclo red/green/refactor y registrar evidencia.
```

### Cuando usar

Define disparadores validos.

Ejemplo:

```text
Usar `diagnose-bug` cuando exista un bug reportado, una prueba fallida o una PR que necesita explicacion de fallo.
```

### Cuando no usar

Define limites explicitos.

Ejemplo:

```text
No usar `diagnose-bug` para modificar codigo por si misma.
No usar `github-issue-publisher` sin approval gate.
```

### Agentes permitidos

Declara que agentes pueden usar la skill.

Ejemplo:

```text
allowed_agents:
  - intake-agent
  - implementer-agent
  - verifier-agent
```

### Workflows compatibles

Declara workflows donde la skill aplica.

Ejemplo:

```text
allowed_workflows:
  - intake-existing-code
  - tdd-implementation
  - verification-pr
```

### Inputs requeridos

Lista lo que la skill necesita para operar.

Ejemplo:

```text
run_id
agent_id
workflow_id
user_request
work_order_id
github_issue_refs
path_scopes
```

### Outputs esperados

Lista resultados que debe producir.

Ejemplo:

```text
diagnosis_report
recommended_tests
suspected_files
timeline_events
agent_log_updates
```

### Artefactos

Define rutas esperadas.

Ejemplo:

```text
.factory/runs/<run-id>/artifacts/diagnose/
.factory/runs/<run-id>/artifacts/tdd/
.factory/runs/<run-id>/handoffs/
```

### Procedimiento

Describe pasos operativos de la skill.

Debe ser suficientemente concreto para que distintos agentes puedan usarla de manera parecida.

### Permisos

Regla central:

```text
Una skill no eleva permisos.
```

La skill solo puede actuar dentro de:

- permisos del agente que la usa;
- path scopes autorizados;
- tool policies permitidas;
- human gates aplicables.

### Human gates

Lista situaciones donde la skill debe detenerse.

Ejemplos:

- escritura en GitHub;
- comando no permitido;
- dependencia nueva;
- cambio de arquitectura;
- datos sensibles;
- scope insuficiente;
- ambiguedad critica.

### Evidencia y trazabilidad

Define eventos y logs esperados.

Ejemplo:

```text
skill.used
artifact.created
approval.requested
test.started
test.passed
test.failed
```

### Fallos y bloqueos

Define que hacer si no puede completar.

Ejemplo:

```text
Si falta informacion critica, la skill debe devolver `blocked` con preguntas concretas.
```

## Categorias de skills

Categorias recomendadas:

```text
requirements
architecture
planning
implementation
verification
diagnosis
github
visualization
handoff
```

Esto ayuda a organizar skills sin acoplarlas a un lenguaje o framework.

## Propuesta inicial

```text
skill_contract_model = standard_template_with_skill_specific_sections
skill_contract_file = SKILL.md
skill_manifest_file = skill.json
skill_contract_template_path = .gridwork/templates/skill-contract.md
skill_json_contains_structured_metadata = true
skill_md_contains_operational_instructions = true
skill_contract_requires_purpose = true
skill_contract_requires_when_to_use = true
skill_contract_requires_when_not_to_use = true
skill_contract_requires_allowed_agents = true
skill_contract_requires_allowed_workflows = true
skill_contract_requires_inputs_outputs = true
skill_contract_requires_artifacts = true
skill_contract_requires_permissions_statement = true
skill_contract_requires_human_gates = true
skill_contract_requires_traceability = true
skill_never_elevates_permissions = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres una plantilla estandar comun para todas las SKILL.md,
o prefieres que cada skill tenga estructura libre segun su naturaleza?
```

Mi recomendacion: plantilla estandar comun con secciones especificas por categoria. Asi las skills son reutilizables y auditables, pero no quedan forzadas a ser identicas.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
usar plantilla estandar comun con secciones especificas por categoria
```

## Decision registrada

```text
skill_contract_model = standard_template_with_skill_specific_sections
skill_contract_file = SKILL.md
skill_manifest_file = skill.json
skill_contract_template_path = .gridwork/templates/skill-contract.md
skill_json_contains_structured_metadata = true
skill_md_contains_operational_instructions = true
skill_contract_requires_purpose = true
skill_contract_requires_when_to_use = true
skill_contract_requires_when_not_to_use = true
skill_contract_requires_allowed_agents = true
skill_contract_requires_allowed_workflows = true
skill_contract_requires_inputs_outputs = true
skill_contract_requires_artifacts = true
skill_contract_requires_permissions_statement = true
skill_contract_requires_human_gates = true
skill_contract_requires_traceability = true
skill_never_elevates_permissions = true
```

## Regla

```text
Todas las skills comparten una estructura base.
Cada skill puede especializar su procedimiento y artefactos por categoria.
skill.json define metadata estructurada.
SKILL.md define instrucciones operativas y contrato de uso.
Una skill nunca eleva permisos.
```

## Supuestos

- Las skills no elevan permisos.
- Los agentes son quienes ejecutan acciones.
- Las skills pueden producir artefactos en `.factory/`.
- Algunas skills pueden requerir approval gates.
- `skill.json` y `SKILL.md` deben mantenerse coherentes.

## Riesgos

- Skills libres pueden ser flexibles, pero dificiles de gobernar.
- Skills demasiado rigidas pueden volverse incomodas para capacidades muy distintas.
- Si una skill no declara limites, puede mezclarse con responsabilidades de agentes.
- Si una skill no declara outputs, el verifier u orquestador no sabe que esperar.

## Artefactos a crear o actualizar

- `.gridwork/templates/skill-contract.md`
- `.gridwork/schemas/skill.schema.json`
- `.gridwork/policies/skill-policy.md`
- `.gridwork/skills/tdd/SKILL.md`
- `.gridwork/skills/diagnose-bug/SKILL.md`
- `.gridwork/skills/handoff/SKILL.md`
- `.gridwork/skills/sdd-requirements/SKILL.md`
- `.gridwork/skills/backlog-planning/SKILL.md`
- `.gridwork/skills/github-issue-publisher/SKILL.md`
- `.gridwork/skills/github-issue-discovery/SKILL.md`
- `.gridwork/skills/github-actions-cicd/SKILL.md`
- `.gridwork/skills/html-architecture-diagrams/SKILL.md`

## Evidencia y notas

- Esta pregunta complementa GQ-043: agentes tienen contrato, skills tambien.
- La recomendacion mantiene gobierno sin impedir especializacion por categoria.
- Decision del usuario: usar plantilla estandar comun con secciones especificas por categoria.
