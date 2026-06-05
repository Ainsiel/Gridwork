# GQ-110 - Publicar factory-v0.1.0 despues del commit fuente

- Estado: accepted
- Fuente: GQ-107, GQ-108, GQ-109
- Pregunta origen: GQ-110
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: tag `factory-v0.1.0`, push de tag y GitHub Release real

## Pregunta

Una vez regenerado el dry-run con el commit fuente correcto, quieres publicar la release real `factory-v0.1.0`?

La duda concreta:

```text
Quieres ejecutar los comandos remotos preparados para crear tag,
pushear tag y crear GitHub Release con los assets de fabrica?
```

## Por que importa

Esta accion crea estado remoto real:

- `git tag factory-v0.1.0`;
- `git push origin factory-v0.1.0`;
- `gh release create factory-v0.1.0 ...`;
- assets descargables por `gridwork init --factory-version 0.1.0`.

## Opciones

### Opcion A - Publicar release real con aprobacion explicita

Ejecutar los comandos remotos preparados por el dry-run mas reciente.

Ventajas:

- deja disponible la fabrica `full-v1` como GitHub Release;
- habilita el camino real de `npx gridwork init --factory-version 0.1.0 --source Ainsiel/Gridwork`.

Desventajas:

- crea tag y release remotos;
- requiere `gh` autenticado y permisos en `Ainsiel/Gridwork`;
- si algo falla, puede requerir cleanup manual.

### Opcion B - Revisar artefactos finales una vez mas

Inspeccionar manifest, checksums, release notes y publish commands del dry-run final antes de publicar.

Ventajas:

- reduce riesgo antes de side effects remotos;
- mantiene el ultimo gate humano.

Desventajas:

- no publica todavia.

### Opcion C - Pausar

No publicar aun.

Ventajas:

- evita side effects remotos.

Desventajas:

- la release full-v1 queda solo local.

## Respuesta recomendada

Usar Opcion B:

```text
next_step = review_final_release_artifacts_before_remote_publish
publish_real_release_now = false
```

Mi recomendacion es revisar los artefactos finales una vez mas antes de ejecutar comandos remotos. Ya estamos muy cerca, pero el publish real merece su propio gate explicito.

## Pregunta para decidir

La duda clave:

```text
Quieres revisar los artefactos finales,
publicar la release real,
o pausar aqui?
```

Mi recomendacion: revisar artefactos finales antes del publish real.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = review_final_release_artifacts_before_remote_publish
publish_real_release_now = false
```

Resultado de la revision final:

```text
final_artifact_review_completed = true
artifacts_dir = .factory/runs/20260605-145303-factory-release/artifacts/release
factory_version = 0.1.0
factory_tag = factory-v0.1.0
source = Ainsiel/Gridwork
source_commit = 149e6ebde1bc
manifest_review = pass
checksum_review = pass
zip_inventory_review = pass
validation_status = pass
validation_blockers = 0
validation_warnings = 0
zip_file_count = 114
zip_all_files_under_gridwork = true
zip_forbidden_product_code_paths = 0
local_tag_exists = false
publish_real_release_executed = false
tag_created = false
tag_pushed = false
github_release_created = false
```

Regla aplicada:

```text
Esta decision solo revisa artefactos locales.
No crea tag, no hace push y no crea GitHub Release.
El publish real queda separado en GQ-111 con aprobacion explicita.
```

Nota de trazabilidad:

```text
El manifest apunta a source_commit = 149e6ebde1bc.
Si se publican los artefactos revisados, el tag remoto debe apuntar a ese commit exacto
o debe regenerarse un nuevo dry-run con el nuevo HEAD antes de publicar.
```
