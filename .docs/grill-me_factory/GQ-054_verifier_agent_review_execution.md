# GQ-054 - Ejecucion de revision por `verifier-agent`

- Estado: accepted
- Fuente: decisiones GQ-032, GQ-033, GQ-034, GQ-035, GQ-037, GQ-041, GQ-046 y GQ-053
- Pregunta origen: GQ-054
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/verification-pr/`, `.gridwork/agents/verifier-agent/`, `.factory/runs/<run-id>/artifacts/verification/`

## Pregunta

Como debe verificar el `verifier-agent` una implementacion o PR producida por el `implementer-agent`?

## Por que importa

El `implementer-agent` entrega cambios, evidencia TDD, resumen de implementacion y handoff. El `verifier-agent` debe revisar si eso cumple el work order sin convertirse en implementador.

Debe poder responder:

- se cumplio el objetivo?
- se respetaron path scopes?
- existen red, green y refactor?
- los tests verifican comportamiento y no implementacion?
- los comandos usados estaban permitidos?
- hay riesgos o evidencia faltante?
- se puede recomendar aceptar, pedir correccion o bloquear?

## Respuesta recomendada

Usar un flujo de verificacion en capas:

```text
validate inputs
check scope and policies
review TDD evidence
review implementation against acceptance criteria
run allowlisted verification commands if needed
produce local report
optionally prepare PR comment with approval gate
```

El verifier no corrige codigo en v1. Si encuentra problemas, devuelve findings al implementer.

## Inputs requeridos

```text
run_id
work_order_ref
handoff_ref
implementation_summary_ref
tdd_evidence_ref
github_issue_refs
github_pr_refs
path_scopes
allowed_commands_policy
```

Si falta alguno de los artefactos clave, el verifier debe reportar `needs_more_evidence`.

## Validaciones iniciales

El verifier debe comprobar:

- el handoff existe si hubo transferencia desde implementer;
- el work order esta disponible;
- los criterios de aceptacion estan claros;
- los cambios estan dentro de scope;
- no hay conflictos obvios con policies;
- la evidencia TDD referencia comandos y resultados;
- el run esta en `waiting_verification` o estado compatible.

## Revision TDD

El verifier debe revisar que:

- exista red phase clara;
- exista green phase clara;
- el refactor solo ocurra despues de green;
- los tests apunten a comportamiento observable;
- no haya horizontal slicing evidente;
- no se testeen detalles internos innecesarios;
- las excepciones no testeables esten justificadas y marcadas como `needs_more_evidence`.

Inspiracion directa:

```text
.example/.agents/skills/tdd/SKILL.md
```

## Comandos de verificacion

El verifier puede ejecutar comandos allowlisted si el workflow y policies lo permiten.

Reglas:

- no ejecutar shell libre;
- no instalar dependencias sin approval;
- no ejecutar deploys;
- no modificar codigo;
- registrar comandos y resultados;
- si falta un comando necesario, pedir approval o marcar bloqueo.

## Decisiones posibles

El verifier puede emitir:

```text
approved
changes_requested
needs_more_evidence
blocked
```

### `approved`

La implementacion cumple criterios, evidencia y tests suficientes.

### `changes_requested`

Hay problemas corregibles por el implementer.

### `needs_more_evidence`

El cambio podria estar bien, pero falta evidencia TDD, comandos, handoff, summary o trazabilidad.

### `blocked`

No se puede verificar por falta critica, conflicto de policies, falla de entorno o condicion externa.

## Reporte local

Debe crear:

```text
.factory/runs/<run-id>/artifacts/verification/verification-report.md
```

Debe incluir:

```text
decision
summary
acceptance_criteria_review
tdd_evidence_review
scope_review
commands_review
findings
risks
required_fixes
recommended_next_step
```

## Comentario en GitHub

Puede preparar comentario resumido:

```text
.factory/runs/<run-id>/artifacts/verification/pr-comment.md
```

Publicarlo con `gh pr comment` requiere approval gate, segun GQ-032 y GQ-033.

## Handoff

Si devuelve trabajo al implementer, debe crear handoff:

```text
handoff_verifier-to-implementer_001.md
```

Si la verificacion queda aprobada y no hay transferencia, no se requiere handoff por rutina.

## Propuesta inicial

```text
verifier_execution_model = layered_verification
verifier_can_modify_code = false
verifier_can_merge = false
verifier_can_push = false
verifier_requires_work_order_ref = true
verifier_requires_tdd_evidence = true
verifier_requires_implementation_summary = true
verifier_reviews_matt_tdd_principles = true
verifier_can_run_allowlisted_verification_commands = true
verifier_decisions = approved,changes_requested,needs_more_evidence,blocked
verifier_outputs_local_report = true
verifier_can_prepare_pr_comment = true
verifier_pr_comment_requires_approval = true
verifier_creates_handoff_when_returning_to_implementer = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el verifier-agent pueda ejecutar comandos de test/verificacion allowlisted,
o que solo revise la evidencia generada por el implementer?
```

Mi recomendacion: permitir que ejecute comandos allowlisted de verificacion. Si solo revisa evidencia, puede pasar por alto fallos reproducibles; si ejecuta shell libre, se vuelve riesgoso. Allowlist es el punto medio correcto.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
permitir que verifier-agent ejecute comandos de test/verificacion allowlisted
```

## Decision registrada

```text
verifier_execution_model = layered_verification
verifier_can_modify_code = false
verifier_can_merge = false
verifier_can_push = false
verifier_requires_work_order_ref = true
verifier_requires_tdd_evidence = true
verifier_requires_implementation_summary = true
verifier_reviews_matt_tdd_principles = true
verifier_can_run_allowlisted_verification_commands = true
verifier_can_run_free_shell = false
verifier_decisions = approved,changes_requested,needs_more_evidence,blocked
verifier_outputs_local_report = true
verifier_can_prepare_pr_comment = true
verifier_pr_comment_requires_approval = true
verifier_creates_handoff_when_returning_to_implementer = true
```

## Regla

```text
El verifier-agent verifica.
El verifier-agent no corrige codigo.
Puede ejecutar comandos allowlisted.
No puede ejecutar shell libre.
Si pide cambios, devuelve findings al implementer-agent.
```

## Supuestos

- El verifier-agent no implementa fixes en v1.
- Las escrituras en GitHub requieren approval.
- Los comandos de verificacion estan en allowlist.
- La evidencia TDD del implementer se basa en la skill TDD de Matt.
- El handoff solo es obligatorio cuando hay transferencia de agente o sesion.

## Riesgos

- Si el verifier no ejecuta nada, depende demasiado de la evidencia del implementer.
- Si ejecuta comandos no controlados, rompe el modelo de permisos.
- Si corrige codigo, mezcla responsabilidades con implementer.
- Si aprueba sin red/green/refactor cuando era testeable, debilita la fabrica.

## Artefactos a crear o actualizar

- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/agents/verifier-agent/AGENT.md`
- `.gridwork/templates/verification-report.md`
- `.gridwork/templates/pr-comment.md`
- `.gridwork/templates/handoff.md`
- `.gridwork/policies/tool-allowlist.md`
- `.gridwork/policies/github-cli-policy.md`

## Evidencia y notas

- Esta pregunta define el cierre de calidad despues del implementer-agent.
- La recomendacion mantiene separacion clara: implementer corrige, verifier revisa.
- Decision del usuario: permitir comandos allowlisted de verificacion.
