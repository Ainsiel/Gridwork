# GQ-085 - Roadmap MVP de implementacion de Gridwork

- Estado: accepted
- Fuente: decisiones GQ-001 a GQ-084
- Pregunta origen: GQ-085
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: roadmap de implementacion, backlog inicial, orden de construccion del monorepo Gridwork, CLI, fabrica `.gridwork`, release process

## Pregunta

En que orden debe implementarse Gridwork para llegar a un MVP usable sin intentar construir toda la fabrica completa de una vez?

La duda concreta:

```text
Que entregables deben existir primero para poder probar `npx gridwork init`
y empezar a usar la fabrica en un repo real?
```

## Por que importa

El grill-me ya definio muchos contratos:

- CLI TypeScript con `npx gridwork init`;
- monorepo;
- bundle de fabrica desde GitHub Releases;
- lockfile;
- cache local;
- agentes;
- workflows;
- skills;
- policies;
- trazabilidad;
- GitHub CLI gobernado;
- TDD y verifier;
- release publisher.

Si se implementa todo a la vez, el proyecto puede quedar enorme antes de tener una primera prueba real.

El MVP debe permitir validar el circuito central:

```text
repo nuevo -> npx gridwork init -> .gridwork instalada -> prompt del orquestador usable -> lockfile/reportes -> version reproducible
```

## Opciones

### Opcion A - MVP centrado en agentes/workflows primero

Primero construir todos los agentes, skills y workflows.

Ventajas:

- se ve rapido la fabrica conceptual;
- permite probar prompts sin CLI completa;
- util si el objetivo inicial es solo usar docs.

Desventajas:

- no valida `npx gridwork init`;
- puede acumular muchos contratos sin instalador real;
- release/versionado queda para despues;
- riesgo de que la fabrica sea dificil de distribuir.

### Opcion B - MVP centrado en CLI y distribucion primero

Primero construir:

- monorepo;
- CLI;
- bundle;
- release;
- init;
- lockfile;
- reportes.

Despues completar agentes/workflows/skills.

Ventajas:

- valida la promesa central de instalacion;
- permite probar Gridwork en repos reales;
- fuerza contratos concretos;
- reduce ambiguedad de releases, hashes y source.

Desventajas:

- al inicio la fabrica instalada puede ser basica;
- menos emocionante visualmente que construir todos los workflows;
- requiere resolver packaging antes de usar agentes sofisticados.

### Opcion C - MVP por rebanadas verticales

Construir una primera rebanada completa:

```text
CLI init minimo + factory bundle minimo + orchestrator prompt + 1 workflow + 1 skill + lockfile + reportes
```

Luego ampliar con nuevas rebanadas:

```text
release publisher -> update/repair -> stack pack -> backlog -> implementer/verifier
```

Ventajas:

- valida instalacion y uso real;
- evita sobredisenar;
- deja algo usable temprano;
- permite testear de extremo a extremo;
- cada incremento agrega valor observable.

Desventajas:

- requiere definir muy bien que entra y que queda fuera del primer corte;
- algunos docs/agentes avanzados quedaran incompletos temporalmente;
- exige disciplina para no meter todo en el MVP.

## Respuesta recomendada

Usar Opcion C:

```text
mvp_implementation_model = vertical_slices
```

El primer MVP debe construir una rebanada completa pero pequena:

```text
monorepo -> CLI init -> factory bundle minimo -> .gridwork instalada -> lockfile -> reportes -> orchestrator prompt
```

No intentar implementar todos los workflows completos en el primer incremento.

## Fase 0 - Preparacion del repo fuente

Objetivo:

```text
crear el esqueleto del monorepo Gridwork
```

Entregables:

- `package.json` root con npm workspaces;
- `packages/cli/package.json`;
- TypeScript configurado;
- estructura `factory/.gridwork/`;
- estructura `.github/workflows/ci.yml`;
- scripts basicos de build/test;
- README minimo de desarrollo.

Definition of Done:

- `npm ci` funciona;
- `npm run build` funciona;
- `npm test` o test placeholder realista funciona;
- root package es `private: true`;
- CLI package tiene bin `gridwork`.

## Fase 1 - Fabrica minima instalable

Objetivo:

```text
tener un `.gridwork/` minimo que pueda instalarse
```

Entregables minimos:

- `factory/.gridwork/README.md`;
- `factory/.gridwork/QUICKSTART.md`;
- `factory/.gridwork/factory.json`;
- `factoryProfile = minimal-mvp`;
- `factory/.gridwork/agents/orchestrator/PROMPT.md`;
- `factory/.gridwork/agents/orchestrator/AGENT.md`;
- `factory/.gridwork/workflows/intake-existing-code/WORKFLOW.md`;
- `factory/.gridwork/skills/handoff/SKILL.md`;
- `factory/.gridwork/policies/security-policy.md`;
- `factory/.gridwork/policies/github-cli-policy.md`;
- `factory/.gridwork/templates/init-report.md`;
- `factory/.gridwork/templates/source-resolution-report.md`;
- schemas minimos para factory/agent/workflow/skill.

Definition of Done:

- manifests parsean;
- no hay placeholders de secretos;
- orquestador puede activarse con prompt MD;
- quickstart apunta al prompt del orquestador;
- no genera codigo productivo.

## Fase 2 - CLI `init` local-first

Objetivo:

```text
probar instalacion sin depender aun de GitHub Release real
```

Implementar `gridwork init` con una fuente local interna de desarrollo o fixture de bundle, solo para tests internos.

Entregables:

- parser de comando `init`;
- preflight minimo;
- aplicacion de archivos `.gridwork/`;
- `.gitignore` para `.factory/`;
- `.gridwork-lock.json`;
- reportes en `.factory/init/<init-run-id>/`;
- no overwrite de archivos personalizados;
- tests de idempotencia.

Definition of Done:

- en un repo temporal, `gridwork init` instala `.gridwork/`;
- re-run no pisa archivos;
- lockfile se escribe;
- reportes se escriben;
- salida de consola es breve;
- tests cubren exito y conflicto basico.

## Fase 3 - Bundle, descarga y verificacion

Objetivo:

```text
cerrar el circuito de release verificable
```

Entregables:

- generador de bundle zip;
- `bundle-manifest.json`;
- `SHA256SUMS.txt`;
- verificacion de hash;
- extraccion segura;
- cache local verificada;
- source resolution desde GitHub Releases;
- token opcional;
- reportes download/cache/checksum.

Definition of Done:

- CLI descarga un release fixture o real;
- rechaza hash mismatch;
- rechaza paths prohibidos;
- puede usar cache verificada para version exacta;
- no imprime secretos;
- no actualiza lockfile si falla.

## Fase 4 - Release publisher y primer release de fabrica

Objetivo:

```text
publicar la primera version consumible de la fabrica
```

Entregables:

- skill `gridwork-release-publisher`;
- `factory-release-plan.md`;
- `factory-release-notes.md`;
- comandos `git tag` / `gh release create` preparados;
- bloqueo de placeholder `DEFAULT_FACTORY_SOURCE`;
- release `factory-v<version>` con assets;
- docs de release.

Definition of Done:

- release plan genera assets verificables;
- tag no se reutiliza;
- release contiene zip, manifest, checksums y notes;
- `npx gridwork init --factory-version <version>` puede instalarlo.

## Fase 5 - Publicacion npm de CLI

Objetivo:

```text
hacer disponible `npx gridwork init`
```

Entregables:

- package name verificado;
- workflow `publish-cli.yml`;
- release plan CLI;
- tag `cli-v<version>`;
- npm publish con provenance cuando este disponible;
- docs de instalacion.

Definition of Done:

- `npx gridwork init` funciona desde npm;
- package no incluye `factory/.gridwork/` ni `.docs/`;
- source oficial real no es placeholder;
- tests pasan antes de publish.

## Fase 6 - Ampliacion de fabrica v1

Objetivo:

```text
instalar el set v1 de agentes, workflows, skills y stack pack
```

Entregables:

- agentes base completos;
- workflows base completos;
- skills base completas;
- stack pack Next.js + Spring Boot + PostgreSQL como guidance;
- policies/path scopes;
- templates de work orders;
- labels GitHub JSON;
- templates de reports.

Definition of Done:

- orquestador puede activar workflows base;
- implementer/verifier tienen contratos TDD;
- backlog planning puede crear issue drafts;
- skills no elevan permisos;
- policies validan path scopes.

## Fuera del primer MVP

No incluir inicialmente:

- dashboard de metricas;
- plugins dinamicos;
- install de stack packs dinamicos;
- adapters automaticos para agentes;
- comando `gridwork run`;
- generacion de codigo productivo;
- deploy real;
- firmas externas;
- migraciones automaticas;
- canales beta/canary/nightly.

## Propuesta inicial

```text
mvp_implementation_model = vertical_slices
mvp_first_slice = init_installs_minimal_factory
mvp_factory_profile_initial = minimal-mvp
mvp_factory_profile_target = full-v1
mvp_phase_0 = source_repo_scaffold
mvp_phase_1 = minimal_factory_definition
mvp_phase_2 = local_first_init
mvp_phase_3 = bundle_download_verify_cache
mvp_phase_4 = factory_release_publisher
mvp_phase_5 = npm_cli_publish
mvp_phase_6 = full_factory_v1_expansion
mvp_excludes_gridwork_run = true
mvp_excludes_dynamic_plugins = true
mvp_excludes_product_code_generation = true
mvp_requires_e2e_init_test = true
mvp_requires_init_dod_acceptance_tests = true
mvp_requires_first_real_factory_release = true
mvp_requires_installed_quickstart = true
mvp_requires_installed_readme = true
mvp_backlog_generation_model = local_drafts_first
mvp_initial_backlog_path = .docs/grill-me_factory/backlog/
mvp_first_github_publish_batch = phase-0_and_phase-1_only
mvp_first_backlog_draft_batch = phase_map_all_phases_plus_detailed_phase_0_and_phase_1
mvp_implementation_start_strategy = review_then_implement_phase_0_locally
mvp_github_publish_before_phase_0 = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres implementar primero toda la fabrica conceptual,
o construir Gridwork por rebanadas verticales empezando por
`init` + fabrica minima instalable + lockfile/reportes?
```

Mi recomendacion: rebanadas verticales. Primero demostrar que se puede instalar una fabrica minima en un repo real; luego ampliar agentes, skills y workflows.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Gridwork debe implementarse por rebanadas verticales;
- el primer MVP debe demostrar `init` + fabrica minima instalable + lockfile/reportes;
- no se debe intentar construir todos los agentes, workflows y skills completos al inicio;
- el monorepo y la fabrica minima son la base del primer corte;
- la descarga/verificacion del bundle viene despues del `init` local-first;
- release publisher y npm publish vienen despues de validar instalacion;
- la expansion completa de agentes/workflows/skills queda para una fase posterior.

## Decision registrada

```text
mvp_implementation_model = vertical_slices
mvp_first_slice = init_installs_minimal_factory
mvp_factory_profile_initial = minimal-mvp
mvp_factory_profile_target = full-v1
mvp_phase_0 = source_repo_scaffold
mvp_phase_1 = minimal_factory_definition
mvp_phase_2 = local_first_init
mvp_phase_3 = bundle_download_verify_cache
mvp_phase_4 = factory_release_publisher
mvp_phase_5 = npm_cli_publish
mvp_phase_6 = full_factory_v1_expansion
mvp_excludes_gridwork_run = true
mvp_excludes_dynamic_plugins = true
mvp_excludes_product_code_generation = true
mvp_requires_e2e_init_test = true
mvp_requires_init_dod_acceptance_tests = true
mvp_requires_first_real_factory_release = true
mvp_requires_installed_quickstart = true
mvp_requires_installed_readme = true
mvp_backlog_generation_model = local_drafts_first
mvp_initial_backlog_path = .docs/grill-me_factory/backlog/
mvp_first_github_publish_batch = phase-0_and_phase-1_only
mvp_first_backlog_draft_batch = phase_map_all_phases_plus_detailed_phase_0_and_phase_1
mvp_implementation_start_strategy = review_then_implement_phase_0_locally
mvp_github_publish_before_phase_0 = false
```

## Regla

```text
Gridwork se implementa por rebanadas verticales.
El primer corte prueba instalacion real de una fabrica minima.
El primer corte no se acepta sin pruebas e2e de `init`.
No se construye toda la fabrica conceptual antes de tener `init` usable.
Release de fabrica ocurre antes de depender de npm publish como experiencia publica.
La expansion completa de agentes, skills y workflows ocurre despues del circuito de instalacion.
```

## Supuestos

- El objetivo principal del MVP es que `npx gridwork init` sea real.
- El usuario quiere poder usar Gridwork en repos nuevos.
- La fabrica completa v1 puede crecer despues de validar el circuito de instalacion.
- Los documentos del grill-me serviran para crear backlog e issues.

## Riesgos

- Intentar construir todos los agentes primero puede retrasar el primer uso real.
- Hacer solo CLI sin orquestador minimo no prueba el valor de fabrica.
- Publicar npm antes de validar release de fabrica puede dejar un CLI inutil.
- No definir fases puede generar issues demasiado grandes.

## Artefactos a crear o actualizar

- `docs/IMPLEMENTATION_ROADMAP.md`
- `docs/MVP_SCOPE.md`
- `.github/workflows/ci.yml`
- `packages/cli/`
- `factory/.gridwork/`
- `.gridwork/skills/gridwork-release-publisher/`
- `.gridwork/templates/`
- `.factory/runs/<run-id>/artifacts/backlog/`

## Evidencia y notas

- Esta pregunta convierte las decisiones del grill-me en una secuencia de implementacion.
- Complementa GQ-024 y GQ-049: el backlog debe salir como vertical slices.
- Complementa GQ-064: la CLI bootstrapper es el centro del primer MVP.
- Complementa GQ-084: cache y offline limitado pertenecen a la fase de descarga/verificacion, no al primer esqueleto.
- Decision del usuario: aceptar roadmap MVP por rebanadas verticales empezando por `init` + fabrica minima instalable.
- Revision posterior GQ-086: la rebanada de `init` requiere DoD e2e con new install, re-run, conflicto, fallo seguro, reportes, lockfile y seguridad.
- Revision posterior GQ-087: la fabrica minima instalable usa `factoryProfile = minimal-mvp`; la expansion de fase 6 apunta a `full-v1`.
- Revision posterior GQ-088: la fase 1 incluye `.gridwork/README.md` y `.gridwork/QUICKSTART.md` como onboarding minimo.
- Revision posterior GQ-089: el roadmap se convierte a backlog mediante drafts locales primero, con primer lote de publicacion GitHub recomendado para fase 0 y fase 1.
- Revision posterior GQ-090: el primer lote de drafts detalla fase 0 y fase 1, y deja fase 2 en adelante solo como mapa liviano.
- Revision posterior GQ-093: antes de implementar fase 0 se ejecuta review de readiness; GitHub publish se pospone hasta despues de fase 0.
