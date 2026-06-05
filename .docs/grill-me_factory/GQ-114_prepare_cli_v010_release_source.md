# GQ-114 - Preparar fuente para release CLI v0.1.0

- Estado: accepted
- Fuente: GQ-071, GQ-079, GQ-104, GQ-113
- Pregunta origen: GQ-114
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli`, default source oficial, versionado CLI y plan npm

## Pregunta

La fabrica `factory-v0.1.0` ya esta publicada y probada desde GitHub Release. Como quieres preparar la CLI para que despues pueda publicarse en npm y usarse con `npx gridwork init`?

La duda concreta:

```text
Quieres preparar la fuente de la CLI para v0.1.0,
sin publicar npm todavia,
actualizando version, source oficial y validaciones?
```

## Por que importa

El smoke remoto paso usando el CLI local y `--source Ainsiel/Gridwork`. Para que el uso real sea ergonomico:

```bash
npx gridwork init --factory-version 0.1.0
```

la CLI publicada debe tener un source oficial embebido que apunte a:

```text
Ainsiel/Gridwork
```

Estado actual a resolver antes de npm:

```text
packages/cli/package.json version = 0.0.0
packages/cli/src/init/constants.ts INSTALLER_VERSION = 0.0.0
packages/cli/src/init/constants.ts DEFAULT_FACTORY_SOURCE = gridwork/gridwork
```

Ademas, el workflow `publish-cli.yml` bloquea correctamente si `DEFAULT_FACTORY_SOURCE` sigue en placeholder.

## Opciones

### Opcion A - Preparar CLI v0.1.0 sin publicar npm

Actualizar fuente y ejecutar validaciones locales:

- cambiar `packages/cli/package.json` a `0.1.0`;
- cambiar `INSTALLER_VERSION` a `0.1.0`;
- cambiar `DEFAULT_FACTORY_SOURCE` a `Ainsiel/Gridwork`;
- ejecutar `npm test`;
- ejecutar `npm pack -w packages/cli --dry-run`;
- ejecutar `gridwork release cli --dry-run --source Ainsiel/Gridwork --source-commit <HEAD> --confirm-package-ownership --confirm-official-source`;
- no crear `cli-v0.1.0`;
- no hacer push;
- no ejecutar `npm publish`.

Ventajas:

- deja la CLI lista para un gate real de publish;
- elimina el placeholder del source oficial;
- evita publicar version `0.0.0`;
- mantiene npm publish separado.

Desventajas:

- requiere cambios de codigo y un nuevo commit fuente antes del tag CLI.

### Opcion B - Solo preflight npm/package ownership

Validar estado de npm antes de tocar fuente:

- `npm whoami`;
- `npm view gridwork`;
- revisar si el nombre `gridwork` esta disponible o bajo control.

Ventajas:

- reduce riesgo si no controlas el package name;
- no cambia codigo.

Desventajas:

- no deja la CLI lista.

### Opcion C - Publicar npm directo

Intentar publicar con el estado actual.

Ventajas:

- avanza rapido.

Desventajas:

- no recomendado;
- version `0.0.0`;
- source oficial placeholder;
- workflow debe bloquearlo;
- puede fallar o publicar algo incorrecto si se salta el workflow.

### Opcion D - Pausar

No preparar la CLI todavia.

Ventajas:

- evita cambios adicionales.

Desventajas:

- `npx gridwork init` sigue sin camino real publicado.

## Respuesta recomendada

Usar Opcion A, con una nota de seguridad:

```text
next_step = prepare_cli_v0_1_0_source_and_dry_run
npm_publish_now = false
create_cli_tag_now = false
push_cli_tag_now = false
```

Mi recomendacion es preparar la CLI v0.1.0 ahora, pero no publicar npm todavia. Despues de esto debe existir otro gate separado para preflight npm real y otro para crear `cli-v0.1.0`.

## Pregunta para decidir

La duda clave:

```text
Quieres preparar la fuente de la CLI v0.1.0 y correr dry-run,
solo hacer preflight npm,
publicar directo,
o pausar?
```

Mi recomendacion: preparar CLI v0.1.0 y dry-run, sin tag ni npm publish.

## Decision registrada

El usuario acepta la recomendacion:

```text
next_step = prepare_cli_v0_1_0_source_and_dry_run
npm_publish_now = false
create_cli_tag_now = false
push_cli_tag_now = false
```

Cambios aplicados:

```text
packages/cli/package.json version = 0.1.0
package-lock packages/cli version = 0.1.0
INSTALLER_VERSION = 0.1.0
DEFAULT_FACTORY_SOURCE = Ainsiel/Gridwork
PLACEHOLDER_FACTORY_SOURCE = gridwork/gridwork
placeholder_blocking_logic = separated_from_default_official_source
```

Commit fuente creado:

```text
commit = 4d2021383f96278bcfb057157c07654653fcac1e
short_commit = 4d2021383f96
message = Prepare CLI v0.1.0 release source
```

Validaciones ejecutadas:

```text
npm_test = pass
test_count = 25
npm_pack_dry_run = pass
packed_package = gridwork@0.1.0
pack_file_count = 32
```

Dry-run CLI:

```text
cli_release_dry_run_completed = true
artifacts_dir = .factory/runs/20260605-184458-cli-release/artifacts/release
package_name = gridwork
version = 0.1.0
tag = cli-v0.1.0
dist_tag = latest
source = Ainsiel/Gridwork
source_commit = 4d2021383f96
validation_status = pass
validation_blockers = 0
validation_warnings = 0
publish_executed = false
tag_created = false
tag_pushed = false
npm_publish_executed = false
```

Comandos preparados, no ejecutados:

```bash
git tag cli-v0.1.0
git push origin cli-v0.1.0
# GitHub Actions publish-cli.yml publica npm despues del tag aprobado.
```

Regla aplicada:

```text
No crear tag CLI sin gate explicito.
No hacer push sin gate explicito.
No ejecutar npm publish local.
El publish npm queda delegado a GitHub Actions cuando exista tag cli-v0.1.0 aprobado.
```
