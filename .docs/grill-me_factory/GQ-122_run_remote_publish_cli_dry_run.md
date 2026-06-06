# GQ-122 - Ejecutar dry-run remoto de publish-cli.yml

- Estado: accepted
- Fuente: GQ-121
- Pregunta origen: GQ-122
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: GitHub Actions `publish-cli.yml`, rama remota, futura release `gridwork@0.1.1`

## Pregunta

El workflow `publish-cli.yml` ya fue ajustado localmente para soportar `workflow_dispatch` como dry-run sin publicar npm. Quieres pushear el commit del workflow y ejecutar el dry-run remoto en GitHub Actions?

La duda concreta:

```text
Quieres subir el cambio del workflow a GitHub y correr `publish-cli.yml`
manual con `dry_run=true`, sin crear tag y sin publicar npm?
```

## Contexto

Estado actual:

```text
workflow_dispatch_dry_run_repair = implemented_locally
local_event_simulation = pass
npm_test = pass
npm_pack_cli_dry_run = pass
npm_publish_now = false
cli_v0_1_1_tag_created = false
remote_github_actions_dry_run = pending
```

El commit debe estar disponible en GitHub antes de ejecutar el workflow remoto. El dry-run remoto no debe publicar npm porque:

```text
publish_step_condition = github.event_name == 'push'
workflow_dispatch_event = true
publish_step_runs = false
```

## Opciones

### Opcion A - Pushear el cambio y ejecutar dry-run remoto

Subir el commit que contiene el arreglo de `publish-cli.yml` y ejecutar manualmente:

```bash
gh workflow run publish-cli.yml --ref <branch> -f dry_run=true
gh run list --workflow publish-cli.yml --limit 5
gh run watch <run-id>
```

Ventajas:

- valida GitHub Actions real sin publicar npm;
- confirma runtime Node 24/npm moderno;
- detecta problemas de CI antes de `cli-v0.1.1`;
- mantiene el publish real bloqueado hasta un tag aprobado.

Desventajas:

- requiere push remoto;
- si GitHub solo permite `workflow_dispatch` desde la rama default, puede requerir que el workflow actualizado llegue primero a la rama default.

### Opcion B - No ejecutar dry-run remoto y preparar 0.1.1

Usar la evidencia local y pasar directo a preparar `gridwork@0.1.1`.

Ventajas:

- avanza mas rapido.

Desventajas:

- el primer test real de GitHub Actions ocurrira durante el publish real.

### Opcion C - Pausar

No ejecutar nada remoto todavia.

Ventajas:

- evita tocar estado remoto.

Desventajas:

- deja el pipeline sin validacion remota.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = push_workflow_fix_then_run_remote_dry_run
npm_publish = false
create_cli_tag = false
use_workflow_dispatch = true
dry_run = true
```

Mi recomendacion es ejecutar el dry-run remoto antes de preparar `gridwork@0.1.1`. Esto separa claramente la validacion del pipeline de la publicacion real.

## Pregunta para decidir

La duda clave:

```text
Quieres que hagamos push del cambio del workflow y ejecutemos el dry-run remoto?
```

Mi recomendacion: si, pero solo con aprobacion explicita para push remoto.

## Decision registrada

Aceptada:

```text
selected_option = push_workflow_fix_then_run_remote_dry_run
workflow_fix_pushed = true
workflow_ref = factory/0.1.0
workflow_dispatch_dry_run = success
npm_publish = false
create_cli_tag = false
```

## Ejecucion remota

Se subieron los commits pendientes de `factory/0.1.0` y se ejecuto:

```bash
gh workflow run publish-cli.yml --ref factory/0.1.0 -f dry_run=true
```

Resultado:

```text
run_id = 27066803619
run_url = https://github.com/Ainsiel/Gridwork/actions/runs/27066803619
event = workflow_dispatch
head_branch = factory/0.1.0
head_sha = a2b3e2fcd943f6ea2c4902aa4bdb6c1461e014b5
status = completed
conclusion = success
```

Pasos:

```text
checkout = success
setup_node = success
install = success
validate_trusted_publishing_runtime = success
validate_event_and_package_metadata = success
validate_official_factory_source = success
build = success
test = success
pack_dry_run = success
resolve_npm_dist_tag = success
publish = skipped
```

Verificacion posterior:

```text
npm_latest_before = 0.1.0
npm_latest_after = 0.1.0
npm_package_published_by_dry_run = false
cli_tag_created = false
```

## Interpretacion

El pipeline remoto funciona en modo dry-run y mantiene la frontera de seguridad:

```text
workflow_dispatch valida pero no publica
push de tag cli-v<version> es el unico evento que puede publicar
```

El dry-run no prueba la autorizacion OIDC de `npm publish`; esa verificacion ocurrira durante la primera release CLI automatizada real.

## Siguiente gate

```text
GQ-123 - Decidir cuando publicar la primera release CLI automatizada
```
