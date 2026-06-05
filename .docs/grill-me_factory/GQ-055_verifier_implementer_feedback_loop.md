# GQ-055 - Ciclo de cambios entre `verifier-agent` e `implementer-agent`

- Estado: accepted
- Fuente: decisiones GQ-021, GQ-022, GQ-037, GQ-041, GQ-046, GQ-053 y GQ-054
- Pregunta origen: GQ-055
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/verification-pr/`, `.gridwork/workflows/tdd-implementation/`, `.factory/runs/<run-id>/artifacts/verification/`, `.factory/runs/<run-id>/work-orders/`

## Pregunta

Como debe manejar Gridwork el ciclo cuando el `verifier-agent` devuelve una implementacion al `implementer-agent` con `changes_requested` o `needs_more_evidence`?

## Por que importa

El usuario definio que si hay fallos, el verifier avisa al implementer para corregir. Ya se decidio que:

- el verifier no modifica codigo;
- el implementer corrige bajo TDD;
- las transferencias requieren handoff;
- los agentes AFK trabajan con work orders;
- los cambios fuera de scope requieren gate;
- la trazabilidad vive en `.factory/`.

Falta definir si una correccion usa el mismo work order, crea uno nuevo o abre una revision del work order.

## Respuesta recomendada

Usar ciclos de revision dentro del mismo work order cuando el scope no cambia:

```text
work_order_revision = r1, r2, r3
```

Si el verifier pide cambios dentro del mismo alcance, el implementer trabaja sobre el mismo work order con una nueva revision. Si los findings cambian el alcance, requieren nuevo work order o approval de scope.

## Decisiones del verifier y efectos

### `approved`

El run puede avanzar al siguiente paso:

```text
run.status = completed
```

o quedar listo para una accion posterior con approval, como push, PR, comment o merge segun policies.

### `changes_requested`

El verifier encontro problemas corregibles.

Debe crear:

```text
.factory/runs/<run-id>/artifacts/verification/verification-report.md
.factory/runs/<run-id>/handoffs/handoff_verifier-to-implementer_001.md
```

El implementer retoma con:

```text
work_order_revision = next
run.status = delegated
next_agent = implementer-agent
```

### `needs_more_evidence`

Puede que el codigo este bien, pero falta evidencia.

El implementer debe agregar evidencia, rerun allowlisted tests o justificar excepciones. No deberia cambiar codigo salvo que la falta de evidencia revele un bug real.

### `blocked`

El run no puede continuar sin accion externa:

- approval humana;
- cambio de scope;
- resolver entorno;
- corregir configuracion;
- aclarar requisitos.

## Findings accionables

El verifier debe devolver findings en formato accionable:

```text
finding_id
severity
category
evidence_ref
affected_acceptance_criteria
required_action
suggested_owner
scope_impact
```

Categorias:

```text
acceptance_criteria_gap
tdd_evidence_gap
test_failure
scope_violation
policy_violation
quality_issue
security_or_secret_risk
documentation_gap
```

## Reglas de scope

Si el finding esta dentro del work order:

```text
same_work_order_revision = true
```

Si el finding requiere cambios fuera del work order:

```text
requires_scope_change = true
human_gate_required = true
new_work_order_or_scope_update_required = true
```

Ejemplo dentro de scope:

```text
El test de checkout con cupon expirado falla.
```

Ejemplo fuera de scope:

```text
Para arreglar esto hay que redisenar el bounded context de pagos.
```

## Evidencia en la correccion

Cada revision del implementer debe producir:

```text
.factory/runs/<run-id>/artifacts/tdd/tdd-evidence-r2.md
.factory/runs/<run-id>/artifacts/implementation-summary-r2.md
.factory/runs/<run-id>/handoffs/handoff_implementer-to-verifier_002.md
```

Debe preservar la evidencia anterior, no sobrescribirla sin rastro.

## Limite de ciclos

Para evitar loops infinitos, cada run debe contar ciclos:

```text
verification_cycle_count
max_verification_cycles
```

Recomendacion v1:

```text
max_verification_cycles = 3
```

Al superar el limite, el orquestador debe pedir decision humana.

## Propuesta inicial

```text
feedback_loop_model = same_work_order_revision_when_scope_unchanged
changes_requested_returns_to_implementer = true
needs_more_evidence_returns_to_implementer = true
verifier_creates_actionable_findings = true
verifier_creates_handoff_to_implementer = true
implementer_preserves_previous_evidence = true
implementation_revision_artifacts_required = true
scope_change_requires_human_gate = true
scope_change_requires_new_work_order_or_scope_update = true
max_verification_cycles = 3
cycle_limit_exceeded_requires_user_decision = true
```

## Pregunta para decidir

La duda clave:

```text
Cuando el verifier pide cambios,
quieres reutilizar el mismo work order con revisiones,
o crear un work order nuevo para cada correccion?
```

Mi recomendacion: reutilizar el mismo work order con revisiones mientras el scope no cambie. Crear uno nuevo solo si el verifier descubre trabajo fuera del alcance original.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
reutilizar el mismo work order con revisiones mientras el scope no cambie
crear un work order nuevo solo si aparece trabajo fuera del alcance original
```

## Decision registrada

```text
feedback_loop_model = same_work_order_revision_when_scope_unchanged
changes_requested_returns_to_implementer = true
needs_more_evidence_returns_to_implementer = true
verifier_creates_actionable_findings = true
verifier_creates_handoff_to_implementer = true
implementer_preserves_previous_evidence = true
implementation_revision_artifacts_required = true
scope_change_requires_human_gate = true
scope_change_requires_new_work_order_or_scope_update = true
max_verification_cycles = 3
cycle_limit_exceeded_requires_user_decision = true
```

## Regla

```text
Mismo scope = mismo work order con nueva revision.
Nuevo scope = nuevo work order o scope update con approval.
Cada ciclo conserva evidencia previa.
Despues de 3 ciclos, el orquestador pide decision humana.
```

## Supuestos

- El verifier-agent no corrige codigo.
- El implementer-agent trabaja bajo TDD.
- El handoff es obligatorio cuando se transfiere entre agentes.
- `.factory/` guarda cada revision y evidencia.
- Los cambios fuera de scope requieren approval.

## Riesgos

- Crear un work order nuevo para cada correccion puede fragmentar el historial.
- Reutilizar siempre el mismo work order puede ocultar cambios de scope si no hay gates.
- Sin limite de ciclos, el flujo puede quedar atrapado entre implementer y verifier.
- Si se sobrescribe evidencia, se pierde trazabilidad.

## Artefactos a crear o actualizar

- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/templates/verification-report.md`
- `.gridwork/templates/tdd-evidence.md`
- `.gridwork/templates/implementation-summary.md`
- `.gridwork/templates/handoff.md`
- `.gridwork/policies/work-order-policy.md`
- `.gridwork/policies/traceability.md`

## Evidencia y notas

- Esta pregunta define el loop de calidad entre implementacion y verificacion.
- La recomendacion mantiene continuidad sin permitir que el scope crezca sin control.
- Decision del usuario: reutilizar el mismo work order con revisiones mientras el scope no cambie.
