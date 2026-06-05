# GQ-112 - Publicar release real factory-v0.1.0

- Estado: accepted
- Fuente: GQ-107, GQ-108, GQ-109, GQ-110, GQ-111
- Pregunta origen: GQ-112
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: tag `factory-v0.1.0`, push de tag y GitHub Release real

## Pregunta

El preflight remoto ya paso. Quieres publicar ahora la release real `factory-v0.1.0`?

La duda concreta:

```text
Quieres crear el tag local apuntando al sourceCommit del manifest,
pushear ese tag a origin y crear la GitHub Release con los assets revisados?
```

## Estado actual

```text
factory_version = 0.1.0
factory_tag = factory-v0.1.0
source = Ainsiel/Gridwork
source_commit = 149e6ebde1bc
local_head = 149e6ebde1bc
repo_permission = ADMIN
remote_tag_exists = false
remote_release_exists = false
validation_status = pass
validation_blockers = 0
validation_warnings = 0
bundle_sha256 = 04df0ed2072a227c3e066cbafb276079850da47249f1a9dcf60829f1007c1f56
```

Artefactos:

```text
.factory/runs/20260605-145303-factory-release/artifacts/release/gridwork-factory-v0.1.0.zip
.factory/runs/20260605-145303-factory-release/artifacts/release/gridwork-factory-v0.1.0.manifest.json
.factory/runs/20260605-145303-factory-release/artifacts/release/gridwork-factory-v0.1.0.sha256
.factory/runs/20260605-145303-factory-release/artifacts/release/gridwork-factory-v0.1.0.release-notes.md
```

## Comandos previstos

Desde la raiz del repo:

```bash
git tag factory-v0.1.0 149e6ebde1bc
git push origin factory-v0.1.0
```

Desde `.factory/runs/20260605-145303-factory-release/artifacts/release`:

```bash
gh release create factory-v0.1.0 gridwork-factory-v0.1.0.zip gridwork-factory-v0.1.0.manifest.json gridwork-factory-v0.1.0.sha256 gridwork-factory-v0.1.0.release-notes.md --repo Ainsiel/Gridwork --notes-file gridwork-factory-v0.1.0.release-notes.md
gh release view factory-v0.1.0 --repo Ainsiel/Gridwork
```

## Opciones

### Opcion A - Publicar release real ahora

Crear tag, pushear tag y crear GitHub Release con los assets revisados.

Ventajas:

- deja disponible la fabrica full-v1 como release descargable;
- habilita `npx gridwork init --factory-version 0.1.0 --source Ainsiel/Gridwork`;
- todos los gates locales y remotos previos ya pasaron.

Desventajas:

- crea estado remoto real;
- si falla en medio, puede requerir cleanup manual.

### Opcion B - Pausar antes del publish

No ejecutar acciones remotas todavia.

Ventajas:

- evita side effects remotos.

Desventajas:

- la fabrica full-v1 sigue solo local.

### Opcion C - Regenerar dry-run antes de publicar

Crear otro commit fuente y regenerar los artefactos antes del publish.

Ventajas:

- incorpora cualquier documento nuevo posterior al dry-run en la trazabilidad de source commit.

Desventajas:

- reinicia parte del gate de release;
- retrasa una publicacion cuyos artefactos ya pasaron validacion;
- no es necesario si se publica el tag apuntando exactamente a `149e6ebde1bc`.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = publish_real_factory_release_v0_1_0
publish_real_release_now = true
tag_target_commit = 149e6ebde1bc
```

Mi recomendacion es publicar ahora, usando el commit exacto del manifest como target del tag. Ya pasaron validacion local, revision de artefactos, preflight remoto, autenticacion, permisos y comprobacion de inexistencia de tag/release.

## Pregunta para decidir

La duda clave:

```text
Quieres publicar la release real factory-v0.1.0 ahora?
```

Mi recomendacion: publicar la release real ahora usando `factory-v0.1.0 -> 149e6ebde1bc`.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = publish_real_factory_release_v0_1_0
publish_real_release_now = true
tag_target_commit = 149e6ebde1bc
```

Resultado:

```text
tag_created = true
tag_name = factory-v0.1.0
tag_target_commit = 149e6ebde1bc872f901fee37c49c0bac1016dee6
tag_pushed = true
remote_tag_exists = true
github_release_created = true
github_release_url = https://github.com/Ainsiel/Gridwork/releases/tag/factory-v0.1.0
is_draft = false
is_prerelease = false
asset_count = 4
publish_real_release_executed = true
```

Assets publicados:

```text
gridwork-factory-v0.1.0.zip
gridwork-factory-v0.1.0.manifest.json
gridwork-factory-v0.1.0.sha256
gridwork-factory-v0.1.0.release-notes.md
```

Verificacion remota posterior:

```text
remote_tag_ref = refs/tags/factory-v0.1.0
remote_tag_commit = 149e6ebde1bc872f901fee37c49c0bac1016dee6
release_view_status = pass
zip_asset_digest = sha256:04df0ed2072a227c3e066cbafb276079850da47249f1a9dcf60829f1007c1f56
manifest_asset_digest = sha256:aa6e6e160f9d903d9e6e66902587986d9e0293dcb47b6485e13c2737c51b3f00
release_notes_asset_digest = sha256:19ad0c4cf6f030cf8b24379d94c329d90a80155b973073cd48b4b117718661f9
```

La release real `factory-v0.1.0` queda publicada.
