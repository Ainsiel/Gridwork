# GQ-123 - Decidir cuando publicar la primera release CLI automatizada

- Estado: pending
- Fuente: GQ-122
- Pregunta origen: GQ-123
- Fecha de apertura: 2026-06-06
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: futura version `gridwork@0.1.1`, tag `cli-v0.1.1`, Trusted Publishing

## Pregunta

El pipeline de GitHub Actions ya paso su dry-run remoto. Cuando quieres hacer la primera publicacion automatizada real mediante Trusted Publishing?

La duda concreta:

```text
Quieres publicar `gridwork@0.1.1` ahora solo para verificar Trusted Publishing,
o esperar hasta tener un cambio funcional real de la CLI?
```

## Contexto

Estado actual:

```text
factory_v0_1_0_published = true
gridwork_v0_1_0_published = true
npx_gridwork_v0_1_0_init = pass
trusted_publisher_configured = true
publish_cli_remote_dry_run = pass
publish_cli_remote_dry_run_id = 27066803619
npm_publish_step_in_dry_run = skipped
npm_latest = 0.1.0
cli_v0_1_1_tag_created = false
```

La unica parte aun no probada de punta a punta es la autorizacion OIDC durante un `npm publish` real desde GitHub Actions.

## Opciones

### Opcion A - Esperar un cambio funcional real antes de publicar 0.1.1

Mantener `0.1.0` como latest. Cuando exista una correccion o mejora real de la CLI, preparar `0.1.1`, validar, crear `cli-v0.1.1` y probar Trusted Publishing durante esa release.

Ventajas:

- cada version publicada contiene valor funcional;
- evita publicar una version cuyo unico objetivo sea probar infraestructura;
- mantiene SemVer y changelog mas claros.

Desventajas:

- Trusted Publishing no queda probado de punta a punta inmediatamente;
- el primer cambio real tambien cargara con el riesgo del primer publish automatizado.

### Opcion B - Publicar 0.1.1 ahora como release de infraestructura

Bumpear `gridwork` a `0.1.1`, documentar el cambio del workflow y publicar mediante `cli-v0.1.1`.

Ventajas:

- prueba Trusted Publishing/OIDC completo ahora;
- confirma el flujo de tag a npm antes de desarrollar mas funcionalidades.

Desventajas:

- publica una version sin cambios funcionales en el paquete distribuido;
- consume una version solo para validar infraestructura;
- requiere crear y pushear un tag que dispara `npm publish`.

### Opcion C - Preparar 0.1.1 pero detenerse antes del tag

Preparar version, release plan y validaciones locales, pero no crear `cli-v0.1.1` todavia.

Ventajas:

- deja el siguiente publish casi listo;
- conserva approval gate antes del efecto externo.

Desventajas:

- crea cambios de version pendientes sin una fecha clara de publicacion;
- puede complicar cambios funcionales posteriores.

## Respuesta recomendada

Usar Opcion A:

```text
first_automated_cli_release = next_meaningful_cli_change
publish_gridwork_0_1_1_now = false
create_cli_v0_1_1_tag_now = false
npm_latest_remains = 0.1.0
```

Mi recomendacion es no publicar `0.1.1` solo para probar infraestructura. El dry-run remoto ya redujo gran parte del riesgo. La primera publicacion automatizada real debe acompanar el siguiente cambio funcional o correccion relevante de la CLI.

## Pregunta para decidir

La duda clave:

```text
Quieres esperar al siguiente cambio funcional real antes de publicar `gridwork@0.1.1`?
```

Mi recomendacion: si, mantener `0.1.0` como latest y continuar con el siguiente objetivo funcional de Gridwork.

## Decision registrada

Pendiente.
