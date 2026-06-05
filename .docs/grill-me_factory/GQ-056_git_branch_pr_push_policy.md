# GQ-056 - Politica de ramas, commits, PRs y push

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-023, GQ-041, GQ-046, GQ-053, GQ-054 y GQ-055
- Pregunta origen: GQ-056
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/git-policy.md`, `.gridwork/skills/git-branch-management/`, `.gridwork/workflows/tdd-implementation/`, `.gridwork/workflows/verification-pr/`

## Pregunta

Como debe manejar Gridwork ramas, commits, PRs y push cuando una implementacion ya fue verificada?

## Por que importa

Ya se decidio que:

- existe modelo `main` / `develop` / `feature`;
- `develop` es obligatorio;
- los agentes no hacen push, PR ni merge sin aprobacion;
- el implementer trabaja bajo TDD;
- el verifier puede aprobar o pedir cambios;
- GitHub CLI se gobierna por allowlist y approval gates.

Falta definir como se pasa desde una implementacion verificada a una rama, commit, PR o push sin mezclar responsabilidades.

## Respuesta recomendada

Crear una skill futura `git-branch-management` para preparar acciones Git, pero mantener las acciones remotas bajo approval:

```text
local git status/read = permitido si esta en policy
crear branch local = approval si modifica repo
commit = approval
push = approval
PR = approval
merge = prohibido para agentes v1
```

El agente puede preparar comandos y reportes, pero no ejecutar acciones de publicacion sin permiso humano.

## Acciones locales

Acciones de lectura permitidas:

```text
git status
git branch --show-current
git log --oneline
git diff --stat
git diff --name-only
```

Acciones de escritura local requieren approval:

```text
git checkout -b <feature-branch>
git add <files>
git commit
```

## Acciones remotas

Siempre requieren approval:

```text
git push
gh pr create
gh pr comment
```

Prohibido para agentes v1:

```text
gh pr merge
git push origin main
git push origin develop directo sin aprobacion explicita
```

## Flujo recomendado

```text
1. implementer termina cambios y evidencia TDD
2. verifier revisa
3. verifier decision = approved
4. orquestador prepara git action plan
5. usuario aprueba commit/push/PR
6. se ejecuta accion aprobada
7. se registra trazabilidad
```

## Branch naming

Formato recomendado:

```text
feature/<issue-number>-<short-slug>
```

Ejemplo:

```text
feature/42-checkout-coupon
```

Si no hay issue:

```text
feature/<run-short-id>-<short-slug>
```

## Git action plan

Antes de ejecutar acciones de escritura, crear:

```text
.factory/runs/<run-id>/artifacts/git/git-action-plan.md
```

Debe incluir:

```text
current_branch
target_branch
base_branch
files_to_stage
commit_message
push_target
pr_title
pr_body_ref
approval_required
risk_level
```

## Propuesta inicial

```text
git_branch_management_skill_enabled = true
git_read_actions_allowed_by_policy = true
git_local_write_actions_require_approval = true
git_remote_write_actions_require_approval = true
agents_can_merge_pr_v1 = false
develop_branch_required = true
feature_branch_format = feature/<issue-number>-<short-slug>
git_action_plan_required_before_write = true
commit_requires_user_approval = true
push_requires_user_approval = true
pr_create_requires_user_approval = true
merge_requires_user_manual_action = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que los agentes puedan crear commits locales con aprobacion,
o prefieres que solo preparen el plan y que tu hagas commit manualmente?
```

Mi recomendacion: permitir commits locales con aprobacion, pero mantener push, PR y merge bajo aprobacion separada. Asi los agentes pueden dejar unidades de cambio limpias sin publicar nada por accidente.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
permitir commits locales con aprobacion
mantener push, PR y merge bajo aprobacion separada
```

## Decision registrada

```text
git_branch_management_skill_enabled = true
git_read_actions_allowed_by_policy = true
git_local_write_actions_require_approval = true
git_remote_write_actions_require_approval = true
agents_can_merge_pr_v1 = false
develop_branch_required = true
feature_branch_format = feature/<issue-number>-<short-slug>
git_action_plan_required_before_write = true
commit_requires_user_approval = true
push_requires_user_approval = true
pr_create_requires_user_approval = true
merge_requires_user_manual_action = true
```

## Regla

```text
Los agentes pueden preparar Git.
Los agentes pueden commitear localmente solo con aprobacion.
Push y PR requieren aprobacion separada.
Merge queda como accion manual del usuario en v1.
```

## Supuestos

- El repo usa Git.
- `develop` debe existir.
- GitHub CLI puede usarse solo bajo policy.
- Merge queda fuera de agentes v1.
- `.factory/` registra planes y approvals.

## Riesgos

- Si los agentes hacen commit sin approval, pueden fijar cambios incompletos.
- Si no pueden commitear nunca, el usuario debe hacer mas trabajo manual.
- Si push y PR se aprueban juntos sin revisar, se pierde control.
- Si merge lo hace un agente, se rompe el modelo de decision humana final.

## Artefactos a crear o actualizar

- `.gridwork/skills/git-branch-management/SKILL.md`
- `.gridwork/policies/git-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/templates/git-action-plan.md`
- `.gridwork/templates/pr-comment.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`

## Evidencia y notas

- Esta pregunta aterriza la parte Git/PR que quedo pendiente desde GQ-023.
- La recomendacion permite automatizacion controlada sin publicar ni mergear sin decision humana.
- Decision del usuario: permitir commits locales con aprobacion, pero separar push, PR y merge.
- Revision posterior: `git tag` y `git push origin <tag>` quedan permitidos solo para `gridwork-release-publisher`, con release plan, validacion y aprobacion humana explicita.
