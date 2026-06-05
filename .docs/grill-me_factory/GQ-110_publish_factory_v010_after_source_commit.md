# GQ-110 - Publicar factory-v0.1.0 despues del commit fuente

- Estado: pending
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

Pendiente.

