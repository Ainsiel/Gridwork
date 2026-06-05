# GQ-117 - Bootstrap inicial del paquete npm gridwork

- Estado: pending
- Fuente: GQ-115, GQ-116
- Pregunta origen: GQ-117
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: primer publish de `gridwork@0.1.0`, trusted publishing posterior, tag `cli-v0.1.0`

## Pregunta

El repo ya esta preparado para trusted publishing, pero `gridwork` todavia no existe en npm. Como quieres hacer el bootstrap inicial del paquete?

La duda concreta:

```text
Quieres hacer un primer publish controlado para reclamar `gridwork`,
luego configurar trusted publishing,
o prefieres cambiar a un package scoped?
```

## Por que importa

El objetivo ergonomico sigue siendo:

```bash
npx gridwork init --factory-version 0.1.0
```

Pero el primer publish de un paquete nuevo tiene una frontera especial:

- `gridwork` no existe todavia en npm;
- no hay package settings donde verificar trusted publisher para `gridwork`;
- pushear `cli-v0.1.0` ahora podria disparar un workflow sin trusted publisher efectivo;
- si el workflow falla despues del tag, habria que resolver un tag remoto ya creado.

## Estado actual

```text
package_name = gridwork
package_version = 0.1.0
npm_package_exists = false
npm_version_exists = false
repo_prepared_for_trusted_publishing = true
workflow_prepared_for_oidc = true
local_tag_cli_v0_1_0_exists = false
remote_tag_cli_v0_1_0_exists = false
publish_ready = false
```

## Opciones

### Opcion A - Bootstrap manual del primer publish y luego trusted publishing

El humano inicia sesion en npm, publica `gridwork@0.1.0` una vez de forma controlada, configura trusted publishing en npmjs.com para futuras versiones y luego se evita usar tokens/manual publish.

Ventajas:

- reclama el nombre `gridwork`;
- conserva el comando ideal `npx gridwork init`;
- despues del primer publish se puede configurar trusted publisher en settings del package;
- no requiere dejar un token npm persistente en GitHub.

Desventajas:

- el primer publish no queda hecho por OIDC;
- requiere login/2FA manual en npm;
- hay que revisar muy bien antes de publicar porque `0.1.0` no puede reutilizarse.

### Opcion B - Bootstrap por GitHub Actions con NPM_TOKEN temporal

Crear un token npm granular, guardarlo como secret temporal, adaptar el workflow para fallback con `NODE_AUTH_TOKEN`, pushear `cli-v0.1.0`, publicar, configurar trusted publishing y luego borrar el token.

Ventajas:

- mantiene el publish desde GitHub Actions;
- puede generar provenance si se conserva `--provenance`;
- reduce comandos manuales locales.

Desventajas:

- introduce un secreto temporal;
- hay que gobernar creacion, scope, rotacion y eliminacion del token;
- aumenta complejidad del workflow v1.

### Opcion C - Cambiar a package scoped

Cambiar a `@<scope>/gridwork` y publicar bajo una cuenta u organizacion npm controlada.

Ventajas:

- ownership mas explicito;
- menor riesgo de colision de nombres futuros.

Desventajas:

- cambia el comando a `npx @<scope>/gridwork init`;
- requiere actualizar package name, docs, tests, workflow y contratos.

### Opcion D - Pausar

No hacer bootstrap todavia.

Ventajas:

- evita la frontera npm.

Desventajas:

- Gridwork sigue sin estar disponible via `npx gridwork`.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = manual_first_publish_then_configure_trusted_publishing
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_by_agent = false
```

Mi recomendacion es reclamar `gridwork` con un primer publish manual y controlado por el humano, despues configurar trusted publishing para `Ainsiel/Gridwork` + `publish-cli.yml`, y solo entonces volver al flujo normal de tags para futuras versiones. No recomiendo que el agente ejecute el primer `npm publish`.

## Pregunta para decidir

La duda clave:

```text
Quieres hacer bootstrap manual del primer publish,
usar NPM_TOKEN temporal,
cambiar a scoped package,
o pausar?
```

Mi recomendacion: bootstrap manual del primer publish y luego trusted publishing.

## Decision registrada

Pendiente.
