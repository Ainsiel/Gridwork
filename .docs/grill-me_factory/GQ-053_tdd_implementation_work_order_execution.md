# GQ-053 - Ejecucion de work order AFK por `implementer-agent` bajo TDD

- Estado: accepted
- Fuente: decisiones GQ-021, GQ-022, GQ-034, GQ-035, GQ-036, GQ-037, GQ-041, GQ-046 y GQ-052
- Pregunta origen: GQ-053
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/tdd-implementation/`, `.gridwork/agents/implementer-agent/`, `.factory/runs/<run-id>/work-orders/`, `.factory/runs/<run-id>/artifacts/tdd/`

## Pregunta

Como debe ejecutar el `implementer-agent` un work order AFK bajo el workflow `tdd-implementation`?

## Por que importa

Ya se definio que:

- el implementer-agent trabaja desde work orders;
- la delegacion AFK requiere confirmacion humana;
- el implementer debe seguir TDD;
- los comandos de test estan allowlisted;
- las skills no elevan permisos;
- el handoff solo es obligatorio cuando hay transferencia de agente o sesion;
- `diagnose-bug` puede apoyar, pero no implementar por si misma.

Ahora falta definir el ciclo concreto de ejecucion para evitar que el implementer haga cambios sin evidencia, sin red phase o fuera de scope.

## Respuesta recomendada

Usar un ciclo AFK controlado:

```text
validate work order
prepare TDD plan
red
green
refactor
evidence
implementation summary
handoff to verifier
```

El implementer no debe empezar modificando codigo productivo. Primero debe entender el work order, verificar scopes, preparar plan TDD y escribir o identificar tests que fallen.

## Inspiracion de la skill TDD de Matt

Esta decision debe basarse explicitamente en `.example/.agents/skills/tdd/SKILL.md`.

Principios integrados:

- los tests verifican comportamiento por interfaces publicas, no detalles de implementacion;
- un buen test funciona como especificacion del comportamiento observable;
- se evita testear metodos privados, colaboradores internos o estructura accidental;
- no se permite horizontal slicing;
- se trabaja con tracer bullets verticales: un test, una implementacion minima, aprendizaje y siguiente test;
- no se anticipan features futuras;
- el refactor solo ocurre despues de green;
- los mocks se reservan para bordes reales, no para acoplar tests a internals;
- se buscan modulos profundos: interfaces pequenas con implementacion rica detras.

## Fases recomendadas

### 1. Validar work order

Antes de tocar codigo, validar:

- `work_order_id`;
- `run_id`;
- `workflow_id = tdd-implementation`;
- `target_agent = implementer-agent`;
- criterios de aceptacion;
- path scopes;
- comandos permitidos;
- human gates;
- issue refs si existen;
- definition of done.

Si falta algo critico:

```text
status = blocked
blocked_reason = missing_work_order_contract
```

### 2. Preparar plan TDD

Crear:

```text
.factory/runs/<run-id>/artifacts/tdd/tdd-plan.md
```

Debe incluir:

```text
acceptance criteria mapped to tests
planned red tests
allowed commands
expected code areas
risk notes
```

### 3. Red

El implementer debe crear o activar una prueba que falle por la razon correcta.

Evidencia requerida:

```text
test command
failing test name
failure summary
why failure is expected
timestamp
```

Si no puede producir red phase, debe marcarlo:

```text
tdd_red_missing = true
needs_more_evidence = true
```

### 4. Green

Implementar el cambio minimo para pasar el test.

Reglas:

- tocar solo path scopes permitidos;
- no ampliar alcance;
- no instalar dependencias sin approval;
- no ejecutar comandos fuera de allowlist;
- no cambiar arquitectura sin gate;
- no modificar `.gridwork/` salvo que el work order lo permita.

### 5. Refactor

Solo refactorizar despues de green.

El refactor debe:

- mantener tests en verde;
- no expandir scope;
- mejorar claridad o duplicacion real;
- no introducir cambios esteticos grandes no pedidos.

### 6. Evidencia TDD

Crear o actualizar:

```text
.factory/runs/<run-id>/artifacts/tdd/tdd-evidence.md
```

Debe incluir:

```text
red evidence
green evidence
refactor evidence
commands executed
test results
files changed
known limitations
```

### 7. Implementation summary

Crear:

```text
.factory/runs/<run-id>/artifacts/implementation-summary.md
```

Debe resumir:

```text
what changed
why it changed
acceptance criteria status
tests run
files changed
risks
next step
```

### 8. Handoff a verifier

Como hay transferencia de `implementer-agent` a `verifier-agent`, debe crear handoff:

```text
.factory/runs/<run-id>/handoffs/handoff_implementer-to-verifier_001.md
```

Luego:

```text
run.status = waiting_verification
next_agent = verifier-agent
```

## Human gates

El implementer debe detenerse si:

- falta informacion del work order;
- necesita tocar path scope no permitido;
- necesita comando no allowlisted;
- necesita instalar dependencia;
- necesita cambiar arquitectura;
- necesita modificar CI/CD;
- encuentra secretos;
- no puede reproducir el bug o criterio;
- no puede crear red phase razonable;
- detecta conflicto entre issue, work order y policies.

## Relacion con `diagnose-bug`

El implementer puede usar `diagnose-bug` para:

- entender fallos;
- formular hipotesis;
- identificar archivos sospechosos;
- recomendar tests.

Pero la implementacion sigue siendo responsabilidad del `implementer-agent` bajo TDD.

## Git y ramas

El implementer debe respetar GQ-023:

- no push sin aprobacion;
- no PR sin aprobacion;
- no merge;
- no trabajar contra `main` si falta `develop`, debe bloquear;
- branch management detallado queda para skill/policy especifica.

## Propuesta inicial

```text
implementer_execution_model = controlled_afk_tdd_cycle
implementer_requires_valid_work_order = true
implementer_starts_with_tdd_plan = true
implementer_requires_red_phase = true
implementer_requires_green_phase = true
implementer_refactors_only_after_green = true
implementer_records_tdd_evidence = true
implementer_records_implementation_summary = true
implementer_creates_handoff_to_verifier = true
implementer_sets_run_status_waiting_verification = true
implementer_can_use_diagnose_bug_as_support = true
implementer_can_skip_red_phase_silently = false
implementer_can_expand_scope = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el implementer-agent pueda continuar si no logra una red phase clara,
dejando `needs_more_evidence`,
o debe bloquearse siempre hasta que exista red phase?
```

Mi recomendacion: bloquear si no hay red phase clara, salvo que el work order sea explicitamente no testeable o de documentacion. En ese caso debe justificarlo y marcar `needs_more_evidence` para el verifier.

## Respuesta del usuario

El usuario acepta la recomendacion y pide recordar que la decision debe basarse en la skill TDD de Matt:

```text
bloquear si no hay red phase clara
permitir excepcion solo para work orders explicitamente no testeables o de documentacion
marcar needs_more_evidence cuando aplique
basarse en la skill TDD de Matt
```

## Decision registrada

```text
implementer_execution_model = controlled_afk_tdd_cycle
implementer_requires_valid_work_order = true
implementer_starts_with_tdd_plan = true
implementer_requires_red_phase = true
implementer_blocks_without_clear_red_phase = true
implementer_non_testable_exception_allowed = true
implementer_non_testable_exception_scope = documentation_or_explicitly_non_testable_work_order
implementer_non_testable_exception_requires_justification = true
implementer_non_testable_exception_marks_needs_more_evidence = true
implementer_requires_green_phase = true
implementer_refactors_only_after_green = true
implementer_records_tdd_evidence = true
implementer_records_implementation_summary = true
implementer_creates_handoff_to_verifier = true
implementer_sets_run_status_waiting_verification = true
implementer_can_use_diagnose_bug_as_support = true
implementer_can_skip_red_phase_silently = false
implementer_can_expand_scope = false
matt_tdd_principles_required = true
tests_verify_behavior_through_public_interfaces = true
horizontal_slicing_forbidden = true
tracer_bullet_vertical_cycles_required = true
refactor_only_when_green = true
```

## Regla

```text
Sin red phase clara, el implementer se bloquea.
Solo hay excepcion si el work order es explicitamente no testeable o de documentacion.
La excepcion requiere justificacion y queda marcada como needs_more_evidence.
El TDD se ejecuta como ciclos verticales: un comportamiento, un test, implementacion minima, green, siguiente ciclo.
```

## Supuestos

- El implementer-agent trabaja AFK solo con work order confirmado.
- El stack puede aportar comandos y guidance, pero no permisos.
- La evidencia queda en `.factory/`.
- Los cambios de codigo ocurren en el repo del proyecto, dentro de path scopes permitidos.
- El verifier-agent revisa despues.

## Riesgos

- Si se permite seguir sin red phase, se debilita TDD.
- Si se bloquea siempre, algunos cambios no testeables pueden quedar trabados.
- Si no hay implementation summary, el verifier debe reconstruir demasiado contexto.
- Si no hay handoff, la transferencia al verifier pierde trazabilidad.

## Artefactos a crear o actualizar

- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/agents/implementer-agent/AGENT.md`
- `.gridwork/skills/tdd/SKILL.md`
- `.gridwork/skills/diagnose-bug/SKILL.md`
- `.gridwork/templates/tdd-plan.md`
- `.gridwork/templates/tdd-evidence.md`
- `.gridwork/templates/implementation-summary.md`
- `.gridwork/templates/handoff.md`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/policies/tool-allowlist.md`

## Evidencia y notas

- Esta pregunta convierte el work order AFK en ejecucion concreta.
- La recomendacion protege TDD sin bloquear casos explicitamente no testeables.
- Decision del usuario: usar la recomendacion y basarse en la skill TDD de Matt.
