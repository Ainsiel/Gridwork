# GQ-072 - Toolchain del monorepo y package manager

- Estado: accepted
- Fuente: decisiones GQ-064, GQ-067, GQ-070 y GQ-071
- Pregunta origen: GQ-072
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: repositorio Gridwork, `package.json` raiz, `packages/cli/`, lockfile, GitHub Actions, publicacion npm

## Pregunta

Que package manager y toolchain debe usar el monorepo de Gridwork para desarrollar y publicar la CLI TypeScript sin agregar dependencias innecesarias?

## Por que importa

Gridwork tiene dos contextos distintos:

```text
usuario instalador -> ejecuta npx gridwork init
mantenedor Gridwork -> desarrolla packages/cli y factory/.gridwork
```

El usuario instalador no deberia necesitar pnpm, yarn, bun ni un setup especial. Pero el repositorio fuente si necesita una toolchain para:

- compilar TypeScript;
- testear la CLI;
- empaquetar npm;
- publicar por GitHub Actions;
- construir releases de fabrica;
- validar manifests y bundles.

La decision debe evitar que la fabrica personal se vuelva pesada antes de tiempo.

## Opciones

### Opcion A - npm workspaces

Usar npm como package manager del monorepo:

```text
package.json
package-lock.json
packages/cli/package.json
```

Ventajas:

- npm ya viene con Node;
- encaja naturalmente con `npx`;
- no requiere instalar pnpm/yarn/bun;
- GitHub Actions puede usar `npm ci`;
- simplifica publicacion npm;
- suficiente para un monorepo pequeno v1.

Desventajas:

- menos ergonomico que pnpm en monorepos grandes;
- puede ser mas lento;
- no tiene algunas protecciones de dependency graph que pnpm maneja mejor.

### Opcion B - pnpm workspaces

Usar pnpm:

```text
pnpm-workspace.yaml
pnpm-lock.yaml
```

Ventajas:

- excelente para monorepos;
- instalaciones rapidas;
- dependency graph mas estricto;
- muy buena experiencia de workspace.

Desventajas:

- requiere Corepack o pnpm instalado;
- agrega una herramienta mas;
- menos directo para alguien que solo espera npm/npx;
- contradice un poco la preferencia de minimizar requisitos.

### Opcion C - Yarn workspaces

Usar Yarn:

```text
yarn.lock
```

Ventajas:

- workspace maduro;
- buen soporte historico;
- util si el ecosistema del repo ya lo usa.

Desventajas:

- otra herramienta externa;
- distintas versiones de Yarn pueden comportarse distinto;
- no aporta suficiente valor para v1.

### Opcion D - Bun

Usar Bun como runtime/package manager.

Ventajas:

- rapido;
- moderno;
- puede simplificar algunos scripts.

Desventajas:

- agrega una dependencia externa mas fuerte;
- puede generar diferencias de runtime;
- no encaja tan bien con `npx gridwork init`;
- demasiado experimental para el objetivo v1.

## Respuesta recomendada

Usar npm workspaces para v1:

```text
monorepo_package_manager = npm
workspace_model = npm_workspaces
lockfile = package-lock.json
```

Esto mantiene el repositorio fuente simple y evita que el usuario necesite aprender otra herramienta.

## Layout recomendado

```text
gridwork/
  package.json
  package-lock.json
  packages/
    cli/
      package.json
      tsconfig.json
      src/
      tests/
      dist/
  factory/
    .gridwork/
  docs/
  .docs/
```

## `package.json` raiz

Ejemplo:

```json
{
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build -w packages/cli",
    "test": "npm run test -w packages/cli",
    "lint": "npm run lint -w packages/cli",
    "pack:cli": "npm pack -w packages/cli --dry-run"
  }
}
```

El root no se publica a npm.

## `packages/cli/package.json`

Ejemplo:

```json
{
  "name": "gridwork",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "gridwork": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "node --test dist/**/*.test.js",
    "prepack": "npm run build"
  },
  "engines": {
    "node": ">=20"
  },
  "files": [
    "dist",
    "README.md",
    "package.json"
  ]
}
```

## Node y runtime

Recomendacion:

```text
node_min_version = >=20
user_runtime_requirement = Node+npx only
source_repo_dev_requirement = Node+npm only
```

Motivo:

- `npx` ya implica Node/npm;
- Node moderno tiene APIs utiles para fetch, fs, streams y crypto;
- evita depender de pnpm/yarn/bun;
- GitHub Actions puede usar una version LTS estable.

## Dependencias

La CLI debe intentar tener:

```text
runtime_dependencies = zero_or_minimal
dev_dependencies = typescript_and_test_tools
postinstall_scripts = false
```

Si se necesita una dependencia para extraer zip de forma segura, debe ser:

- pequena;
- mantenida;
- auditada;
- sin postinstall;
- justificada en docs;
- validada por `npm pack --dry-run`.

## GitHub Actions

Los workflows del repo fuente deben usar:

```text
npm ci
npm run build
npm test
npm pack -w packages/cli --dry-run
```

No deben requerir:

```text
pnpm install
yarn install
bun install
```

## Reglas para el usuario instalador

El usuario final ejecuta:

```bash
npx gridwork init
```

No necesita:

- clonar el repo de Gridwork;
- instalar pnpm;
- instalar yarn;
- instalar bun;
- compilar TypeScript;
- instalar dependencias del proyecto destino.

## Propuesta inicial

```text
monorepo_package_manager = npm
workspace_model = npm_workspaces
root_package_private = true
root_lockfile = package-lock.json
pnpm_required_v1 = false
yarn_required_v1 = false
bun_required_v1 = false
node_min_version = >=20
source_repo_dev_requirement = node_npm
user_runtime_requirement = node_npx
cli_runtime_dependencies = zero_or_minimal
cli_dev_dependencies = typescript_and_test_tools
cli_postinstall_scripts = false
github_actions_uses_npm_ci = true
github_actions_uses_npm_pack_dry_run = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el monorepo fuente use npm workspaces,
o prefieres pnpm/yarn/bun para desarrollar la CLI y la fabrica?
```

Mi recomendacion: npm workspaces en v1. Es menos sofisticado que pnpm, pero evita dependencias extra y encaja mejor con `npx gridwork init` y la publicacion npm.

## Respuesta del usuario

El usuario acepta la recomendacion:

- usar npm workspaces en v1;
- usar `package-lock.json` como lockfile del monorepo;
- no requerir pnpm, yarn ni bun;
- usar Node `>=20`;
- mantener runtime dependencies de la CLI en cero o minimas;
- prohibir postinstall scripts en la CLI;
- usar `npm ci`, `npm run build`, `npm test` y `npm pack --dry-run` en GitHub Actions.

## Decision registrada

```text
monorepo_package_manager = npm
workspace_model = npm_workspaces
root_package_private = true
root_lockfile = package-lock.json
pnpm_required_v1 = false
yarn_required_v1 = false
bun_required_v1 = false
node_min_version = >=20
source_repo_dev_requirement = node_npm
user_runtime_requirement = node_npx
cli_runtime_dependencies = zero_or_minimal
cli_dev_dependencies = typescript_and_test_tools
cli_postinstall_scripts = false
github_actions_uses_npm_ci = true
github_actions_uses_npm_pack_dry_run = true
```

## Regla

```text
El monorepo fuente usa npm workspaces.
El root es privado y no se publica.
El lockfile es `package-lock.json`.
La CLI exige Node >=20.
El usuario final solo necesita Node+npx para usar `npx gridwork init`.
V1 no requiere pnpm, yarn ni bun.
```

## Supuestos

- El monorepo v1 sera pequeno.
- Solo existe `packages/cli/` como paquete npm al inicio.
- La fabrica vive en `factory/.gridwork/` y no se publica como paquete npm.
- La prioridad es reducir requisitos para instalar y mantener Gridwork.
- GitHub Actions sera el lugar principal de build/publish.

## Riesgos

- npm workspaces puede ser menos optimo si el monorepo crece mucho.
- Node `>=20` sigue siendo una dependencia real, aunque razonable para `npx`.
- Cero runtime dependencies podria ser dificil si se mantiene zip como formato.
- Si se agrega una dependencia runtime sin control, el paquete npm puede crecer o introducir riesgo.

## Artefactos a crear o actualizar

- `package.json`
- `package-lock.json`
- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `.github/workflows/publish-cli.yml`
- `.github/workflows/ci.yml`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta reduce friccion para el flujo `npx gridwork init`.
- Complementa GQ-071: publicacion npm de la CLI.
- Complementa GQ-067: monorepo con `packages/cli/` y `factory/.gridwork/`.
- Decision del usuario: aceptar npm workspaces como toolchain v1 del monorepo.
- Revision posterior GQ-075: `zero_or_minimal` permite una unica dependencia runtime pequena y auditada para extraccion segura de zip.
