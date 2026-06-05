# GQ-116 - Resolver npm ownership y trusted publishing

- Estado: accepted
- Fuente: GQ-071, GQ-079, GQ-115
- Pregunta origen: GQ-116
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: npm package `gridwork`, GitHub Actions publish CLI, tag `cli-v0.1.0`

## Pregunta

El preflight de `GQ-115` mostro que `gridwork` y `gridwork@0.1.0` no existen en npm, pero la maquina local no esta autenticada y no esta confirmado el mecanismo de publish. Como quieres resolver npm ownership/trusted publishing antes de crear `cli-v0.1.0`?

La duda concreta:

```text
Quieres preparar npm trusted publishing para el package `gridwork`,
usar un token npm como fallback,
cambiar a un package scoped,
o pausar?
```

## Por que importa

Pushear `cli-v0.1.0` dispara `publish-cli.yml`. Ese workflow ejecuta:

```bash
npm publish -w packages/cli --provenance --access public --tag latest
```

Si npm auth/trusted publishing no esta configurado, el workflow puede fallar despues de crear el tag remoto. Eso dejaria un tag publicado pero sin package npm.

## Estado actual

```text
package_name = gridwork
package_version = 0.1.0
npm_package_exists = false
npm_version_exists = false
npm_whoami = ENEEDAUTH
local_tag_cli_v0_1_0_exists = false
remote_tag_cli_v0_1_0_exists = false
workflow_exists = true
workflow_uses_provenance = true
publish_ready = false
```

## Opciones

### Opcion A - Configurar npm trusted publishing para `gridwork`

Resolver ownership/publicacion con npm y GitHub Actions antes del tag:

- iniciar sesion en npm con la cuenta correcta;
- confirmar que se puede publicar el package `gridwork`;
- configurar trusted publishing/OIDC para `Ainsiel/Gridwork` y `publish-cli.yml`, si npm lo permite para este package;
- mantener `npm publish` solo en GitHub Actions;
- repetir preflight antes de crear `cli-v0.1.0`.

Ventajas:

- mantiene el modelo mas seguro decidido en GQ-071;
- evita tokens npm de larga vida;
- alinea `--provenance` con GitHub Actions.

Desventajas:

- requiere pasos fuera del repo o autenticacion interactiva;
- si npm no permite trusted publishing antes del primer publish, podria requerir fallback.

### Opcion B - Usar NPM_TOKEN como fallback controlado

Mantener publish por GitHub Actions, pero usando un token npm como secret del repo.

Ventajas:

- suele funcionar incluso cuando trusted publishing no esta disponible;
- permite publicar el primer package si la cuenta npm tiene permisos.

Desventajas:

- introduce un secreto que debe gobernarse cuidadosamente;
- hay mas riesgo operacional que con trusted publishing.

### Opcion C - Cambiar a package scoped

Cambiar el package de `gridwork` a `@<scope>/gridwork` si el nombre global no se puede reclamar.

Ventajas:

- ownership mas claro bajo una cuenta u organizacion npm;
- reduce riesgo de colision de nombres.

Desventajas:

- cambia el comando ergonomico a `npx @<scope>/gridwork init`;
- requiere actualizar contratos, docs, tests y workflow.

### Opcion D - Pausar

No resolver npm todavia.

Ventajas:

- evita tocar auth y secretos.

Desventajas:

- `npx gridwork init` sigue sin estar disponible.

## Respuesta recomendada

Usar Opcion A primero:

```text
next_step = configure_or_confirm_npm_trusted_publishing_for_gridwork
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_now = false
```

Mi recomendacion es intentar mantener el modelo de trusted publishing/OIDC. Si npm no permite configurarlo para el primer publish del package, el fallback controlado seria Opcion B con un token npm limitado en GitHub Secrets. No recomiendo crear `cli-v0.1.0` hasta resolver esto.

## Pregunta para decidir

La duda clave:

```text
Quieres resolver npm trusted publishing para `gridwork`,
usar NPM_TOKEN como fallback,
cambiar a package scoped,
o pausar?
```

Mi recomendacion: resolver trusted publishing primero, sin tag ni publish.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = configure_or_confirm_npm_trusted_publishing_for_gridwork
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_now = false
```

Resultado:

```text
trusted_publishing_source_prepared = true
package_name = gridwork
package_version = 0.1.0
package_repository_url = https://github.com/Ainsiel/Gridwork.git
workflow = .github/workflows/publish-cli.yml
workflow_node_version = 24
workflow_npm_minimum_check = >=11.5.1
workflow_node_minimum_check = >=22.14.0
workflow_id_token_write = true
workflow_registry = https://registry.npmjs.org
workflow_publish_command = npm publish -w packages/cli --access public --tag <dist_tag>
workflow_provenance = automatic_when_trusted_publishing_is_used
local_npm_publish_executed = false
cli_tag_created = false
cli_tag_pushed = false
npm_publish_executed = false
```

Cambios aplicados:

```text
packages/cli/package.json agrega repository.url exacto para Ainsiel/Gridwork.
publish-cli.yml usa Node 24 y valida runtime compatible con trusted publishing.
publish-cli.yml valida tag/version, repository.url y source oficial antes de publicar.
publish-cli.yml mantiene publicacion solo por GitHub Actions despues de tag cli-v*.
```

Validaciones ejecutadas:

```text
npm_test = pass
test_count = 25
npm_pack_dry_run = pass
packed_package = gridwork@0.1.0
pack_file_count = 32
```

Blocker externo:

```text
npm_package_exists = false
npm_whoami = ENEEDAUTH
trusted_publisher_configured = not_verified
publish_ready = false
```

Segun la documentacion oficial de npm, trusted publishing se configura en npmjs.com desde los settings del paquete, indicando GitHub Actions, owner/repo y workflow filename. Como `gridwork` todavia no existe en npm, no queda confirmado un trusted publisher para este paquete desde este repo.

Regla aplicada:

```text
No crear `cli-v0.1.0` hasta resolver el bootstrap/ownership inicial del paquete npm.
No hacer push del tag.
No ejecutar npm publish.
```

Fuentes oficiales consultadas:

```text
https://docs.npmjs.com/trusted-publishers/
https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/
```
