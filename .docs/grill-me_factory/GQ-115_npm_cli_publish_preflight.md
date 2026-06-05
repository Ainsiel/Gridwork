# GQ-115 - Preflight npm antes de publicar CLI v0.1.0

- Estado: pending
- Fuente: GQ-071, GQ-079, GQ-104, GQ-114
- Pregunta origen: GQ-115
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: npm package `gridwork`, tag `cli-v0.1.0`, workflow `publish-cli.yml`

## Pregunta

La fuente de la CLI `v0.1.0` ya esta preparada y el dry-run paso. Quieres hacer un preflight npm y GitHub Actions antes de crear el tag `cli-v0.1.0`?

La duda concreta:

```text
Quieres validar npm auth, ownership/version del package,
tag remoto inexistente y readiness del workflow,
sin crear tag ni publicar npm todavia?
```

## Por que importa

Crear `cli-v0.1.0` y pushearlo dispara `publish-cli.yml`, que puede publicar en npm. Antes de ese side effect hay que confirmar:

- el usuario controla o puede publicar `gridwork`;
- `gridwork@0.1.0` no existe ya en npm;
- GitHub Actions tiene permisos y configuracion de trusted publishing/provenance;
- el tag `cli-v0.1.0` no existe local ni remoto;
- el workflow no bloqueara por metadata.

## Opciones

### Opcion A - Preflight npm/Actions sin publicar

Ejecutar solo consultas y validaciones:

- `npm whoami`;
- `npm view gridwork --json`;
- comprobar si `gridwork@0.1.0` existe;
- comprobar `git tag --list cli-v0.1.0`;
- comprobar `git ls-remote --tags origin refs/tags/cli-v0.1.0`;
- revisar que `.github/workflows/publish-cli.yml` exista y use `cli-v*`;
- no crear tag;
- no hacer push;
- no ejecutar `npm publish`.

Ventajas:

- reduce riesgo antes del publish real;
- detecta problemas de ownership/version;
- mantiene el gate humano antes de disparar GitHub Actions.

Desventajas:

- requiere red y posiblemente npm auth local.

### Opcion B - Crear y pushear `cli-v0.1.0` ahora

Crear el tag y pushearlo para que GitHub Actions publique.

Ventajas:

- habilita el camino real hacia `npx gridwork init`.

Desventajas:

- puede publicar npm de inmediato;
- si npm ownership/version falla, el workflow fallara despues del tag;
- puede requerir cleanup manual.

### Opcion C - Pausar

No avanzar todavia.

Ventajas:

- evita side effects.

Desventajas:

- CLI npm sigue sin publicar.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = npm_cli_publish_preflight_only
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_now = false
```

Mi recomendacion es hacer preflight npm/Actions antes de crear `cli-v0.1.0`. Ya tenemos fuente y dry-run; el riesgo ahora esta en npm ownership, version disponible y configuracion del workflow.

## Pregunta para decidir

La duda clave:

```text
Quieres ejecutar preflight npm/Actions sin publicar?
```

Mi recomendacion: preflight npm/Actions sin tag ni publish.

## Decision registrada

Pendiente.
