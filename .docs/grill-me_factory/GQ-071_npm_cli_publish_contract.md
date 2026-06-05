# GQ-071 - Publicacion npm de la CLI `gridwork`

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-064, GQ-065, GQ-067, GQ-069 y GQ-070
- Pregunta origen: GQ-071
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli/`, paquete npm `gridwork`, tags `cli-v<version>`, GitHub Actions, `gridwork-release-publisher`, docs de release

## Pregunta

Como debe publicarse el paquete npm `gridwork` para que `npx gridwork init` este disponible sin mezclar la publicacion de la CLI con los releases de la fabrica?

## Por que importa

Gridwork tiene dos piezas versionadas:

```text
CLI npm = instala y valida
factory release = contiene la fabrica descargable
```

Ya se decidio que la fabrica se publica como asset `gridwork-factory-v<version>.zip` en releases `factory-v<version>`.

Pero para que el usuario pueda ejecutar:

```bash
npx gridwork init
```

tambien hay que publicar el paquete npm `gridwork`. Esa publicacion debe tener reglas claras para no mezclar:

- version de CLI;
- version de fabrica;
- tags de CLI;
- tags de fabrica;
- secretos npm;
- GitHub Actions;
- approvals humanos.

## Opciones

### Opcion A - Publicacion manual local

El mantenedor corre desde su maquina:

```bash
npm publish
```

Ventajas:

- simple al inicio;
- no requiere workflow de GitHub Actions;
- menos infraestructura.

Desventajas:

- requiere token npm local;
- menor trazabilidad;
- mas facil publicar desde una rama o commit incorrecto;
- mas dificil repetir el proceso;
- no aprovecha checks automatizados.

### Opcion B - Publicacion automatica por tag

Al crear un tag:

```text
cli-v0.1.0
```

GitHub Actions publica automaticamente el paquete npm.

Ventajas:

- trazabilidad fuerte;
- reproducible;
- evita tokens npm locales;
- puede correr tests antes de publicar;
- puede usar provenance de npm.

Desventajas:

- requiere configurar secrets o trusted publishing;
- un tag creado por error podria publicar;
- hay que cuidar bien gates y permisos.

### Opcion C - Modelo hibrido con plan, approval y workflow

`gridwork-release-publisher` prepara el release plan de CLI, valida y propone comandos. La publicacion real ocurre por GitHub Actions, pero solo despues de aprobacion humana.

Flujo:

```text
release plan -> validation -> approval -> tag cli-v<version> -> GitHub Actions -> npm publish
```

Ventajas:

- mantiene trazabilidad;
- evita npm tokens locales;
- reduce riesgo de publicar accidentalmente;
- separa CLI y fabrica;
- encaja con el modelo de approvals ya aceptado;
- permite que la skill prepare todo sin publicar por sorpresa.

Desventajas:

- mas piezas que publicacion manual;
- requiere un workflow de GitHub Actions;
- hay que definir bien el gate antes de crear tag.

## Respuesta recomendada

Usar Opcion C:

```text
release plan local + approval humano + tag cli-v<version> + GitHub Actions publica a npm
```

La skill `gridwork-release-publisher` puede preparar releases de fabrica y releases de CLI, pero debe distinguir modos:

```text
mode = factory-release
mode = cli-release
```

En modo CLI, la skill prepara:

- plan de release CLI;
- validacion de version;
- changelog/release notes;
- verificacion de package metadata;
- plan de tag `cli-v<version>`;
- plan de workflow npm publish;
- comandos propuestos.

No publica sin approval.

## Reglas de versionado

La version de CLI vive en:

```text
packages/cli/package.json
```

El tag de CLI usa:

```text
cli-v<version>
```

Ejemplo:

```text
packages/cli/package.json -> 0.1.0
tag -> cli-v0.1.0
```

La version de fabrica vive en:

```text
factory/.gridwork/factory.json
```

El tag de fabrica usa:

```text
factory-v<version>
```

Las versiones pueden avanzar de forma independiente.

## Reglas de publicacion npm

Antes de publicar, debe validarse:

- `packages/cli/package.json` existe;
- package name es `gridwork` o fallback aprobado `@<scope>/gridwork`;
- bin name es `gridwork`;
- version SemVer valida;
- tag esperado es `cli-v<package.version>`;
- no existe ya ese tag;
- no existe ya esa version en npm;
- si la version es prerelease, no se publica con dist-tag `latest`;
- si la version es prerelease, usa dist-tag explicito `next`;
- build de TypeScript pasa;
- tests de CLI pasan;
- `npm pack --dry-run` no incluye archivos indebidos;
- no hay postinstall scripts;
- no hay secretos;
- package no incluye `factory/.gridwork/` por accidente;
- package no incluye `.factory/`;
- package no incluye `.docs/`;
- CLI conserva `init` como unico comando operativo v1.
- `DEFAULT_FACTORY_SOURCE` no sigue como placeholder.

## GitHub Actions

Recomendacion: crear un workflow de publicacion para la CLI:

```text
.github/workflows/publish-cli.yml
```

Debe dispararse solo con tags:

```text
cli-v*
```

Debe:

- hacer checkout;
- instalar dependencias del workspace;
- compilar CLI;
- correr tests;
- ejecutar `npm pack --dry-run`;
- publicar a npm si todo pasa.

Debe usar npm trusted publishing/provenance si esta disponible. Si no esta disponible, el release plan debe registrar el motivo y mantener `npm publish` limitado a GitHub Actions.

## Separacion con factory release

Un release de CLI no debe publicar la fabrica.

Un release de fabrica no debe publicar npm.

```text
cli-v0.1.0 -> npm package
factory-v1.0.0 -> factory bundle assets
```

La CLI publicada puede instalar la ultima fabrica compatible, segun GQ-069 y GQ-070.

## Approval gates

Requiere approval para:

- cambiar version de `packages/cli/package.json`;
- crear tag `cli-v<version>`;
- hacer push del tag;
- crear o modificar workflow npm publish;
- publicar manualmente a npm;
- cambiar package name;
- cambiar source oficial embebido;
- cambiar rangos de compatibilidad aceptados.

## Reportes

`gridwork-release-publisher` debe generar:

```text
.factory/runs/<run-id>/artifacts/release/
  cli-release-plan.md
  cli-release-validation.json
  cli-npm-pack-report.md
  cli-release-notes.md
```

El reporte debe indicar:

- version actual;
- proxima version;
- tag;
- checks ejecutados;
- archivos incluidos por `npm pack`;
- riesgos;
- approval requerido;
- comandos propuestos;
- resultado de publish, si se ejecuto.

## Propuesta inicial

```text
cli_publish_model = github_actions_after_approved_tag
cli_release_tag_prefix = cli-v
cli_package_name_preferred = gridwork
cli_package_name_fallback_allowed = true
cli_package_name_fallback = @<scope>/gridwork
cli_bin_name = gridwork
cli_package_source_path = packages/cli/
cli_factory_versions_independent = true
gridwork_release_publisher_supports_cli_release_mode = true
gridwork_release_publisher_cli_default_mode = plan_and_prepare
gridwork_release_publisher_cli_can_create_tag = true_with_approval
gridwork_release_publisher_cli_can_push_tag = true_with_approval
gridwork_release_publisher_cli_can_publish_npm = false
github_actions_cli_publish_enabled = true
github_actions_cli_publish_tag_pattern = cli-v*
github_actions_cli_publish_uses_provenance_when_available = true
npm_cli_prerelease_allowed_with_next_dist_tag = true
npm_cli_prerelease_default_v1 = false
cli_publish_requires_tests = true
cli_publish_requires_npm_pack_dry_run = true
cli_publish_rejects_postinstall_scripts = true
cli_publish_rejects_factory_bundle_inside_package = true
cli_publish_rejects_runtime_factory_inside_package = true
cli_publish_blocks_default_source_placeholder = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres publicar la CLI `gridwork` manualmente con `npm publish`,
o usar un modelo hibrido donde la skill prepara el release y GitHub Actions
publica a npm despues de un tag `cli-v<version>` aprobado?
```

Mi recomendacion: modelo hibrido. La skill prepara y valida; el humano aprueba; el tag `cli-v<version>` dispara GitHub Actions; GitHub Actions publica a npm. La fabrica sigue publicandose por releases `factory-v<version>`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- publicar la CLI con modelo hibrido;
- `gridwork-release-publisher` prepara y valida el release de CLI;
- el humano aprueba antes de crear/push tag;
- el tag `cli-v<version>` dispara GitHub Actions;
- GitHub Actions publica el paquete npm `gridwork`;
- la skill no publica npm directamente;
- los releases de CLI y fabrica deben mantenerse separados.

## Decision registrada

```text
cli_publish_model = github_actions_after_approved_tag
cli_release_tag_prefix = cli-v
cli_package_name_preferred = gridwork
cli_package_name_fallback_allowed = true
cli_package_name_fallback = @<scope>/gridwork
cli_bin_name = gridwork
cli_package_source_path = packages/cli/
cli_factory_versions_independent = true
gridwork_release_publisher_supports_cli_release_mode = true
gridwork_release_publisher_cli_default_mode = plan_and_prepare
gridwork_release_publisher_cli_can_create_tag = true_with_approval
gridwork_release_publisher_cli_can_push_tag = true_with_approval
gridwork_release_publisher_cli_can_publish_npm = false
github_actions_cli_publish_enabled = true
github_actions_cli_publish_tag_pattern = cli-v*
github_actions_cli_publish_uses_provenance_when_available = true
npm_cli_prerelease_allowed_with_next_dist_tag = true
npm_cli_prerelease_default_v1 = false
cli_publish_requires_tests = true
cli_publish_requires_npm_pack_dry_run = true
cli_publish_rejects_postinstall_scripts = true
cli_publish_rejects_factory_bundle_inside_package = true
cli_publish_rejects_runtime_factory_inside_package = true
cli_publish_blocks_default_source_placeholder = true
```

## Regla

```text
La CLI se publica por npm.
La fabrica se publica por GitHub Release.
`cli-v<version>` publica CLI.
`factory-v<version>` publica fabrica.
La skill prepara y valida; no publica npm directamente.
GitHub Actions publica npm despues de un tag aprobado.
La publicacion de CLI se bloquea si `DEFAULT_FACTORY_SOURCE` sigue como placeholder.
Una CLI prerelease no se publica como npm `latest`; si se usa, debe ir con dist-tag `next`.
```

## Supuestos

- El paquete npm preferido es `gridwork`; si no esta disponible, se permite fallback scoped `@<scope>/gridwork`.
- El repositorio fuente sera monorepo.
- GitHub sera el sistema de release inicial.
- La CLI no debe incluir el bundle de fabrica dentro del paquete npm.
- El usuario quiere evitar dependencias innecesarias para quien instala Gridwork.

## Riesgos

- Publicar manualmente puede perder trazabilidad.
- Publicar automaticamente sin approval puede subir una CLI incorrecta.
- Mezclar release de CLI con release de fabrica puede confundir versiones.
- Incluir accidentalmente la fabrica o `.factory/` en npm puede inflar el paquete o filtrar datos.
- Un workflow mal configurado puede publicar desde tags incorrectos.

## Artefactos a crear o actualizar

- `packages/cli/package.json`
- `packages/cli/src/cli.ts`
- `.github/workflows/publish-cli.yml`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `.gridwork/templates/cli-release-plan.md`
- `.gridwork/templates/cli-release-notes.md`
- `.gridwork/templates/cli-npm-pack-report.md`
- `docs/RELEASE_PROCESS.md`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta completa el circuito de distribucion: npm para CLI, GitHub Release para fabrica.
- Complementa GQ-067: tags de CLI y fabrica separados.
- Complementa GQ-070: la CLI publicada solo instala fabricas compatibles.
- Decision del usuario: aceptar modelo hibrido con plan local, approval, tag `cli-v<version>` y publicacion npm por GitHub Actions.
- Revision posterior GQ-078: `publish-cli.yml` debe usar npm provenance/trusted publishing cuando este disponible; publicacion local manual no es default.
- Revision posterior GQ-079: `gridwork` es package name preferido, pero se permite fallback scoped `@<scope>/gridwork`; el bin sigue siendo `gridwork`.
- Revision posterior GQ-080: `publish-cli.yml` y el release plan de CLI deben bloquearse si `DEFAULT_FACTORY_SOURCE` sigue como placeholder.
- Revision posterior GQ-082: las CLI prerelease quedan permitidas solo como capacidad controlada con dist-tag `next`, no como flujo normal v1 ni como `latest`.
