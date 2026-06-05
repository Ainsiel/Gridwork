# GQ-086 - Definition of Done y pruebas de aceptacion de `npx gridwork init`

- Estado: accepted
- Fuente: decisiones GQ-028, GQ-029, GQ-030, GQ-064, GQ-068, GQ-069, GQ-074, GQ-075, GQ-076, GQ-077, GQ-083, GQ-084 y GQ-085
- Pregunta origen: GQ-086
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: CLI `gridwork init`, tests de CLI, CI, fixture de fabrica, reportes `.factory/init/`, lockfile, release bundle

## Pregunta

Que debe cumplir `npx gridwork init` para considerar listo el MVP?

La duda concreta:

```text
Que pruebas y criterios de aceptacion deben pasar antes de decir
que la primera rebanada de Gridwork esta realmente usable?
```

## Por que importa

GQ-085 decidio que el MVP se construye por rebanadas verticales, empezando por:

```text
init + fabrica minima instalable + lockfile + reportes
```

Ahora falta definir como sabremos que esa primera rebanada esta terminada.

Sin una Definition of Done, se puede llamar "listo" a un `init` que:

- instala archivos pero no valida hashes;
- crea `.gridwork/` pero no lockfile;
- pisa personalizaciones;
- no deja reportes;
- imprime secretos;
- falla si se ejecuta dos veces;
- no se puede probar en CI.

## Opciones

### Opcion A - DoD minimo manual

Considerar listo cuando:

```bash
gridwork init
```

funciona manualmente una vez en el repo local.

Ventajas:

- rapido;
- simple;
- permite avanzar pronto.

Desventajas:

- no protege idempotencia;
- no prueba conflictos;
- no prueba errores;
- no da confianza para publicar npm;
- demasiado debil para un instalador.

### Opcion B - DoD unitario + smoke test

Exigir:

- unit tests de funciones principales;
- un smoke test de `gridwork init`;
- build TypeScript;
- npm pack dry-run.

Ventajas:

- balance inicial razonable;
- cubre errores obvios;
- mas simple que un e2e completo.

Desventajas:

- puede no probar instalacion real en repo temporal;
- puede no detectar errores de paths;
- puede no validar re-run/conflictos/reportes.

### Opcion C - DoD e2e por rebanada vertical

Exigir que la primera rebanada pase pruebas end-to-end en repos temporales:

```text
repo vacio -> init -> .gridwork -> lockfile -> reportes -> re-run -> conflicto -> fallo seguro
```

Ventajas:

- valida la experiencia real;
- protege idempotencia;
- verifica reportes y lockfile;
- encaja con el roadmap por rebanadas;
- da confianza para release.

Desventajas:

- requiere mas trabajo de tests;
- puede necesitar fixtures;
- exige cuidar determinismo de paths y fechas.

## Respuesta recomendada

Usar Opcion C:

```text
init_mvp_dod_model = e2e_vertical_slice_acceptance
```

El MVP no esta listo hasta que `gridwork init` pase pruebas de aceptacion en repos temporales y cubra exito, re-run, conflicto y fallo seguro.

## Criterios de aceptacion MVP

### 1. Instalacion nueva

Dado un directorio temporal vacio con Git opcional:

```bash
gridwork init
```

Debe:

- crear `.gridwork/`;
- crear `.factory/`;
- crear `.gridwork-lock.json`;
- actualizar `.gitignore` para ignorar `.factory/`;
- instalar `.gridwork/README.md`;
- instalar `.gridwork/QUICKSTART.md`;
- instalar `factory.json`;
- declarar `factoryProfile = minimal-mvp` en el primer MVP;
- instalar `agents/orchestrator/PROMPT.md`;
- instalar contratos minimos de agente/workflow/skill;
- escribir reportes en `.factory/init/<init-run-id>/`;
- imprimir resumen corto;
- imprimir el path del quickstart y del prompt del orquestador;
- no generar frontend/backend/database/docker;
- salir con exit code `0`.

### 2. Re-run idempotente

Dado un repo donde Gridwork ya fue instalado:

```bash
gridwork init
```

Debe:

- no duplicar entradas en `.gitignore`;
- no sobrescribir archivos sin necesidad;
- mantener version del lockfile;
- crear nuevo reporte de run;
- indicar que valido/reparo version bloqueada;
- salir con exit code `0`.

### 3. Conflicto seguro

Dado un archivo de `.gridwork/` modificado manualmente:

```bash
gridwork init --factory-version <version>
```

Debe:

- no sobrescribir el archivo modificado;
- escribir candidatos en `.factory/init/<init-run-id>/candidates/`;
- escribir `conflicts.md` y `conflicts.json`;
- no actualizar lockfile si el update queda incompleto;
- salir con exit code `8` si el conflicto bloquea.

### 4. Bundle invalido

Dado un bundle con hash incorrecto o path prohibido:

```bash
gridwork init --factory-version <version>
```

Debe:

- bloquear instalacion;
- no aplicar archivos;
- no actualizar lockfile;
- escribir `checksum-report` o `validation-report`;
- salir con exit code `5` o `6` segun corresponda.

### 5. Compatibilidad

Dado un bundle con `required_cli_version` incompatible:

Debe:

- bloquear instalacion;
- escribir `compatibility-report.md`;
- no aplicar archivos;
- no actualizar lockfile;
- salir con exit code `7`.

### 6. Reportes

Cada run de `init` debe escribir, segun aplique:

```text
.factory/init/<init-run-id>/
  init-report.md
  preflight.json
  source-resolution.md
  source-resolution.json
  download-report.md
  download-report.json
  cache-report.md
  cache-report.json
  checksum-report.json
  validation-report.md
  validation.json
  compatibility-report.md
  compatibility.json
  lockfile-report.md
```

Reportes opcionales por caso:

```text
conflicts.md
conflicts.json
candidates/
update-report.md
```

### 7. Seguridad

Tests deben verificar:

- no se imprimen tokens;
- no se escriben `GITHUB_TOKEN` ni `GH_TOKEN`;
- no se escriben headers `Authorization`;
- no se instalan paths fuera de `.gridwork/`;
- `.factory/` no entra en el bundle;
- npm package no incluye `.factory/`, `.docs/` ni `factory/.gridwork/`.

### 8. Source y red

Debe probarse:

- source oficial embebido no es placeholder para release;
- `--source owner/repo --factory-version` requiere version;
- prerelease sin `--allow-prerelease` bloquea;
- rate limit/auth failure escribe reporte sin secretos;
- cache no decide `latest`;
- cache puede instalar/reparar version exacta si hash coincide.

## Tipos de tests

### Unit tests

Cubren:

- parser de flags;
- resolve-source;
- semver/prerelease;
- lockfile;
- hash/checksum;
- path safety;
- redaction;
- conflict detection;
- cache key.

### Integration tests

Cubren:

- apply files en directorio temporal;
- `.gitignore`;
- report writers;
- manifest validation;
- package contents via pack dry-run.

### E2E tests

Cubren:

- `gridwork init` en repo temporal;
- re-run;
- conflicto;
- bundle invalido;
- cache exact version;
- compatibility failure.

## CI minimo para aceptar MVP

El PR del MVP debe pasar:

```text
npm ci
npm run build
npm test
npm pack -w packages/cli --dry-run
```

Ademas debe ejecutar:

```text
e2e:init:new-install
e2e:init:rerun-idempotent
e2e:init:conflict-safe
e2e:init:invalid-bundle-blocked
```

## Propuesta inicial

```text
init_mvp_dod_model = e2e_vertical_slice_acceptance
init_mvp_requires_new_install_e2e = true
init_mvp_requires_rerun_idempotent_e2e = true
init_mvp_requires_conflict_safe_e2e = true
init_mvp_requires_invalid_bundle_e2e = true
init_mvp_requires_compatibility_failure_test = true
init_mvp_requires_reports_assertions = true
init_mvp_requires_lockfile_assertions = true
init_mvp_requires_minimal_inventory_assertions = true
init_mvp_requires_installed_readme_assertion = true
init_mvp_requires_installed_quickstart_assertion = true
init_mvp_requires_next_step_output_assertion = true
init_mvp_requires_no_secret_output_tests = true
init_mvp_requires_npm_pack_dry_run = true
init_mvp_requires_package_contents_check = true
init_mvp_requires_cache_exact_version_test = true
init_mvp_requires_prerelease_gate_test = true
init_mvp_requires_source_override_test = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres considerar listo el MVP con tests unitarios y smoke test,
o exigir pruebas e2e de la rebanada completa de `init`
en repos temporales?
```

Mi recomendacion: exigir pruebas e2e de la rebanada completa. Si `init` es la promesa central de Gridwork, debe probarse como usuario real: repo nuevo, re-run, conflicto, fallo seguro y reportes.

## Respuesta del usuario

El usuario acepta la recomendacion:

- el MVP de `init` requiere pruebas e2e de la rebanada completa;
- no basta con unit tests o smoke test manual;
- deben probarse instalacion nueva, re-run idempotente, conflicto seguro y fallo seguro;
- deben validarse reportes, lockfile y salida de consola;
- deben existir pruebas de seguridad para evitar secretos en output/reportes;
- deben existir pruebas de package contents y `npm pack --dry-run`;
- deben probarse prerelease gate, source override y cache para version exacta.

## Decision registrada

```text
init_mvp_dod_model = e2e_vertical_slice_acceptance
init_mvp_requires_new_install_e2e = true
init_mvp_requires_rerun_idempotent_e2e = true
init_mvp_requires_conflict_safe_e2e = true
init_mvp_requires_invalid_bundle_e2e = true
init_mvp_requires_compatibility_failure_test = true
init_mvp_requires_reports_assertions = true
init_mvp_requires_lockfile_assertions = true
init_mvp_requires_minimal_inventory_assertions = true
init_mvp_requires_installed_readme_assertion = true
init_mvp_requires_installed_quickstart_assertion = true
init_mvp_requires_next_step_output_assertion = true
init_mvp_requires_no_secret_output_tests = true
init_mvp_requires_npm_pack_dry_run = true
init_mvp_requires_package_contents_check = true
init_mvp_requires_cache_exact_version_test = true
init_mvp_requires_prerelease_gate_test = true
init_mvp_requires_source_override_test = true
```

## Regla

```text
El MVP de `init` no esta listo solo porque funcione manualmente.
Debe pasar e2e en repos temporales.
Debe probar new install, re-run, conflicto, fallo seguro, reportes y lockfile.
Debe probar que no imprime ni escribe secretos.
Debe probar package contents con `npm pack --dry-run`.
```

## Supuestos

- El primer MVP se enfoca en `init`.
- La CLI se puede probar en directorios temporales.
- Algunos tests pueden usar fixtures locales antes del primer release real.
- No se necesita publicar npm para validar la primera rebanada local.

## Riesgos

- Sin e2e, se puede publicar una CLI que funciona solo en casos ideales.
- Tests demasiado fragiles pueden frenar iteracion.
- Si los reportes no se testean, pueden romperse silenciosamente.
- Si npm pack no se revisa, el paquete puede incluir archivos indebidos.

## Artefactos a crear o actualizar

- `packages/cli/tests/init.e2e.test.ts`
- `packages/cli/tests/init-output.test.ts`
- `packages/cli/tests/lockfile.test.ts`
- `packages/cli/tests/cache.test.ts`
- `packages/cli/tests/fixtures/`
- `docs/MVP_ACCEPTANCE.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `.github/workflows/ci.yml`

## Evidencia y notas

- Esta pregunta concreta como validar la primera rebanada definida en GQ-085.
- Complementa GQ-074: exit codes y reportes deben ser contrato testeable.
- Complementa GQ-076: conflictos no deben sobrescribir personalizaciones.
- Complementa GQ-084: cache es una optimizacion verificable, no fuente de verdad.
- Decision del usuario: aceptar DoD e2e para la rebanada completa de `init` MVP.
- Revision posterior GQ-087: los e2e del primer MVP deben assertar inventario `minimal-mvp` y `factoryProfile`.
- Revision posterior GQ-088: los e2e deben assertar `.gridwork/README.md`, `.gridwork/QUICKSTART.md` y salida de siguiente paso.
