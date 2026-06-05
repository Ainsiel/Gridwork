# GQ-120 - Configurar trusted publishing npm para releases CLI futuras

- Estado: pending
- Fuente: GQ-118, GQ-119
- Pregunta origen: GQ-120
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: paquete npm `gridwork`, workflow `.github/workflows/publish-cli.yml`, tags `cli-v*`

## Pregunta

Ya existe `gridwork@0.1.0` en npm y `npx gridwork@0.1.0 init --factory-version 0.1.0` funciona. Quieres configurar trusted publishing en npm para que futuras releases CLI se publiquen desde GitHub Actions sin token npm?

La duda concreta:

```text
Quieres agregar GitHub Actions como trusted publisher del paquete npm `gridwork`
usando el repo `Ainsiel/Gridwork` y el workflow `publish-cli.yml`?
```

## Contexto

Estado actual:

```text
npm_package = gridwork
npm_version_0_1_0_exists = true
npm_latest_dist_tag = 0.1.0
npx_gridwork_0_1_0_init_smoke_test = pass
manual_first_publish_completed = true
trusted_publisher_configured = false
cli_tag_created = false
cli_tag_pushed = false
```

El workflow ya existe en el repo fuente:

```text
workflow = .github/workflows/publish-cli.yml
trigger = push tags cli-v*
package_manager = npm
publish_command = npm publish -w packages/cli --access public --tag <dist-tag>
id_token_permission = write
node_version = 24
npm_minimum = 11.5.1
node_minimum = 22.14.0
```

## Opciones

### Opcion A - Configurar trusted publisher con GitHub Actions

En npm, agregar un trusted publisher para:

```text
package = gridwork
provider = GitHub Actions
owner = Ainsiel
repository = Gridwork
workflow = publish-cli.yml
environment = none
```

Luego dejar el tag `cli-v0.1.0` sin crear, porque `0.1.0` ya fue publicado manualmente. La primera prueba real del workflow deberia ser con una version futura, por ejemplo `0.1.1`.

Ventajas:

- elimina la necesidad de guardar `NPM_TOKEN` en GitHub;
- usa OIDC/provenance nativo de npm;
- reduce riesgo de secretos persistentes;
- alinea el modelo con releases futuras por tags `cli-v*`.

Desventajas:

- requiere configuracion manual en npm UI;
- no prueba la version `0.1.0` porque ya existe en npm;
- el primer test real del workflow queda para `0.1.1` o superior.

### Opcion B - Usar `NPM_TOKEN` en GitHub Secrets

Crear un token npm y guardarlo como secret del repo.

Ventajas:

- modelo conocido y ampliamente usado;
- puede funcionar aunque trusted publishing no este disponible.

Desventajas:

- introduce un secreto persistente;
- requiere rotacion y gobierno del token;
- contradice la preferencia de minimizar dependencias secretas.

### Opcion C - Mantener releases manuales por ahora

No configurar automatizacion todavia y publicar siguientes versiones manualmente.

Ventajas:

- no requiere configuracion adicional ahora.

Desventajas:

- mantiene pasos manuales repetitivos;
- aumenta riesgo de publicar desde un estado no validado por CI;
- no aprovecha el workflow ya preparado.

## Respuesta recomendada

Usar Opcion A:

```text
trusted_publishing_strategy = npm_trusted_publisher_github_actions
npm_token_secret_required = false
configure_package = gridwork
configure_owner = Ainsiel
configure_repository = Gridwork
configure_workflow = publish-cli.yml
first_workflow_publish_version = 0.1.1_or_later
create_cli_v0_1_0_tag = false
```

Mi recomendacion es configurar trusted publishing ahora, pero no crear `cli-v0.1.0`. La version `0.1.0` ya fue publicada manualmente, asi que el primer tag CLI automatizado debe esperar a una version futura.

## Pregunta para decidir

La duda clave:

```text
Quieres configurar trusted publishing en npm para `Ainsiel/Gridwork` + `publish-cli.yml`?
```

Mi recomendacion: si, configurar trusted publishing y dejar la prueba real de GitHub Actions para `gridwork@0.1.1`.

## Decision registrada

Pendiente.
