# GQ-069 - Resolucion de source y version de fabrica en `init`

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-064, GQ-066, GQ-067 y GQ-068
- Pregunta origen: GQ-069
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, paquete npm `gridwork`, GitHub Releases, `.gridwork-lock.json`, `bundle-manifest.json`, `SHA256SUMS.txt`

## Pregunta

Como debe resolver `npx gridwork init` la fuente y version de la fabrica que va a instalar?

## Por que importa

GQ-064 decidio que la CLI sera un bootstrapper npm. GQ-068 decidio que la fabrica se descarga como bundle verificable desde un release.

Ahora falta responder una pregunta operativa:

```text
npx gridwork init
```

Cuando el usuario ejecuta ese comando en un repositorio nuevo, la CLI necesita saber:

- de que repositorio descargar la fabrica;
- que version instalar;
- si puede instalar `latest`;
- si puede instalar una version especifica;
- si puede instalar desde un fork;
- como dejar todo registrado en `.gridwork-lock.json`.

Sin esta decision, la instalacion queda ambigua.

## Opciones

### Opcion A - Source fijo dentro de la CLI

La CLI trae configurado el repositorio oficial de fabrica:

```text
default_factory_source = <owner>/<repo>
```

El usuario ejecuta:

```bash
npx gridwork init
```

La CLI busca el ultimo release estable compatible y lo instala.

Ventajas:

- UX simple;
- buen default para v1;
- menos preguntas;
- menos riesgo de instalar desde una fuente equivocada;
- lockfile deja la fuente exacta instalada.

Desventajas:

- menos flexible para forks;
- cambiar source oficial requiere nueva version de CLI o una constante configurable;
- si el repo oficial cambia de owner, hay que actualizar la CLI.

### Opcion B - Source obligatorio por flag

El usuario debe indicar:

```bash
npx gridwork init --source owner/repo
```

Ventajas:

- muy explicito;
- compatible con fabricas forked;
- la CLI no necesita conocer un repo oficial.

Desventajas:

- peor UX;
- mas facil equivocarse;
- cada instalacion requiere recordar el source;
- no se parece tanto al flujo simple que quieres para Gridwork.

### Opcion C - Source fijo con override avanzado

La CLI trae un source oficial por defecto, pero permite override explicito:

```bash
npx gridwork init
npx gridwork init --factory-version 1.0.0
npx gridwork init --source owner/repo --factory-version 1.0.0
```

Ventajas:

- mantiene UX simple;
- permite forks o pruebas de desarrollo;
- no obliga a crear otro comando;
- conserva trazabilidad porque el lockfile registra source, tag, URL y hash.

Desventajas:

- la CLI debe validar mas casos;
- `--source` puede abrir mas superficie de riesgo;
- se necesitan reglas claras para no aceptar URLs arbitrarias en v1.

## Respuesta recomendada

Usar Opcion C:

```text
source oficial por defecto + override avanzado por flag
```

En v1, `npx gridwork init` debe usar un source oficial embebido en la CLI. El usuario no necesita configurarlo.

Para casos avanzados, permitir:

```bash
npx gridwork init --source owner/repo --factory-version 1.0.0
```

Pero con restricciones:

- `--source` acepta solo formato GitHub `owner/repo`;
- no acepta URLs arbitrarias en v1;
- no instala desde branch;
- no instala desde `main`;
- no instala sin tag `factory-v<version>`;
- no instala sin `bundle-manifest.json`;
- no instala sin `SHA256SUMS.txt`;
- no instala si el hash falla.

## Resolucion de version

### Primera instalacion sin flags

```bash
npx gridwork init
```

Debe resolver:

```text
source = source oficial embebido
version = ultimo release estable compatible
tag = factory-v<version>
auth = sin credenciales por defecto
cache = no decide latest
```

Debe ignorar:

- draft releases;
- prereleases;
- tags que no empiecen con `factory-v`;
- releases sin assets obligatorios;
- releases incompatibles con `required_cli_version`.

### Primera instalacion con version explicita

```bash
npx gridwork init --factory-version 1.0.0
```

Debe resolver:

```text
source = source oficial embebido
version = 1.0.0
tag = factory-v1.0.0
```

### Instalacion desde fork o source alternativo

```bash
npx gridwork init --source owner/repo --factory-version 1.0.0
```

Debe resolver:

```text
source = owner/repo
version = 1.0.0
tag = factory-v1.0.0
```

Recomendacion: exigir `--factory-version` cuando se usa `--source`. Asi se evita que una fuente desconocida decida automaticamente que es `latest`.

### Re-run con lockfile existente

Si existe `.gridwork-lock.json`:

```bash
npx gridwork init
```

Debe usar:

```text
source = lockfile.factory.source
version = lockfile.factory.version
tag = lockfile.factory.tag
```

Esto conserva GQ-066: `init` sin version repara, no actualiza.

## Flags recomendados

V1 puede soportar:

```text
init
init --factory-version <version>
init --factory-version <prerelease-version> --allow-prerelease
init --check-updates
init --source <owner/repo> --factory-version <version>
```

No soportar en v1:

```text
init --branch main
init --url https://...
init --local-path ...
init --channel nightly
init --channel beta
init --channel canary
init --agent ...
init --workflow ...
```

## Lockfile

El lockfile debe guardar la resolucion exacta:

```json
{
  "factory": {
    "sourceType": "github-release",
    "source": "owner/repo",
    "version": "1.0.0",
    "tag": "factory-v1.0.0",
    "assetName": "gridwork-factory-v1.0.0.zip",
    "resolved": "https://github.com/owner/repo/releases/download/factory-v1.0.0/gridwork-factory-v1.0.0.zip",
    "sha256": "sha256:<hash>",
    "sourceCommit": "<git-sha>",
    "bundleManifestHash": "sha256:<hash>"
  },
  "installer": {
    "package": "gridwork",
    "version": "0.1.0"
  }
}
```

## Reporte local

Cada init debe dejar evidencia:

```text
.factory/init/<init-run-id>/
  source-resolution.json
  source-resolution.md
  init-report.md
  validation-report.md
```

`source-resolution.md` debe explicar:

- source usado;
- version solicitada;
- version resuelta;
- tag resuelto;
- assets encontrados;
- assets rechazados, si aplica;
- motivo de bloqueo, si aplica.

## Propuesta inicial

```text
init_default_source_model = embedded_official_github_repo
init_default_source_type = github-release
init_default_source_config_path = packages/cli/src/config/defaults.ts
init_default_source_placeholder_allowed_in_release = false
init_default_source_should_be_public = true
init_github_access_requires_gh = false
init_github_access_optional_token_env = GITHUB_TOKEN,GH_TOKEN
init_cache_can_resolve_latest = false
init_cache_can_install_exact_version = true
init_default_version_resolution = latest_stable_compatible_release
init_existing_lockfile_uses_locked_source = true
init_existing_lockfile_uses_locked_version = true
init_source_override_allowed = true
init_source_override_requires_factory_version = true
init_source_override_format = github_owner_repo
init_arbitrary_url_source_v1 = false
init_branch_source_v1 = false
init_main_source_v1 = false
init_prerelease_default_v1 = false
init_prerelease_requires_exact_factory_version = true
init_prerelease_requires_allow_flag = true
init_channel_flag_v1 = false
init_requires_factory_tag_prefix = factory-v
init_ignores_releases_missing_required_assets = true
init_writes_source_resolution_report = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `npx gridwork init` use siempre un source oficial embebido,
o que tambien permita un override avanzado `--source owner/repo --factory-version <version>`?
```

Mi recomendacion: usar source oficial embebido como default y permitir override avanzado solo con `--factory-version`. No permitir URLs, branches ni `main` en v1.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `npx gridwork init` debe usar un source oficial embebido por defecto;
- `init` puede permitir override avanzado con `--source owner/repo`;
- cuando se usa `--source`, tambien debe requerirse `--factory-version <version>`;
- `--source` acepta solo formato GitHub `owner/repo` en v1;
- v1 no acepta URLs arbitrarias;
- v1 no acepta branches;
- v1 no instala desde `main`;
- v1 no instala prereleases por defecto;
- `init` debe dejar reporte local de resolucion de source.

## Decision registrada

```text
init_default_source_model = embedded_official_github_repo
init_default_source_type = github-release
init_default_source_config_path = packages/cli/src/config/defaults.ts
init_default_source_placeholder_allowed_in_release = false
init_default_source_should_be_public = true
init_github_access_requires_gh = false
init_github_access_optional_token_env = GITHUB_TOKEN,GH_TOKEN
init_cache_can_resolve_latest = false
init_cache_can_install_exact_version = true
init_default_version_resolution = latest_stable_compatible_release
init_existing_lockfile_uses_locked_source = true
init_existing_lockfile_uses_locked_version = true
init_source_override_allowed = true
init_source_override_requires_factory_version = true
init_source_override_format = github_owner_repo
init_arbitrary_url_source_v1 = false
init_branch_source_v1 = false
init_main_source_v1 = false
init_prerelease_default_v1 = false
init_prerelease_requires_exact_factory_version = true
init_prerelease_requires_allow_flag = true
init_channel_flag_v1 = false
init_requires_factory_tag_prefix = factory-v
init_ignores_releases_missing_required_assets = true
init_writes_source_resolution_report = true
```

## Regla

```text
`init` normal usa el source oficial embebido.
El source oficial v1 debe ser publico.
`init` no requiere `gh`.
`init` puede usar `GITHUB_TOKEN`/`GH_TOKEN` opcional para source privado o rate limits.
`init` no usa cache para resolver ultimo release estable.
`init` puede usar cache verificada para una version exacta.
`init --factory-version` instala una version especifica del source oficial.
`init --source owner/repo --factory-version x.y.z` permite source alternativo controlado.
V1 no instala desde URLs, branches ni `main`.
V1 ignora prereleases por defecto.
V1 instala prerelease solo con version exacta y `--allow-prerelease`.
V1 no usa canales `beta`, `canary` ni `nightly`.
Si existe lockfile, `init` usa source y version bloqueados.
```

## Supuestos

- GitHub Releases sera el source inicial.
- La fabrica oficial vive en el mismo monorepo que la CLI.
- La CLI puede consultar releases con APIs nativas de Node.
- El usuario quiere UX simple para primera instalacion.
- Los forks o pruebas alternativas son utiles, pero no deben complicar el uso normal.

## Riesgos

- Un source fijo puede quedar obsoleto si cambia el owner/repo.
- Un source demasiado abierto puede permitir instalaciones no verificables.
- Resolver `latest` desde una fuente alternativa sin version explicita puede ser riesgoso.
- Permitir branches romperia la trazabilidad de releases versionados.

## Artefactos a crear o actualizar

- `packages/cli/src/init/resolve-source.ts`
- `packages/cli/src/init/download-bundle.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/src/init/source-resolution-report.ts`
- `.gridwork/templates/source-resolution-report.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta aterriza el ultimo eslabon entre npm, GitHub Release y lockfile.
- Complementa GQ-066: `init` sin version repara la version bloqueada.
- Complementa GQ-068: la version resuelta se instala solo si el bundle verifica correctamente.
- Decision del usuario: aceptar source oficial embebido con override avanzado controlado.
- Revision posterior GQ-080: el source oficial embebido vive en defaults de build validados y ningun release puede publicarse si queda placeholder.
- Revision posterior GQ-082: `init` instala stable por defecto; prerelease requiere version exacta y `--allow-prerelease`; no hay canales en v1.
- Revision posterior GQ-083: `init` no requiere `gh`; usa acceso publico por defecto y token opcional por entorno para repos privados o rate limits.
- Revision posterior GQ-084: cache local verificada puede instalar/reparar versiones exactas, pero no resuelve `latest`.
