# GQ-070 - Contrato de compatibilidad entre CLI, fabrica y schemas

- Estado: accepted
- Fuente: decisiones GQ-004, GQ-062, GQ-064, GQ-068 y GQ-069
- Pregunta origen: GQ-070
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli/`, `factory/.gridwork/factory.json`, `bundle-manifest.json`, `.gridwork-lock.json`, schemas, releases de fabrica

## Pregunta

Como debe manejar Gridwork la compatibilidad entre version de CLI, version de fabrica, version de schemas y manifests?

## Por que importa

Ya se decidio que:

```text
CLI npm = bootstrapper
fabrica = bundle versionado descargado desde release
schemas = contratos versionados
lockfile = evidencia de instalacion
```

Eso permite actualizar CLI y fabrica por separado, pero tambien abre un riesgo:

```text
una CLI vieja podria instalar una fabrica nueva que ya no entiende
una fabrica vieja podria tener manifests incompatibles con una CLI nueva
un schema podria cambiar sin que los agentes o workflows lo sepan
```

Necesitamos reglas explicitas para decidir cuando instalar, cuando advertir y cuando bloquear.

## Opciones

### Opcion A - Versiones acopladas

La version de CLI y fabrica siempre coinciden:

```text
cli_version = 1.0.0
factory_version = 1.0.0
```

Ventajas:

- simple de explicar;
- menos combinaciones de compatibilidad;
- release mentalmente mas directo.

Desventajas:

- obliga a publicar CLI cada vez que cambia la fabrica;
- contradice el modelo de bootstrapper pequeno;
- dificulta fixes de fabrica sin tocar npm;
- mezcla responsabilidades.

### Opcion B - Versiones independientes con compatibilidad estricta

CLI, fabrica y schemas tienen versiones separadas, pero cada bundle declara compatibilidad:

```text
cli_version = version del paquete npm
factory_version = version del bundle de fabrica
schema_version = version del contrato de manifests
required_cli_version = rango SemVer requerido por el bundle
```

La CLI instala solo si el rango es compatible.

Ventajas:

- permite evolucionar CLI y fabrica por separado;
- mantiene seguridad;
- hace el lockfile mas auditable;
- bloquea combinaciones no soportadas;
- encaja con releases verificados.

Desventajas:

- requiere SemVer disciplinado;
- requiere validacion adicional;
- puede bloquear instalaciones si el rango esta mal declarado.

### Opcion C - Versiones independientes con best effort

La CLI intenta instalar aunque haya incompatibilidad, y solo emite warnings.

Ventajas:

- menos bloqueos;
- mas flexible para experimentos;
- permite probar bundles aun si la metadata es incompleta.

Desventajas:

- puede dejar una fabrica rota instalada;
- reduce trazabilidad;
- hace mas dificil diagnosticar fallos;
- contradice el modelo de validacion fuerte.

## Respuesta recomendada

Usar Opcion B:

```text
versiones independientes + compatibilidad estricta
```

La CLI, la fabrica y los schemas deben versionarse de forma independiente, pero `init` debe bloquear instalaciones incompatibles.

## Versiones recomendadas

### CLI

Version del paquete npm:

```text
packages/cli/package.json -> version
```

Ejemplo:

```json
{
  "name": "gridwork",
  "version": "0.1.0"
}
```

### Fabrica

Version del bundle:

```text
factory/.gridwork/factory.json -> factory_version
```

Ejemplo:

```json
{
  "factory_id": "gridwork",
  "factory_version": "1.0.0"
}
```

### Schemas

Version del contrato de manifests:

```text
factory/.gridwork/factory.json -> schema_version
bundle-manifest.json -> schema_version
```

Ejemplo:

```json
{
  "schema_version": "1.0.0"
}
```

## Metadata de compatibilidad

`bundle-manifest.json` debe declarar:

```json
{
  "factory_version": "1.0.0",
  "release_channel": "stable",
  "prerelease": false,
  "schema_version": "1.0.0",
  "required_cli_version": ">=0.1.0 <1.0.0",
  "compatible_schema_versions": [ "1.0.0" ],
  "breaking_changes": false
}
```

`factory.json` debe declarar:

```json
{
  "factoryId": "gridwork",
  "factoryVersion": "1.0.0",
  "schemaVersion": "1.0.0",
  "contractVersions": {
    "agent": "1.0.0",
    "workflow": "1.0.0",
    "skill": "1.0.0",
    "work_order": "1.0.0",
    "run": "1.0.0"
  }
}
```

## Reglas SemVer

### Factory version

```text
patch = correcciones compatibles de docs, prompts, templates o policies
minor = nuevas skills, workflows, agentes o templates compatibles
major = cambios incompatibles en estructura, contratos, lifecycle o permisos
```

### CLI version

```text
patch = bugfix compatible del instalador
minor = nuevas flags o validaciones compatibles
major = cambios incompatibles en init, lockfile o formato de bundle
```

### Schema version

```text
patch = aclaraciones o constraints compatibles
minor = nuevos campos opcionales compatibles
major = campos requeridos nuevos, cambios de semantica o estructura incompatible
```

## Validacion de `init`

Antes de instalar, la CLI debe comprobar:

- `required_cli_version` incluye la version actual de la CLI;
- `schema_version` del bundle es soportado por la CLI;
- `factory.json` y `bundle-manifest.json` declaran versiones coherentes;
- `factory_version` coincide con el tag `factory-v<version>`;
- prerelease requiere autorizacion explicita aunque sea compatible;
- manifests usan versiones de contrato soportadas;
- lockfile existente no queda actualizado si hay incompatibilidad.

Si falla compatibilidad, bloquear instalacion.

## Migraciones

Recomendacion v1:

```text
automatic_migrations_v1 = false
```

La CLI no debe migrar automaticamente una fabrica instalada. Si detecta incompatibilidad, debe generar reporte y sugerir:

- actualizar CLI;
- instalar una version de fabrica compatible;
- revisar release notes;
- resolver manualmente si hay personalizaciones.

## Reportes

Cada init debe escribir:

```text
.factory/init/<init-run-id>/
  compatibility-report.md
  compatibility.json
```

Debe incluir:

- version de CLI;
- version solicitada de fabrica;
- version resuelta de fabrica;
- tag;
- schema version;
- required CLI version;
- resultado compatible/incompatible;
- motivo de bloqueo;
- siguiente accion sugerida.

## Lockfile

El lockfile debe guardar:

```json
{
  "factory": {
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "contracts": {
      "agent": "1.0.0",
      "workflow": "1.0.0",
      "skill": "1.0.0"
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
  }
}
```

## Propuesta inicial

```text
cli_factory_versions_independent = true
factory_schema_versions_independent = true
bundle_declares_required_cli_version = true
bundle_declares_schema_version = true
factory_json_declares_contract_versions = true
init_blocks_incompatible_cli_version = true
init_blocks_unsupported_schema_version = true
init_blocks_contract_version_mismatch = true
init_uses_semver_compatibility = true
init_blocks_prerelease_without_allow_flag = true
init_best_effort_incompatible_install = false
automatic_migrations_v1 = false
init_writes_compatibility_report = true
lockfile_records_compatibility_result = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que la CLI permita instalar bundles con compatibilidad dudosa
mostrando warnings, o que bloquee cualquier incompatibilidad de CLI,
schema o contrato?
```

Mi recomendacion: bloquear incompatibilidades. Mantener versiones independientes, pero exigir `required_cli_version`, `schema_version` y contract versions compatibles antes de instalar.

## Respuesta del usuario

El usuario acepta la recomendacion:

- CLI, fabrica y schemas deben tener versiones independientes;
- el bundle debe declarar `required_cli_version`;
- el bundle debe declarar `schema_version`;
- `factory.json` debe declarar versiones de contrato;
- `init` debe bloquear incompatibilidades;
- v1 no debe hacer migraciones automaticas;
- `init` debe escribir reporte local de compatibilidad.

## Decision registrada

```text
cli_factory_versions_independent = true
factory_schema_versions_independent = true
bundle_declares_required_cli_version = true
bundle_declares_schema_version = true
factory_json_declares_contract_versions = true
init_blocks_incompatible_cli_version = true
init_blocks_unsupported_schema_version = true
init_blocks_contract_version_mismatch = true
init_uses_semver_compatibility = true
init_blocks_prerelease_without_allow_flag = true
init_best_effort_incompatible_install = false
automatic_migrations_v1 = false
init_writes_compatibility_report = true
lockfile_records_compatibility_result = true
```

## Regla

```text
CLI, fabrica y schemas versionan por separado.
El bundle declara que CLI y schemas soporta.
`factory.json` declara contract versions.
`init` bloquea incompatibilidades.
`init` bloquea prereleases si no fueron autorizados explicitamente.
V1 no migra automaticamente fabricas instaladas.
```

## Supuestos

- La fabrica puede cambiar mas rapido que la CLI.
- La CLI no debe publicar npm por cada cambio menor de prompts o templates.
- Los schemas son contratos, no simples documentos.
- V1 prioriza trazabilidad y seguridad sobre flexibilidad experimental.
- La validacion SemVer puede implementarse de forma minima.

## Riesgos

- Bloquear puede frustrar si una version esta mal declarada.
- Best effort puede instalar una fabrica que no funciona.
- Migraciones automaticas tempranas pueden crear mas complejidad que valor.
- Si no se registran contract versions, sera dificil diagnosticar incompatibilidades.

## Artefactos a crear o actualizar

- `factory/.gridwork/factory.json`
- `.gridwork/templates/bundle-manifest.json`
- `.gridwork/templates/compatibility-report.md`
- `packages/cli/src/init/compatibility.ts`
- `packages/cli/src/init/compatibility-report.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/src/validation/minimal-validator.ts`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta evita que el modelo de releases versionados se vuelva ambiguo.
- Complementa GQ-068: el manifest no solo verifica hash, tambien declara compatibilidad.
- Complementa GQ-069: la version resuelta debe ser compatible antes de instalar.
- Decision del usuario: aceptar compatibilidad estricta con bloqueo ante incompatibilidades.
- Revision posterior GQ-082: una version prerelease compatible sigue bloqueada si falta `--allow-prerelease`.
