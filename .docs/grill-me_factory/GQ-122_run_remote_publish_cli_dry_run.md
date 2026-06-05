# GQ-122 - Ejecutar dry-run remoto de publish-cli.yml

- Estado: pending
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

Pendiente.
