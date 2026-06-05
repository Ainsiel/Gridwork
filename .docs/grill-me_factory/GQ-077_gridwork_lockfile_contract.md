# GQ-077 - Contrato de `.gridwork-lock.json`

- Estado: accepted
- Fuente: decisiones GQ-003, GQ-064, GQ-066, GQ-068, GQ-069, GQ-070 y GQ-076
- Pregunta origen: GQ-077
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork-lock.json`, `.gitignore`, `packages/cli/src/init/lockfile.ts`, reportes de `init`, CI del repositorio fuente

## Pregunta

Debe `.gridwork-lock.json` ser un archivo versionado y cual debe ser su contrato exacto?

## Por que importa

El lockfile fue acumulando responsabilidades importantes:

```text
source de fabrica
version instalada
tag resuelto
hash del bundle
hash del manifest
compatibilidad
contract versions
inventario de archivos instalados
hashes por archivo
cache como optimizacion local, no como fuente de verdad
```

Si no se define bien, puede volverse:

- demasiado grande;
- ambiguo;
- facil de corromper;
- dificil de mergear;
- inseguro si guarda datos locales;
- inutil si no se versiona.

## Opciones

### Opcion A - Lockfile versionado

`.gridwork-lock.json` se commitea junto a `.gridwork/`.

Ventajas:

- todos los clones usan la misma fabrica;
- trazabilidad fuerte;
- CI puede validar version, source y hashes;
- PRs muestran cuando cambia la fabrica;
- permite reparar usando la version bloqueada;
- encaja con GQ-066 y GQ-076.

Desventajas:

- puede tener conflictos de merge;
- puede crecer por hashes de archivos;
- requiere formato estable.

### Opcion B - Lockfile local ignorado

`.gridwork-lock.json` queda en `.gitignore`.

Ventajas:

- no hay conflictos de merge;
- cada usuario puede tener su version local;
- menos ruido en PRs.

Desventajas:

- se pierde reproducibilidad;
- clones diferentes podrian usar fabricas distintas;
- no se puede saber que version de Gridwork gobierna el repo;
- `init` seria menos auditable.

### Opcion C - Lockfile dividido

Separar:

```text
.gridwork-lock.json          # versionado, metadata estable
.factory/init/lock-state.json # local, detalles runtime
```

Ventajas:

- versiona lo esencial;
- deja runtime local fuera de Git;
- reduce ruido;
- mantiene trazabilidad.

Desventajas:

- dos archivos que coordinar;
- mas complejidad;
- puede ser prematuro en v1.

## Respuesta recomendada

Usar Opcion A en v1:

```text
gridwork_lockfile_versioned = true
```

El lockfile debe ser seguro para commitear, deterministico y sin datos locales sensibles.

Si luego crece demasiado, se puede evaluar una division como Opcion C.

## Ubicacion

Debe vivir en la raiz del proyecto destino:

```text
.gridwork-lock.json
```

No dentro de `.gridwork/`, porque gobierna la instalacion de `.gridwork/` completa.

No dentro de `.factory/`, porque `.factory/` es runtime local ignorado.

## Contenido permitido

Debe contener:

- `lockfileVersion`;
- factory source;
- source type;
- factory version;
- tag;
- asset name;
- resolved URL;
- bundle hash;
- bundle manifest hash;
- source commit;
- schema version;
- contract versions;
- required CLI version;
- installer package;
- installer version;
- compatibility status;
- auth mode usado para resolver la descarga, sin secretos;
- lista de archivos instalados;
- hash por archivo instalado;
- fecha de instalacion o update, si no contiene datos sensibles.

## Contenido prohibido

No debe contener:

- tokens;
- headers;
- credenciales;
- paths absolutos del usuario;
- home directory;
- logs;
- prompts conversacionales;
- outputs de agentes;
- datos del proyecto;
- reportes completos;
- contenido de archivos;
- informacion de `.factory/runs/`.

## Ejemplo recomendado

```json
{
  "lockfileVersion": "1.0.0",
  "factory": {
    "sourceType": "github-release",
    "source": "owner/repo",
    "version": "1.0.0",
    "releaseChannel": "stable",
    "prerelease": false,
    "tag": "factory-v1.0.0",
    "assetName": "gridwork-factory-v1.0.0.zip",
    "resolved": "https://github.com/owner/repo/releases/download/factory-v1.0.0/gridwork-factory-v1.0.0.zip",
    "sha256": "sha256:<bundle-hash>",
    "sourceCommit": "<git-sha>",
    "bundleManifestHash": "sha256:<manifest-hash>",
    "schemaVersion": "1.0.0",
    "contractVersions": {
      "agent": "1.0.0",
      "workflow": "1.0.0",
      "skill": "1.0.0",
      "workOrder": "1.0.0",
      "run": "1.0.0"
    }
  },
  "installer": {
    "package": "gridwork",
    "version": "0.1.0"
  },
  "compatibility": {
    "requiredCliVersion": ">=0.1.0 <1.0.0",
    "checkedAt": "2026-06-04T00:00:00Z",
    "status": "compatible"
  },
  "resolution": {
    "authMode": "unauthenticated"
  },
  "files": [
    {
      "path": ".gridwork/factory.json",
      "sha256": "sha256:<file-hash>",
      "source": "gridwork-factory-v1.0.0.zip"
    }
  ]
}
```

## Determinismo

El lockfile debe escribirse de forma estable:

- JSON pretty-print con 2 espacios;
- keys ordenadas por convencion interna;
- archivos ordenados por path;
- paths con `/`;
- hashes con prefijo `sha256:`;
- sin timestamps volatiles innecesarios;
- sin rutas absolutas.

Nota: `checkedAt` es util para trazabilidad, pero puede generar diffs. Si causa ruido, puede moverse a `lockfile-report.md`.

## Merge conflicts

Si hay conflicto de merge en `.gridwork-lock.json`, no debe resolverse a mano a ciegas.

Regla recomendada:

```text
resolver archivos .gridwork/
ejecutar npx gridwork init
permitir que init regenere lockfile consistente
revisar diff
commit lockfile resultante
```

Los agentes no deben inventar hashes ni editar el lockfile manualmente salvo como parte del flujo de `init` o una reparacion explicita documentada.

## Validacion

`init` y CI deben validar:

- JSON parsea;
- `lockfileVersion` soportado;
- source/type/version/tag coherentes;
- hashes tienen formato correcto;
- files no contiene paths fuera de `.gridwork/`;
- files no contiene `.factory/`;
- no hay paths absolutos;
- no hay duplicados;
- archivos locales coinciden con hashes cuando se requiere repair/update;
- compatibility status es coherente con `factory` e `installer`.

## Propuesta inicial

```text
gridwork_lockfile_versioned = true
gridwork_lockfile_path = .gridwork-lock.json
gridwork_lockfile_inside_gridwork = false
gridwork_lockfile_inside_factory_runtime = false
gridwork_lockfile_committable = true
gridwork_lockfile_contains_secrets = false
gridwork_lockfile_records_source = true
gridwork_lockfile_records_factory_version = true
gridwork_lockfile_records_release_channel = true
gridwork_lockfile_records_auth_mode = true
gridwork_lockfile_records_auth_token = false
gridwork_lockfile_records_bundle_hash = true
gridwork_lockfile_records_manifest_hash = true
gridwork_lockfile_records_contract_versions = true
gridwork_lockfile_records_file_hashes = true
gridwork_lockfile_records_absolute_paths = false
gridwork_lockfile_deterministic_order = true
gridwork_lockfile_manual_editing_allowed = false_except_documented_repair
gridwork_lockfile_merge_conflict_strategy = regenerate_with_init_after_resolving_gridwork
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `.gridwork-lock.json` se commitee junto a `.gridwork/`,
o que sea un archivo local ignorado dentro de `.factory/`?
```

Mi recomendacion: commitear `.gridwork-lock.json` en la raiz. Debe ser seguro para Git, deterministico y sin secretos. Si hay conflictos, se resuelven regenerandolo con `npx gridwork init` despues de revisar `.gridwork/`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `.gridwork-lock.json` debe commitearse junto a `.gridwork/`;
- debe vivir en la raiz del proyecto destino;
- debe ser seguro para Git;
- debe ser deterministico;
- no debe contener secretos ni paths absolutos;
- debe registrar source, version, hashes, compatibilidad y hashes por archivo;
- no debe editarse manualmente salvo reparacion documentada;
- conflictos de merge se resuelven regenerando con `npx gridwork init` despues de revisar `.gridwork/`.

## Decision registrada

```text
gridwork_lockfile_versioned = true
gridwork_lockfile_path = .gridwork-lock.json
gridwork_lockfile_inside_gridwork = false
gridwork_lockfile_inside_factory_runtime = false
gridwork_lockfile_committable = true
gridwork_lockfile_contains_secrets = false
gridwork_lockfile_records_source = true
gridwork_lockfile_records_factory_version = true
gridwork_lockfile_records_release_channel = true
gridwork_lockfile_records_auth_mode = true
gridwork_lockfile_records_auth_token = false
gridwork_lockfile_records_bundle_hash = true
gridwork_lockfile_records_manifest_hash = true
gridwork_lockfile_records_contract_versions = true
gridwork_lockfile_records_file_hashes = true
gridwork_lockfile_records_absolute_paths = false
gridwork_lockfile_deterministic_order = true
gridwork_lockfile_manual_editing_allowed = false_except_documented_repair
gridwork_lockfile_merge_conflict_strategy = regenerate_with_init_after_resolving_gridwork
```

## Regla

```text
`.gridwork-lock.json` es versionado.
Vive en la raiz, no dentro de `.gridwork/` ni `.factory/`.
No contiene secretos, logs, paths absolutos ni contenido de archivos.
Registra origen, version, hashes, compatibilidad y hashes por archivo.
Registra si la fabrica instalada es stable o prerelease.
Puede registrar `authMode`, pero nunca tokens ni headers.
Los agentes no inventan hashes.
Los conflictos se resuelven regenerando el lockfile con `init` despues de revisar `.gridwork/`.
```

## Supuestos

- `.gridwork/` es versionado.
- `.factory/` es runtime local ignorado.
- El lockfile no contiene datos sensibles.
- El lockfile permite reproducibilidad entre clones.
- La cache vive fuera del lockfile, en `.factory/cache/`.
- El usuario quiere trazabilidad fuerte.

## Riesgos

- Lockfile largo puede generar diffs grandes.
- Merge conflicts pueden ocurrir si varias ramas actualizan Gridwork.
- Si se edita manualmente, hashes pueden quedar falsos.
- Si no se versiona, cada clon puede quedar con una fabrica distinta.

## Artefactos a crear o actualizar

- `.gridwork-lock.json`
- `.gitignore`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/src/init/file-hashes.ts`
- `packages/cli/src/init/lockfile-report.ts`
- `packages/cli/tests/lockfile.test.ts`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta consolida el contrato que quedo distribuido entre GQ-064, GQ-066, GQ-070 y GQ-076.
- El lockfile es el puente entre release remoto, instalacion local versionada y proteccion de personalizaciones.
- Decision del usuario: aceptar `.gridwork-lock.json` versionado en la raiz con contrato deterministico y sin secretos.
- Revision posterior GQ-082: el lockfile debe registrar `releaseChannel` y `prerelease` para distinguir stable de prerelease.
- Revision posterior GQ-083: el lockfile puede registrar `authMode`, pero nunca `GITHUB_TOKEN`, `GH_TOKEN` ni headers `Authorization`.
- Revision posterior GQ-084: el lockfile sigue siendo fuente de version exacta; cache local solo guarda assets verificados en `.factory/cache/`.
