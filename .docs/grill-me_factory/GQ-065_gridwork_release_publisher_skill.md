# GQ-065 - Skill `gridwork-release-publisher`

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-023, GQ-028, GQ-056, GQ-062, GQ-063 y GQ-064
- Pregunta origen: GQ-065
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/gridwork-release-publisher/`, repositorio de fabrica Gridwork, Git tags, GitHub Releases, assets de bundle, `.gridwork-lock.json`

## Pregunta

Como debe funcionar la skill `gridwork-release-publisher` para crear tags y releases cuando el usuario quiera actualizar Gridwork, de modo que `npx gridwork init` pueda descargar una version estable de la fabrica?

## Por que importa

GQ-064 decidio que la CLI npm sera un bootstrapper: descarga la fabrica desde un release/tag versionado. Eso crea una nueva responsabilidad:

```text
cuando cambia la fabrica -> preparar bundle -> crear tag -> crear release -> publicar asset -> registrar hash
```

Si este proceso es manual y sin contrato, se puede publicar un release incompleto, sin hash o con cambios no revisados.

## Respuesta recomendada

Crear una skill de mantenimiento de Gridwork:

```text
gridwork-release-publisher
```

Esta skill debe preparar releases/tags, generar plan, validar bundle y pedir aprobacion antes de cualquier accion remota.

## Alcance de la skill

Puede:

- revisar cambios locales de `.gridwork/`;
- validar manifests y schemas;
- crear un release plan local;
- generar release notes;
- proponer version SemVer;
- preparar bundle de fabrica;
- calcular hash;
- generar `SHA256SUMS.txt`;
- verificar source tag y source commit;
- rechazar reuse/overwrite de tag o release publicado;
- preparar comandos `git tag` y `gh release create`;
- preparar releases de CLI en modo `cli-release`;
- preparar tag `cli-v<version>` para publicacion npm por GitHub Actions;
- validar que `DEFAULT_FACTORY_SOURCE` no siga como placeholder antes de release real;
- publicar releases de fabrica en modo `manual_gh_release` usando `gh release create` con aprobacion;
- preparar prereleases de fabrica solo como prerelease explicito;
- marcar prerelease en GitHub Release cuando la version SemVer sea prerelease;
- ejecutar tag/release solo con aprobacion explicita.

No puede:

- publicar release sin approval;
- crear tags sin approval;
- subir assets sin approval;
- modificar secrets;
- instalar desde `main` sin pin;
- publicar cambios si la validacion falla;
- hacer merge automatico.
- publicar npm directamente.
- publicar si el source oficial embebido sigue como placeholder.
- publicar una version prerelease como stable.

## Fases recomendadas

### 1. Preflight de release

Verificar:

- repo Git limpio o cambios esperados;
- rama correcta;
- version actual;
- proxima version propuesta;
- `.gridwork/` valida;
- templates existen;
- schemas parsean;
- no hay secretos;
- no hay archivos runtime `.factory/` incluidos en bundle.

Output:

```text
.factory/runs/<run-id>/artifacts/release/gridwork-release-plan.md
```

### 2. Bundle plan

Definir que se incluira en el bundle:

```text
.gridwork/
```

Excluir:

```text
.factory/
.git/
node_modules/
logs temporales
secretos
```

Output:

```text
bundle-manifest.json
```

### 3. Release notes

Crear:

```text
gridwork-release-notes.md
```

Debe incluir:

- version;
- cambios de agents;
- cambios de workflows;
- cambios de skills;
- cambios de policies;
- cambios de schemas;
- cambios de templates;
- compatibilidad;
- riesgos;
- instrucciones de instalacion.

### 4. Tag plan

Preparar tag:

```text
factory-v<factory-version>
```

Ejemplo:

```text
factory-v1.0.0
```

El tag debe apuntar al commit aprobado.

### 5. Release publish

Con aprobacion humana, puede ejecutar:

```bash
git tag factory-v1.0.0
git push origin factory-v1.0.0
gh release create factory-v1.0.0 <bundle-asset> --notes-file gridwork-release-notes.md
```

Estos comandos deben registrarse en `tool-calls.jsonl` y `approvals.jsonl`.

## Approval gates

Requiere approval para:

- crear tag;
- hacer push de tag;
- crear GitHub Release;
- subir asset;
- sobrescribir release existente;
- reutilizar un tag publicado;
- reutilizar una version publicada;
- publicar pre-release como latest;
- publicar prerelease sin marcar GitHub Release como prerelease;
- cambiar version SemVer mayor.

## Versionado

Usar SemVer:

```text
major.minor.patch
```

Reglas sugeridas:

- `patch`: correcciones de docs, policies o templates sin romper contratos.
- `minor`: nuevas skills, workflows, schemas o capacidades compatibles.
- `major`: cambios incompatibles en estructura, contracts o comportamiento de init.

## Propuesta inicial

```text
gridwork_release_publisher_skill_enabled = true
gridwork_release_publisher_default_mode = plan_and_prepare
gridwork_release_publisher_can_create_tag = true_with_approval
gridwork_release_publisher_can_push_tag = true_with_approval
gridwork_release_publisher_can_create_github_release = true_with_approval
gridwork_release_publisher_can_upload_bundle_asset = true_with_approval
gridwork_release_publisher_can_merge = false
gridwork_release_publisher_requires_validation_pass = true
gridwork_release_publisher_requires_secret_scan = true
gridwork_release_publisher_uses_semver = true
gridwork_release_publisher_outputs_release_plan = true
gridwork_release_publisher_outputs_release_notes = true
gridwork_release_publisher_outputs_bundle_manifest = true
gridwork_release_publisher_supports_cli_release_mode = true
gridwork_release_publisher_cli_can_publish_npm = false
gridwork_release_publisher_factory_release_mode_v1 = manual_gh_release
gridwork_release_publisher_factory_uses_gh_release_create_v1 = true
gridwork_release_publisher_factory_action_auto_publish_v1 = false
gridwork_release_publisher_records_release_mode = true
gridwork_release_publisher_factory_prerelease_allowed = true
gridwork_release_publisher_factory_prerelease_github_flag_required = true
gridwork_release_publisher_cli_prerelease_next_dist_tag_required = true
gridwork_release_publisher_requires_sha256sums = true
gridwork_release_publisher_requires_source_commit = true
gridwork_release_publisher_requires_source_tag = true
gridwork_release_publisher_blocks_default_source_placeholder = true
gridwork_release_publisher_reuses_tags = false
gridwork_release_publisher_overwrites_releases = false
gridwork_release_publisher_external_signatures_required_v1 = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `gridwork-release-publisher` solo prepare el release plan,
o que tambien pueda crear tag y GitHub Release con aprobacion explicita?
```

Mi recomendacion: que prepare todo por defecto, y que pueda crear tag/release solo con aprobacion explicita. Esto mantiene utilidad real sin publicar versiones por accidente.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `gridwork-release-publisher` debe preparar release plan, release notes, bundle manifest y hash por defecto.
- La skill puede crear tag y GitHub Release solo con aprobacion explicita.
- La skill puede subir el asset del bundle solo con aprobacion explicita.
- La skill no puede hacer merge.
- La skill no puede publicar si falla la validacion o el escaneo de secretos.

## Decision registrada

```text
gridwork_release_publisher_skill_enabled = true
gridwork_release_publisher_default_mode = plan_and_prepare
gridwork_release_publisher_can_create_tag = true_with_approval
gridwork_release_publisher_can_push_tag = true_with_approval
gridwork_release_publisher_can_create_github_release = true_with_approval
gridwork_release_publisher_can_upload_bundle_asset = true_with_approval
gridwork_release_publisher_can_merge = false
gridwork_release_publisher_requires_validation_pass = true
gridwork_release_publisher_requires_secret_scan = true
gridwork_release_publisher_uses_semver = true
gridwork_release_publisher_outputs_release_plan = true
gridwork_release_publisher_outputs_release_notes = true
gridwork_release_publisher_outputs_bundle_manifest = true
gridwork_release_publisher_supports_cli_release_mode = true
gridwork_release_publisher_cli_can_publish_npm = false
gridwork_release_publisher_factory_release_mode_v1 = manual_gh_release
gridwork_release_publisher_factory_uses_gh_release_create_v1 = true
gridwork_release_publisher_factory_action_auto_publish_v1 = false
gridwork_release_publisher_records_release_mode = true
gridwork_release_publisher_factory_prerelease_allowed = true
gridwork_release_publisher_factory_prerelease_github_flag_required = true
gridwork_release_publisher_cli_prerelease_next_dist_tag_required = true
gridwork_release_publisher_requires_sha256sums = true
gridwork_release_publisher_requires_source_commit = true
gridwork_release_publisher_requires_source_tag = true
gridwork_release_publisher_blocks_default_source_placeholder = true
gridwork_release_publisher_reuses_tags = false
gridwork_release_publisher_overwrites_releases = false
gridwork_release_publisher_external_signatures_required_v1 = false
```

## Regla

```text
La skill prepara releases por defecto.
La skill publica tags/releases solo con approval.
En v1, la publicacion de fabrica usa `manual_gh_release` y `gh release create`.
`publish-factory.yml` puede existir como template u objetivo futuro, pero no auto-publica en v1.
Las versiones prerelease deben marcarse como prerelease y nunca como stable/latest.
Cada release debe tener bundle, hash, release notes y manifest.
Cada release de fabrica debe tener `SHA256SUMS.txt`, source tag y source commit.
Cada release real bloquea si `DEFAULT_FACTORY_SOURCE` sigue como placeholder.
El bundle nunca incluye `.factory/`.
La skill puede preparar releases de CLI, pero no publica npm directamente.
La skill no reutiliza tags ni sobrescribe releases publicados.
V1 no exige firmas externas.
Merge queda fuera de la skill.
```

## Supuestos

- La fabrica Gridwork vive en un repositorio Git.
- GitHub sera el primer host de releases.
- La CLI `npx gridwork init` descargara releases/tags versionados.
- `.factory/` nunca debe entrar al bundle.
- Los valores secretos no se leen ni se publican.

## Riesgos

- Publicar un release sin validacion puede romper instalaciones nuevas.
- Publicar desde una rama incorrecta puede fijar cambios incompletos.
- No generar hash dificulta auditar instalaciones.
- Permitir overwrite de releases puede volver ambiguo un lockfile.

## Artefactos a crear o actualizar

- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `.gridwork/skills/gridwork-release-publisher/skill.json`
- `.gridwork/templates/gridwork-release-plan.md`
- `.gridwork/templates/gridwork-release-notes.md`
- `.gridwork/templates/bundle-manifest.json`
- `.gridwork/templates/cli-release-plan.md`
- `.gridwork/templates/cli-release-notes.md`
- `.gridwork/templates/cli-npm-pack-report.md`
- `.gridwork/policies/git-policy.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/policies/security-policy.md`
- `.factory/runs/<run-id>/artifacts/release/`

## Evidencia y notas

- Esta pregunta baja a detalle el requisito del usuario: crear release/tag cada vez que se actualice Gridwork para que `npx gridwork init` pueda consumir una version estable.
- La recomendacion conserva el mismo modelo de gates aceptado para GitHub, Git y releases.
- Decision del usuario: aceptar preparacion por defecto y publicacion tag/release solo con aprobacion explicita.
- Revision posterior GQ-071: la skill tambien soporta modo `cli-release`; prepara release plan de CLI y tag `cli-v<version>`, pero la publicacion npm ocurre por GitHub Actions.
- Revision posterior GQ-078: la skill exige checksums, source tag/source commit y no reutiliza tags/releases; firmas externas quedan fuera de v1.
- Revision posterior GQ-080: la skill debe bloquear releases reales si el source oficial embebido sigue como placeholder.
- Revision posterior GQ-081: la skill es el publicador autoritativo de releases de fabrica en v1 mediante `gh release create` con aprobacion; `publish-factory.yml` queda como template u objetivo futuro.
- Revision posterior GQ-082: la skill puede preparar prereleases, pero debe marcarlos como prerelease y no publicarlos como stable/latest.
