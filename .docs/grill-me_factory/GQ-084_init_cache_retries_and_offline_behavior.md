# GQ-084 - Cache, reintentos y comportamiento offline de `init`

- Estado: accepted
- Fuente: decisiones GQ-003, GQ-020, GQ-066, GQ-068, GQ-069, GQ-074, GQ-077 y GQ-083
- Pregunta origen: GQ-084
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, `.factory/cache/`, `.factory/init/<init-run-id>/`, descarga de bundles, reportes de source/download, lockfile

## Pregunta

Debe `npx gridwork init` guardar bundles descargados en cache local y como debe comportarse cuando no hay red?

La duda concreta:

```text
Si GitHub falla, hay rate limit o el usuario esta offline,
puede `init` reutilizar un bundle descargado antes?
```

## Por que importa

GQ-083 decidio que `init` descarga desde GitHub Releases sin requerir `gh`, con token opcional. Aun asi, pueden fallar:

- red;
- DNS;
- GitHub rate limit;
- repo privado sin token;
- descarga interrumpida;
- re-run de `init` en una fabrica ya instalada;
- reparacion de archivos faltantes.

Sin cache, cualquier reparacion que necesite el bundle vuelve a depender de GitHub. Con cache mal disenada, se puede instalar algo viejo, corrupto o equivocado.

## Opciones

### Opcion A - Sin cache persistente

`init` descarga todo cada vez que necesita un bundle.

Puede usar staging temporal por run:

```text
.factory/init/<init-run-id>/downloads/
```

pero no conserva cache.

Ventajas:

- simple;
- menos archivos locales;
- menos reglas;
- evita que cache vieja confunda.

Desventajas:

- no ayuda si no hay red;
- reintentos largos pueden repetir descargas;
- reparar archivos faltantes depende siempre de GitHub;
- rate limits afectan mas.

### Opcion B - Cache global de usuario

Guardar bundles en una ruta global:

```text
~/.gridwork/cache/
```

Ventajas:

- varios proyectos reutilizan descargas;
- mejor para muchos repos;
- puede reducir rate limits.

Desventajas:

- escribe fuera del repo destino;
- complica permisos y limpieza;
- puede guardar metadatos no deseados;
- es menos transparente para v1;
- contradice el modelo de runtime local dentro de `.factory/`.

### Opcion C - Cache local verificada en `.factory/`

Guardar bundles verificados dentro del repo destino:

```text
.factory/cache/bundles/
```

La cache es local, ignorada por Git y nunca se confia sin hash.

Ventajas:

- respeta el modelo `.factory/` runtime local;
- no escribe en home ni config global;
- permite reparar una version bloqueada si ya fue descargada;
- conserva evidencia local;
- reduce descargas repetidas dentro del mismo repo.

Desventajas:

- no ayuda en un repo nuevo sin cache;
- ocupa espacio local;
- no comparte cache entre proyectos;
- requiere limpiar entradas viejas;
- necesita reglas estrictas de hash.

## Respuesta recomendada

Usar Opcion C:

```text
init_cache_model_v1 = project_local_verified_cache
```

V1 debe tener:

- staging por run en `.factory/init/<init-run-id>/downloads/`;
- cache local verificada en `.factory/cache/bundles/`;
- no cache global en home;
- no confiar en cache sin verificar hash;
- no instalar latest desde cache sin resolver metadata remota;
- no hacer offline install desde cero si no existe bundle verificado.

## Reglas de cache

La cache guarda assets ya verificados:

```text
.factory/cache/bundles/
  github-release/
    owner__repo/
      factory-v1.0.0/
        gridwork-factory-v1.0.0.zip
        bundle-manifest.json
        SHA256SUMS.txt
        cache-entry.json
```

`cache-entry.json` debe registrar:

```json
{
  "sourceType": "github-release",
  "source": "owner/repo",
  "version": "1.0.0",
  "tag": "factory-v1.0.0",
  "assetName": "gridwork-factory-v1.0.0.zip",
  "sha256": "sha256:<hash>",
  "bundleManifestHash": "sha256:<hash>",
  "sourceCommit": "<git-sha>",
  "cachedAt": "2026-06-04T00:00:00Z"
}
```

No debe guardar:

```text
tokens
headers
Authorization
paths absolutos
logs completos
```

## Uso de cache

Primera instalacion sin lockfile:

```bash
npx gridwork init
```

Requiere red para resolver ultimo stable compatible. La cache no decide que es latest.

Primera instalacion con version exacta:

```bash
npx gridwork init --factory-version 1.0.0
```

Puede usar cache solo si:

- source coincide;
- version coincide;
- tag coincide;
- manifest coincide;
- hash coincide;
- compatibilidad pasa.

Re-run con lockfile:

```bash
npx gridwork init
```

Puede:

- validar archivos locales con hashes del lockfile sin red;
- reparar archivos faltantes usando cache verificada;
- descargar desde red si cache no existe;
- fallar con reporte si no hay red ni cache suficiente.

## Reintentos y timeouts

V1 debe tener reintentos conservadores:

```text
download_retry_count = 2
download_retry_backoff = short_exponential
download_timeout_seconds = 30
metadata_timeout_seconds = 15
```

No reintentar indefinidamente.

No reintentar si:

- auth failure claro;
- asset no existe;
- hash mismatch;
- incompatibilidad;
- paths prohibidos.

## Offline

V1 no debe prometer instalacion offline completa.

Permitir comportamiento offline limitado:

```text
offline_repair_locked_version_if_cache_available = true
offline_new_install_without_cache = false
offline_update_without_cache = false
```

No agregar `--offline` en v1. Si la red falla, `init` puede intentar cache segura cuando la version exacta ya esta determinada por flags o lockfile.

## Reportes

Cada run debe registrar:

```text
.factory/init/<init-run-id>/
  download-report.md
  download-report.json
  cache-report.md
  cache-report.json
```

Los reportes deben indicar:

- si se uso red;
- si se uso cache;
- motivo de cache hit/miss;
- reintentos;
- timeouts;
- rate limit;
- hash verificado;
- si no se aplicaron archivos.

## Propuesta inicial

```text
init_cache_model_v1 = project_local_verified_cache
init_cache_path = .factory/cache/bundles/
init_staging_download_path = .factory/init/<init-run-id>/downloads/
init_global_cache_v1 = false
init_cache_committed = false
init_cache_contains_secrets = false
init_cache_requires_hash_verification = true
init_cache_can_repair_locked_version = true
init_cache_can_install_exact_version = true
init_cache_can_resolve_latest = false
init_offline_new_install_v1 = false
init_offline_update_without_cache_v1 = false
init_offline_repair_with_verified_cache_v1 = true
init_offline_flag_v1 = false
init_download_retry_count = 2
init_download_timeout_seconds = 30
init_metadata_timeout_seconds = 15
init_download_report_enabled = true
init_cache_report_enabled = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que v1 no tenga cache persistente,
o que tenga una cache local verificada en `.factory/cache/bundles/`
para reparar versiones bloqueadas y reutilizar bundles exactos?
```

Mi recomendacion: cache local verificada en `.factory/`, sin cache global y sin prometer instalacion offline completa. La cache ayuda a reparar o reinstalar una version exacta, pero no decide `latest`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe usar cache local verificada en `.factory/cache/bundles/`;
- los downloads temporales del run viven en `.factory/init/<init-run-id>/downloads/`;
- no hay cache global en home en v1;
- la cache no se commitea;
- la cache no contiene secretos;
- la cache solo se usa despues de verificar hashes;
- la cache puede reparar una version bloqueada por lockfile;
- la cache puede reutilizar una version exacta;
- la cache no resuelve `latest`;
- v1 no promete instalacion offline completa;
- v1 no tendra flag `--offline`;
- `init` debe tener reintentos y timeouts conservadores;
- deben existir reportes de download y cache.

## Decision registrada

```text
init_cache_model_v1 = project_local_verified_cache
init_cache_path = .factory/cache/bundles/
init_staging_download_path = .factory/init/<init-run-id>/downloads/
init_global_cache_v1 = false
init_cache_committed = false
init_cache_contains_secrets = false
init_cache_requires_hash_verification = true
init_cache_can_repair_locked_version = true
init_cache_can_install_exact_version = true
init_cache_can_resolve_latest = false
init_offline_new_install_v1 = false
init_offline_update_without_cache_v1 = false
init_offline_repair_with_verified_cache_v1 = true
init_offline_flag_v1 = false
init_download_retry_count = 2
init_download_timeout_seconds = 30
init_metadata_timeout_seconds = 15
init_download_report_enabled = true
init_cache_report_enabled = true
```

## Regla

```text
La cache vive en `.factory/cache/bundles/`.
Los downloads temporales viven en `.factory/init/<init-run-id>/downloads/`.
La cache nunca se commitea.
La cache nunca contiene tokens, headers ni secretos.
La cache solo se usa con hash verificado.
La cache puede reparar o reinstalar una version exacta.
La cache no decide `latest`.
V1 no tiene cache global ni `--offline`.
Offline solo permite reparar una version bloqueada si ya existe cache verificada.
```

## Supuestos

- `.factory/` es runtime local ignorado.
- La CLI verifica hashes antes de aplicar archivos.
- El usuario quiere evitar configuracion global y dependencias externas.
- Repos nuevos sin cache necesitan red.
- Cache debe ser una optimizacion, no una fuente de verdad.

## Riesgos

- Cache sin hash puede instalar assets corruptos o equivocados.
- Cache global puede complicar permisos y limpieza.
- Offline completo puede prometer mas de lo que v1 puede garantizar.
- Usar cache para resolver latest romperia trazabilidad.

## Artefactos a crear o actualizar

- `packages/cli/src/init/cache.ts`
- `packages/cli/src/init/download-bundle.ts`
- `packages/cli/src/init/download-report.ts`
- `packages/cli/src/init/cache-report.ts`
- `packages/cli/tests/cache.test.ts`
- `.gridwork/templates/download-report.md`
- `.gridwork/templates/cache-report.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta complementa GQ-083: acceso a GitHub puede fallar por rate limits o red.
- Complementa GQ-066: `init` sin version repara la version bloqueada por lockfile.
- Complementa GQ-077: lockfile sigue siendo fuente de version exacta; cache solo guarda assets verificados.
- Complementa GQ-020: cache y reportes viven en `.factory/`, no en Git.
- Decision del usuario: aceptar cache local verificada en `.factory/`, sin cache global y sin offline completo en v1.
