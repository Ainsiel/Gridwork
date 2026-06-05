# GQ-057 - Skill `github-actions-cicd`

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-012, GQ-022, GQ-023, GQ-035, GQ-046, GQ-047 y GQ-056
- Pregunta origen: GQ-057
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/github-actions-cicd/`, `.github/workflows/`, `.factory/runs/<run-id>/artifacts/cicd/`

## Pregunta

Como debe funcionar la skill `github-actions-cicd` para ayudar a crear o modificar pipelines de GitHub Actions?

## Por que importa

El usuario aclaro que CI/CD release no sera un workflow usado por agentes. Sera un archivo YAML de GitHub Actions, y puede existir una skill que ayude a crear pipelines.

Esto implica que `github-actions-cicd` no debe desplegar ni publicar por si misma. Debe ayudar a disenar, generar y revisar YAML de GitHub Actions con control de riesgos.

## Respuesta recomendada

Tratar `github-actions-cicd` como una skill de diseno y preparacion de pipelines:

```text
analizar repo
crear pipeline draft local
crear validation plan
pedir approval para escribir en .github/workflows
no ejecutar deploys automaticamente
```

La skill puede generar drafts locales en `.factory/` y, con aprobacion, escribir archivos en `.github/workflows/`.

## Modos recomendados

### `draft-only`

Modo por defecto.

Produce:

```text
.factory/runs/<run-id>/artifacts/cicd/
  github-actions-plan.md
  workflow-draft.yml
  validation-plan.md
```

No modifica `.github/workflows/`.

### `write-with-approval`

Con aprobacion humana, puede escribir:

```text
.github/workflows/<workflow-name>.yml
```

Debe registrar approval, archivos creados/modificados y resumen del cambio.

### `review-existing`

Revisa workflows existentes:

```text
.github/workflows/*.yml
```

Puede detectar:

- triggers riesgosos;
- deploys automaticos;
- secretos mal referenciados;
- falta de tests;
- falta de branch protection assumptions;
- jobs demasiado acoplados al stack.

## Reglas de seguridad

La skill no debe:

- ejecutar deploys;
- crear secretos;
- leer valores de secretos;
- publicar releases;
- hacer push;
- hacer merge;
- modificar branch protection;
- activar workflows remotos manualmente;
- usar comandos fuera de allowlist.

Debe tratar `.github/workflows/` como path scope sensible.

## Pipeline recomendado para el stack v1

Para Next.js + Spring Boot + PostgreSQL, puede proponer jobs como:

```text
frontend_lint
frontend_test
backend_test
backend_verify
database_migration_check
docker_compose_config_check
```

Debe basarse en:

```text
.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
.gridwork/stack-packs/nextjs-springboot-postgresql/policies/quality-commands.json
```

Si los comandos reales del repo no estan confirmados, debe dejar placeholders o pedir confirmacion.

## Deploy

Deploy debe ser opcional y estar deshabilitado por defecto.

Si se disena un job de deploy:

```text
deploy_enabled_by_default = false
deploy_requires_manual_environment_approval = true
deploy_requires_user_confirmation = true
```

En v1, la skill puede documentar un deploy job, pero no debe configurarlo como ejecucion automatica sin aprobacion explicita.

## Approval gates

Requiere approval si:

- escribe en `.github/workflows/`;
- agrega o cambia triggers;
- agrega jobs de deploy;
- cambia permisos del workflow;
- referencia secrets;
- modifica matrices grandes;
- cambia ramas objetivo;
- agrega acciones externas nuevas.

## Propuesta inicial

```text
github_actions_cicd_skill_mode_default = draft-only
github_actions_cicd_can_write_workflow_files = true_with_approval
github_actions_cicd_can_execute_workflows = false
github_actions_cicd_can_deploy = false
github_actions_cicd_can_create_secrets = false
github_actions_cicd_outputs_local_drafts = true
github_actions_cicd_draft_path = .factory/runs/<run-id>/artifacts/cicd/
github_actions_cicd_write_path = .github/workflows/
github_actions_cicd_uses_stack_pack_commands = true
github_actions_cicd_deploy_disabled_by_default = true
github_actions_cicd_requires_approval_for_workflow_write = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `github-actions-cicd` solo genere drafts locales,
o que tambien pueda escribir archivos en `.github/workflows/` con aprobacion?
```

Mi recomendacion: permitir que escriba archivos en `.github/workflows/` solo con aprobacion. El modo por defecto debe ser draft local, y deploy debe quedar deshabilitado por defecto.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `github-actions-cicd` debe funcionar en modo `draft-only` por defecto.
- La skill puede escribir archivos en `.github/workflows/` solo con aprobacion humana.
- La skill no debe ejecutar workflows, deploys, releases, push, merge ni crear secrets.
- Deploy queda deshabilitado por defecto.
- La skill debe generar primero un plan local y un draft validable.

## Decision registrada

```text
github_actions_cicd_skill_mode_default = draft-only
github_actions_cicd_can_write_workflow_files = true_with_approval
github_actions_cicd_can_execute_workflows = false
github_actions_cicd_can_deploy = false
github_actions_cicd_can_create_secrets = false
github_actions_cicd_outputs_local_drafts = true
github_actions_cicd_draft_path = .factory/runs/<run-id>/artifacts/cicd/
github_actions_cicd_write_path = .github/workflows/
github_actions_cicd_uses_stack_pack_commands = true
github_actions_cicd_deploy_disabled_by_default = true
github_actions_cicd_requires_approval_for_workflow_write = true
```

## Regla

```text
CI/CD no es un workflow de agentes.
`github-actions-cicd` es una skill de diseno, generacion y revision de YAML.
El output seguro por defecto es local.
Escribir en `.github/workflows/` requiere approval.
Deploy queda fuera de ejecucion automatica en v1.
```

## Supuestos

- CI/CD no es workflow de agentes.
- GitHub Actions se configura con YAML.
- El stack pack aporta comandos como guidance.
- `.github/workflows/` es una zona sensible.
- Despliegue es opcional.

## Riesgos

- Solo drafts locales puede ser seguro, pero deja mas trabajo manual.
- Escribir workflows sin approval puede romper CI o activar ejecuciones no deseadas.
- Deploy automatico por defecto puede ser peligroso.
- Usar comandos no confirmados puede crear pipelines que fallan siempre.

## Artefactos a crear o actualizar

- `.gridwork/skills/github-actions-cicd/SKILL.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/tool-allowlist.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/templates/github-actions-plan.md`
- `.gridwork/templates/github-actions-workflow.yml`
- `.gridwork/templates/cicd-validation-plan.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/quality-commands.json`

## Evidencia y notas

- Esta pregunta mantiene CI/CD fuera de los workflows de agentes, pero dentro de las skills utiles de la fabrica.
- La recomendacion permite utilidad real sin activar despliegues ni escrituras remotas por accidente.
- Decision del usuario: aceptar modo `draft-only` por defecto y escritura aprobada en `.github/workflows/`.
