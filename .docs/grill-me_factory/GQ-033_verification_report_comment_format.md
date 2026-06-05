# GQ-033 - Formato de reporte y comentario de `verification-pr`

- Estado: accepted
- Fuente: decision GQ-032 sobre reporte local obligatorio y comentario de PR con GitHub CLI
- Pregunta origen: GQ-033
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/templates/verification-report.md`, `.gridwork/templates/pr-comment.md`

## Pregunta

Que formato deben tener el reporte local y el comentario de GitHub que genera `verification-pr`?

## Por que importa

El reporte local es evidencia operativa en `.factory/`. El comentario en GitHub comunica el resultado a la PR. Si ambos tienen formatos distintos o demasiado largos, se pierde claridad.

Tambien hay que evitar que el comentario en GitHub exponga logs internos, rutas sensibles o detalles innecesarios.

## Respuesta recomendada

Usar dos niveles:

```text
verification-report.md = completo, local, con evidencia y detalles.
pr-comment.md = resumen publico/controlado, apto para GitHub.
```

## `verification-report.md`

Debe incluir:

- decision final;
- PR o diff revisado;
- issue/work order fuente;
- criterios de aceptacion revisados;
- tests revisados;
- evidencia;
- findings ordenados por severidad;
- riesgos;
- scope creep detectado;
- recomendacion;
- instrucciones para implementer si hay cambios requeridos.

Decision posible:

```text
approved_for_human_merge
changes_requested
blocked
needs_more_evidence
out_of_scope
```

## `pr-comment.md`

Debe ser mas corto:

```md
## Gridwork Verification

Decision: `changes_requested`

Summary:
- Acceptance criteria partially met.
- Tests cover backend behavior but missing UI flow.

Findings:
- P1: Missing end-to-end coverage for login flow.
- P2: Error message does not match acceptance criteria.

Next step:
Return to `implementer-agent` with the requested changes.

Local evidence:
`.factory/runs/RUN-.../artifacts/verification/verification-report.md`
```

## Propuesta inicial

```text
verification_report_full_local = true
verification_comment_summary_only = true
verification_comment_must_not_include_sensitive_logs = true
verification_comment_includes_decision = true
verification_comment_includes_top_findings = true
verification_comment_links_or_references_local_report = true
verification_findings_ordered_by_severity = true
verification_decision_enum = approved_for_human_merge,changes_requested,blocked,needs_more_evidence,out_of_scope
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el comentario de GitHub incluya todos los findings,
o solo los findings principales y deje el detalle completo en el reporte local?
```

Mi recomendacion: solo findings principales en GitHub; detalle completo en `.factory/`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- El reporte local debe ser completo.
- El comentario de GitHub debe incluir solo los findings principales.
- El detalle completo queda en `.factory/`.
- El comentario no debe publicar logs internos ni informacion sensible.

## Decision registrada

```text
verification_report_full_local = true
verification_comment_summary_only = true
verification_comment_includes_all_findings = false
verification_comment_includes_top_findings = true
verification_comment_must_not_include_sensitive_logs = true
verification_comment_includes_decision = true
verification_comment_references_local_report = true
verification_findings_ordered_by_severity = true
verification_decision_enum = approved_for_human_merge,changes_requested,blocked,needs_more_evidence,out_of_scope
```

## Regla

```text
.factory contiene el detalle.
GitHub recibe el resumen accionable.
El comentario en PR nunca publica logs internos completos.
```

## Supuestos

- El comentario de GitHub se publica solo con aprobacion.
- El reporte local queda siempre en `.factory/`.
- El usuario decide merge.
- Los logs internos no deben publicarse automaticamente en GitHub.

## Riesgos

- Comentarios muy largos pueden meter ruido en la PR.
- Comentarios muy cortos pueden no orientar al implementer.
- Publicar logs internos puede revelar informacion no deseada.
- Si el reporte local y el comentario divergen, se pierde trazabilidad.

## Artefactos a crear o actualizar

- `.gridwork/templates/verification-report.md`
- `.gridwork/templates/pr-comment.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/agents/verifier-agent/AGENT.md`
- `.factory/runs/<run-id>/artifacts/verification/`

## Evidencia y notas

- Esta pregunta estandariza la salida del verifier-agent para uso local y GitHub.
- Decision del usuario: usar resumen en GitHub y detalle completo en `.factory/`.
