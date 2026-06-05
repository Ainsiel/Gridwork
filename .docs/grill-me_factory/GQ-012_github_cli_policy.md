# GQ-012 - Gobierno de GitHub CLI (`gh`)

- Estado: accepted
- Fuente: decision aceptada en GQ-011
- Pregunta origen: GQ-012
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/github-cli-policy.md`

## Pregunta

Como debe Gridwork usar GitHub CLI (`gh`) en workflows y skills sin perder control de permisos, trazabilidad y side effects?

## Por que importa

El usuario planea usar GitHub CLI para flujos relacionados con issues, PRs y probablemente CI/CD. `gh` permite leer informacion, pero tambien crear issues, comentar, cambiar labels, crear PRs, hacer merge y ejecutar acciones con side effects externos.

Si Gridwork usa `gh` como shell libre, rompe la gobernanza.

## Respuesta recomendada

Tratar `gh` como una herramienta gobernada con allowlist por accion.

Clasificar comandos en tres grupos:

```text
read_only
write_with_dry_run
blocked_or_human_gate
```

## Comandos read-only recomendados

Estos pueden ejecutarse con menor friccion y registrando logs:

```bash
gh issue view
gh issue list
gh pr view
gh pr list
gh repo view
gh run list
gh run view
```

## Comandos con dry-run/aprobacion

Estos preparan payload, muestran resultado esperado y piden aprobacion:

```bash
gh issue create
gh issue edit
gh issue comment
gh pr create
gh pr comment
gh pr edit
```

## Comandos bloqueados o con gate fuerte

Estos no deberian ejecutarse automaticamente en v1:

```bash
gh pr merge
gh release create
gh workflow run
gh secret set
gh repo delete
```

## Regla de trazabilidad

Cada uso de `gh` debe registrarse en:

```text
.factory/runs/<run_id>/tool_calls.jsonl
```

Con:

- comando;
- argumentos sanitizados;
- agente;
- workflow;
- skill;
- issue/PR afectada;
- dry-run o ejecucion real;
- resultado;
- evidencia;
- aprobacion humana si aplica.

## Respuesta del usuario

El usuario acepta la recomendacion:

- GitHub CLI (`gh`) sera una herramienta gobernada.
- Los comandos se clasificaran por nivel de riesgo.
- Los comandos read-only podran usarse con registro.
- Los comandos que escriben en GitHub requeriran dry-run y/o aprobacion.
- Comandos sensibles como merge, release, workflow run o secrets tendran gate fuerte o bloqueo en v1.

## Decision registrada

Decision aceptada:

```text
github_cli_tool = governed
github_cli_policy = allowlist_by_risk
github_cli_read_only_allowed_with_logging = true
github_cli_write_requires_dry_run_or_approval = true
github_cli_sensitive_commands_blocked_or_human_gate = true
```

Regla:

```text
GitHub CLI es herramienta, no workflow.
El orquestador valida cada comando gh contra policy.
Todo uso de gh queda registrado en tool_calls.jsonl.
```

## Supuestos

- GitHub sera el issue tracker inicial.
- `gh` estara instalado o el usuario lo instalara manualmente.
- Gridwork no guardara tokens de GitHub en el repo.
- Las credenciales de `gh` viven fuera de Gridwork.

## Riesgos

- `gh` puede crear side effects externos si no se gobierna.
- `gh` depende de autenticacion local.
- Comandos como merge, release, secrets o workflow run requieren gates fuertes.
- Si no se registran tool calls, se pierde auditoria.

## Preguntas abiertas

- Que milestones puede usar `github-issue-publisher` al crear issues?
- Que formato debe tener el comentario de PR generado por `verification-pr`?
- `gh pr merge` queda bloqueado siempre en v1?

## Artefactos a crear o actualizar

- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/github-labels.json`
- `.gridwork/schemas/tool-call.schema.json`
- `.gridwork/skills/backlog-planning/`
- `.gridwork/skills/github-issue-publisher/`
- `.gridwork/skills/github-actions-cicd/`
- `.gridwork/workflows/verification-pr/`
- `docs/GITHUB_WORKFLOW.md`

## Evidencia y notas

- GitHub CLI es una herramienta, no un workflow.
- El orquestador debe validar cada uso de `gh` contra policy.
- Esta decision conecta backlog planning, verification PR y GitHub Actions.
- Revision posterior: crear issues reales en GitHub se hara mediante `github-issue-publisher`, con `gh issue create` y aprobacion humana.
- Revision posterior: `github-issue-publisher` solo debe usar labels predefinidas en `.gridwork/policies/github-labels.json`.
- Revision posterior: `verification-pr` puede publicar comentarios en PR con `gh pr comment`, despues de aprobacion humana y con reporte local obligatorio.
- Revision posterior: `gh release create` queda permitido solo para `gridwork-release-publisher`, con plan local, validacion, hash del bundle y aprobacion humana explicita.
- Revision posterior GQ-083: `gridwork init` no requiere `gh` ni `gh auth status`; usa acceso HTTP/fetch propio y tokens opcionales por entorno solo para GitHub Releases.
