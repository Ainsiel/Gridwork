# GQ-081 - Mecanismo de publicacion de releases de fabrica

- Estado: accepted
- Fuente: decisiones GQ-065, GQ-068, GQ-071, GQ-073 y GQ-080
- Pregunta origen: GQ-081
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `gridwork-release-publisher`, `publish-factory.yml`, tags `factory-v<version>`, GitHub Releases, bundle de fabrica, release plan

## Pregunta

Como debe publicarse una nueva version de la fabrica Gridwork?

La duda concreta:

```text
Cuando cambie `factory/.gridwork/`, quien crea el release `factory-v<version>`?
```

## Por que importa

Ya se decidio que:

```text
CLI npm -> tag cli-v<version> -> publish-cli.yml -> npm
fabrica -> tag factory-v<version> -> GitHub Release con bundle zip
```

Pero aun falta elegir el mecanismo autoritativo para publicar la fabrica:

- GitHub Actions al hacer push de `factory-v*`;
- la skill `gridwork-release-publisher` usando `gh release create` con aprobacion;
- un modelo hibrido por etapas.

Si ambos mecanismos publican al mismo tiempo, se puede duplicar releases o subir assets distintos para el mismo tag. Si ninguno queda claro, el proceso sera manual y fragil.

## Opciones

### Opcion A - GitHub Actions publica fabrica por tag

Crear:

```text
.github/workflows/publish-factory.yml
```

Trigger:

```text
factory-v*
```

Flujo:

```text
approval humano -> git tag factory-v1.0.0 -> git push tag -> GitHub Actions crea bundle y release
```

Ventajas:

- reproducible;
- fuerte trazabilidad en GitHub Actions;
- menos diferencias entre maquinas locales;
- encaja con CI y checks automaticos.

Desventajas:

- mas infraestructura inicial;
- requiere configurar permisos de workflow;
- si el workflow esta mal, el tag puede disparar una publicacion incorrecta;
- cuesta mas iterar mientras el proceso de release aun esta madurando.

### Opcion B - Skill publica con `gh release create`

`gridwork-release-publisher` prepara todo y, con aprobacion explicita, ejecuta:

```bash
git tag factory-v1.0.0
git push origin factory-v1.0.0
gh release create factory-v1.0.0 <assets> --notes-file <notes>
```

Ventajas:

- simple para v1;
- el usuario ve el plan antes de publicar;
- encaja con el modelo de approvals local;
- permite iterar rapido en el contrato de bundle, notes y checksums.

Desventajas:

- depende de `gh` disponible y autenticado;
- mas sensible al entorno local;
- la reproducibilidad depende de que la skill registre bien comandos, approvals y hashes;
- no aprovecha todo el valor de GitHub Actions para publicar.

### Opcion C - Modelo hibrido por etapas

V1 usa la skill como publicador principal, pero deja `publish-factory.yml` como objetivo/template.

Flujo inicial:

```text
gridwork-release-publisher -> plan -> bundle -> manifest -> SHA256SUMS -> approval -> gh release create
```

Flujo futuro:

```text
gridwork-release-publisher -> plan -> approval -> tag factory-v* -> publish-factory.yml -> GitHub Release
```

Ventajas:

- permite empezar sin sobredisenar;
- mantiene el release bajo control humano;
- deja una ruta clara hacia automatizacion;
- evita que CI publique antes de que el proceso este probado;
- conserva una sola autoridad por release.

Desventajas:

- requiere documentar que mecanismo esta activo;
- puede haber migracion futura desde skill publish hacia GitHub Actions;
- si no se define un gate, se puede terminar usando ambos mecanismos.

## Respuesta recomendada

Usar Opcion C:

```text
factory_publish_model_v1 = skill_prepares_and_publishes_with_gh_after_approval
factory_publish_model_target = github_actions_publish_factory
```

En v1, `gridwork-release-publisher` debe ser el mecanismo autoritativo para publicar releases de fabrica, siempre con aprobacion explicita.

`publish-factory.yml` puede existir como template o workflow futuro, pero no debe publicar automaticamente hasta que el proceso este estable.

## Regla de autoridad

Cada release de fabrica debe declarar un solo modo:

```text
manual_gh_release
github_actions_publish_factory
```

En v1 recomendado:

```text
release_mode = manual_gh_release
```

Si `release_mode = manual_gh_release`:

- la skill genera bundle local;
- la skill genera `bundle-manifest.json`;
- la skill genera `SHA256SUMS.txt`;
- la skill genera release notes;
- la skill prepara comandos;
- el usuario aprueba;
- la skill puede ejecutar `git tag`, `git push` y `gh release create`.

Si `release_mode = github_actions_publish_factory`:

- la skill no sube assets;
- la skill prepara plan y tag;
- GitHub Actions construye bundle;
- GitHub Actions sube assets.

No permitir:

```text
skill sube assets y GitHub Actions vuelve a subir assets para el mismo tag
```

## Checks obligatorios antes de publicar

Antes de publicar un release de fabrica, debe validarse:

- `.gridwork/` fuente es valida;
- `factory/.gridwork/factory.json` existe;
- schemas y manifests base parsean;
- bundle no incluye `.factory/`;
- bundle no incluye `.git/`;
- bundle no incluye `node_modules/`;
- bundle tiene `bundle-manifest.json`;
- bundle tiene `SHA256SUMS.txt`;
- checksums coinciden;
- tag `factory-v<version>` no existe;
- release `factory-v<version>` no existe;
- source commit esta registrado;
- `DEFAULT_FACTORY_SOURCE` no sigue como placeholder;
- compatibilidad CLI/fabrica/schema queda registrada.

## Reportes

La skill debe generar:

```text
.factory/runs/<run-id>/artifacts/release/
  factory-release-plan.md
  factory-release-validation.json
  factory-release-notes.md
  bundle-manifest.json
  SHA256SUMS.txt
  publish-commands.md
```

Si se publica, tambien debe registrar:

```text
publish-result.md
approvals.jsonl
tool-calls.jsonl
```

## Propuesta inicial

```text
factory_publish_model_v1 = skill_prepares_and_publishes_with_gh_after_approval
factory_publish_model_target = github_actions_publish_factory
factory_publish_authority_per_release_required = true
factory_publish_v1_release_mode = manual_gh_release
factory_publish_uses_gh_release_create_v1 = true
factory_publish_requires_human_approval = true
factory_publish_action_template_allowed_v1 = true
factory_publish_action_auto_publish_enabled_v1 = false
factory_publish_tag_prefix = factory-v
factory_publish_reuses_tags = false
factory_publish_overwrites_releases = false
factory_publish_requires_bundle_manifest = true
factory_publish_requires_sha256sums = true
factory_publish_blocks_default_source_placeholder = true
factory_publish_records_source_commit = true
factory_publish_records_release_mode = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que v1 publique releases de fabrica mediante GitHub Actions
cuando se haga push de `factory-v*`, o que `gridwork-release-publisher`
prepare y publique con `gh release create` bajo aprobacion explicita?
```

Mi recomendacion: usar la skill `gridwork-release-publisher` como publicador autoritativo en v1, usando `gh release create` solo con aprobacion. Dejar `publish-factory.yml` como template u objetivo futuro, no como publicador automatico inicial.

## Respuesta del usuario

El usuario acepta la recomendacion:

- en v1, `gridwork-release-publisher` es el publicador autoritativo de releases de fabrica;
- la skill prepara plan, bundle, manifest, checksums, notes y comandos;
- la skill puede publicar con `gh release create` solo con aprobacion explicita;
- `publish-factory.yml` puede existir como template u objetivo futuro;
- `publish-factory.yml` no debe publicar automaticamente en v1;
- cada release debe declarar un solo `release_mode`;
- no se permite que la skill y GitHub Actions suban assets para el mismo tag.

## Decision registrada

```text
factory_publish_model_v1 = skill_prepares_and_publishes_with_gh_after_approval
factory_publish_model_target = github_actions_publish_factory
factory_publish_authority_per_release_required = true
factory_publish_v1_release_mode = manual_gh_release
factory_publish_uses_gh_release_create_v1 = true
factory_publish_requires_human_approval = true
factory_publish_action_template_allowed_v1 = true
factory_publish_action_auto_publish_enabled_v1 = false
factory_publish_tag_prefix = factory-v
factory_publish_reuses_tags = false
factory_publish_overwrites_releases = false
factory_publish_requires_bundle_manifest = true
factory_publish_requires_sha256sums = true
factory_publish_blocks_default_source_placeholder = true
factory_publish_records_source_commit = true
factory_publish_records_release_mode = true
```

## Regla

```text
En v1, la fabrica se publica mediante `gridwork-release-publisher` y `gh release create`.
La publicacion requiere aprobacion humana explicita.
`publish-factory.yml` puede existir como template u objetivo futuro, pero no auto-publica en v1.
Cada release declara exactamente un `release_mode`.
La skill y GitHub Actions no pueden subir assets para el mismo tag.
```

## Supuestos

- GitHub Releases sera el mecanismo inicial para distribuir bundles de fabrica.
- GitHub CLI (`gh`) estara disponible para el mantenedor cuando quiera publicar.
- La publicacion de CLI npm sigue separada por `cli-v<version>`.
- La publicacion de fabrica sigue separada por `factory-v<version>`.
- El usuario prefiere empezar con bajo costo operativo y gates humanos claros.

## Riesgos

- Usar dos mecanismos de publicacion al mismo tiempo puede duplicar assets.
- Publicar desde entorno local exige registrar comandos, hashes y approvals con cuidado.
- Activar `publish-factory.yml` demasiado pronto puede publicar bundles incompletos.
- No declarar `release_mode` puede confundir a futuros agentes.

## Artefactos a crear o actualizar

- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `.gridwork/templates/factory-release-plan.md`
- `.gridwork/templates/factory-release-notes.md`
- `.gridwork/templates/publish-commands.md`
- `.github/workflows/publish-factory.yml`
- `docs/RELEASE_PROCESS.md`
- `docs/FACTORY_RELEASES.md`

## Evidencia y notas

- Esta pregunta separa la publicacion de fabrica de la publicacion npm de CLI.
- Complementa GQ-065: la skill puede publicar tag/release solo con approval.
- Complementa GQ-073: CI valida, pero no necesariamente publica.
- Complementa GQ-080: ningun release debe publicarse si el source oficial sigue como placeholder.
- Decision del usuario: aceptar publicacion v1 por `gridwork-release-publisher` con `gh release create` bajo aprobacion; GitHub Actions queda como objetivo futuro.
- Revision posterior GQ-102: `gridwork release factory --dry-run` implementa el modo local plan-only y no ejecuta `git tag`, `git push` ni `gh release create`.
