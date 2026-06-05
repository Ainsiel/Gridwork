# GQ-073 - CI del repositorio fuente de Gridwork

- Estado: accepted
- Fuente: decisiones GQ-062, GQ-065, GQ-067, GQ-068, GQ-070, GQ-071 y GQ-072
- Pregunta origen: GQ-073
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.github/workflows/ci.yml`, `packages/cli/`, `factory/.gridwork/`, release publisher, bundle manifest, npm package

## Pregunta

Que debe validar el CI del repositorio fuente de Gridwork antes de permitir releases de CLI o fabrica?

## Por que importa

Gridwork ahora tiene dos tipos de publicacion:

```text
CLI npm -> tag cli-v<version>
fabrica bundle -> tag factory-v<version>
```

Tambien tiene dos areas fuente:

```text
packages/cli/
factory/.gridwork/
```

El CI debe proteger ambas sin confundirse con workflows que usan los agentes en proyectos destino. Este CI es del producto Gridwork, no del software que Gridwork ayudara a crear.

## Diferencia importante

No es lo mismo:

```text
.github/workflows/ci.yml del repo Gridwork
```

que:

```text
.gridwork/skills/github-actions-cicd/
```

El primero valida y publica Gridwork.

El segundo ayuda a crear pipelines CI/CD para proyectos donde Gridwork fue instalado.

## Opciones

### Opcion A - CI minimo solo para CLI

Validar solo:

- install;
- build TypeScript;
- tests de CLI;
- npm pack dry-run.

Ventajas:

- rapido;
- simple;
- suficiente si la fabrica se revisa manualmente.

Desventajas:

- no valida manifests de fabrica;
- no detecta bundle roto;
- no protege schemas/templates;
- release de fabrica queda menos seguro.

### Opcion B - CI completo para CLI y fabrica

Validar:

- npm install limpio;
- build de CLI;
- tests de CLI;
- npm pack dry-run;
- no postinstall scripts;
- factory manifest validation;
- schemas parsean;
- agents/workflows/skills tienen contratos minimos;
- bundle dry-run;
- paths prohibidos;
- checksum/manifest dry-run;
- secret scan basico.

Ventajas:

- protege CLI y fabrica;
- reduce releases rotos;
- refuerza contratos aceptados;
- encaja con verificaciones de `init`;
- deja evidencia antes de publicar.

Desventajas:

- mas trabajo inicial;
- puede requerir utilidades internas para validar bundle;
- si los checks son demasiado estrictos, pueden frenar cambios validos.

### Opcion C - CI por etapas

Empezar con CI minimo y agregar validaciones de fabrica cuando existan los scripts.

Ventajas:

- permite avanzar rapido;
- evita bloquear por scripts que aun no existen;
- facilita iterar.

Desventajas:

- puede dejar una brecha temporal;
- requiere disciplina para no olvidarse de ampliar CI.

## Respuesta recomendada

Usar Opcion C, pero con contrato objetivo de Opcion B.

En v1, definir:

```text
ci_minimum_required = cli_build_test_pack + factory_manifest_validation
ci_target = cli_and_factory_full_validation
```

Es decir, empezar con checks implementables, pero documentar desde el principio el set completo que debe existir antes de publicar releases reales.

## Workflow recomendado

Crear:

```text
.github/workflows/ci.yml
```

Triggers:

```text
pull_request
push to main/develop
workflow_dispatch
```

No debe publicar npm ni GitHub Releases.

Publicacion queda en workflows separados:

```text
.github/workflows/publish-cli.yml
.github/workflows/publish-factory.yml (template u objetivo futuro en v1)
```

## Checks minimos v1

```text
npm ci
npm run build
npm test
npm pack -w packages/cli --dry-run
e2e init acceptance tests cuando exista la rebanada de `init`
```

Ademas:

- validar `packages/cli/package.json`;
- validar que root `package.json` sea `private: true`;
- validar que `packages/cli/package.json` tenga `bin.gridwork`;
- validar que no haya postinstall scripts;
- validar que el paquete CLI no incluya `.factory/`, `.docs/` ni `factory/.gridwork/`;
- validar que `factory/.gridwork/factory.json` exista;
- validar que schemas base existan;
- validar que manifests base parseen como JSON.

## Checks objetivo

Cuando existan utilidades internas, CI debe validar:

- `factory/.gridwork/factory.json`;
- `agent.json` de cada agente;
- `workflow.json` de cada workflow;
- `skill.json` de cada skill;
- `stack-pack.json` del stack pack default;
- schemas JSON;
- templates obligatorios;
- policies obligatorias;
- path scopes;
- tool allowlist;
- GitHub labels JSON;
- bundle dry-run desde `factory/.gridwork/`;
- `bundle-manifest.json` generado;
- `SHA256SUMS.txt` generado;
- zip no contiene paths prohibidos;
- zip contiene `.gridwork/factory.json`;
- secret scan basico para patterns conocidos;
- reportes de release pueden generarse.
- bloquear publish si `DEFAULT_FACTORY_SOURCE` sigue como placeholder.

## Publicacion de CLI

`publish-cli.yml` debe dispararse solo con:

```text
cli-v*
```

Debe ejecutar CI antes de publicar npm.

No debe tocar releases de fabrica.

## Publicacion de fabrica

`publish-factory.yml`, si existe como publicador activo futuro, debe dispararse solo con:

```text
factory-v*
```

Debe:

- construir bundle desde `factory/.gridwork/`;
- generar `bundle-manifest.json`;
- generar `SHA256SUMS.txt`;
- validar compatibilidad;
- subir assets de release.

No debe publicar npm.

En v1, segun GQ-081, `publish-factory.yml` no debe auto-publicar. Puede existir como template, dry-run u objetivo futuro.

El publicador autoritativo v1 de fabrica es `gridwork-release-publisher` con `gh release create` y approval explicita.

## Reportes

CI debe guardar artefactos cuando falle o cuando se ejecute por release:

```text
ci-report.md
cli-pack-report.md
factory-validation-report.md
bundle-dry-run-report.md
```

Estos reportes son artefactos de GitHub Actions, no necesariamente archivos versionados.

Los reportes locales de agentes siguen viviendo en:

```text
.factory/
```

## Approval gates

CI no aprueba cambios por si mismo.

CI puede:

- bloquear PR;
- bloquear publicacion;
- generar evidencia;
- fallar si detecta incompatibilidad.

No puede:

- mergear;
- publicar npm sin tag aprobado;
- crear GitHub Release sin approval;
- modificar archivos del repo.

## Propuesta inicial

```text
source_repo_ci_enabled = true
source_repo_ci_workflow = .github/workflows/ci.yml
source_repo_ci_triggers = pull_request,push_main_develop,workflow_dispatch
source_repo_ci_publish_allowed = false
source_repo_ci_uses_npm_ci = true
source_repo_ci_builds_cli = true
source_repo_ci_tests_cli = true
source_repo_ci_runs_npm_pack_dry_run = true
source_repo_ci_runs_init_e2e_acceptance_when_available = true
source_repo_ci_validates_cli_package_metadata = true
source_repo_ci_rejects_postinstall_scripts = true
source_repo_ci_validates_factory_manifest = true
source_repo_ci_validates_factory_schemas = true
source_repo_ci_validates_factory_manifests = true
source_repo_ci_bundle_dry_run_target = true
source_repo_ci_secret_scan_basic = true
source_repo_ci_blocks_default_source_placeholder = true
publish_cli_workflow_separate = true
publish_cli_tag_pattern = cli-v*
publish_factory_workflow_optional_v1 = true
publish_factory_workflow_template_allowed_v1 = true
publish_factory_workflow_auto_publish_enabled_v1 = false
publish_factory_tag_pattern = factory-v*
ci_reports_are_github_action_artifacts = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el CI del repo fuente valide solo la CLI al inicio,
o que desde v1 tenga contrato para validar CLI y fabrica,
aunque algunos checks de fabrica se implementen por etapas?
```

Mi recomendacion: contrato completo desde v1, implementacion por etapas. CI minimo inicial para CLI + manifests de fabrica, y objetivo declarado para bundle, schemas, paths prohibidos, checksums y secret scan.

## Respuesta del usuario

El usuario acepta la recomendacion:

- el CI del repositorio fuente debe tener contrato completo desde v1;
- la implementacion puede avanzar por etapas;
- el minimo inicial debe validar CLI y manifests de fabrica;
- el objetivo debe incluir bundle dry-run, schemas, paths prohibidos, checksums y secret scan;
- CI no debe publicar npm ni GitHub Releases;
- publicacion de CLI y fabrica debe vivir en workflows separados;
- la skill `github-actions-cicd` sigue siendo para proyectos destino, no para operar Gridwork.

## Decision registrada

```text
source_repo_ci_enabled = true
source_repo_ci_workflow = .github/workflows/ci.yml
source_repo_ci_triggers = pull_request,push_main_develop,workflow_dispatch
source_repo_ci_publish_allowed = false
source_repo_ci_uses_npm_ci = true
source_repo_ci_builds_cli = true
source_repo_ci_tests_cli = true
source_repo_ci_runs_npm_pack_dry_run = true
source_repo_ci_runs_init_e2e_acceptance_when_available = true
source_repo_ci_validates_cli_package_metadata = true
source_repo_ci_rejects_postinstall_scripts = true
source_repo_ci_validates_factory_manifest = true
source_repo_ci_validates_factory_schemas = true
source_repo_ci_validates_factory_manifests = true
source_repo_ci_bundle_dry_run_target = true
source_repo_ci_secret_scan_basic = true
source_repo_ci_blocks_default_source_placeholder = true
publish_cli_workflow_separate = true
publish_cli_tag_pattern = cli-v*
publish_factory_workflow_optional_v1 = true
publish_factory_workflow_template_allowed_v1 = true
publish_factory_workflow_auto_publish_enabled_v1 = false
publish_factory_tag_pattern = factory-v*
ci_reports_are_github_action_artifacts = true
```

## Regla

```text
CI valida Gridwork, no proyectos destino.
CI no publica.
`publish-cli.yml` publica npm solo con tags `cli-v*`.
En v1, `gridwork-release-publisher` publica fabrica solo con tags `factory-v*` y approval.
`publish-factory.yml` puede existir como template u objetivo futuro, pero no auto-publica en v1.
El contrato completo existe desde v1, aunque checks avanzados se implementen por etapas.
La rebanada de `init` debe pasar acceptance tests e2e antes de considerarse MVP.
```

## Supuestos

- El repo fuente de Gridwork sera monorepo npm.
- GitHub Actions sera usado para CI.
- Publicacion de CLI y fabrica se separa por tags distintos.
- La skill `github-actions-cicd` sigue siendo para proyectos destino, no para operar Gridwork.
- Los reportes de CI pueden vivir como artifacts de GitHub Actions.

## Riesgos

- CI demasiado grande puede frenar el arranque.
- CI demasiado minimo puede permitir releases rotos.
- Mezclar publish con CI puede publicar accidentalmente.
- No diferenciar CI fuente vs skill de CI/CD puede confundir responsabilidades.

## Artefactos a crear o actualizar

- `.github/workflows/ci.yml`
- `.github/workflows/publish-cli.yml`
- `.github/workflows/publish-factory.yml`
- `packages/cli/package.json`
- `packages/cli/src/validation/`
- `packages/cli/src/init/verify-bundle.ts`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `docs/RELEASE_PROCESS.md`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta separa CI del producto Gridwork de la skill `github-actions-cicd`.
- Complementa GQ-071: publish npm por workflow separado.
- Complementa GQ-068 y GQ-070: bundles y compatibilidad deben verificarse antes de publicar.
- Decision del usuario: aceptar CI con contrato completo desde v1 e implementacion por etapas.
- Revision posterior GQ-080: CI debe bloquear publish si `DEFAULT_FACTORY_SOURCE` sigue como placeholder.
- Revision posterior GQ-081: `publish-factory.yml` no auto-publica en v1; la fabrica se publica con `gridwork-release-publisher` y `gh release create` bajo aprobacion.
- Revision posterior GQ-085: CI puede implementarse por fases, pero cada fase del MVP debe tener checks suficientes para validar su rebanada vertical.
- Revision posterior GQ-086: cuando exista `init`, CI debe ejecutar acceptance tests e2e de new install, re-run, conflicto y bundle invalido.
