# GQ-111 - Gate remoto para publicar factory-v0.1.0

- Estado: accepted
- Fuente: GQ-107, GQ-108, GQ-109, GQ-110
- Pregunta origen: GQ-111
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: tag `factory-v0.1.0`, push del tag y GitHub Release real

## Pregunta

Los artefactos finales ya fueron revisados localmente y estan listos desde el punto de vista mecanico. Como quieres avanzar con el publish remoto real?

La duda concreta:

```text
Quieres hacer un preflight remoto con GitHub CLI,
publicar directamente la release real,
o pausar aqui?
```

## Contexto

Artefactos revisados:

```text
artifacts_dir = .factory/runs/20260605-145303-factory-release/artifacts/release
factory_version = 0.1.0
factory_tag = factory-v0.1.0
source = Ainsiel/Gridwork
source_commit = 149e6ebde1bc
validation_status = pass
validation_blockers = 0
validation_warnings = 0
bundle_sha256 = 04df0ed2072a227c3e066cbafb276079850da47249f1a9dcf60829f1007c1f56
```

Como `GQ-110` puede generar cambios documentales despues del dry-run, la regla segura para publicar estos artefactos es no asumir `HEAD`. El tag debe apuntar al commit declarado por el manifest:

```bash
git tag factory-v0.1.0 149e6ebde1bc
git push origin factory-v0.1.0
gh release create factory-v0.1.0 gridwork-factory-v0.1.0.zip gridwork-factory-v0.1.0.manifest.json gridwork-factory-v0.1.0.sha256 gridwork-factory-v0.1.0.release-notes.md --repo Ainsiel/Gridwork --notes-file gridwork-factory-v0.1.0.release-notes.md
gh release view factory-v0.1.0 --repo Ainsiel/Gridwork
```

Los comandos `gh` deben ejecutarse desde:

```text
.factory/runs/20260605-145303-factory-release/artifacts/release
```

## Opciones

### Opcion A - Preflight remoto sin publicar

Validar autenticacion y estado remoto antes de crear side effects:

- `gh auth status`;
- confirmar que existe acceso a `Ainsiel/Gridwork`;
- confirmar que el tag remoto `factory-v0.1.0` no existe;
- confirmar que la release `factory-v0.1.0` no existe.

Ventajas:

- reduce riesgo antes del publish;
- detecta problemas de permisos o autenticacion;
- no crea tag, push ni release.

Desventajas:

- agrega un paso antes de publicar.

### Opcion B - Publicar release real ahora

Ejecutar tag, push del tag y `gh release create` con los assets revisados.

Ventajas:

- deja disponible la fabrica via GitHub Release;
- habilita el uso real con `npx gridwork init --factory-version 0.1.0 --source Ainsiel/Gridwork`.

Desventajas:

- crea estado remoto real;
- si falla a mitad, puede requerir limpieza manual;
- requiere `gh` autenticado y permisos.

### Opcion C - Pausar

No ejecutar acciones remotas todavia.

Ventajas:

- evita side effects remotos.

Desventajas:

- la fabrica `full-v1` sigue solo local.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = remote_publish_preflight_only
publish_real_release_now = false
```

Mi recomendacion es hacer un preflight remoto antes de publicar. La revision local ya paso, pero ahora el riesgo se mueve a permisos, autenticacion, existencia previa de tag/release y consistencia con el commit del manifest.

## Pregunta para decidir

La duda clave:

```text
Quieres hacer preflight remoto,
publicar directamente,
o pausar aqui?
```

Mi recomendacion: preflight remoto sin publicar.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = remote_publish_preflight_only
publish_real_release_now = false
```

Resultado del preflight remoto:

```text
gh_auth_status = pass
gh_account = Ainsiel
gh_token_scopes = gist,read:org,repo,workflow
repo = Ainsiel/Gridwork
repo_visibility = PUBLIC
viewer_permission = ADMIN
default_branch = main
origin = https://github.com/Ainsiel/Gridwork.git
source_commit = 149e6ebde1bc
local_head = 149e6ebde1bc
local_tag_factory_v0_1_0_exists = false
remote_tag_factory_v0_1_0_exists = false
remote_release_factory_v0_1_0_exists = false
publish_real_release_executed = false
tag_created = false
tag_pushed = false
github_release_created = false
```

Observacion:

```text
gh release view devolvio "release not found", que en este preflight es el resultado esperado.
```

Regla aplicada:

```text
El preflight remoto solo consulta estado.
No crea tag, no hace push y no crea GitHub Release.
```

La publicacion real queda separada en `GQ-112`.
