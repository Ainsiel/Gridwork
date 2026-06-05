# GQ-032 - Decisiones de `verification-pr`

- Estado: accepted
- Fuente: decisiones sobre `verification-pr`, ramas, PRs, GitHub CLI y human gates
- Pregunta origen: GQ-032
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/verification-pr/`, `.gridwork/agents/verifier-agent/`, `.gridwork/policies/github-cli-policy.md`

## Pregunta

Que puede decidir el workflow `verification-pr` y que acciones quedan reservadas para el usuario?

## Por que importa

El `verifier-agent` revisa cambios, PRs, evidencia, tests, scope y cumplimiento del work order. Pero en v1 ya se decidio que los agentes no hacen merge libremente y que los side effects externos requieren aprobacion.

Hay que definir si `verification-pr`:

- solo genera un reporte local;
- puede comentar en la PR con aprobacion;
- puede recomendar merge;
- puede aprobar formalmente una PR;
- puede disparar correcciones al implementer-agent.

## Respuesta recomendada

En v1, `verification-pr` debe decidir semanticamente, pero no ejecutar merge ni aprobaciones formales en GitHub.

Puede emitir estas decisiones:

```text
approved_for_human_merge
changes_requested
blocked
needs_more_evidence
out_of_scope
```

## Acciones permitidas

El `verifier-agent` puede:

- leer diff local o PR;
- leer issue y work order;
- leer evidencia en `.factory/`;
- ejecutar checks read-only permitidos;
- generar reporte local;
- recomendar merge humano;
- generar instrucciones para el implementer-agent si hay fallos.

## Acciones con gate

Requieren aprobacion:

- comentar en PR con `gh pr comment`;
- editar labels o estado de issue;
- crear una follow-up issue;
- pedir re-run de CI si usa `gh workflow run` o acciones equivalentes.

## Acciones bloqueadas en v1

No puede:

- hacer merge;
- aprobar formalmente una PR en GitHub sin usuario;
- hacer push;
- hacer deploy;
- modificar codigo directamente durante verification-pr.

## Reporte recomendado

```text
.factory/runs/<run-id>/artifacts/verification/
  verification-report.md
  findings.json
  pr-comment.md
```

`verification-report.md` es la evidencia local obligatoria.

`pr-comment.md` es el comentario preparado para GitHub. Si el usuario aprueba publicarlo, el workflow puede usar:

```bash
gh pr comment
```

## Propuesta inicial

```text
verification_pr_can_recommend_merge = true
verification_pr_can_merge = false
verification_pr_can_formally_approve_pr_without_user = false
verification_pr_can_comment_on_pr_requires_approval = true
verification_pr_can_request_changes = true
verification_pr_can_delegate_back_to_implementer = true
verification_pr_modifies_code = false
verification_pr_report_path = .factory/runs/<run-id>/artifacts/verification/
```

## Pregunta para decidir

Mi recomendacion es que el verifier solo recomiende y genere reporte en v1.

La duda clave:

```text
Quieres que `verification-pr` pueda comentar en la PR despues de tu aprobacion,
o que en v1 solo genere reporte local en `.factory/`?
```

## Respuesta del usuario

El usuario decide:

- Como se puede usar GitHub CLI, `verification-pr` debe poder generar comentario en GitHub.
- Tambien debe generar el reporte local.
- Esto se suma a la recomendacion de no hacer merge ni aprobacion formal automatica.

## Decision registrada

```text
verification_pr_can_recommend_merge = true
verification_pr_can_merge = false
verification_pr_can_formally_approve_pr_without_user = false
verification_pr_generates_local_report = true
verification_pr_local_report_required = true
verification_pr_can_prepare_pr_comment = true
verification_pr_can_comment_on_pr = true
verification_pr_can_comment_on_pr_requires_approval = true
verification_pr_comment_tool = gh
verification_pr_comment_command = gh pr comment
verification_pr_can_request_changes = true
verification_pr_can_delegate_back_to_implementer = true
verification_pr_modifies_code = false
verification_pr_report_path = .factory/runs/<run-id>/artifacts/verification/
```

## Regla

```text
El reporte local siempre se genera.
El comentario de GitHub se prepara siempre que exista PR.
Publicar el comentario requiere aprobacion porque es side effect externo.
El verifier recomienda; el usuario decide merge.
```

## Supuestos

- El usuario decide merge.
- PR comments son side effects externos.
- La evidencia operativa vive en `.factory/`.
- El verifier no corrige codigo directamente en v1.
- `gh pr comment` esta permitido bajo policy y aprobacion.

## Riesgos

- Si el verifier solo reporta localmente, el feedback puede quedar fuera de GitHub.
- Si comenta PRs sin control, puede generar ruido o exponer informacion.
- Si aprueba/mergea en GitHub, se rompe la gobernanza v1.

## Artefactos a crear o actualizar

- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/agents/verifier-agent/AGENT.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/templates/verification-report.md`
- `.gridwork/templates/pr-comment.md`
- `.factory/runs/<run-id>/artifacts/verification/`

## Evidencia y notas

- Esta pregunta aterriza el rol del verifier-agent dentro del ciclo PR.
- Decision del usuario: generar reporte local y comentario en GitHub usando GitHub CLI.
