# GQ-118 - Verificar publish manual y configurar trusted publishing

- Estado: accepted
- Fuente: GQ-117
- Pregunta origen: GQ-118
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `gridwork@0.1.0` en npm, trusted publisher, flujo futuro `cli-v*`

## Pregunta

Despues de que el humano ejecute el primer publish manual de `gridwork@0.1.0`, quieres verificar el paquete publicado, probar `npx`, y configurar trusted publishing para futuras releases?

La duda concreta:

```text
Quieres que, una vez confirmes que hiciste el publish manual,
verifiquemos npm, probemos instalacion real via npx
y dejemos trusted publishing listo para tags futuros?
```

## Por que importa

El primer publish manual reclama el nombre `gridwork`, pero no completa el modelo de release de largo plazo. Despues del publish hay que validar:

- `gridwork@0.1.0` existe en npm;
- `latest` apunta a `0.1.0`;
- `npx gridwork@0.1.0 init --factory-version 0.1.0` instala la fabrica real;
- trusted publishing queda configurado para `Ainsiel/Gridwork` + `publish-cli.yml`;
- futuros tags `cli-v*` podran publicar via GitHub Actions.

## Opciones

### Opcion A - Verificar npm y configurar trusted publishing

Ejecutar verificaciones de lectura y smoke test, y guiar la configuracion de trusted publishing:

- `npm view gridwork@0.1.0 version`;
- `npm view gridwork dist-tags --json`;
- smoke test con `npx gridwork@0.1.0 init --factory-version 0.1.0`;
- configurar trusted publisher en npmjs.com;
- opcionalmente verificar settings desde npm UI;
- no crear `cli-v0.1.0` todavia.

Ventajas:

- confirma que el primer publish funciona de verdad;
- evita avanzar a tags automatizados sin trusted publisher;
- deja preparada la estrategia futura.

Desventajas:

- requiere que el humano haya completado el publish manual y la configuracion npm.

### Opcion B - Crear `cli-v0.1.0` despues del publish manual

Crear y pushear el tag CLI una vez que `gridwork@0.1.0` existe.

Ventajas:

- prueba el workflow real.

Desventajas:

- `0.1.0` ya estaria publicado, asi que el workflow fallaria por version existente;
- no es util para esta misma version.

### Opcion C - Pausar

No verificar todavia.

Ventajas:

- evita nuevos pasos.

Desventajas:

- no queda confirmado que `npx gridwork` funciona.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = verify_manual_publish_then_configure_trusted_publisher
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_by_agent = false
```

Mi recomendacion es que, despues del publish manual, verifiquemos `gridwork@0.1.0`, probemos `npx` en un directorio temporal y configuremos trusted publishing para releases futuras. Para `0.1.0`, no conviene pushear `cli-v0.1.0` despues del publish manual porque la version ya existira.

## Pregunta para decidir

La duda clave:

```text
Cuando completes el publish manual, quieres que verifiquemos npm/npx y trusted publishing?
```

Mi recomendacion: verificar publish manual y configurar trusted publishing antes de cualquier tag CLI futuro.

## Decision registrada

Aceptada:

```text
manual_publish_completed = true
npm_package = gridwork
npm_version = 0.1.0
npm_latest_dist_tag = 0.1.0
npx_smoke_test_completed = true
npx_idempotency_test_completed = true
trusted_publisher_configured = false
trusted_publisher_gate = GQ-120
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_by_agent = false
```

## Intento de verificacion 2026-06-05

Se intento ejecutar la verificacion recomendada, pero el publish manual todavia no esta disponible en npm:

```text
npm_view_gridwork_0_1_0_version = E404
npm_view_gridwork_dist_tags = E404
npm_view_gridwork_repository = E404
package_gridwork_exists = false
package_gridwork_0_1_0_exists = false
npx_smoke_test_executed = false
trusted_publisher_verification_executed = false
```

Interpretacion:

```text
El primer publish manual de `gridwork@0.1.0` aun no fue detectado en npm.
GQ-118 queda pendiente hasta que el humano ejecute el publish manual preparado en GQ-117.
```

Paso manual requerido antes de reintentar:

```bash
npm login
npm publish -w packages/cli --access public --tag latest
```

Luego reintentar:

```bash
npm view gridwork@0.1.0 version
npm view gridwork dist-tags --json
npx gridwork@0.1.0 init --factory-version 0.1.0
```

## Intento de publish manual 2026-06-05

El humano ejecuto:

```bash
npm login
npm publish -w packages/cli --access public --tag latest
```

Resultado:

```text
npm_login = success
npm_whoami = ainsiel
npm_publish = failed
npm_publish_error_code = E403
npm_publish_error_reason = two_factor_authentication_or_granular_access_token_with_bypass_2fa_required
package_gridwork_0_1_0_published = false
npm_view_gridwork_0_1_0_version_after_failure = E404
```

Interpretacion:

```text
El paquete y el tarball estan correctos, pero npm bloqueo el primer publish por politica de seguridad de la cuenta/registry.
GQ-118 sigue pendiente hasta resolver 2FA/token y publicar manualmente.
```

Siguiente gate:

```text
GQ-119 - Resolver 2FA/token npm para primer publish manual
```

## Verificacion despues del publish manual 2026-06-05

Despues de habilitar 2FA y publicar manualmente, se verifico npm:

```text
npm_view_gridwork_0_1_0_version = 0.1.0
npm_view_gridwork_dist_tags_latest = 0.1.0
package_gridwork_0_1_0_exists = true
```

Tambien se ejecuto un smoke test real usando el paquete publicado via `npx`:

```text
npx_command = npx gridwork@0.1.0 init --factory-version 0.1.0
target_dir = .factory/runs/20260605-npx-gridwork-v010/target
first_run_status = success
first_run_message = Gridwork installed.
first_run_source = github-release:Ainsiel/Gridwork@factory-v0.1.0
first_run_factory_profile = full-v1
first_run_prompt = .gridwork/agents/orchestrator/PROMPT.md
first_run_report = .factory/init/20260605-191754-init
```

Se ejecuto una segunda pasada para validar idempotencia:

```text
second_run_status = success
second_run_message = Gridwork already installed.
second_run_source = github-release:Ainsiel/Gridwork@factory-v0.1.0
second_run_factory_profile = full-v1
second_run_prompt = .gridwork/agents/orchestrator/PROMPT.md
second_run_report = .factory/init/20260605-191811-init
```

Interpretacion:

```text
El bootstrap publico de Gridwork ya funciona:
npm install path = npm registry
factory install path = GitHub Release factory-v0.1.0
user entrypoint = .gridwork/agents/orchestrator/PROMPT.md
```

Siguiente gate:

```text
GQ-120 - Configurar trusted publishing npm para releases CLI futuras
```
