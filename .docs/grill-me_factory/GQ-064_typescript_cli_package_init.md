# GQ-064 - CLI TypeScript y paquete npm

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-003, GQ-028, GQ-029, GQ-030, GQ-062 y GQ-063
- Pregunta origen: GQ-064
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: paquete npm `gridwork`, `npx gridwork init`, repositorio/release de fabrica, `.gridwork/`, `.gridwork-lock.json`, `.factory/init/<init-run-id>/`

## Pregunta

Como debe estructurarse la CLI TypeScript y el paquete npm de Gridwork para que `npx gridwork init` instale la fabrica completa sin convertirse en un runtime de workflows?

## Por que importa

Ya se decidio que v1 solo tiene `init`. Eso significa que la CLI no orquesta agentes, no ejecuta workflows y no implementa codigo. Su trabajo es mas limitado, pero debe hacerlo muy bien:

```text
instalar bundle
preservar cambios existentes
actualizar .gitignore
hacer preflight
validar estructura
generar reportes locales
no generar codigo productivo
```

La decision importante es si el paquete npm debe traer todo el bundle de Gridwork embebido, o si `init` debe descargarlo desde un repositorio remoto versionado.

## Respuesta recomendada

Recomendacion ajustada despues de comparar con el modelo de skills de Matt Pocock:

```text
npm package = bootstrapper pequeno
github release/tag = fuente versionada de la fabrica
init descarga la fabrica desde release/tag
init verifica version/hash
init escribe lockfile
```

Esto se parece mas al modelo `npx skills@latest add mattpocock/skills`: `npx` ejecuta el instalador, pero el contenido instalado viene de una fuente versionada y trazable.

## Modelo recomendado de paquete

```text
gridwork/
  package.json
  tsconfig.json
  src/
    cli.ts
    commands/
      init.ts
    init/
      download-bundle.ts
      resolve-source.ts
      verify-bundle.ts
      extract-bundle.ts
      gitignore.ts
      preflight.ts
      validation.ts
      conflict-report.ts
      init-report.ts
      lockfile.ts
    validation/
      minimal-validator.ts
      references.ts
    utils/
      fs.ts
      paths.ts
      json.ts
      time.ts
  dist/
    cli.js
```

El usuario no tiene que ver esta estructura. Solo ejecuta:

```bash
npx gridwork init
```

## Comandos v1

Solo debe existir:

```text
gridwork init
```

Alias opcional:

```text
gridwork --help
gridwork --version
```

No deben existir en v1:

```text
gridwork run
gridwork implement
gridwork verify
gridwork stack add
gridwork agent add
gridwork github connect
```

## Responsabilidades de `init`

`init` debe:

- detectar directorio actual;
- crear `.gridwork/` si no existe;
- crear `.factory/` si no existe;
- resolver la fuente de la fabrica;
- descargar el bundle desde release/tag;
- verificar version/hash;
- extraer `.gridwork/`;
- escribir `.gridwork-lock.json`;
- no sobrescribir archivos modificados sin estrategia de conflicto;
- actualizar `.gitignore` para incluir `.factory/`;
- ejecutar preflight checks;
- ejecutar validador minimo;
- crear reporte local de instalacion;
- listar warnings y siguientes pasos;
- indicar donde esta el prompt del orquestador.

## No responsabilidades de `init`

`init` no debe:

- generar frontend;
- generar backend;
- generar database;
- generar Docker Compose;
- ejecutar workflows;
- activar agentes;
- crear issues;
- hacer commits;
- hacer push;
- conectarse a GitHub;
- leer secretos;
- instalar dependencias del proyecto.

## Bundle embebido vs descarga remota

### Opcion A - Bundle embebido en npm

El paquete trae todo:

```text
bundle/.gridwork/
```

Ventajas:

- instalacion reproducible;
- no requiere fetch extra;
- funciona mejor offline despues de que npx obtuvo el paquete;
- evita depender de GitHub remoto;
- facilita versionar el bundle con el paquete;
- reduce fallos por red.

Desventajas:

- el paquete npm pesa mas;
- cada update requiere publicar nueva version;
- no permite hotfix remoto sin publicar.

### Opcion B - Descargar bundle desde remoto

`init` descarga el bundle desde GitHub u otra URL.

Ventajas:

- paquete npm mas pequeno;
- puede actualizar bundle sin republicar CLI;
- facilita canales remotos.

Desventajas:

- agrega dependencia de red;
- mas dificil auditar que se instalo;
- requiere validar checksums o firmas;
- introduce mas superficie de seguridad;
- puede fallar aunque el paquete se haya descargado bien.

## Recomendacion de v1

Elegir Opcion B con restricciones: descargar desde release/tag versionado, no desde `main` sin control.

La version de la CLI no tiene que ser igual a la version de la fabrica. La CLI es el instalador; la fabrica es el contenido versionado.

```text
gridwork package version = installer version
factory release/tag = factory bundle version
```

Ejemplo:

```bash
npx gridwork@latest init
```

Puede instalar por defecto el ultimo release estable de la fabrica:

```text
gridwork-factory@1.0.0
```

Tambien deberia permitir fijar version:

```bash
npx gridwork@latest init --factory-version 1.0.0
```

## Versionado recomendado

`factory.json` debe registrar metadata de la fabrica instalada:

```text
factory_version
installed_by
installed_at
package_version
bundle_version
source
resolved
```

Ejemplo:

```json
{
  "factory_id": "gridwork",
  "factory_version": "1.0.0",
  "installed_by": "gridwork-cli",
  "package_version": "0.1.0",
  "bundle_version": "1.0.0",
  "source": "owner/gridwork-factory",
  "resolved": "https://github.com/owner/gridwork-factory/releases/download/factory-v1.0.0/gridwork-factory-v1.0.0.zip"
}
```

Ademas, `init` debe escribir un lockfile:

```text
.gridwork-lock.json
```

Ejemplo:

```json
{
  "factory": {
    "source": "owner/gridwork-factory",
    "sourceType": "github-release",
    "version": "1.0.0",
    "resolved": "https://github.com/owner/gridwork-factory/releases/download/factory-v1.0.0/gridwork-factory-v1.0.0.zip",
    "computedHash": "sha256:..."
  },
  "installer": {
    "package": "gridwork",
    "version": "0.1.0"
  }
}
```

## Dependencias

Para v1:

```text
runtime_dependencies = minimal
dev_dependencies = typescript_and_test_tools
postinstall_scripts = false
network_fetch_after_npx = true_for_factory_release_download
```

El CLI puede usar APIs nativas de Node para descargar, extraer, parsear JSON y escribir reportes. Si se usa una dependencia para extraer zip/tar, debe ser minima y auditada.

## Init reports

`init` debe escribir:

```text
.factory/init/<init-run-id>/
  init-report.md
  preflight.json
  validation-report.md
  validation.json
  lockfile-report.md
  conflicts.md
```

Si no hay conflictos, `conflicts.md` puede omitirse o quedar como reporte vacio.

## UX recomendada

Al terminar, mostrar algo como:

```text
Gridwork installed.

Version: 1.0.0
Source: owner/gridwork-factory@1.0.0
Definition folder: .gridwork/
Runtime folder: .factory/
Lockfile: .gridwork-lock.json
Main prompt: .gridwork/agents/orchestrator/PROMPT.md

Next step:
Tell your agent: "Lee .gridwork/agents/orchestrator/PROMPT.md y actua como el orquestador de Gridwork."
```

## Propuesta inicial

```text
cli_language = typescript
cli_distribution = npm_package
cli_usage_v1 = npx_gridwork_init
cli_commands_v1 = init_only
cli_role = bootstrapper_installer
cli_bundle_strategy = download_factory_from_versioned_github_release
cli_remote_bundle_fetch_v1 = true
cli_downloads_from_main_without_pin = false
cli_writes_gridwork_lockfile = true
cli_verifies_bundle_hash = true
cli_runtime_dependencies = minimal
cli_postinstall_scripts = false
cli_generates_product_code = false
cli_executes_workflows = false
cli_updates_gitignore = true
cli_runs_preflight = true
cli_runs_minimal_validation = true
cli_writes_init_reports = true
package_version_equals_bundle_version_v1 = false
gridwork_release_publisher_skill_required = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `npx gridwork init` instale un bundle embebido en el paquete npm,
o que descargue el bundle desde un repositorio remoto durante la instalacion?
```

Mi recomendacion ajustada: que `npx gridwork init` descargue la fabrica desde un release/tag versionado del repositorio de Gridwork, deje `.gridwork-lock.json`, verifique hash y nunca instale desde `main` sin pin.

## Respuesta del usuario

El usuario acepta la recomendacion ajustada:

- La CLI TypeScript sera un bootstrapper npm.
- `npx gridwork init` descargara la fabrica desde un release/tag versionado.
- La instalacion debe dejar lockfile con source, version, resolved URL y hash.
- La CLI no debe instalar desde `main` sin control.
- Debe existir una skill para crear release/tag cuando se quiera actualizar Gridwork.

## Decision registrada

```text
cli_language = typescript
cli_distribution = npm_package
cli_usage_v1 = npx_gridwork_init
cli_commands_v1 = init_only
cli_role = bootstrapper_installer
cli_bundle_strategy = download_factory_from_versioned_github_release
cli_remote_bundle_fetch_v1 = true
cli_downloads_from_main_without_pin = false
cli_writes_gridwork_lockfile = true
cli_verifies_bundle_hash = true
cli_runtime_dependencies = minimal
cli_postinstall_scripts = false
cli_generates_product_code = false
cli_executes_workflows = false
cli_updates_gitignore = true
cli_runs_preflight = true
cli_runs_minimal_validation = true
cli_writes_init_reports = true
package_version_equals_bundle_version_v1 = false
gridwork_release_publisher_skill_required = true
```

## Regla

```text
npx ejecuta el instalador.
El instalador descarga la fabrica desde release/tag.
El lockfile registra origen, version y hash.
La CLI no es runtime de workflows.
Actualizar Gridwork implica crear un nuevo release/tag de fabrica.
```

## Supuestos

- La CLI se implementara en TypeScript.
- El usuario ejecutara `npx gridwork init`.
- El usuario no quiere dependencias externas innecesarias.
- El paquete npm puede ser pequeno y no necesita incluir todo el bundle de fabrica.
- No existe `gridwork run` en v1.
- La fabrica vivira en un repositorio o release source versionado.
- GitHub puede ser el source inicial de releases.

## Riesgos

- La instalacion depende de red para descargar el release de fabrica.
- Si no se verifica hash, se pierde trazabilidad.
- Si se instala desde `main`, el resultado puede cambiar sin control.
- Si la skill de release/tag no tiene gates, podria publicar versiones incorrectas.

## Artefactos a crear o actualizar

- `package.json`
- `tsconfig.json`
- `src/cli.ts`
- `src/commands/init.ts`
- `src/init/download-bundle.ts`
- `src/init/resolve-source.ts`
- `src/init/verify-bundle.ts`
- `src/init/extract-bundle.ts`
- `src/init/preflight.ts`
- `src/init/validation.ts`
- `src/init/gitignore.ts`
- `src/init/init-report.ts`
- `src/init/lockfile.ts`
- `.gridwork-lock.json`
- `.gridwork/skills/gridwork-release-publisher/`
- `.gridwork/templates/gridwork-release-plan.md`
- `.gridwork/templates/gridwork-release-notes.md`
- `.gridwork/templates/bundle-manifest.json`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta concreta el modelo aceptado en GQ-002: TypeScript + `npx gridwork init` + CLI init-only.
- La recomendacion mantiene la CLI como instalador de fabrica, no como runtime de agentes.
- Decision final del usuario: usar CLI npm como bootstrapper y descargar la fabrica desde release/tag versionado.
- Revision posterior GQ-079: `npx gridwork init` sigue siendo el comando preferido, pero si el package npm `gridwork` no esta disponible se permite fallback `npx @<scope>/gridwork init` manteniendo bin `gridwork`.
- Revision posterior GQ-085: el MVP debe empezar por una rebanada instalable con CLI `init`, fabrica minima, lockfile y reportes antes de expandir todos los agentes/workflows.
- Revision posterior GQ-086: la CLI `init` MVP no esta lista sin acceptance tests e2e y `npm pack --dry-run` con validacion de package contents.
