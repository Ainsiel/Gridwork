# GQ-068 - Contrato del bundle de release de fabrica

- Estado: accepted
- Fuente: decisiones GQ-028, GQ-062, GQ-063, GQ-064, GQ-065, GQ-066 y GQ-067
- Pregunta origen: GQ-068
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: release asset de fabrica, `bundle-manifest.json`, `SHA256SUMS.txt`, `npx gridwork init`, `.gridwork-lock.json`, `gridwork-release-publisher`

## Pregunta

Que debe contener exactamente el bundle `gridwork-factory-v<version>.zip` y como debe verificarlo la CLI antes de instalarlo?

## Por que importa

GQ-067 decidio que el repositorio fuente sera un monorepo y que la fabrica publicable vive en:

```text
factory/.gridwork/
```

GQ-064 decidio que `npx gridwork init` descarga la fabrica desde un release/tag versionado. Por eso el bundle necesita un contrato fuerte:

```text
release asset -> manifest -> hash -> validacion -> extraccion -> lockfile
```

Si el contrato es debil, la CLI podria instalar un zip incompleto, manipulado, ambiguo o con archivos que no pertenecen a la fabrica.

## Respuesta recomendada

Publicar cada release de fabrica con varios assets:

```text
gridwork-factory-v<version>.zip
bundle-manifest.json
SHA256SUMS.txt
gridwork-release-notes.md
```

La CLI debe descargar primero el manifest y los checksums, validar la metadata, descargar el zip, verificar hash y solo despues extraer/aplicar archivos.

## Contenido del zip

El zip debe tener una raiz estable:

```text
.gridwork/
  factory.json
  agents/
  workflows/
  skills/
  stack-packs/
  policies/
  schemas/
  templates/
```

No debe incluir:

```text
.factory/
.git/
node_modules/
packages/
docs/
.docs/
dist/
coverage/
archivos temporales
archivos de secretos
```

El bundle es el contenido instalable de la fabrica, no el repositorio fuente completo.

## Assets del release

### `gridwork-factory-v<version>.zip`

Archivo instalable. Debe contener solo `.gridwork/`.

### `bundle-manifest.json`

Metadata estructurada del bundle.

Ejemplo:

```json
{
  "schema_version": "1.0.0",
  "bundle_format": "gridwork-factory-zip",
  "factory_id": "gridwork",
  "factory_version": "1.0.0",
  "release_channel": "stable",
  "prerelease": false,
  "created_at": "2026-06-03T00:00:00Z",
  "source_commit": "<git-sha>",
  "source_tag": "factory-v1.0.0",
  "release_mode": "manual_gh_release",
  "asset_name": "gridwork-factory-v1.0.0.zip",
  "sha256": "sha256:<hash>",
  "required_cli_version": ">=0.1.0 <1.0.0",
  "compatible_schema_versions": [ "1.0.0" ],
  "contract_versions": {
    "agent": "1.0.0",
    "workflow": "1.0.0",
    "skill": "1.0.0",
    "work_order": "1.0.0",
    "run": "1.0.0"
  },
  "breaking_changes": false,
  "included_paths": [
    ".gridwork/factory.json",
    ".gridwork/agents/",
    ".gridwork/workflows/",
    ".gridwork/skills/",
    ".gridwork/stack-packs/",
    ".gridwork/policies/",
    ".gridwork/schemas/",
    ".gridwork/templates/"
  ],
  "excluded_paths": [
    ".factory/",
    ".git/",
    "node_modules/",
    "packages/",
    "docs/",
    ".docs/"
  ]
}
```

### `SHA256SUMS.txt`

Archivo simple para verificar hashes.

Ejemplo:

```text
<hash>  gridwork-factory-v1.0.0.zip
<hash>  bundle-manifest.json
<hash>  gridwork-release-notes.md
```

### `gridwork-release-notes.md`

Notas humanas del release. No reemplazan el manifest.

Debe explicar:

- version;
- cambios principales;
- compatibilidad;
- riesgos;
- instrucciones de instalacion;
- instrucciones de actualizacion;
- breaking changes, si existen.

## Verificaciones de la CLI

Antes de instalar, `npx gridwork init` debe validar:

- el tag solicitado coincide con `source_tag`;
- `release_mode` es conocido y coincide con el plan de release;
- `release_channel` es conocido;
- si `prerelease = true`, el usuario autorizo prerelease explicitamente;
- `factory_version` coincide con la version solicitada;
- `asset_name` coincide con `gridwork-factory-v<version>.zip`;
- el hash del zip coincide con `bundle-manifest.json`;
- el hash tambien coincide con `SHA256SUMS.txt`;
- el zip contiene `.gridwork/factory.json`;
- el zip no contiene `.factory/`;
- el zip no contiene `.git/`;
- el zip no contiene `node_modules/`;
- el zip no contiene paths fuera de `.gridwork/`;
- el zip no contiene archivos de secretos conocidos;
- `factory.json` parsea correctamente;
- manifests de agents, workflows, skills y stack packs parsean correctamente;
- schemas base existen;
- templates base existen;
- version de CLI cumple `required_cli_version`.
- `schema_version` del bundle es soportado por la CLI;
- contract versions son soportadas por la CLI.

Si una verificacion critica falla, la CLI no debe instalar ni actualizar `.gridwork-lock.json`.

## Fallos bloqueantes

Debe bloquear instalacion si:

- falta `bundle-manifest.json`;
- falta `SHA256SUMS.txt`;
- falta el zip;
- hash no coincide;
- version solicitada no coincide;
- falta `.gridwork/factory.json`;
- aparecen paths prohibidos;
- aparece `.factory/` dentro del zip;
- falla validacion minima de manifests;
- `required_cli_version` no es compatible.
- `schema_version` no es soportado;
- contract versions no son compatibles.

## Reportes locales

Aunque falle, `init` debe escribir evidencia en:

```text
.factory/init/<init-run-id>/
  init-report.md
  bundle-manifest.json
  checksum-report.json
  validation-report.md
  validation.json
  lockfile-report.md
```

Si hay conflicto de archivos existentes:

```text
.factory/init/<init-run-id>/
  conflicts.md
  conflicts.json
  candidates/
```

## Lockfile resultante

Despues de instalar correctamente, `.gridwork-lock.json` debe registrar:

```json
{
  "factory": {
    "sourceType": "github-release",
    "source": "<owner>/<repo>",
    "version": "1.0.0",
    "tag": "factory-v1.0.0",
    "assetName": "gridwork-factory-v1.0.0.zip",
    "resolved": "https://github.com/<owner>/<repo>/releases/download/factory-v1.0.0/gridwork-factory-v1.0.0.zip",
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

## Propuesta inicial

```text
factory_release_bundle_format = zip
factory_release_bundle_root = .gridwork/
factory_release_zip_name = gridwork-factory-v<version>.zip
factory_release_assets_include_zip = true
factory_release_assets_include_bundle_manifest = true
factory_release_assets_include_sha256sums = true
factory_release_assets_include_release_notes = true
bundle_manifest_required = true
sha256sums_required = true
cli_downloads_manifest_before_zip = true
cli_verifies_zip_hash_before_extract = true
cli_validates_bundle_paths_before_install = true
cli_rejects_paths_outside_gridwork = true
cli_rejects_factory_runtime_in_bundle = true
cli_rejects_git_and_node_modules_in_bundle = true
cli_rejects_secret_like_files = true
cli_writes_lockfile_only_after_bundle_validation = true
bundle_declares_required_cli_version = true
bundle_declares_compatible_schema_versions = true
bundle_declares_contract_versions = true
bundle_declares_release_mode = true
bundle_declares_release_channel = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el release publique solo el `.zip`,
o que publique tambien `bundle-manifest.json` y `SHA256SUMS.txt`
para verificacion antes de instalar?
```

Mi recomendacion: publicar zip + manifest + SHA256SUMS + release notes. El CLI debe verificar manifest y hash antes de extraer/aplicar, aunque eso haga el release un poco mas ceremonioso.

## Respuesta del usuario

El usuario acepta la recomendacion:

- cada release debe publicar `gridwork-factory-v<version>.zip`;
- cada release debe publicar `bundle-manifest.json`;
- cada release debe publicar `SHA256SUMS.txt`;
- cada release debe publicar `gridwork-release-notes.md`;
- la CLI debe verificar manifest y checksums antes de extraer;
- la CLI debe rechazar bundles con paths prohibidos;
- la CLI debe escribir `.gridwork-lock.json` solo despues de una validacion correcta.

## Decision registrada

```text
factory_release_bundle_format = zip
factory_release_bundle_root = .gridwork/
factory_release_zip_name = gridwork-factory-v<version>.zip
factory_release_assets_include_zip = true
factory_release_assets_include_bundle_manifest = true
factory_release_assets_include_sha256sums = true
factory_release_assets_include_release_notes = true
bundle_manifest_required = true
sha256sums_required = true
cli_downloads_manifest_before_zip = true
cli_verifies_zip_hash_before_extract = true
cli_validates_bundle_paths_before_install = true
cli_rejects_paths_outside_gridwork = true
cli_rejects_factory_runtime_in_bundle = true
cli_rejects_git_and_node_modules_in_bundle = true
cli_rejects_secret_like_files = true
cli_writes_lockfile_only_after_bundle_validation = true
bundle_declares_release_mode = true
bundle_declares_release_channel = true
```

## Regla

```text
Un release de fabrica no es solo un zip.
El release debe incluir zip, manifest, checksums y release notes.
El manifest debe registrar `release_mode`.
El manifest debe registrar `release_channel` y `prerelease`.
La CLI instala solo despues de validar version, hash, paths y manifests.
Si la verificacion falla, no se aplica `.gridwork/` y no se actualiza el lockfile.
```

## Supuestos

- GitHub Release sera el source remoto inicial.
- La CLI tendra acceso de red durante `npx gridwork init`.
- La fabrica se instala desde assets versionados, no desde `main`.
- `.factory/` es runtime local y nunca entra al bundle.
- El bundle no incluye codigo productivo del proyecto destino.

## Riesgos

- Si solo se publica zip, la verificacion queda pobre.
- Si el manifest no tiene hash, el lockfile pierde trazabilidad.
- Si el zip permite paths fuera de `.gridwork/`, podria escribir archivos no esperados.
- Si el bundle incluye `.factory/`, podria filtrar logs o datos locales.
- Si `required_cli_version` no se valida, una CLI antigua podria instalar una fabrica incompatible.

## Artefactos a crear o actualizar

- `.gridwork/templates/bundle-manifest.json`
- `.gridwork/templates/gridwork-release-notes.md`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `packages/cli/src/init/download-bundle.ts`
- `packages/cli/src/init/verify-bundle.ts`
- `packages/cli/src/init/extract-bundle.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/src/init/init-report.ts`
- `packages/cli/src/validation/minimal-validator.ts`
- `docs/RELEASE_PROCESS.md`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta convierte el modelo de release en un contrato auditable.
- Complementa GQ-064: bootstrapper npm con descarga remota verificada.
- Complementa GQ-065: release publisher prepara bundle, manifest, hash y release notes.
- Complementa GQ-067: el bundle se construye desde `factory/.gridwork/`, no desde todo el monorepo.
- Decision del usuario: aceptar release verificable con manifest y checksums obligatorios.
- Revision posterior GQ-070: `bundle-manifest.json` tambien declara `required_cli_version`, `compatible_schema_versions`, `contract_versions` y `breaking_changes`.
- Revision posterior GQ-081: `bundle-manifest.json` debe registrar `release_mode`; en v1 el modo recomendado es `manual_gh_release`.
- Revision posterior GQ-082: `bundle-manifest.json` debe declarar `release_channel` y `prerelease`; `init` bloquea prereleases salvo version exacta con `--allow-prerelease`.
- Revision posterior GQ-102: el tag canonical de fabrica es `factory-v<version>` y el publisher genera assets `gridwork-factory-v<version>.*`.
