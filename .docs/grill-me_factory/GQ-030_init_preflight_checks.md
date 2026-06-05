# GQ-030 - Preflight checks de `npx gridwork init`

- Estado: accepted
- Fuente: decisiones GQ-028 y GQ-029 sobre instalacion completa e init idempotente
- Pregunta origen: GQ-030
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, `.factory/init/<init-run-id>/init-report.md`

## Pregunta

Que validaciones debe hacer `npx gridwork init` al instalar o revisar Gridwork en un repo?

## Por que importa

`init` es el unico comando CLI de v1. Aunque no ejecuta workflows ni agentes, puede ayudar a detectar problemas tempranos:

- el repo no tiene Git;
- falta `.gitignore`;
- falta rama `develop`;
- falta GitHub CLI;
- `.factory/` no esta ignorado;
- `.gridwork/factory.json` esta roto;
- faltan archivos base.

Pero si `init` valida demasiado y bloquea por herramientas externas, contradice la idea de una fabrica portable y sin dependencias externas fuertes.

## Respuesta recomendada

Separar checks en dos categorias:

```text
blocking_checks = validaciones necesarias para instalar la fabrica
warning_checks = validaciones utiles para operar workflows futuros
```

## Checks bloqueantes recomendados

Estos deberian bloquear o fallar la instalacion:

- no se puede escribir en el directorio actual;
- `.gridwork/` existe pero no se puede leer;
- `.factory/` no puede crearse o actualizarse;
- `.gitignore` no puede actualizarse cuando `.factory/` no esta ignorado;
- `factory.json` existente es invalido y no se puede preservar/reparar;
- hay conflicto de archivos y no se puede guardar reporte en `.factory/init/`.

## Checks de advertencia recomendados

Estos no deberian bloquear `init`; solo dejar warnings en consola y en `init-report.md`:

- el directorio no parece un repo Git;
- no existe rama `develop`;
- no esta instalado `gh`;
- `gh auth status` no esta autenticado;
- no existe remoto GitHub;
- faltan ramas `main` o `develop`;
- no existe `.github/workflows/`;
- el proyecto no tiene frontend/backend/database detectables.

## Regla

```text
init instala la fabrica aunque falten herramientas operativas.
init advierte sobre precondiciones para workflows futuros.
Los workflows/agentes aplican gates cuando esas condiciones importan.
```

## Reporte

`init` debe registrar preflight en:

```text
.factory/init/<init-run-id>/init-report.md
.factory/init/<init-run-id>/preflight.json
```

Ejemplo:

```json
{
  "checks": [
    {
      "id": "git_repo_detected",
      "status": "warning",
      "message": "No se detecto repositorio Git."
    },
    {
      "id": "factory_gitignored",
      "status": "passed",
      "message": ".factory/ esta en .gitignore."
    }
  ]
}
```

## Propuesta inicial

```text
init_preflight_enabled = true
init_preflight_blocks_only_installation_critical_errors = true
init_preflight_warns_for_operational_missing_tools = true
init_does_not_require_gh_installed = true
init_does_not_require_gh_auth = true
init_warns_if_develop_missing = true
init_warns_if_not_git_repo = true
init_report_path = .factory/init/<init-run-id>/
```

## Pregunta para decidir

La duda clave:

```text
Si el repo no tiene rama `develop`, quieres que init bloquee,
o que solo advierta porque `develop` sera necesario cuando se use un workflow con Git?
```

Mi recomendacion: solo advertir en `init`. Bloquear mas tarde, cuando un workflow de Git/PR/AFK realmente necesite `develop`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe ejecutar preflight checks.
- `init` solo debe bloquear por errores criticos de instalacion.
- Si falta `develop`, `init` debe advertir, no bloquear.
- Si falta `gh`, autenticacion de `gh`, repo Git o remoto GitHub, `init` debe advertir.
- Los workflows/agentes deben convertir esas precondiciones en gates cuando realmente las necesiten.

## Decision registrada

```text
init_preflight_enabled = true
init_preflight_blocks_only_installation_critical_errors = true
init_preflight_warns_for_operational_missing_tools = true
init_does_not_require_gh_installed = true
init_does_not_require_gh_auth = true
init_warns_if_develop_missing = true
init_warns_if_not_git_repo = true
init_warns_if_github_remote_missing = true
init_warns_if_github_actions_missing = true
init_report_path = .factory/init/<init-run-id>/
workflow_blocks_later_when_required_precondition_missing = true
```

## Regla

```text
init instala y advierte.
workflows ejecutan y bloquean cuando la precondicion sea necesaria.
```

## Supuestos

- `develop` es obligatorio para el modelo de ramas v1.
- `gh` se usa en skills, no durante la instalacion basica.
- `init` no debe exigir dependencias externas para instalar archivos.
- Los agentes/workflows aplican gates cuando operan.

## Riesgos

- Si `init` solo advierte, el usuario puede olvidar resolver precondiciones.
- Si `init` bloquea demasiado, instalar Gridwork se vuelve friccionante.
- Si no hay reporte de preflight, los warnings se pierden.

## Artefactos a crear o actualizar

- `.factory/init/<init-run-id>/init-report.md`
- `.factory/init/<init-run-id>/preflight.json`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta mantiene `init` portable y no destructivo.
- Diferencia instalacion de operacion: faltas operativas se advierten, no necesariamente bloquean la instalacion.
- Decision del usuario: usar la recomendacion; `develop` faltante es warning en init, gate cuando un workflow lo necesite.
