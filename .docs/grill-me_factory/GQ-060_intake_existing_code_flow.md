# GQ-060 - Workflow `intake-existing-code`

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-017, GQ-020, GQ-021, GQ-024, GQ-031, GQ-036, GQ-042, GQ-047, GQ-048, GQ-051 y GQ-052
- Pregunta origen: GQ-060
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/intake-existing-code/`, `.gridwork/skills/diagnose-bug/`, `.gridwork/skills/github-issue-publisher/`, `.factory/runs/<run-id>/artifacts/intake/`

## Pregunta

Como debe funcionar `intake-existing-code` cuando el usuario ya tiene un proyecto con codigo y quiere reportar un bug, proponer una mejora, agregar una funcionalidad o aclarar una tarea pequena?

## Por que importa

Este flujo es diferente a `ideation-from-zero`. Aqui ya existe codigo, posiblemente tambien issues, ramas, decisiones previas y restricciones reales del repositorio.

El usuario ademas indico que esta etapa no debe ser AFK por defecto. Debe ser un flujo interactivo donde el usuario conversa con los agentes para aclarar el problema antes de crear una issue, work order o plan de implementacion.

## Respuesta recomendada

Tratar `intake-existing-code` como un flujo HITL de aclaracion, diagnostico y normalizacion.

No debe modificar codigo. No debe crear work orders AFK automaticamente. Debe producir un paquete claro de entrada para los siguientes pasos:

```text
bug/mejora/feature/refactor -> intake -> change brief -> issue draft opcional -> work order draft opcional
```

## Tipos de solicitud

El flujo debe clasificar la solicitud en una de estas categorias:

```text
bug
new_feature
improvement
refactor
technical_debt
spike
documentation
unknown
```

Si la categoria es `unknown`, el orquestador debe preguntar antes de seguir.

## Fases recomendadas

### 1. Clasificacion inicial

Objetivo: entender que tipo de cambio se esta pidiendo.

Preguntas tipicas:

- Esto es un bug, una mejora, una funcionalidad nueva o una investigacion?
- Hay una issue de GitHub relacionada?
- El problema ocurre en frontend, backend, base de datos, integracion o flujo completo?
- Hay pasos para reproducirlo?
- Cual seria un resultado aceptable?

Output:

```text
.factory/runs/<run-id>/artifacts/intake/intake-summary.md
```

### 2. Lectura controlada del contexto

Objetivo: entender el proyecto sin tocar codigo.

Puede revisar:

- layout del repo;
- archivos relevantes dentro de path scopes permitidos;
- docs existentes;
- issues o PRs si se usa GitHub CLI en modo lectura;
- stack pack confirmado o candidato;
- historial local si el usuario lo permite.

No puede:

- modificar codigo;
- ejecutar comandos no allowlisted;
- instalar dependencias;
- hacer push, PR o merge;
- crear work orders AFK sin confirmacion.

Output:

```text
repo-context.md
affected-areas.md
stack-context.md
```

### 3. Diagnostico si es bug

Objetivo: usar `diagnose-bug` en modo `diagnose-only` o `diagnose-and-propose-fix`.

Debe capturar:

- sintomas;
- pasos de reproduccion;
- resultado esperado;
- resultado actual;
- impacto;
- archivos sospechosos;
- pruebas recomendadas;
- hipotesis.

Output:

```text
diagnosis.md
reproduction.md
recommended-tests.md
```

### 4. Refinamiento si es feature o mejora

Objetivo: convertir una idea parcial en un cambio pequeno y testeable.

Debe preguntar:

- Que usuario o rol se beneficia?
- Que caso de uso cambia?
- Cual es el alcance minimo?
- Que queda fuera de alcance?
- Que criterios de aceptacion aplican?
- Que riesgo tiene tocar este cambio?
- Hay impacto en frontend, backend, database o CI/CD?

Output:

```text
change-brief.md
acceptance-criteria.md
scope-boundaries.md
```

### 5. Mapeo a dominio y vertical slice

Objetivo: evitar tareas horizontales vagas.

Debe identificar:

- dominio o bounded context afectado;
- paths probables;
- capa frontend si aplica;
- capa backend si aplica;
- persistencia si aplica;
- tests esperados;
- dependencias con otras tareas.

Output:

```text
vertical-slice-candidate.md
affected-domain-map.md
```

### 6. Issue draft opcional

Objetivo: preparar una issue de GitHub sin publicarla automaticamente.

El flujo puede usar guidance de `backlog-planning` o `github-issue-publisher`, pero no debe publicar sin approval.

La issue draft debe incluir:

- titulo;
- problema;
- alcance;
- criterios de aceptacion;
- labels predefinidas;
- tipo de cambio;
- dominio;
- pruebas esperadas;
- riesgos;
- links a evidencia local.

Output:

```text
issue-draft.md
```

### 7. Work order draft opcional

Objetivo: preparar una posible delegacion AFK, pero sin activarla.

Si la tarea queda suficientemente clara, puede generar:

```text
candidate-work-order.md
```

La delegacion real al `implementer-agent` requiere confirmacion humana, tal como se decidio en GQ-052.

## Modelo recomendado

`intake-existing-code` debe ser interactivo por defecto:

```text
human_in_the_loop = true
afk_by_default = false
can_modify_code = false
can_create_issue_draft = true
can_publish_issue = true_with_approval_via_github_issue_publisher
can_create_candidate_work_order = true
can_delegate_afk = false_without_user_confirmation
```

## Propuesta inicial

```text
intake_existing_code_mode = hitl_refinement
intake_existing_code_can_modify_code = false
intake_existing_code_can_run_diagnose_bug = true
intake_existing_code_diagnose_bug_mode_default = diagnose-only
intake_existing_code_can_create_issue_draft = true
intake_existing_code_can_publish_issue = false
intake_existing_code_can_request_issue_publish_approval = true
intake_existing_code_can_create_candidate_work_order = true
intake_existing_code_can_delegate_afk_without_confirmation = false
intake_existing_code_outputs_local_artifacts = true
intake_existing_code_artifact_path = .factory/runs/<run-id>/artifacts/intake/
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `intake-existing-code` solo aclare y documente solicitudes,
o que tambien pueda preparar issue drafts y candidate work orders,
sin publicarlos ni delegarlos hasta que tu apruebes?
```

Mi recomendacion: que pueda preparar issue drafts y candidate work orders, pero no publicarlos ni delegarlos sin aprobacion. Asi el flujo conversa contigo, deja todo ordenado, y luego tu decides si se publica en GitHub o si se convierte en trabajo AFK para el implementer.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `intake-existing-code` debe ser un flujo interactivo por defecto.
- Puede preparar `issue drafts`.
- Puede preparar `candidate work orders`.
- No puede publicar issues sin aprobacion.
- No puede delegar trabajo AFK sin confirmacion humana.
- No modifica codigo.

## Decision registrada

```text
intake_existing_code_mode = hitl_refinement
intake_existing_code_can_modify_code = false
intake_existing_code_can_run_diagnose_bug = true
intake_existing_code_diagnose_bug_mode_default = diagnose-only
intake_existing_code_can_create_issue_draft = true
intake_existing_code_can_publish_issue = false
intake_existing_code_can_request_issue_publish_approval = true
intake_existing_code_can_create_candidate_work_order = true
intake_existing_code_can_delegate_afk_without_confirmation = false
intake_existing_code_outputs_local_artifacts = true
intake_existing_code_artifact_path = .factory/runs/<run-id>/artifacts/intake/
```

## Regla

```text
Intake aclara.
Intake documenta.
Intake puede preparar drafts.
Intake no publica sin approval.
Intake no delega AFK sin confirmacion.
Intake no modifica codigo.
```

## Supuestos

- Este flujo se usa cuando ya existe codigo.
- El usuario participa activamente.
- La implementacion ocurre despues, en `tdd-implementation`.
- Las issues reales se crean con `github-issue-publisher` y approval.
- La delegacion AFK requiere work order confirmado.
- `diagnose-bug` no modifica codigo.

## Riesgos

- Si intake modifica codigo, se salta TDD y permisos del implementer.
- Si intake crea work orders automaticamente, puede delegar tareas ambiguas.
- Si no prepara drafts, el usuario tendra que repetir informacion en GitHub.
- Si no clasifica bien la solicitud, el orquestador puede activar el flujo equivocado.

## Artefactos a crear o actualizar

- `.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `.gridwork/templates/intake-summary.md`
- `.gridwork/templates/repo-context.md`
- `.gridwork/templates/change-brief.md`
- `.gridwork/templates/scope-boundaries.md`
- `.gridwork/templates/vertical-slice-candidate.md`
- `.gridwork/templates/affected-domain-map.md`
- `.gridwork/templates/issue-draft.md`
- `.gridwork/templates/candidate-work-orders.md`
- `.factory/runs/<run-id>/artifacts/intake/`

## Evidencia y notas

- Esta pregunta baja a detalle el flujo para trabajo en proyectos existentes.
- Mantiene la separacion: intake aclara, diagnose diagnostica, issue publisher publica, implementer implementa bajo TDD.
- Decision del usuario: aceptar drafts de issues y candidate work orders sin publicacion ni delegacion automatica.
