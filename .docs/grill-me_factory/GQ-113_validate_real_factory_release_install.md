# GQ-113 - Validar instalacion desde release real factory-v0.1.0

- Estado: accepted
- Fuente: GQ-112
- Pregunta origen: GQ-113
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: validacion de consumo real de GitHub Release

## Pregunta

La release real `factory-v0.1.0` ya esta publicada. Quieres validar que `gridwork init` pueda consumirla desde GitHub Release usando el CLI local?

La duda concreta:

```text
Quieres ejecutar una prueba smoke remota en un directorio temporal,
descargando los assets reales desde GitHub Release,
sin publicar nada nuevo?
```

## Por que importa

Publicar assets no garantiza por si solo que el camino de consumo funcione completo. La validacion smoke confirma:

- resolucion de release real;
- descarga de manifest, checksums y zip;
- verificacion SHA;
- extraccion segura;
- instalacion en `.gridwork/`;
- generacion de `.gridwork-lock.json`;
- reportes de init en `.factory/`.

## Opciones

### Opcion A - Smoke test remoto con CLI local

Ejecutar el CLI local compilado contra `Ainsiel/Gridwork` y `factory-v0.1.0` en un directorio temporal dentro de `.factory/runs/`.

Ventajas:

- valida el camino real de descarga antes de publicar la CLI en npm;
- no crea estado remoto nuevo;
- si falla, el problema queda acotado al consumo de release.

Desventajas:

- requiere red y acceso a GitHub;
- escribe archivos temporales locales en `.factory/`.

### Opcion B - Saltar directo a publicacion npm de la CLI

Usar el resultado de la release como suficiente y avanzar a publicar el paquete npm.

Ventajas:

- avanza mas rapido hacia `npx gridwork`.

Desventajas:

- si el consumo real falla, se descubre despues de publicar la CLI.

### Opcion C - Pausar

No validar todavia.

Ventajas:

- evita trabajo adicional.

Desventajas:

- la release queda publicada sin prueba de consumo end-to-end.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = smoke_test_real_factory_release_with_local_cli
publish_new_remote_state = false
```

Mi recomendacion es validar la release real con el CLI local antes de publicar la CLI npm. Es el siguiente punto de control natural: ya probamos el build local y la publicacion remota, ahora toca probar que un proyecto nuevo pueda descargar e instalar la fabrica publicada.

## Pregunta para decidir

La duda clave:

```text
Quieres ejecutar smoke test remoto de factory-v0.1.0 con el CLI local?
```

Mi recomendacion: si, validar la release real antes del publish npm.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = smoke_test_real_factory_release_with_local_cli
publish_new_remote_state = false
```

Resultado:

```text
remote_release_smoke_completed = true
target_dir = .factory/runs/20260605-remote-release-smoke-v010/target
cli_used = packages/cli/dist/index.js
command = gridwork init --factory-version 0.1.0 --source Ainsiel/Gridwork --verbose
source_type = github-release
source = Ainsiel/Gridwork
release_tag = factory-v0.1.0
factory_profile = full-v1
factory_version = 0.1.0
generated_product_code = false
lockfile_created = true
runtime_reports_created = true
publish_new_remote_state = false
```

Primera ejecucion:

```text
init_run_id = 20260605-183654-init
status = success
created = 114
updated = 0
unchanged = 0
conflicts = 0
validation_errors = 0
validation_status = pass
```

Segunda ejecucion idempotente:

```text
init_run_id = 20260605-183753-init
status = success
created = 0
updated = 0
unchanged = 114
conflicts = 0
validation_errors = 0
validation_status = pass
```

Evidencia del lockfile:

```text
lockfile_factory_source_type = github-release
lockfile_factory_source = Ainsiel/Gridwork
lockfile_factory_version = 0.1.0
lockfile_factory_tag = factory-v0.1.0
lockfile_factory_sha256 = sha256:04df0ed2072a227c3e066cbafb276079850da47249f1a9dcf60829f1007c1f56
lockfile_factory_source_commit = 149e6ebde1bc
compatibility_status = compatible
auth_mode = none
```

Conclusion:

```text
La release real factory-v0.1.0 es consumible por el CLI local.
El camino descarga -> verifica -> extrae -> instala -> lockfile -> reportes funciona.
```
