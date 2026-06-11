# Contexto del proyecto Gridwork

## Alcance de esta revision

Este documento resume el repositorio completo revisado el 2026-06-11.

La revision original cubrio codigo fuente, pruebas, workflows de GitHub, artefactos
compilados y la factory instalable. La factory actual contiene 197 archivos.

Se excluyeron expresamente:

- `.example/` y archivos `*.example`;
- `node_modules/`;
- metadatos internos de `.git/`.

`packages/cli/dist/` fue revisado como salida generada. No esta rastreado por Git y
su fuente de verdad es `packages/cli/src/`.

## Resumen ejecutivo

Gridwork es una factory personal de software, agnostica del agente, que se instala
dentro de un repositorio existente. El producto tiene dos partes:

1. `packages/cli/`: CLI TypeScript publicada como paquete npm `gridwork`.
2. `factory/.gridwork/`: factory declarativa que el CLI instala como `.gridwork/`.

La factory no ejecuta una automatizacion oculta ni genera codigo de producto durante
`init`. Instala contratos para agentes, workflows, skills, politicas, schemas,
templates y un stack pack. El usuario activa el sistema pegando o referenciando
`.gridwork/agents/orchestrator/PROMPT.md` en el chat de su agente de codigo.

No existe `gridwork run`. El CLI solo:

- instala o actualiza la factory con `gridwork init`;
- prepara artefactos locales de release con `gridwork release ... --dry-run`.

Estado declarado:

```text
cli package = gridwork@0.1.0
factory version = 0.1.0
factory profile = full-v1
generated product code = false
agents = 9
workflows = 10
core skills = 39
stack skills = 12
```

## Fuentes de verdad

| Tema | Fuente principal |
|---|---|
| Comportamiento del CLI | `packages/cli/src/` |
| Contrato npm del CLI | `packages/cli/package.json` |
| Factory distribuible | `factory/.gridwork/` |
| Inventario principal de factory | `factory/.gridwork/factory.json` |
| Contratos humanos | archivos `AGENT.md`, `WORKFLOW.md`, `SKILL.md` y politicas |
| Guia practica de workflows | `factory/.gridwork/docs/WORKFLOW_GUIDE.md` |
| Contratos estructurados | archivos `agent.json`, `workflow.json`, `skill.json` y schemas |
| Inventario validado por el instalador | `packages/cli/src/init/constants.ts` |
| Comportamiento esperado | `packages/cli/test/*.test.mjs` |
| Salida compilada | `packages/cli/dist/`, regenerada desde `src/` |

Cuando se cambia la factory, normalmente deben mantenerse sincronizados:

- el archivo real bajo `factory/.gridwork/`;
- su referencia en `factory.json` o el stack pack, si corresponde;
- los inventarios `FULL_FACTORY_REQUIRED_FILES` y `FULL_FACTORY_JSON_FILES`;
- los manifiestos cruzados de agentes, workflows y skills;
- los catalogos instalados y las pruebas de inventario.

## Estructura del repositorio

```text
.github/workflows/
  ci.yml                       build, test y npm pack dry-run
  publish-cli.yml              trusted publishing del CLI desde tags cli-v*

factory/.gridwork/             fuente versionada de la factory instalable
  agents/                      7 agentes, manifiestos y contratos
  docs/                        catalogos instalados
  policies/                    reglas, permisos, gates y labels
  schemas/                     schemas JSON permisivos
  skills/                      39 skills centrales
  stack-packs/                 stack pack Next.js/Spring Boot/FastAPI/PostgreSQL/Docker
  templates/                   plantillas de runtime, arquitectura y releases
  workflows/                   10 playbooks
  factory.json                 inventario y activacion principal

packages/cli/
  src/                         fuente TypeScript
  test/                        pruebas Node test runner
  dist/                        salida generada por TypeScript
  package.json                 paquete npm gridwork

package.json                   monorepo npm privado con workspaces
package-lock.json              lockfile npm
README.md                      documentacion principal
```

En repositorios donde Gridwork se instala:

```text
.gridwork/                     definiciones versionables instaladas
.gridwork-lock.json            procedencia y hashes de archivos instalados
.factory/                      estado local, reportes, cache y artefactos ignorados
```

## Toolchain y comandos

- Node.js requerido: `>=20`.
- Modulos: ESM (`"type": "module"`).
- TypeScript estricto, target ES2022 y resolucion `NodeNext`.
- Dependencia de runtime unica: `fflate` para ZIP.
- Pruebas: `node:test`, escritas como `.mjs` e importando desde `dist/`.
- Monorepo: npm workspaces sobre `packages/*`.

Comandos de desarrollo:

```bash
npm ci
npm run build
npm test
npm run pack:cli:dry-run
```

`npm test` construye primero el CLI y luego ejecuta las pruebas. La revision actual
ejecuto 37 pruebas: todas pasaron.

## Arquitectura del CLI

### Entrada y parsing

- `src/index.ts` es el binario con shebang y asigna `process.exitCode`.
- `src/cli.ts` enruta solamente `init` y `release`.
- Errores de uso devuelven codigo `2`.
- El IO se inyecta mediante `CliIO`, lo que facilita pruebas sin consola real.

Comandos publicos:

```text
gridwork init [options]
gridwork release factory --dry-run [options]
gridwork release cli --dry-run [options]
```

Opciones `init`:

```text
--verbose
--factory-version <semver>
--source <owner/repo>
--allow-prerelease
```

`--source` y `--allow-prerelease` requieren `--factory-version`.
`--json`, `--silent` y `--force` estan rechazados expresamente en v1.

Codigos de salida de `init`:

| Codigo | Significado |
|---:|---|
| 0 | exito |
| 1 | fallo general |
| 2 | error de uso |
| 4 | fallo al resolver o descargar fuente |
| 5 | fallo al verificar bundle |
| 6 | fallo de validacion |
| 7 | incompatibilidad |
| 8 | conflicto de archivo |
| 9 | fallo de filesystem/aplicacion |

### Init local

Sin `--factory-version`, `init` toma la factory desde `factory/.gridwork` del checkout
fuente. El flujo:

1. crea `.factory/init/<timestamp>-init/`;
2. escribe preflight y resolucion de fuente;
3. lista la factory, rechazando symlinks;
4. compara SHA-256 del origen, destino y lockfile anterior;
5. genera un apply plan;
6. bloquea ante archivos modificados o de propietario desconocido;
7. copia solo archivos nuevos o actualizables de forma segura;
8. valida inventario, JSON parseable, perfil y ausencia de rutas de producto;
9. agrega `.factory/` a `.gitignore`;
10. escribe `.gridwork-lock.json` con procedencia y hashes;
11. escribe reportes Markdown y JSON.

Acciones posibles del apply plan:

```text
create
update_safe
unchanged
conflict_modified
conflict_unknown_owner
```

Los conflictos nunca se sobrescriben. La nueva version se deja bajo
`.factory/init/<run-id>/candidates/.gridwork/...`.

El init es idempotente y puede reparar archivos instalados faltantes cuando el
lockfile demuestra su propiedad previa.

### Init remoto

Con `--factory-version`, el CLI resuelve un GitHub Release:

```text
tag = factory-v<version>
assets =
  gridwork-factory-v<version>.zip
  gridwork-factory-v<version>.manifest.json
  gridwork-factory-v<version>.sha256
```

Detalles:

- fuente predeterminada: `Ainsiel/Gridwork`;
- API predeterminada: `https://api.github.com`;
- `GRIDWORK_GITHUB_API_BASE_URL` permite sustituir la API para pruebas;
- `GITHUB_TOKEN`, si existe, se usa como bearer token pero nunca se reporta;
- cache local: `.factory/cache/bundles/github-release/<owner__repo>/<tag>/`;
- valida checksums, version, perfil, `generatedProductCode=false` y version minima
  del CLI;
- soporta prereleases solo con `--allow-prerelease`;
- extrae primero a staging y luego reutiliza el flujo de instalacion local.

Limites defensivos del bundle:

```text
zip maximo = 25 MiB
descomprimido maximo = 100 MiB
archivo maximo = 10 MiB
cantidad maxima = 2000 archivos
```

Todo archivo ZIP debe estar bajo `.gridwork/`. Se bloquean traversal, rutas
absolutas/no portables, `.git`, `.github`, `.factory`, `node_modules` y rutas de
producto.

### Release de factory

`gridwork release factory` solo soporta `--dry-run`. Construye un ZIP con raiz
`.gridwork/`, manifest, checksums, notas, inventario, validacion y comandos
propuestos bajo `.factory/runs/<run-id>/artifacts/release/`.

El dry-run:

- valida inventario y rutas seguras;
- bloquea la fuente placeholder `gridwork/gridwork`;
- exige permiso explicito para prereleases;
- prepara `git tag`, `git push` y `gh release create`;
- nunca ejecuta comandos remotos.

### Release del CLI

`gridwork release cli` tambien es exclusivamente `--dry-run`.

Valida:

- nombre del paquete;
- `bin.gridwork = dist/index.js`;
- inclusion de `dist`;
- ausencia de scripts `preinstall`, `install` y `postinstall`;
- ausencia de rutas prohibidas en el paquete;
- confirmacion de propiedad del paquete;
- confirmacion de fuente oficial;
- commit fuente conocido.

Usa tag `cli-v<version>`. Versiones estables usan dist-tag npm `latest` y
prereleases usan `next`. El CLI local nunca ejecuta `npm publish`.

## Modelo de la factory

### Activacion

La activacion principal es `agents/orchestrator/PROMPT.md`. El prompt obliga a cargar
manifiestos, contratos y politicas antes de enrutar, y pide una primera respuesta
estructurada sin modificar codigo ni crear runs ambiguos.

### Agentes

| Agente | Modo | Responsabilidad |
|---|---|---|
| `orchestrator` | interactive | enrutar solicitudes, delegar y aplicar gates |
| `intake-agent` | interactive | aclarar ideas, bugs, features y mejoras |
| `software-architect` | interactive | disenar arquitectura DDD y ADRs |
| `planner-agent` | hybrid | preparar backlog vertical y planes GitHub |
| `backlog-manager-agent` | interactive | consultar backlog local/GitHub, seleccionar tareas y preparar handoffs |
| `implementer-agent` | afk | ejecutar work orders aprobadas con TDD |
| `verifier-agent` | hybrid/read-only | revisar alcance, evidencia y politicas |

Los skills nunca elevan permisos. El implementador necesita una work order aprobada;
el verificador no modifica codigo; el orquestador no implementa durante activacion ni
hace merge.

### Workflows

| Workflow | Modo | Agente principal | Resultado |
|---|---|---|---|
| `intake-existing-code` | interactive | intake-agent | solicitud aclarada y siguiente paso |
| `ideation-from-zero` | interactive | intake-agent | requisitos normalizados y SDD draft |
| `architecture-ddd` | interactive | software-architect | arquitectura, ADRs y backlog draft |
| `architecture-foundation` | hybrid | architecture-foundation-agent | estructura ejecutable minima, contratos y pruebas de arquitectura |
| `backlog-management` | interactive | backlog-manager-agent | snapshot, gaps, seleccion y work order candidate |
| `backlog-task-delivery` | hybrid | orchestrator | seleccion, implementacion TDD y verificacion |
| `tdd-implementation` | afk | implementer-agent | implementacion y evidencia RED/GREEN |
| `verification-pr` | hybrid | verifier-agent | decision pass/changes/evidence |
| `feature-pr-delivery` | hybrid | orchestrator | PR feature, CI, verificacion y merge a develop |
| `release-promotion` | hybrid | release-manager-agent | promocion develop-main y verificacion de deploy |

Flujo conceptual frecuente:

```text
solicitud
  -> orchestrator
  -> intake o ideation
  -> architecture-ddd cuando aplica
  -> architecture-foundation para materializar limites aprobados sin logica de negocio
  -> backlog-management para consultar o seleccionar trabajo
  -> backlog-task-delivery para seleccionar, implementar y verificar una tarea
  -> work order aprobada
  -> tdd-implementation
  -> feature-pr-delivery y verification-pr
  -> release-promotion para develop -> main -> produccion
  -> acciones Git separadas y aprobadas
```

### Skills centrales

Los 39 skills centrales se agrupan asi:

- requisitos y planificacion: `sdd-requirements`, `backlog-planning`,
  `backlog-management`;
- arquitectura: `architecture-grill-me`, `ubiquitous-language`,
  `domain-driven-design`, `clean-architecture`, seleccion de patrones, contratos API,
  modelo relacional y ADRs;
- foundation: planificacion, scaffolding minimo, contratos con consumidores conocidos,
  composition root, pruebas de limites y verificacion de conformidad;
- diagramas: base HTML autocontenida y variantes C4, ERD y UML;
- diagnostico, implementacion y pruebas: `diagnose-bug`, `tdd`,
  `integration-test-design`, `integration-testing`;
- GitHub/Git/CI: CLI gobernado, discovery/publish de issues, labels,
  `git-branch-management`, ramas por work order, ciclo de PR, evaluacion CI,
  promocion de release, verificacion de deployment y `github-actions-cicd`;
- operacion: `handoff` y `gridwork-release-publisher`.

Cada skill tiene:

- `skill.json`: agentes/workflows permitidos, inputs, outputs, artefactos y gates;
- `SKILL.md`: procedimiento accionable y restricciones.

### Stack pack

El unico stack pack mantiene el id `nextjs-springboot-postgresql` e incluye 12 skills:

- Next.js: frontend, UI y performance;
- Spring Boot: backend y performance;
- FastAPI: backend y performance;
- PostgreSQL: persistencia y performance;
- Docker: Dockerfile, Compose local y optimizacion de Compose.

El stack pack es orientacion, no scaffold. Sus paths y comandos son hints, no
permisos. Antes de usarlos se deben detectar versiones, convenciones, rutas reales y
comandos confirmados. Performance siempre requiere baseline; dependencias,
infraestructura y entornos compartidos permanecen tras gates.

### Politicas e invariantes

Reglas globales mas importantes:

- deny by default y gana la regla mas restrictiva;
- no leer, imprimir, almacenar ni publicar secretos reales;
- `.gridwork/` es definicion versionable; `.factory/` es runtime local ignorado;
- codigo e infraestructura de producto requieren scope confirmado y, para AFK, work
  order aprobada;
- comandos AFK deben estar allowlisted;
- GitHub writes, cambios de dependencias, acciones Git y decisiones arquitectonicas
  relevantes requieren gates separados;
- branch, stage, commit, push y PR son aprobaciones distintas;
- merge y deploy son manuales por defecto en v1;
- TDD requiere RED y GREEN validos; evidencia faltante produce
  `needs_more_evidence`;
- diagramas deben ser HTML autocontenido, sin CDN ni build externo;
- no se inventan labels: `policies/github-labels.json` es el catalogo.

Precedencia declarada:

```text
user instruction
system/tool safety
repository policy
workflow contract
agent contract
skill contract
stack guidance
work order
```

### Runtime y templates

La trazabilidad esperada vive bajo `.factory/runs/<run-id>/`:

- JSON para estado actual;
- JSONL para eventos append-only;
- Markdown para reportes humanos;
- gates, command summaries, TDD evidence, handoffs y artefactos especializados.

Las plantillas cubren:

- init, validacion, compatibilidad, conflictos y lockfile;
- runs, eventos, metricas y handoffs;
- work orders, TDD, implementacion y verificacion;
- arquitectura, ADR, API, datos y diagramas;
- issues, labels, Git y PR comments;
- releases de factory y CLI;
- slices fullstack, migraciones, UI, performance, Dockerfile y Compose.

Los schemas JSON son deliberadamente permisivos (`additionalProperties: true`) y
describen manifests de factory, agentes, workflows, skills y lockfile.

## Pruebas y CI

Las 37 pruebas cubren:

- ayuda del CLI y ausencia de `gridwork run`;
- instalacion local full-v1;
- idempotencia, reparacion y conflictos;
- flags invalidos;
- validacion de factory;
- instalacion remota verificada, cache y ZIP traversal;
- inventario completo, JSON parseable y referencias cruzadas;
- capacidades del backlog manager, pruebas de integracion y skills FastAPI;
- cobertura de todos los workflows en la guia practica instalada;
- instrucciones accionables de todos los skills;
- ausencia de carpetas de producto;
- template HTML autocontenido;
- dry-runs de release de factory y CLI;
- instalacion de un bundle producido por el propio release dry-run;
- bloqueo de placeholders, publish directo y prereleases no aprobadas.

`.github/workflows/ci.yml` corre en PRs y pushes a `main`/`develop` con Node 20:

```text
npm ci -> build -> test -> npm pack --dry-run
```

`.github/workflows/publish-cli.yml`:

- publica solo desde tags `cli-v*`;
- permite `workflow_dispatch` unicamente como dry-run;
- usa trusted publishing/OIDC;
- valida versiones minimas de Node/npm, tag, metadata, fuente oficial y ausencia de
  lifecycle scripts;
- construye, prueba, hace pack dry-run y luego publica con `latest` o `next`.

## Guia para cambios

### Cambiar comportamiento del CLI

1. editar `packages/cli/src/`;
2. actualizar o agregar pruebas en `packages/cli/test/`;
3. ejecutar `npm test`;
4. revisar que `npm run pack:cli:dry-run` incluya solo lo esperado.

### Agregar o cambiar un agente, workflow o skill

1. editar contrato Markdown y manifiesto JSON;
2. actualizar permisos y referencias cruzadas;
3. actualizar `factory.json`, catalogos y constantes de inventario;
4. revisar templates/politicas afectados;
5. ejecutar las pruebas completas.

### Cambiar el formato de release o init remoto

Mantener sincronizados:

- nombres de tags y assets;
- generador de factory release;
- verificador/instalador remoto;
- checksums y manifest;
- pruebas end-to-end de release e instalacion.

## Discrepancias y riesgos conocidos

1. `packages/cli/README.md` esta desactualizado: dice que el instalador real llegaria
   en fases posteriores, pero ya esta implementado.
2. El README raiz menciona `.docs/grill-me_factory/`, pero esa ruta no existe en el
   repositorio revisado.
3. `schemas/lockfile.schema.json` describe campos como `kind`, `schemaVersion`,
   `factorySource` y `installedAt`, mientras el lockfile real generado usa
   `lockfileVersion`, objetos `factory`, `installer`, `compatibility` y `resolution`.
4. La validacion de manifests comprueba existencia y JSON parseable, pero no aplica
   formalmente los JSON Schemas.
5. El init local sin version depende de la ruta de checkout `factory/.gridwork`.
   El paquete npm declara que publica solo `dist`, `README.md` y `package.json`, por
   lo que el uso publicado fiable es el init remoto con `--factory-version`.
6. `dist/` es necesario para ejecutar pruebas y publicar, pero esta ignorado y no
   rastreado; siempre debe regenerarse antes de probar o empaquetar.
7. Hay archivos instalables no registrados directamente por `factory.json`: los
   cuatro catalogos de `docs/`, el README del stack pack y ocho templates de release.
   Algunos se exigen por los inventarios del CLI, de modo que existen dos fuentes de
   inventario que deben mantenerse sincronizadas.
8. Los schemas permiten propiedades adicionales y la compatibilidad de version del
   CLI remoto solo entiende expresiones simples `>=x.y.z`.
9. El stack pack conserva el id historico `nextjs-springboot-postgresql`, aunque ahora
   tambien ofrece FastAPI como backend alternativo.

## Estado verificado

Revision ejecutada:

```text
npm test
tests = 37
pass = 37
fail = 0

npm run pack:cli:dry-run
package = gridwork@0.1.0
files = 32
result = pass
```

El worktree estaba limpio antes de crear este archivo.
