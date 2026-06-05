# GQ-108 - Publicar release real de fabrica full-v1 0.1.0

- Estado: accepted
- Fuente: GQ-081, GQ-102, GQ-107
- Pregunta origen: GQ-108
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: tag `factory-v0.1.0` y GitHub Release real en `Ainsiel/Gridwork`

## Pregunta

Ahora que el release dry-run de fabrica full-v1 paso, quieres publicar la release real?

La duda concreta:

```text
Quieres ejecutar los comandos remotos para crear tag,
pushear tag y crear GitHub Release factory-v0.1.0?
```

## Por que importa

Esta decision ya no es solo local. Publicar una release real crea estado remoto:

- tag Git;
- push a GitHub;
- GitHub Release;
- assets descargables por `gridwork init --factory-version 0.1.0`.

## Opciones

### Opcion A - Revisar artefactos y publicar con aprobacion explicita

Revisar los artefactos generados y luego ejecutar los comandos remotos si el usuario aprueba exactamente ese publish.

Ventajas:

- convierte `factory-v0.1.0` en una release consumible;
- mantiene un gate humano antes de side effects remotos.

Desventajas:

- crea estado remoto real;
- requiere `gh` autenticado y permisos en el repo.

### Opcion B - Solo revisar artefactos

Inspeccionar manifest, checksums, release notes y publish commands sin publicar todavia.

Ventajas:

- evita side effects remotos;
- permite ajustar contenido antes de crear tag.

Desventajas:

- `gridwork init --factory-version 0.1.0` no quedara disponible desde GitHub Releases aun.

### Opcion C - Regenerar dry-run con otra version

Cambiar version o source y preparar un nuevo dry-run.

Ventajas:

- corrige versionado antes de publicar.

Desventajas:

- retrasa la publicacion real.

### Opcion D - Pausar

No revisar ni publicar por ahora.

Ventajas:

- evita cualquier riesgo remoto.

Desventajas:

- la release full-v1 queda solo como artefacto local.

## Respuesta recomendada

Usar Opcion B antes de cualquier publish real:

```text
next_step = review_release_artifacts_before_real_publish
publish_real_release_now = false
```

Mi recomendacion es revisar los artefactos una vez mas antes de ejecutar comandos remotos. El dry-run paso, pero publicar una release real debe ser una aprobacion separada y explicita.

## Pregunta para decidir

La duda clave:

```text
Quieres que revisemos los artefactos antes de publicar,
que publiquemos la release real con aprobacion explicita,
que regenere el dry-run con otra version,
o que pausemos aqui?
```

Mi recomendacion: revisar artefactos antes de publicar la release real.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = review_release_artifacts_before_real_publish
publish_real_release_now = false
```

Resultado de revision:

```text
artifact_review_completed = true
manifest_review = pass
checksum_review = pass
zip_inventory_review = pass
publish_commands_review = pass
local_tag_exists = false
publish_real_release_executed = false
release_ready_for_publish = false
```

Hallazgo bloqueante:

```text
blocker = source_commit_does_not_represent_working_tree
source_commit_in_manifest = 9958f18acf77
worktree_dirty = true
untracked_source_files = true
```

Los artefactos del dry-run son validos como bundle local, pero no deben publicarse todavia porque el repositorio tiene cambios sin commit. Si se ejecutara `git tag factory-v0.1.0` ahora, el tag apuntaria a `9958f18acf77`, que no contiene necesariamente el contenido `full-v1` incluido en el bundle generado desde el working tree.

## Evidencia de revision

El review mecanico del zip confirmo:

```text
sha_matches_manifest = true
zip_file_count = 114
manifest_file_count = 114
all_entries_rooted_in_gridwork = true
forbidden_path_count = 0
```

El manifest revisado declara:

```text
factory_id = gridwork-full-v1
factory_version = 0.1.0
factory_profile = full-v1
generated_product_code = false
source = Ainsiel/Gridwork
source_commit = 9958f18acf77
source_tag = factory-v0.1.0
```

Los comandos remotos quedaron solo preparados:

```text
git tag factory-v0.1.0
git push origin factory-v0.1.0
gh release create factory-v0.1.0 ...
```

No fueron ejecutados.

