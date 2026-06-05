# GQ-109 - Preparar commit fuente antes de publicar factory-v0.1.0

- Estado: accepted
- Fuente: GQ-107, GQ-108
- Pregunta origen: GQ-109
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: commit fuente, tag `factory-v0.1.0`, release real de fabrica

## Pregunta

El review de GQ-108 encontro que los artefactos del release dry-run son validos, pero el repositorio tiene cambios sin commit. Como quieres preparar la fuente antes de publicar?

La duda concreta:

```text
Quieres que preparemos un commit fuente con el estado actual de Gridwork,
regenere el dry-run usando el nuevo commit,
y despues volvamos a decidir si publicamos factory-v0.1.0?
```

## Por que importa

Un release real debe poder trazarse a un commit que contenga exactamente el contenido publicado. Ahora mismo:

```text
source_commit_in_manifest = 9958f18acf77
worktree_dirty = true
untracked_source_files = true
```

Publicar el release sin resolver esto crearia una release cuyo bundle viene del working tree, pero cuyo tag podria apuntar a un commit que no representa ese contenido.

## Opciones

### Opcion A - Preparar commit fuente y regenerar dry-run

Revisar los cambios, preparar un commit local de Gridwork, regenerar `gridwork release factory --dry-run` con el nuevo commit y volver a revisar.

Ventajas:

- deja trazabilidad correcta;
- evita publicar un bundle que no coincide con el tag;
- mantiene publish real separado.

Desventajas:

- requiere un paso extra antes de publicar.

### Opcion B - Solo revisar cambios sin commit

Inspeccionar el diff y decidir despues.

Ventajas:

- permite revisar con calma.

Desventajas:

- sigue bloqueando publish real.

### Opcion C - Publicar ignorando el blocker

Ejecutar tag, push y release desde el estado actual.

Ventajas:

- publica mas rapido.

Desventajas:

- no recomendado;
- rompe trazabilidad source commit -> bundle;
- puede publicar una release dificil de reproducir.

### Opcion D - Pausar

No avanzar.

Ventajas:

- evita side effects.

Desventajas:

- la release full-v1 queda solo local.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = prepare_source_commit_then_regenerate_dry_run
publish_real_release_now = false
```

Mi recomendacion es no publicar todavia. Primero hay que versionar el estado fuente, regenerar el dry-run con el commit correcto y recien ahi decidir si se ejecutan comandos remotos.

## Pregunta para decidir

La duda clave:

```text
Quieres que prepare el commit fuente y regenere el dry-run,
que solo revisemos el diff,
que pausemos,
o que publiques ignorando el blocker?
```

Mi recomendacion: preparar commit fuente y regenerar dry-run, sin publicar remoto.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = prepare_source_commit_then_regenerate_dry_run
publish_real_release_now = false
```

Resultado:

```text
source_commit_preparation_started = true
source_commit_created = true
factory_release_dry_run_must_use_latest_head = true
publish_real_release_executed = false
tag_created = false
tag_pushed = false
github_release_created = false
```

Regla aplicada:

```text
No publicar release real hasta que el dry-run use el commit fuente mas reciente.
No crear tag, push ni GitHub Release en esta decision.
```

## Evidencia

Se preparo el estado fuente para que el siguiente dry-run de fabrica use `HEAD` como `sourceCommit` y ya no apunte a un commit anterior al contenido full-v1.

El publish real queda diferido a una decision separada.

