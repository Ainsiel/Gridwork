# GQ-067 - Repositorio fuente de Gridwork

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-028, GQ-064, GQ-065 y GQ-066
- Pregunta origen: GQ-067
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: repositorio Gridwork, paquete npm, fuente de fabrica, release assets, docs de desarrollo

## Pregunta

Como debe organizarse el repositorio fuente de Gridwork: un monorepo con CLI y fabrica en el mismo repo, o repos separados para la CLI npm y la fabrica versionada?

## Por que importa

GQ-064 decidio que la CLI npm sera un bootstrapper y descargara la fabrica desde un release/tag versionado. Eso implica al menos dos piezas:

```text
CLI TypeScript -> paquete npm
fabrica Gridwork -> bundle descargable desde release/tag
```

Pueden vivir en el mismo repositorio o en repos separados. La decision afecta releases, versionado, CI/CD, mantenimiento y trazabilidad.

## Opciones

### Opcion A - Monorepo

Un solo repositorio contiene:

```text
packages/cli/
factory/
docs/
.docs/
```

La CLI se publica a npm desde `packages/cli/`.

La fabrica se empaqueta desde `factory/.gridwork/` y se publica como asset de GitHub Release.

Ventajas:

- una sola fuente de verdad;
- mas simple para v1 personal;
- cambios de CLI y fabrica pueden coordinarse;
- `gridwork-release-publisher` puede operar en un solo repo;
- menos setup inicial;
- mas facil revisar docs y decisiones juntas.

Desventajas:

- el repo mezcla codigo de CLI y definiciones de fabrica;
- se necesitan convenciones claras para no empaquetar archivos incorrectos;
- versiones de CLI y fabrica pueden divergir aunque vivan juntas.

### Opcion B - Repos separados

Repositorios separados:

```text
gridwork-cli/
gridwork-factory/
```

La CLI se publica desde `gridwork-cli`.

La fabrica se publica desde `gridwork-factory`.

Ventajas:

- separacion limpia;
- releases independientes;
- repo de fabrica puede ser muy declarativo;
- menos riesgo de mezclar codigo CLI con bundle.

Desventajas:

- mas mantenimiento;
- mas configuracion;
- mas dificil coordinar cambios;
- para una fabrica personal v1 puede ser demasiado pronto.

## Respuesta recomendada

Usar monorepo en v1, pero con separacion interna estricta:

```text
gridwork/
  packages/
    cli/
  factory/
    .gridwork/
  docs/
  .docs/
```

La CLI no debe leer archivos de desarrollo al instalar. Solo debe descargar assets de release.

El release publisher debe construir el bundle desde:

```text
factory/.gridwork/
```

y producir asset:

```text
gridwork-factory-v<version>.zip
```

## Layout recomendado

```text
gridwork/
  package.json                    # workspace root opcional
  package-lock.json               # lockfile npm

  packages/
    cli/
      package.json
      tsconfig.json
      src/
        cli.ts
        commands/
        init/
        validation/
        utils/
      dist/

  factory/
    .gridwork/
      factory.json
      agents/
      workflows/
      skills/
      stack-packs/
      policies/
      schemas/
      templates/

  docs/
    CLI_INIT_BEHAVIOR.md
    RELEASE_PROCESS.md
    OPERATING_MODEL.md

  .docs/
    grill-me_factory/
```

## Versionado recomendado

Separar versiones aunque vivan en el mismo repo:

```text
cli_version = package version de packages/cli
factory_version = version en factory/.gridwork/factory.json
```

Tags de fabrica:

```text
factory-v1.0.0
factory-v1.1.0
```

Tags de CLI, si se necesitan:

```text
cli-v0.1.0
cli-v0.2.0
```

Tambien podria usarse solo `v1.0.0` para fabrica al inicio, pero los prefijos reducen ambiguedad.

## Release assets

GitHub Release de fabrica debe incluir:

```text
gridwork-factory-v1.0.0.zip
bundle-manifest.json
SHA256SUMS.txt
gridwork-release-notes.md
```

La CLI debe descargar:

```text
gridwork-factory-v<factory-version>.zip
```

y verificar hash contra metadata del release o manifest.

## Propuesta inicial

```text
gridwork_source_repo_model = monorepo_v1
cli_source_path = packages/cli/
factory_source_path = factory/.gridwork/
factory_release_asset_name = gridwork-factory-v<version>.zip
cli_package_version_independent_from_factory_version = true
factory_tags_use_prefix = factory-v<version>
cli_tags_use_prefix = cli-v<version>
gridwork_release_publisher_builds_from_factory_path = true
gridwork_release_publisher_excludes_factory_runtime = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que la CLI npm y la fabrica Gridwork vivan en un monorepo,
o prefieres repos separados para `gridwork-cli` y `gridwork-factory`?
```

Mi recomendacion: monorepo para v1, con `packages/cli/` y `factory/.gridwork/` separados. Es mas simple para construir, documentar y publicar una fabrica personal, sin cerrar la puerta a separar repos despues.

## Respuesta del usuario

El usuario acepta la recomendacion:

- usar monorepo para v1;
- mantener la CLI TypeScript en `packages/cli/`;
- mantener la fabrica versionada en `factory/.gridwork/`;
- separar docs publicos en `docs/` y decisiones internas en `.docs/`;
- versionar CLI y fabrica de forma independiente;
- usar tags con prefijo para evitar ambiguedad;
- publicar el bundle como asset `gridwork-factory-v<version>.zip`.

## Decision registrada

```text
gridwork_source_repo_model = monorepo_v1
cli_source_path = packages/cli/
factory_source_path = factory/.gridwork/
factory_release_asset_name = gridwork-factory-v<version>.zip
cli_package_version_independent_from_factory_version = true
factory_tags_use_prefix = factory-v<version>
cli_tags_use_prefix = cli-v<version>
gridwork_release_publisher_builds_from_factory_path = true
gridwork_release_publisher_excludes_factory_runtime = true
```

## Regla

```text
Gridwork v1 vive en un monorepo.
La CLI vive en `packages/cli/`.
La fabrica publicable vive en `factory/.gridwork/`.
El release de fabrica se taggea como `factory-v<version>`.
El release de CLI, si existe, se taggea como `cli-v<version>`.
El bundle de fabrica se construye solo desde `factory/.gridwork/`.
```

## Supuestos

- El proyecto actual `Gridwork` puede convertirse en el repositorio fuente.
- La fabrica se versiona como asset de release.
- La CLI se publica a npm.
- Los docs de grill-me pueden vivir en `.docs/` y no entrar al bundle.
- `.factory/` nunca entra al release asset.

## Riesgos

- Monorepo puede mezclar responsabilidades si no hay paths claros.
- Repos separados pueden ser excesivos para v1.
- Tags ambiguos pueden confundir version de CLI con version de fabrica.
- Si el release publisher empaqueta desde el path equivocado, puede publicar archivos de desarrollo.

## Artefactos a crear o actualizar

- `packages/cli/`
- `factory/.gridwork/`
- `docs/RELEASE_PROCESS.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `.gridwork/templates/bundle-manifest.json`

## Evidencia y notas

- Esta pregunta aterriza la decision de GQ-064: CLI bootstrapper + fabrica versionada.
- La recomendacion privilegia simplicidad inicial y trazabilidad local.
- Decision del usuario: aceptar monorepo v1 con separacion interna estricta.
- Revision posterior GQ-072: el monorepo usa npm workspaces y `package-lock.json`; no requiere `pnpm-workspace.yaml`.
