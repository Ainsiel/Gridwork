# GQ-119 - Resolver 2FA/token npm para primer publish manual

- Estado: pending
- Fuente: GQ-117, GQ-118
- Pregunta origen: GQ-119
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: primer publish manual de `gridwork@0.1.0`

## Pregunta

El primer publish manual fallo con `E403` porque npm exige 2FA o un granular access token con bypass 2FA. Como quieres resolver este requisito de seguridad?

La duda concreta:

```text
Quieres habilitar 2FA en tu cuenta npm y reintentar el publish manual,
usar un granular access token con bypass 2FA,
o pausar?
```

## Contexto

Resultado del intento:

```text
npm_login = success
npm_account = ainsiel
npm_publish_command = npm publish -w packages/cli --access public --tag latest
npm_publish_result = E403
npm_publish_error = Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
package_gridwork_exists = false
package_gridwork_0_1_0_exists = false
```

El paquete ya paso:

```text
npm_test = pass
npm_pack_dry_run = pass
npm_publish_dry_run = pass
package_metadata_normalized = true
```

## Opciones

### Opcion A - Habilitar 2FA en npm y reintentar publish manual

Configurar 2FA en la cuenta npm `ainsiel`, idealmente para authorization and writes, y reintentar:

```bash
npm publish -w packages/cli --access public --tag latest
```

Si npm pide OTP:

```bash
npm publish -w packages/cli --access public --tag latest --otp <codigo-2fa>
```

Ventajas:

- cumple el requisito oficial de npm para publish directo;
- no introduce tokens persistentes;
- mantiene el bootstrap manual simple;
- despues del publish se puede configurar trusted publishing para futuras releases.

Desventajas:

- requiere configurar 2FA fuera del repo;
- requiere guardar recovery codes de npm de forma segura.

### Opcion B - Granular access token con bypass 2FA

Crear un token granular con permiso de publish y bypass 2FA, y usarlo para el primer publish.

Ventajas:

- evita flujo interactivo con OTP.

Desventajas:

- introduce un secreto sensible;
- debe rotarse o eliminarse despues;
- no es necesario para el flujo manual si 2FA esta disponible.

### Opcion C - Pausar

No resolver todavia.

Ventajas:

- evita tocar configuracion de seguridad npm.

Desventajas:

- `gridwork@0.1.0` no queda publicado;
- no se puede verificar `npx gridwork`.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = enable_npm_2fa_then_retry_manual_publish
npm_publish_by_agent = false
create_cli_tag_now = false
push_cli_tag_now = false
```

Mi recomendacion es habilitar 2FA en npm y repetir el publish manual. No recomiendo crear un token para este primer publish salvo que npm 2FA no sea viable.

## Pregunta para decidir

La duda clave:

```text
Quieres habilitar 2FA en npm y reintentar el publish manual?
```

Mi recomendacion: habilitar 2FA, reintentar el publish manual y luego volver a GQ-118 para verificar npm/npx.

## Decision registrada

Pendiente.
