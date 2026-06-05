# GQ-121 - Validar pipeline CLI antes de publicar 0.1.1

- Estado: pending
- Fuente: GQ-120
- Pregunta origen: GQ-121
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.github/workflows/publish-cli.yml`, futura release `gridwork@0.1.1`, tag `cli-v0.1.1`

## Pregunta

Ahora que `gridwork@0.1.0` existe y Trusted Publishing ya esta configurado, como quieres validar el pipeline de GitHub Actions antes de hacer el primer publish automatizado real?

La duda concreta:

```text
Quieres arreglar/verificar primero el dry-run manual de GitHub Actions,
o saltar directo a preparar `gridwork@0.1.1` y publicar con tag `cli-v0.1.1`?
```

## Contexto

Estado actual:

```text
factory_release = factory-v0.1.0
npm_package = gridwork
npm_current_version = 0.1.0
npm_latest = 0.1.0
npx_gridwork_0_1_0_init = pass
trusted_publisher_configured = true
cli_v0_1_0_tag_created = false
```

El workflow existe:

```text
workflow = .github/workflows/publish-cli.yml
trigger_push_tags = cli-v*
trigger_workflow_dispatch = true
publish_on_push_only = true
```

Hallazgo:

```text
workflow_dispatch_dry_run_may_fail = true
reason = Validate tag and package metadata currently expects GITHUB_REF_NAME to start with cli-v
```

Esto no bloquea un publish real por tag, pero si dificulta probar manualmente el workflow sin publicar.

## Opciones

### Opcion A - Reparar y probar dry-run manual antes de 0.1.1

Actualizar `publish-cli.yml` para que `workflow_dispatch` pueda ejecutar validaciones sin exigir tag `cli-v*` y sin publicar npm. Luego correr el workflow manualmente en GitHub Actions como dry-run.

Ventajas:

- valida GitHub Actions sin publicar una version real;
- reduce riesgo antes de `cli-v0.1.1`;
- permite comprobar Node 24, npm moderno, install, build, tests y pack;
- mantiene `npm publish` solo para eventos `push` de tag.

Desventajas:

- requiere un pequeno ajuste al workflow;
- no prueba todavia la autorizacion OIDC completa de npm publish, porque no publica.

### Opcion B - Saltar directo a `gridwork@0.1.1`

Bumpear version a `0.1.1`, correr validaciones locales, commitear, crear `cli-v0.1.1` y pushear el tag para que GitHub Actions publique npm.

Ventajas:

- prueba el flujo real completo;
- confirma Trusted Publishing de punta a punta.

Desventajas:

- si falla, el tag/release queda como intento fallido;
- si pasa, publica una version real aunque solo sea para validar pipeline;
- hay menos margen para detectar problemas del workflow sin tocar npm.

### Opcion C - Esperar a cambios funcionales reales

No validar ahora. Esperar a que exista una mejora real para publicar `0.1.1`.

Ventajas:

- evita publicar una version solo de prueba.

Desventajas:

- deja el pipeline sin validar hasta el proximo cambio real;
- el primer publish automatizado podria fallar en un momento menos comodo.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = repair_and_run_publish_cli_dry_run
publish_npm_now = false
create_cli_v0_1_1_tag_now = false
prepare_v0_1_1_after_dry_run = true
```

Mi recomendacion es primero arreglar el modo `workflow_dispatch`/dry-run para validar GitHub Actions sin publicar. Despues, con esa evidencia, preparar `0.1.1` y hacer el primer publish automatizado real mediante `cli-v0.1.1`.

## Pregunta para decidir

La duda clave:

```text
Quieres que arreglemos y probemos primero el dry-run manual de `publish-cli.yml`?
```

Mi recomendacion: si, validar el pipeline en seco antes de publicar `0.1.1`.

## Decision registrada

Pendiente.
