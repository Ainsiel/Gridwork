# GQ-094 - Ejecutar review de readiness del primer lote

- Estado: accepted
- Fuente: decisiones GQ-089, GQ-090, GQ-091, GQ-092 y GQ-093
- Pregunta origen: GQ-094
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.docs/grill-me_factory/backlog/review-report.md`, drafts `GW-MVP-001` a `GW-MVP-007`, implementacion fase 0

## Pregunta

Como ejecutamos el primer review de readiness del backlog?

La duda concreta:

```text
Revisamos solo fase 0 para poder implementar,
o revisamos fase 0 y fase 1 completas antes de tocar codigo?
```

## Por que importa

GQ-093 decide que no se implementa fase 0 sin review. Ahora hay que decidir el alcance operativo de ese review.

El lote contiene:

```text
phase-0 = GW-MVP-001, GW-MVP-002, GW-MVP-003
phase-1 = GW-MVP-004, GW-MVP-005, GW-MVP-006, GW-MVP-007
```

Fase 0 es necesaria para empezar el monorepo. Fase 1 todavia puede refinarse mientras se implementa fase 0.

## Opciones

### Opcion A - Revisar solo fase 0

Revisar `GW-MVP-001` a `GW-MVP-003`, marcar lo listo y empezar implementacion.

Ventajas:

- permite avanzar rapido;
- enfoca el review en lo que se implementara primero;
- evita bloquear fase 0 por detalles de fase 1.

Desventajas:

- fase 1 queda pendiente;
- el publish plan completo sigue no listo;
- puede aparecer dependencia futura no detectada.

### Opcion B - Revisar fase 0 y fase 1 completas

Revisar los 7 drafts antes de implementar.

Ventajas:

- deja el lote completo con estado claro;
- ayuda a publicar despues;
- reduce sorpresas entre fase 0 y fase 1.

Desventajas:

- retrasa el comienzo de implementacion;
- fase 1 podria requerir mas ajustes y bloquear sin necesidad;
- puede ser mas review del necesario para empezar.

### Opcion C - Revisar fase 0 para readiness de implementacion y auditar fase 1 livianamente

Hacer review completo de fase 0 y una auditoria liviana de fase 1 para detectar bloqueos obvios.

Ventajas:

- permite empezar fase 0 con seguridad;
- no ignora fase 1;
- mantiene el publish plan bloqueado hasta review completo;
- balancea avance y claridad.

Desventajas:

- fase 1 no queda necesariamente `ready`;
- requiere distinguir review completo vs auditoria liviana.

## Respuesta recomendada

Usar Opcion C:

```text
first_readiness_review_scope = phase_0_full_review_plus_phase_1_light_audit
```

Marcar `GW-MVP-001` a `GW-MVP-003` como `ready` si pasan checklist. Para `GW-MVP-004` a `GW-MVP-007`, hacer solo auditoria liviana y dejarlos `draft` o `needs-refinement` si aparece algo claro.

## Propuesta inicial

```text
first_readiness_review_scope = phase_0_full_review_plus_phase_1_light_audit
phase_0_full_review = true
phase_1_full_review = false
phase_1_light_audit = true
phase_0_ready_required_for_implementation = true
publish_plan_ready_after_this_review = false
github_publish_after_this_review = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres revisar solo fase 0,
fase 0 y fase 1 completas,
o fase 0 completa mas auditoria liviana de fase 1?
```

Mi recomendacion: fase 0 completa mas auditoria liviana de fase 1. Asi podemos empezar implementacion sin olvidar el siguiente tramo.

## Respuesta del usuario

El usuario acepta la recomendacion:

- ejecutar review completo de fase 0;
- ejecutar auditoria liviana de fase 1;
- marcar `GW-MVP-001`, `GW-MVP-002` y `GW-MVP-003` como `ready` si pasan checklist;
- mantener fase 1 como `draft` salvo que aparezcan bloqueos claros;
- no marcar el publish plan como listo;
- no publicar issues en GitHub.

## Decision registrada

```text
first_readiness_review_scope = phase_0_full_review_plus_phase_1_light_audit
phase_0_full_review = true
phase_1_full_review = false
phase_1_light_audit = true
phase_0_ready_required_for_implementation = true
publish_plan_ready_after_this_review = false
github_publish_after_this_review = false
phase_0_drafts_marked_ready_if_checklist_passes = true
phase_1_drafts_remain_draft_after_light_audit = true
```

## Resultado del review

```text
GW-MVP-001 = ready
GW-MVP-002 = ready
GW-MVP-003 = ready
GW-MVP-004 = draft, light-audit-passed
GW-MVP-005 = draft, light-audit-passed
GW-MVP-006 = draft, light-audit-passed
GW-MVP-007 = draft, light-audit-passed
```

## Regla

```text
Fase 0 queda lista para implementacion local.
Fase 1 queda auditada livianamente, pero no lista para publish ni implementacion.
El publish plan sigue bloqueado.
GitHub publish sigue deshabilitado.
```

## Supuestos

- Aun no se publica GitHub.
- Fase 0 es el objetivo inmediato.
- Fase 1 puede refinarse despues de que el monorepo exista.
- El review debe actualizar `review-report.md`.

## Riesgos

- Si se revisa demasiado poco, fase 0 puede quedar ambigua.
- Si se revisa demasiado, se demora el primer avance real.
- Si fase 1 no se audita, puede aparecer un bloqueo tarde.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-0/*.md`
- `.docs/grill-me_factory/backlog/phase-1/*.md`
- `.docs/grill-me_factory/backlog/publish-plan.md`

## Evidencia y notas

- Esta pregunta convierte GQ-093 en una accion operativa concreta.
- Complementa GQ-092: solo drafts `ready` se implementan sin excepcion.
- Complementa GQ-085: fase 0 es el primer paso del MVP.
- Decision del usuario: aceptar fase 0 completa mas auditoria liviana de fase 1.
