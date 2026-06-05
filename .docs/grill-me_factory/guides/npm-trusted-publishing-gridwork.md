# Guia - Configurar npm Trusted Publishing para Gridwork

## Objetivo

Configurar el paquete npm `gridwork` para que futuras versiones de la CLI se publiquen desde GitHub Actions usando Trusted Publishing, sin guardar `NPM_TOKEN` en GitHub Secrets.

Estado actual:

```text
package = gridwork
version_publicada = 0.1.0
dist_tag_latest = 0.1.0
repo = Ainsiel/Gridwork
workflow = .github/workflows/publish-cli.yml
workflow_filename = publish-cli.yml
tag_pattern = cli-v*
primer_tag_automatico_recomendado = cli-v0.1.1_or_later
```

No crear `cli-v0.1.0`, porque `gridwork@0.1.0` ya fue publicado manualmente. npm no permite republicar el mismo nombre/version.

## Antes de empezar

Checklist:

```text
gridwork@0.1.0_publicado = true
npm_2fa_enabled = true
workflow_publish_cli_exists = true
workflow_has_id_token_write = true
workflow_uses_node_24 = true
workflow_publishes_with_npm_publish = true
npm_token_secret_required = false
```

Accion de seguridad pendiente:

```text
regenerar_recovery_codes_npm = true
```

Los recovery codes compartidos en chat deben considerarse expuestos. Regeneralos en npm y guarda los nuevos fuera del repo y fuera del chat.

## Configuracion manual en npmjs.com

1. Entra a `https://www.npmjs.com/` con la cuenta que administra `gridwork`.

2. Ve al paquete:

```text
Packages -> gridwork
```

3. Abre configuracion:

```text
Settings -> Trusted publishing
```

4. En `Select your publisher`, elige:

```text
GitHub Actions
```

5. Completa el formulario exactamente asi:

```text
Organization or user: Ainsiel
Repository: Gridwork
Workflow filename: publish-cli.yml
Environment name: dejar vacio
Allowed actions: npm publish
```

Detalles importantes:

- usar `publish-cli.yml`, no `.github/workflows/publish-cli.yml`;
- respetar mayusculas/minusculas en `Ainsiel` y `Gridwork`;
- seleccionar `npm publish` como allowed action;
- no seleccionar `npm stage publish` en v1, porque Gridwork decidio publicacion directa para futuras releases;
- no agregar `NPM_TOKEN` a GitHub Secrets.

6. Guarda la configuracion.

## Configuracion recomendada de seguridad

Despues de crear el trusted publisher, npm recomienda restringir la publicacion por tokens tradicionales.

Ruta:

```text
Packages -> gridwork -> Settings -> Publishing access
```

Seleccion recomendada:

```text
Require two-factor authentication and disallow tokens
```

Impacto:

- GitHub Actions seguira publicando mediante Trusted Publishing/OIDC;
- no se podran usar tokens npm persistentes para publicar;
- los publishes manuales seguiran requiriendo 2FA;
- se reduce el riesgo de robo de `NPM_TOKEN`, porque no existira uno en GitHub.

## Que ya esta preparado en GitHub Actions

El workflow actual cumple el contrato esperado:

```text
file = .github/workflows/publish-cli.yml
trigger = push tags cli-v*
permissions.contents = read
permissions.id-token = write
runner = ubuntu-latest
node = 24
registry = https://registry.npmjs.org
publish_command = npm publish -w packages/cli --access public --tag <dist-tag>
```

`id-token: write` es el permiso critico para que GitHub Actions pueda emitir el token OIDC que npm confia.

## Como se probara en una version futura

La prueba real no debe hacerse con `0.1.0`, porque esa version ya existe.

Flujo recomendado para `0.1.1`:

1. Preparar cambios de version:

```text
packages/cli/package.json -> version = 0.1.1
packages/cli/src/init/constants.ts -> INSTALLER_VERSION = 0.1.1
```

2. Ejecutar validaciones locales:

```powershell
npm test
npm pack -w packages/cli --dry-run
npm publish -w packages/cli --access public --tag latest --dry-run
```

3. Crear commit fuente.

4. Crear y pushear tag:

```powershell
git tag cli-v0.1.1
git push origin cli-v0.1.1
```

5. GitHub Actions ejecutara `publish-cli.yml` y publicara `gridwork@0.1.1`.

6. Verificar npm:

```powershell
npm view gridwork@0.1.1 version
npm view gridwork dist-tags --json
```

7. Probar instalacion real:

```powershell
npx gridwork@0.1.1 init --factory-version 0.1.0
```

Nota: `--factory-version 0.1.0` sigue siendo valido si la fabrica no cambia. Si tambien se publica una nueva fabrica, usar la version de fabrica correspondiente.

## Troubleshooting

### Error: trusted publisher no autorizado

Revisar:

```text
package = gridwork
organization_or_user = Ainsiel
repository = Gridwork
workflow_filename = publish-cli.yml
allowed_actions incluye npm publish
workflow_file_exists = .github/workflows/publish-cli.yml
workflow_permissions_id_token_write = true
```

El nombre del workflow en npm debe ser solo el filename.

### Error: version already exists

Significa que npm ya tiene esa version. No se puede republicar.

Solucion:

```text
bump_version = true
usar_nuevo_tag_cli = true
```

Ejemplo:

```text
gridwork@0.1.0 ya existe -> usar gridwork@0.1.1
cli-v0.1.0 no debe usarse -> usar cli-v0.1.1
```

### Error: tag must match packages/cli version

El workflow bloquea si el tag no coincide con `packages/cli/package.json`.

Regla:

```text
tag cli-v0.1.1 requiere package version 0.1.1
```

### Error: Node/npm version

El workflow valida runtime moderno para Trusted Publishing:

```text
node >= 22.14.0
npm >= 11.5.1
```

GitHub Actions usa Node 24, por lo que deberia pasar. Tu entorno local puede tener una version menor; eso no bloquea el publish desde Actions.

### No aparece el comando npm trust localmente

Tu npm local puede no incluir `npm trust`.

Estado observado:

```text
local_npm_version = 10.9.2
npm_trust_available = false
```

En ese caso, usar npmjs.com UI. No hace falta actualizar npm local solo para configurar esta relacion.

## Checklist final

Despues de configurar npm:

```text
trusted_publisher_created = true
provider = GitHub Actions
package = gridwork
owner = Ainsiel
repo = Gridwork
workflow_filename = publish-cli.yml
environment = empty
allowed_actions = npm publish
npm_token_secret_created = false
cli_v0_1_0_tag_created = false
next_publish_test = gridwork@0.1.1_or_later
```

## Fuentes oficiales

- npm Trusted Publishers: `https://docs.npmjs.com/trusted-publishers/`
- npm trust CLI: `https://docs.npmjs.com/cli/v11/commands/npm-trust/`
- npm provenance: `https://docs.npmjs.com/generating-provenance-statements/`
- npm publish: `https://docs.npmjs.com/cli/v11/commands/npm-publish/`
