# GQ-080 - Source oficial embebido y coordenadas de release

- Estado: accepted
- Fuente: decisiones GQ-064, GQ-067, GQ-069, GQ-078 y GQ-079
- Pregunta origen: GQ-080
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli/src/init/resolve-source.ts`, configuracion de build de CLI, GitHub owner/repo, docs de instalacion, release process

## Pregunta

Como debe definir la CLI el source oficial embebido desde donde descarga la fabrica Gridwork?

## Por que importa

GQ-069 decidio que:

```text
init default = source oficial embebido
override avanzado = --source owner/repo --factory-version <version>
```

GQ-079 agrego que el package npm final puede ser:

```text
gridwork
@<scope>/gridwork
```

Pero falta decidir donde vive y como se valida el source oficial:

```text
default_factory_source = <github-owner>/<repo>
```

Si se hardcodea mal, `npx gridwork init` podria descargar releases equivocados. Si se deja como placeholder en un release real, la CLI quedaria inutil.

## Opciones

### Opcion A - Hardcode fijo en codigo fuente

La CLI tiene una constante:

```ts
const DEFAULT_FACTORY_SOURCE = "owner/repo";
```

Ventajas:

- simple;
- facil de leer;
- sin configuracion de build.

Desventajas:

- cambiar owner/repo requiere editar codigo;
- riesgo de publicar con placeholder;
- dificil manejar forks o distribuciones personales;
- mezcla identidad del release con codigo.

### Opcion B - Variable de entorno en runtime

`init` lee:

```text
GRIDWORK_FACTORY_SOURCE=owner/repo
```

Ventajas:

- flexible;
- no requiere recompilar para cambiar source.

Desventajas:

- peor UX;
- una variable mal seteada puede cambiar instalacion sin que el usuario lo note;
- menos reproducible;
- contradice source oficial embebido.

### Opcion C - Constantes generadas/validadas en build

La CLI tiene defaults compilados, definidos en un archivo de config controlado:

```text
packages/cli/src/config/defaults.ts
```

Ejemplo:

```ts
export const DEFAULT_FACTORY_SOURCE = "github-owner/gridwork";
export const DEFAULT_FACTORY_SOURCE_TYPE = "github-release";
export const FACTORY_TAG_PREFIX = "factory-v";
```

CI y release plan bloquean si hay placeholders:

```text
<github-owner>/<repo>
owner/repo
TODO
```

Ventajas:

- UX simple;
- reproducible;
- facil de testear;
- evita publicar placeholders;
- permite que implementacion cambie source antes del release;
- mantiene override avanzado bajo control.

Desventajas:

- requiere check de CI;
- cambiar source oficial requiere release de CLI;
- necesita disciplina de release.

## Respuesta recomendada

Usar Opcion C:

```text
official_source_model = build_time_validated_defaults
```

La CLI debe compilar con un source oficial real antes de publicar. Durante desarrollo pueden existir placeholders, pero CI/release publisher deben bloquear releases si siguen presentes.

## Config recomendada

Archivo:

```text
packages/cli/src/config/defaults.ts
```

Contenido conceptual:

```ts
export const DEFAULT_FACTORY_SOURCE = "<github-owner>/<repo>";
export const DEFAULT_FACTORY_SOURCE_TYPE = "github-release";
export const FACTORY_TAG_PREFIX = "factory-v";
export const FACTORY_ASSET_NAME_TEMPLATE = "gridwork-factory-v{version}.zip";
export const BUNDLE_MANIFEST_ASSET_NAME = "bundle-manifest.json";
export const SHA256SUMS_ASSET_NAME = "SHA256SUMS.txt";
```

En desarrollo puede existir placeholder.

En release real, placeholder bloquea:

```text
publish-cli = blocked
factory release plan = blocked
```

## Validaciones antes de release

`gridwork-release-publisher` y CI deben validar:

- `DEFAULT_FACTORY_SOURCE` no es placeholder;
- formato es `owner/repo`;
- no contiene protocolo `https://`;
- no contiene branch;
- repo coincide con GitHub repository esperado, si se puede detectar;
- tag prefix es `factory-v`;
- asset template coincide con GQ-068;
- package name docs coinciden con GQ-079;
- source oficial aparece en release notes y docs.
- source oficial v1 debe ser publico para que `npx gridwork init` funcione sin auth.

## Runtime de `init`

Por defecto:

```bash
npx gridwork init
```

usa:

```text
DEFAULT_FACTORY_SOURCE
```

Para desarrollo/forks:

```bash
npx gridwork init --source owner/repo --factory-version 1.0.0
```

sigue permitido, segun GQ-069.

No permitir en v1:

```text
GRIDWORK_FACTORY_SOURCE como override silencioso
config global de usuario
branch source
URL arbitraria
main
```

## Documentacion

Mientras el source oficial no este definido, docs internas pueden usar:

```text
<github-owner>/<repo>
```

Docs publicas de release no deben usar placeholders.

El release plan debe tener un checklist:

```text
[ ] package name verificado
[ ] npm ownership verificado
[ ] GitHub owner/repo definido
[ ] DEFAULT_FACTORY_SOURCE no es placeholder
[ ] release assets existen
```

## Propuesta inicial

```text
official_factory_source_model = build_time_validated_defaults
official_factory_source_config_path = packages/cli/src/config/defaults.ts
official_factory_source_runtime_env_override_v1 = false
official_factory_source_global_config_v1 = false
official_factory_source_should_be_public_v1 = true
official_factory_source_placeholder_allowed_in_dev = true
official_factory_source_placeholder_allowed_in_release = false
official_factory_source_format = github_owner_repo
official_factory_source_branch_allowed = false
official_factory_source_url_allowed = false
official_factory_source_override_flag_allowed = true
official_factory_source_override_requires_factory_version = true
release_blocks_if_default_source_placeholder = true
ci_blocks_publish_if_default_source_placeholder = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el source oficial se hardcodee directamente en codigo,
o que viva como defaults de build validados por CI/release plan,
bloqueando releases si queda un placeholder?
```

Mi recomendacion: usar defaults de build validados. En desarrollo puede existir `<github-owner>/<repo>`, pero ningun release de CLI puede publicarse si el source oficial sigue como placeholder.

## Respuesta del usuario

El usuario acepta la recomendacion:

- el source oficial debe vivir como defaults de build validados;
- el archivo conceptual de defaults es `packages/cli/src/config/defaults.ts`;
- durante desarrollo puede existir placeholder;
- ningun release real de CLI puede publicarse con placeholder;
- v1 no usa env override silencioso para source oficial;
- v1 no usa config global de usuario para source oficial;
- el formato de source oficial es `owner/repo`;
- el override avanzado `--source owner/repo --factory-version <version>` sigue permitido.

## Decision registrada

```text
official_factory_source_model = build_time_validated_defaults
official_factory_source_config_path = packages/cli/src/config/defaults.ts
official_factory_source_runtime_env_override_v1 = false
official_factory_source_global_config_v1 = false
official_factory_source_should_be_public_v1 = true
official_factory_source_placeholder_allowed_in_dev = true
official_factory_source_placeholder_allowed_in_release = false
official_factory_source_format = github_owner_repo
official_factory_source_branch_allowed = false
official_factory_source_url_allowed = false
official_factory_source_override_flag_allowed = true
official_factory_source_override_requires_factory_version = true
release_blocks_if_default_source_placeholder = true
ci_blocks_publish_if_default_source_placeholder = true
```

## Regla

```text
El source oficial vive en defaults de build validados.
En desarrollo puede existir placeholder.
Ningun release de CLI puede publicarse con placeholder.
V1 no usa env override ni config global para source oficial.
El source oficial v1 debe ser publico.
El override explicito `--source owner/repo --factory-version` sigue permitido.
```

## Supuestos

- GitHub Releases sera el source inicial.
- El owner/repo oficial aun puede no estar definido.
- El package npm final aun puede requerir verificacion.
- El override `--source owner/repo --factory-version` sigue existiendo para forks o pruebas.
- El usuario quiere evitar configuracion global o variables silenciosas.

## Riesgos

- Hardcodear mal el source rompe instalaciones.
- Permitir env override silencioso puede hacer instalaciones no reproducibles.
- Publicar con placeholder dejaria `npx gridwork init` inutil.
- Cambiar source oficial despues exige nueva version de CLI.

## Artefactos a crear o actualizar

- `packages/cli/src/config/defaults.ts`
- `packages/cli/src/init/resolve-source.ts`
- `packages/cli/tests/resolve-source.test.ts`
- `.github/workflows/ci.yml`
- `.github/workflows/publish-cli.yml`
- `.gridwork/templates/cli-release-plan.md`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta concreta el source oficial embebido aceptado en GQ-069.
- Complementa GQ-079: package name y source ownership deben verificarse antes del release.
- Complementa GQ-078: provenance y metadata no ayudan si el source oficial esta mal definido.
- Decision del usuario: aceptar defaults de build validados y bloqueo de release si queda placeholder.
- Revision posterior GQ-083: el source oficial v1 debe ser publico para que `init` no requiera `gh`, login ni token.
