# GQ-023 - Ramas, PRs y ciclo de merge

- Estado: accepted
- Fuente: requisitos iniciales sobre GitHub, develop, PRs, CI/CD y ramas por dominio
- Pregunta origen: GQ-023
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/git-policy.md`, `.gridwork/policies/github-cli-policy.md`, workflows de implementacion y verificacion

## Pregunta

Como debe Gridwork organizar ramas, PRs y merges hacia `develop` cuando los agentes trabajan con issues, work orders y verificacion?

## Por que importa

El usuario quiere que las issues sean vertical slices y que el implementer trabaje AFK con TDD. Despues, el verifier revisa antes de decidir si se sube a `develop`.

Sin una politica clara de ramas y PRs:

- un agente podria modificar la rama equivocada;
- se puede mezclar trabajo de varios dominios;
- la verificacion pierde una frontera clara;
- CI/CD no sabe que rama validar;
- `develop` puede recibir cambios no revisados.

## Respuesta recomendada

Usar un modelo simple:

```text
main       = rama estable/produccion
develop    = rama de integracion
feature/*  = ramas de trabajo por issue o vertical slice
```

Para v1, cada work order AFK debe trabajar en una rama de feature asociada a una issue:

```text
feature/<domain-or-context>/<issue-number>-<short-slug>
```

Ejemplos:

```text
feature/auth/12-login-flow
feature/billing/24-create-invoice
feature/catalog/31-product-search
```

## Ciclo recomendado

```text
Issue aprobada
  -> Orchestrator crea/valida work order
  -> Implementer trabaja en feature branch
  -> Implementer deja evidencia local en .factory/
  -> Verifier revisa cambios contra work order e issue
  -> Si aprueba, se puede crear PR hacia develop
  -> CI valida PR
  -> Usuario decide merge
```

## Reglas recomendadas para agentes

El `implementer-agent` puede:

- leer la issue;
- crear o usar la rama de feature si esta permitido;
- modificar archivos dentro del path scope;
- ejecutar tests permitidos;
- preparar resumen de PR.

El `implementer-agent` no puede en v1:

- hacer merge;
- hacer push sin aprobacion;
- crear PR sin aprobacion;
- modificar `main` o `develop` directamente;
- cerrar issues;
- cambiar protecciones de rama.

El `verifier-agent` puede:

- revisar diff local o PR;
- revisar evidencia de tests;
- verificar cumplimiento del work order;
- recomendar aprobar, pedir cambios o bloquear.

El `verifier-agent` no puede en v1:

- hacer merge;
- hacer deploy;
- aprobar formalmente una PR en GitHub sin aprobacion humana;
- corregir codigo directamente, salvo que se cree una nueva tarea para el implementer.

## Relacion con GitHub CLI

Las acciones read-only de `gh` pueden ser permitidas:

```text
gh issue view
gh issue list
gh pr view
gh pr diff
gh pr checks
```

Las acciones con side effects requieren gate:

```text
gh pr create
gh pr comment
gh issue edit
gh issue close
gh pr merge
git push
```

## Decision propuesta

```text
branching_model_v1 = main_develop_feature
integration_branch = develop
stable_branch = main
feature_branch_pattern = feature/<domain>/<issue-number>-<slug>
afk_work_requires_feature_branch = true
implementer_can_modify_develop_directly = false
implementer_can_push_without_approval = false
implementer_can_create_pr_without_approval = false
verifier_can_merge = false
user_owns_merge_decision = true
ci_target_branch = develop
```

## Pregunta para decidir

Mi recomendacion es usar el modelo anterior.

La duda principal:

```text
Quieres que Gridwork use siempre `develop` como rama de integracion,
o prefieres que el orquestador detecte la rama base del repo y pregunte si no existe `develop`?
```

## Respuesta del usuario

El usuario elige la opcion A:

- Gridwork debe asumir siempre `develop` como rama de integracion.
- Si es necesario, mas adelante se pueden crear skills especificas para trabajar con ramas del repositorio.
- El diseno detallado de esas skills queda diferido porque es mas concreto.

## Decision registrada

```text
branching_model_v1 = main_develop_feature
stable_branch = main
integration_branch = develop
feature_branch_pattern = feature/<domain>/<issue-number>-<slug>
develop_required_v1 = true
fallback_to_main_when_develop_missing = false
afk_work_requires_feature_branch = true
implementer_can_modify_develop_directly = false
implementer_can_push_without_approval = false
implementer_can_create_pr_without_approval = false
verifier_can_merge = false
user_owns_merge_decision = true
ci_target_branch = develop
skill_git_branch_management_candidate = true
skill_git_branch_management_deferred = true
```

## Regla

```text
main es estable.
develop es integracion.
feature/* es trabajo por issue o vertical slice.
Los agentes no trabajan directo sobre main ni develop.
Si develop no existe, el run se bloquea hasta resolver setup/aprobacion.
```

## Supuestos

- El repo usa GitHub.
- El usuario quiere GitHub CLI como herramienta gobernada.
- CI/CD via GitHub Actions se puede activar sobre PRs hacia `develop`.
- Los agentes no hacen merge en v1.
- `develop` es requisito del modelo v1.

## Riesgos

- Si se exige `develop` y el repo no la tiene, el setup inicial puede sentirse rigido.
- Si se detecta rama base automaticamente, puede haber ambiguedad entre `main`, `master`, `develop` u otras.
- Si los agentes pueden hacer push o PR sin aprobacion, hay side effects externos.
- Si varias issues comparten rama, se pierde trazabilidad por vertical slice.

## Artefactos a crear o actualizar

- `.gridwork/policies/git-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`
- `.gridwork/skills/github-issue-discovery/`
- `.gridwork/skills/git-branch-management/` (candidata diferida)
- `.gridwork/skills/handoff/`
- `.gridwork/skills/github-actions-cicd/`

## Evidencia y notas

- Esta pregunta conecta issues verticales, ramas por dominio, verificacion de PR y CI/CD.
- Mantiene la regla de GQ-022: push, PR creation y merge son side effects y requieren aprobacion.
- Decision del usuario: usar siempre `develop` como rama de integracion en v1.
- Nota del usuario: skills para trabajar con ramas pueden crearse mas adelante.
