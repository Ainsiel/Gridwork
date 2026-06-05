# GQ-082 - Canales de release y prereleases

- Estado: accepted
- Fuente: decisiones GQ-065, GQ-066, GQ-069, GQ-070, GQ-078 y GQ-081
- Pregunta origen: GQ-082
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, GitHub Releases, `gridwork-release-publisher`, `bundle-manifest.json`, `.gridwork-lock.json`, npm dist-tags

## Pregunta

Debe Gridwork v1 soportar prereleases, canales beta/canary/nightly o solo releases estables?

La duda concreta:

```text
Que debe instalar `npx gridwork init` cuando existen releases estables y prereleases?
```

## Por que importa

GQ-069 ya decidio que `init` normal usa:

```text
ultimo release estable compatible
```

Tambien se decidio que v1 no instala desde branches ni `main`.

Pero falta decidir si queremos permitir pruebas controladas antes de un release estable:

- probar una fabrica nueva antes de marcarla estable;
- probar una CLI nueva antes de publicarla como default;
- permitir que el usuario instale una version experimental bajo su responsabilidad.

Sin una regla clara, los agentes podrian recomendar instalar prereleases como si fueran estables, o el CLI podria resolver una version beta por accidente.

## Opciones

### Opcion A - Solo stable en v1

Gridwork v1 solo publica e instala releases estables.

```bash
npx gridwork init
npx gridwork init --factory-version 1.0.0
```

No hay:

```text
beta
canary
nightly
--allow-prerelease
npm dist-tag next
```

Ventajas:

- maxima simplicidad;
- menos reglas de compatibilidad;
- menos riesgo de instalaciones experimentales;
- buen ajuste para una fabrica personal inicial.

Desventajas:

- probar cambios antes de stable queda mas manual;
- obliga a publicar stable para validar con usuarios reales;
- dificulta ensayos de compatibilidad CLI/fabrica.

### Opcion B - Stable por defecto + prerelease explicito

Default:

```bash
npx gridwork init
```

solo instala stable.

Para prerelease, el usuario debe pedir una version exacta y aceptar riesgo:

```bash
npx gridwork init --factory-version 1.1.0-beta.1 --allow-prerelease
```

Reglas:

- no hay `latest` prerelease;
- no hay canales en v1;
- no hay nightly;
- prerelease requiere version exacta;
- prerelease requiere flag explicito;
- lockfile registra que se instalo prerelease.

Ventajas:

- mantiene UX estable por defecto;
- permite probar releases experimentales;
- conserva trazabilidad;
- evita que una beta se instale por accidente.

Desventajas:

- agrega un flag mas;
- requiere validar SemVer prerelease;
- release notes deben advertir riesgos;
- hay que distinguir stable/prerelease en reportes y lockfile.

### Opcion C - Canales completos

Soportar:

```bash
npx gridwork init --channel stable
npx gridwork init --channel beta
npx gridwork init --channel canary
npx gridwork init --channel nightly
```

Ventajas:

- flexible;
- util si hay muchos usuarios;
- permite flujos similares a productos maduros.

Desventajas:

- demasiado para v1;
- complica resolucion de versiones;
- puede chocar con GQ-066, que evita auto-update;
- requiere reglas de retencion, canales y compatibilidad mas complejas.

## Respuesta recomendada

Usar Opcion B:

```text
release_channel_model_v1 = stable_default_prerelease_explicit_only
```

Default siempre estable:

```bash
npx gridwork init
```

Pruebas experimentales solo con version exacta:

```bash
npx gridwork init --factory-version 1.1.0-beta.1 --allow-prerelease
```

No agregar canales `beta`, `canary` ni `nightly` en v1.

## Reglas de fabrica

Un release de fabrica estable:

```text
tag = factory-v1.0.0
github_release.prerelease = false
release_channel = stable
```

Un prerelease de fabrica:

```text
tag = factory-v1.1.0-beta.1
github_release.prerelease = true
release_channel = prerelease
```

`npx gridwork init` sin flags:

- ignora prereleases;
- ignora drafts;
- elige ultimo stable compatible.

`npx gridwork init --factory-version 1.1.0-beta.1` sin `--allow-prerelease`:

- bloquea;
- explica que la version es prerelease;
- sugiere reintentar con `--allow-prerelease`.

## Reglas de CLI npm

Para v1, publicar la CLI npm como stable por defecto.

Si en algun momento se publica una CLI prerelease, debe:

- usar SemVer prerelease, por ejemplo `0.2.0-beta.1`;
- no publicarse con npm dist-tag `latest`;
- usar dist-tag explicito como `next`;
- requerir approval especial;
- dejar evidencia en `cli-release-plan.md`.

Esto queda permitido como capacidad, pero no como flujo normal v1.

## Manifest y lockfile

`bundle-manifest.json` debe registrar:

```json
{
  "factory_version": "1.1.0-beta.1",
  "release_channel": "prerelease",
  "prerelease": true
}
```

`.gridwork-lock.json` debe registrar:

```json
{
  "factory": {
    "version": "1.1.0-beta.1",
    "releaseChannel": "prerelease",
    "prerelease": true
  }
}
```

## Propuesta inicial

```text
release_channel_model_v1 = stable_default_prerelease_explicit_only
init_default_installs_prerelease = false
init_prerelease_requires_exact_factory_version = true
init_prerelease_requires_allow_flag = true
init_channel_flag_v1 = false
init_beta_channel_v1 = false
init_canary_channel_v1 = false
init_nightly_channel_v1 = false
factory_prerelease_tag_allowed = true
factory_prerelease_github_release_prerelease_flag_required = true
bundle_manifest_declares_release_channel = true
lockfile_records_release_channel = true
npm_cli_prerelease_allowed_with_next_dist_tag = true
npm_cli_prerelease_default_v1 = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres que Gridwork v1 sea solo stable,
o que permita prereleases solo cuando el usuario indique una version exacta
y agregue `--allow-prerelease`?
```

Mi recomendacion: stable por defecto y prerelease explicito solamente. Sin canales `beta`, `canary` ni `nightly` en v1.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Gridwork v1 instala releases estables por defecto;
- `npx gridwork init` ignora prereleases si no hay flags explicitos;
- prerelease requiere version exacta;
- prerelease requiere `--allow-prerelease`;
- v1 no tendra canales `beta`, `canary` ni `nightly`;
- `bundle-manifest.json` debe declarar release channel;
- `.gridwork-lock.json` debe registrar release channel;
- prerelease de CLI npm queda permitido solo como capacidad controlada, no como flujo normal v1.

## Decision registrada

```text
release_channel_model_v1 = stable_default_prerelease_explicit_only
init_default_installs_prerelease = false
init_prerelease_requires_exact_factory_version = true
init_prerelease_requires_allow_flag = true
init_channel_flag_v1 = false
init_beta_channel_v1 = false
init_canary_channel_v1 = false
init_nightly_channel_v1 = false
factory_prerelease_tag_allowed = true
factory_prerelease_github_release_prerelease_flag_required = true
bundle_manifest_declares_release_channel = true
lockfile_records_release_channel = true
npm_cli_prerelease_allowed_with_next_dist_tag = true
npm_cli_prerelease_default_v1 = false
```

## Regla

```text
`npx gridwork init` instala stable por defecto.
Prerelease solo se instala con `--factory-version <x.y.z-prerelease>` y `--allow-prerelease`.
No hay `--channel`, beta, canary ni nightly en v1.
El manifest y lockfile registran `release_channel` / `releaseChannel`.
Una CLI prerelease no se publica como npm `latest`.
```

## Supuestos

- Gridwork v1 prioriza seguridad y trazabilidad sobre flexibilidad de canales.
- Puede ser util probar una fabrica prerelease antes de marcarla stable.
- El usuario no quiere instalaciones desde branch ni `main`.
- La CLI puede validar SemVer prerelease.
- GitHub Releases permite marcar prereleases.

## Riesgos

- Permitir prereleases sin flag puede instalar versiones inestables por accidente.
- Prohibir prereleases por completo puede volver mas torpe probar cambios reales.
- Canales completos pueden agregar complejidad antes de tiempo.
- npm dist-tags mal usados pueden publicar una CLI beta como `latest`.

## Artefactos a crear o actualizar

- `packages/cli/src/init/resolve-version.ts`
- `packages/cli/src/init/resolve-source.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/tests/resolve-version.test.ts`
- `.gridwork/templates/bundle-manifest.json`
- `.gridwork/templates/source-resolution-report.md`
- `.gridwork/templates/cli-release-plan.md`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta concreta como evitar que prereleases se instalen por accidente.
- Complementa GQ-066: no hay auto-update ni canales automaticos en v1.
- Complementa GQ-069: default usa ultimo release estable compatible.
- Complementa GQ-081: la skill de release puede preparar prereleases, pero no marcarlos como stable sin approval.
- Decision del usuario: aceptar stable por defecto y prerelease explicito con version exacta + `--allow-prerelease`.
