# GQ-107 - Preparar release dry-run de fabrica full-v1

- Estado: accepted
- Fuente: GQ-081, GQ-102, GQ-106
- Pregunta origen: GQ-107
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: release de fabrica `factory-v<version>` para distribuir full-v1

## Pregunta

Ahora que la fabrica `full-v1` esta implementada localmente, preparamos un release dry-run de fabrica?

La duda concreta:

```text
Quieres que ejecute `gridwork release factory --dry-run`
para generar bundle, manifest, checksums, release notes y publish plan
de la fabrica full-v1 sin publicar nada real?
```

## Por que importa

Fase 6 cambio el contenido instalable de la fabrica. Antes de publicar o consumir una release real, conviene validar el contrato productor-consumidor completo:

- bundle zip;
- manifest;
- checksums;
- release notes;
- publish commands;
- instalacion con `gridwork init --factory-version`.

## Opciones

### Opcion A - Ejecutar release dry-run full-v1

Generar artefactos locales de release sin crear tags, sin GitHub Release y sin push.

Ventajas:

- valida que full-v1 se puede distribuir;
- no tiene side effects remotos;
- deja evidencia local para revisar antes de publicar.

Desventajas:

- no publica todavia la fabrica.

### Opcion B - Revisar archivos full-v1 antes del release dry-run

Hacer una revision documental/manual adicional antes de preparar artefactos.

Ventajas:

- reduce riesgo de empaquetar contenido que quieras ajustar.

Desventajas:

- retrasa la validacion e2e de release.

### Opcion C - Pausar

No preparar release dry-run todavia.

Ventajas:

- permite revisar con calma la fabrica full-v1.

Desventajas:

- no sabemos aun si el release full-v1 queda listo para consumo.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = factory_release_dry_run_full_v1
publish_real_release = false
create_tag = false
push_tag = false
gh_release_create = false
```

Mi recomendacion es generar un release dry-run. Ya existen tests pasando, y el dry-run no publica nada; solo deja artefactos locales para inspeccion.

## Pregunta para decidir

La duda clave:

```text
Quieres que prepare el release dry-run de la fabrica full-v1,
que haga otra revision antes,
o que pausemos aqui?
```

Mi recomendacion: ejecutar release dry-run full-v1 sin publicar nada.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = factory_release_dry_run_full_v1
publish_real_release = false
create_tag = false
push_tag = false
gh_release_create = false
```

Resultado:

```text
factory_release_dry_run_completed = true
factory_version = 0.1.0
factory_tag = factory-v0.1.0
factory_profile = full-v1
source = Ainsiel/Gridwork
source_commit = 9958f18acf77
artifacts_dir = .factory/runs/20260605-143926-factory-release/artifacts/release
validation_status = pass
validation_blockers = 0
validation_warnings = 0
bundle_file_count = 114
bundle_sha256 = sha256:2d83dc3204a0aba4e572bf38aade5f864239587b5b3c7d751205cd7a86139922
publish_executed = false
tag_created = false
tag_pushed = false
github_release_created = false
```

Artefactos generados:

- `.factory/runs/20260605-143926-factory-release/artifacts/release/gridwork-factory-v0.1.0.zip`
- `.factory/runs/20260605-143926-factory-release/artifacts/release/gridwork-factory-v0.1.0.manifest.json`
- `.factory/runs/20260605-143926-factory-release/artifacts/release/gridwork-factory-v0.1.0.sha256`
- `.factory/runs/20260605-143926-factory-release/artifacts/release/gridwork-factory-v0.1.0.release-notes.md`
- `.factory/runs/20260605-143926-factory-release/artifacts/release/factory-release-validation.json`
- `.factory/runs/20260605-143926-factory-release/artifacts/release/publish-commands.md`

Publish commands preparados pero no ejecutados:

```text
git tag factory-v0.1.0
git push origin factory-v0.1.0
gh release create factory-v0.1.0 ...
gh release view factory-v0.1.0 --repo Ainsiel/Gridwork
```

## Evidencia

El manifest generado declara:

```text
factory_id = gridwork-full-v1
factory_profile = full-v1
generated_product_code = false
release_channel = stable
release_mode = manual_gh_release
```

La validacion local de release quedo en `pass` sin blockers ni warnings.

