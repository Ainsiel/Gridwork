# GQ-092 - Revision y readiness de drafts del backlog

- Estado: accepted
- Fuente: decisiones GQ-024, GQ-031, GQ-049, GQ-050, GQ-089, GQ-090 y GQ-091
- Pregunta origen: GQ-092
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: drafts del backlog inicial, publish plan, estados de readiness, publicacion GitHub, inicio de implementacion MVP

## Pregunta

Como deben revisarse y aprobarse los drafts del backlog antes de publicarlos en GitHub o usarlos para implementar?

La duda concreta:

```text
Los drafts actuales quedan solo como borradores,
o definimos un checklist de readiness para pasarlos a ready?
```

## Por que importa

Ya existen drafts locales para fase 0 y fase 1. Tambien existe un publish plan local, pero no debe publicarse sin revision.

Antes de convertir estos drafts en issues reales o work orders, necesitamos una regla clara para decidir si cada draft esta listo.

## Opciones

### Opcion A - Publicar cuando el usuario lo pida

El usuario revisa informalmente y pide publicar.

Ventajas:

- rapido;
- poca burocracia;
- suficiente si el backlog es pequeno.

Desventajas:

- puede publicar issues incompletas;
- no deja evidencia de revision;
- las labels o criterios pueden estar inconsistentes.

### Opcion B - Checklist de readiness por draft

Cada draft debe pasar un checklist antes de moverse a `ready`.

Ventajas:

- mantiene calidad;
- evita issues incompletas;
- deja trazabilidad;
- encaja con TDD y verifier.

Desventajas:

- agrega un paso mas;
- requiere actualizar estados.

### Opcion C - Review por lote con checklist y excepciones documentadas

Revisar el lote completo con checklist comun, permitiendo excepciones marcadas por draft.

Ventajas:

- balancea calidad y velocidad;
- evita revisar cada draft como burocracia aislada;
- permite publicar fase 0 y fase 1 como lote pequeno;
- deja bloqueos visibles.

Desventajas:

- si una issue esta mala, puede bloquear el lote;
- requiere mantener un reporte de review.

## Respuesta recomendada

Usar Opcion C:

```text
draft_readiness_model = batch_review_with_per_draft_checklist
```

Crear un reporte local de review para el lote fase 0 + fase 1. Cada draft puede quedar:

```text
draft
ready
needs-refinement
blocked
deferred
```

`draft` es el estado inicial antes de la revision. Solo los drafts `ready` pueden entrar a un publish plan aprobado o a implementacion sin excepcion explicita.

## Checklist recomendado

Cada draft debe validar:

- tiene objetivo claro;
- tiene alcance incluido;
- tiene fuera de alcance;
- tiene criterios de aceptacion verificables;
- tiene pruebas esperadas;
- referencia decisiones GQ correctas;
- usa labels presentes en catalogo;
- declara `factory_profile`;
- declara agente y workflow sugerido;
- no requiere decisiones pendientes;
- no mezcla fases lejanas.

## Propuesta inicial

```text
draft_readiness_model = batch_review_with_per_draft_checklist
draft_status_allowed = draft,ready,needs-refinement,blocked,deferred
draft_status_initial = draft
draft_review_report_path = .docs/grill-me_factory/backlog/review-report.md
drafts_ready_can_be_published = true
drafts_needs_refinement_cannot_be_published = true
drafts_blocked_cannot_be_published = true
github_publish_requires_ready_drafts_only = true
implementation_requires_ready_or_explicit_exception = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres publicar/usar drafts con revision informal,
o definir un checklist de readiness por lote antes de publicar o implementar?
```

Mi recomendacion: review por lote con checklist por draft. Es liviano, pero evita que el backlog inicial se convierta en issues poco verificables.

## Respuesta del usuario

El usuario acepta la recomendacion:

- revisar el lote completo con checklist por draft;
- crear un reporte local de review;
- mantener los drafts como `draft` hasta que sean revisados;
- permitir estados `ready`, `needs-refinement`, `blocked` y `deferred` despues de la revision;
- publicar en GitHub solo drafts `ready`;
- implementar desde drafts no ready solo con excepcion explicita.

## Decision registrada

```text
draft_readiness_model = batch_review_with_per_draft_checklist
draft_status_allowed = draft,ready,needs-refinement,blocked,deferred
draft_status_initial = draft
draft_review_report_path = .docs/grill-me_factory/backlog/review-report.md
drafts_ready_can_be_published = true
drafts_needs_refinement_cannot_be_published = true
drafts_blocked_cannot_be_published = true
github_publish_requires_ready_drafts_only = true
implementation_requires_ready_or_explicit_exception = true
review_report_created_before_publish = true
```

## Regla

```text
El lote phase-0 + phase-1 se revisa con checklist comun.
Cada draft conserva estado `draft` hasta que el review lo clasifique.
Solo drafts `ready` pueden publicarse en GitHub.
Solo drafts `ready` pueden implementarse sin excepcion explicita.
Todo bloqueo o excepcion queda documentado en `review-report.md`.
```

## Supuestos

- Aun no publicamos issues reales.
- El primer lote es pequeno y puede revisarse completo.
- La fase 0 podria implementarse antes de publicar GitHub si el usuario lo decide.
- Las labels extendidas de GQ-091 deben estar disponibles antes de publicar.

## Riesgos

- Demasiada revision puede frenar el primer MVP.
- Muy poca revision puede crear issues debiles.
- Si no hay estado por draft, publish plan puede mezclar issues listas y no listas.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/publish-plan.md`
- `.docs/grill-me_factory/backlog/phase-0/*.md`
- `.docs/grill-me_factory/backlog/phase-1/*.md`

## Evidencia y notas

- Esta pregunta aparece despues de crear los drafts de GQ-090 y extender labels en GQ-091.
- Complementa GQ-050: publish plan con approval.
- Complementa GQ-086: cada issue debe tener criterios testeables.
- Decision del usuario: aceptar review por lote con checklist por draft antes de publicar o implementar.
- Revision posterior GQ-093: el review debe ejecutarse antes de implementar fase 0 localmente.
- Revision posterior GQ-094: `GW-MVP-001` a `GW-MVP-003` quedan `ready`; fase 1 queda con auditoria liviana y review completo pendiente.
