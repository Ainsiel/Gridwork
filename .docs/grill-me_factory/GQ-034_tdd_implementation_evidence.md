# GQ-034 - Evidencia TDD de `tdd-implementation`

- Estado: accepted
- Fuente: requisitos iniciales sobre implementer-agent AFK, TDD estricto, verifier y trazabilidad; inspirado en `.example/.agents/skills/tdd/`
- Pregunta origen: GQ-034
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/tdd-implementation/`, `.gridwork/skills/tdd/`, `.gridwork/agents/implementer-agent/`

## Pregunta

Que evidencia debe producir el workflow `tdd-implementation` para demostrar que el `implementer-agent` siguio TDD y no solo implemento codigo al final?

## Por que importa

El usuario quiere que el implementador trabaje AFK, pero con TDD estricto. Para que el verifier pueda confiar en el trabajo, no basta con decir "tests pasan". Debe existir evidencia de:

- plan de pruebas;
- test escrito antes del codigo productivo;
- fallo inicial;
- implementacion minima;
- test pasando;
- refactor si aplica;
- archivos modificados;
- relacion con issue/work order.

## Respuesta recomendada

Cada run AFK de `tdd-implementation` debe producir evidencia local en `.factory/`:

```text
.factory/runs/<run-id>/artifacts/tdd/
  tdd-plan.md
  red-evidence.md
  green-evidence.md
  refactor-notes.md
  changed-files.md
  test-results.md
  implementation-summary.md
```

La skill `tdd` de Gridwork debe inspirarse en la skill TDD de Matt Pocock revisada en:

```text
.example/.agents/skills/tdd/SKILL.md
.example/.agents/skills/tdd/tests.md
.example/.agents/skills/tdd/mocking.md
.example/.agents/skills/tdd/refactoring.md
.example/.agents/skills/tdd/interface-design.md
.example/.agents/skills/tdd/deep-modules.md
```

Principios que Gridwork debe adoptar:

- las pruebas verifican comportamiento observable, no detalles de implementacion;
- las pruebas usan interfaces publicas;
- evitar tests acoplados a metodos privados, llamadas internas o estructura interna;
- no escribir todos los tests primero y luego todo el codigo;
- trabajar en vertical slices mediante tracer bullets;
- un test relevante, fallo esperado, implementacion minima, test pasando, repetir;
- no anticipar funcionalidades futuras;
- mockear solo bordes del sistema, como APIs externas, tiempo, aleatoriedad, filesystem o DB cuando corresponda;
- no mockear modulos propios ni colaboradores internos que el proyecto controla;
- disenar interfaces testeables con dependencias inyectadas, resultados retornados y poca superficie;
- preferir deep modules: interfaz pequena, implementacion profunda;
- refactorizar solo despues de estar en verde.

Ademas, `events.jsonl` debe registrar las transiciones:

```text
tdd_plan_created
failing_test_written
red_verified
minimal_implementation_done
green_verified
refactor_done
handoff_created
```

## Secuencia obligatoria inspirada en tracer bullets

```text
1. Leer work order.
2. Crear plan TDD por comportamientos, no por detalles internos.
3. Elegir un primer comportamiento como tracer bullet.
4. Escribir un test que use interfaz publica.
5. Ejecutar tests y capturar fallo esperado.
6. Implementar el minimo codigo necesario para ese test.
7. Ejecutar tests y capturar exito.
8. Repetir con el siguiente comportamiento.
9. Refactorizar solo si todos los tests relevantes estan en verde.
10. Registrar archivos modificados.
11. Crear handoff para verification-pr.
```

Anti-patron prohibido:

```text
RED: escribir todos los tests.
GREEN: implementar todo el codigo.
```

Patron requerido:

```text
RED -> GREEN por comportamiento.
RED -> GREEN por comportamiento.
RED -> GREEN por comportamiento.
REFACTOR al final o entre ciclos solo estando en verde.
```

## Que pasa si no puede demostrar red

Si el agente no puede demostrar fallo inicial:

```text
status = needs_human_or_verifier_attention
```

Debe explicar por que:

- no existia harness de test;
- el test no puede aislarse;
- el comportamiento ya pasaba antes;
- falta informacion;
- hay bloqueo tecnico.

En ese caso no debe fingir TDD. Debe registrar la excepcion.

## Propuesta inicial

```text
tdd_evidence_required = true
tdd_plan_required = true
red_evidence_required = true
green_evidence_required = true
refactor_notes_required = true
changed_files_required = true
test_results_required = true
tdd_exception_must_be_recorded = true
tdd_evidence_path = .factory/runs/<run-id>/artifacts/tdd/
implementer_cannot_claim_tdd_without_red_green_evidence = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que la falta de evidencia red/green bloquee automaticamente la entrega al verifier,
o que permita pasar al verifier marcado como `needs_more_evidence`?
```

Mi recomendacion: permitir pasar al verifier, pero marcado como `needs_more_evidence`, para que el verifier decida si bloquea o pide correccion.

## Respuesta del usuario

El usuario acepta la recomendacion y agrega:

- La falta de evidencia red/green no debe bloquear automaticamente la entrega al verifier.
- Debe pasar al verifier marcado como `needs_more_evidence`.
- La skill TDD debe inspirarse en la skill TDD de Matt de `.example`.

## Decision registrada

```text
tdd_evidence_required = true
tdd_plan_required = true
red_evidence_required = true
green_evidence_required = true
refactor_notes_required = true
changed_files_required = true
test_results_required = true
tdd_exception_must_be_recorded = true
tdd_evidence_path = .factory/runs/<run-id>/artifacts/tdd/
implementer_cannot_claim_tdd_without_red_green_evidence = true
missing_red_green_evidence_blocks_auto_completion = false
missing_red_green_evidence_status = needs_more_evidence
verifier_decides_on_missing_tdd_evidence = true
tdd_inspired_by_matt_pocock_skill = true
tdd_tests_behavior_not_implementation = true
tdd_tests_public_interfaces = true
tdd_uses_vertical_tracer_bullets = true
tdd_horizontal_slicing_forbidden = true
tdd_mock_only_system_boundaries = true
tdd_refactor_only_when_green = true
tdd_prefers_deep_modules = true
```

## Regla

```text
El implementer puede fallar en demostrar TDD, pero no puede fingir TDD.
Si falta red/green, registra excepcion y entrega al verifier como `needs_more_evidence`.
El verifier decide si bloquea, pide correccion o acepta una excepcion justificada.
```

## Supuestos

- `tdd-implementation` se usa con work order AFK.
- La evidencia operativa vive en `.factory/`.
- El verifier revisa contra work order e issue.
- Algunos proyectos existentes pueden no tener test harness completo.
- La skill TDD base debe heredar la filosofia de comportamiento/public interfaces/tracer bullets de `.example/.agents/skills/tdd/`.

## Riesgos

- Si se bloquea automaticamente, el agente puede quedarse atascado en proyectos con test setup incompleto.
- Si se permite sin evidencia, se debilita TDD.
- Si la evidencia es demasiado pesada, el workflow AFK se vuelve lento.
- Si los logs de test incluyen informacion sensible, no deben publicarse en GitHub.
- Si se testean detalles internos, los tests pueden romperse con refactors validos.
- Si se hacen tests horizontales por adelantado, se puede probar comportamiento imaginado en vez de comportamiento real.

## Artefactos a crear o actualizar

- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/skills/tdd/SKILL.md`
- `.gridwork/agents/implementer-agent/AGENT.md`
- `.gridwork/templates/tdd-plan.md`
- `.gridwork/templates/tdd-evidence.md`
- `.factory/runs/<run-id>/artifacts/tdd/`

## Evidencia y notas

- Esta pregunta endurece el TDD sin hacer imposible trabajar en proyectos existentes.
- Inspirado en la skill TDD de Matt Pocock en `.example/.agents/skills/tdd/`.
