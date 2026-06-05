# GQ-074 - UX, errores y exit codes de `npx gridwork init`

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-030, GQ-064, GQ-066, GQ-068, GQ-069, GQ-070 y GQ-073
- Pregunta origen: GQ-074
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli/src/commands/init.ts`, reportes de `.factory/init/`, tests de CLI, docs de `init`

## Pregunta

Como debe comunicar `npx gridwork init` sus resultados, warnings, errores bloqueantes y exit codes?

## Por que importa

`init` ya tiene varias responsabilidades:

```text
resolver source -> descargar assets -> verificar hash -> validar compatibilidad -> aplicar archivos -> escribir lockfile -> reportar
```

Si la salida de consola y los exit codes no tienen contrato, sera dificil:

- probar la CLI;
- diagnosticar fallos;
- saber si un warning bloquea o no;
- usar `init` en CI;
- explicar al usuario que hacer despues.

La CLI debe ser sencilla, pero no silenciosa ni ambigua.

## Opciones

### Opcion A - Salida minima

`init` imprime muy poco:

```text
Gridwork installed.
```

Ventajas:

- simple;
- poco ruido;
- agradable cuando todo sale bien.

Desventajas:

- diagnostico pobre;
- no muestra reportes creados;
- no explica siguiente paso;
- dificil entender fallos.

### Opcion B - Salida detallada por defecto

`init` imprime cada paso, rutas, checks y archivos.

Ventajas:

- transparente;
- util para debugging;
- facil ver donde fallo.

Desventajas:

- mucho ruido;
- puede abrumar;
- aumenta riesgo de mostrar datos sensibles si se hace mal.

### Opcion C - Resumen humano + reportes detallados

`init` imprime un resumen corto y deja los detalles en `.factory/init/<init-run-id>/`.

Ventajas:

- buen balance;
- consola limpia;
- trazabilidad local;
- facil de testear;
- evita exponer datos innecesarios en pantalla;
- encaja con observabilidad file-based.

Desventajas:

- el usuario debe abrir reportes para ver detalles;
- requiere que los reportes esten bien estructurados.

## Respuesta recomendada

Usar Opcion C:

```text
console = resumen humano corto
reports = detalle completo en .factory/init/<init-run-id>/
exit_codes = estables y documentados
```

La consola debe decir que paso, donde estan los reportes y cual es el siguiente paso.

## Salida exitosa recomendada

Ejemplo:

```text
Gridwork installed.

Factory version: 1.0.0
Source: owner/repo@factory-v1.0.0
Definition folder: .gridwork/
Runtime folder: .factory/
Lockfile: .gridwork-lock.json
Reports: .factory/init/20260604-120000-init/
Quickstart: .gridwork/QUICKSTART.md

Next step:
Tell your agent: "Lee .gridwork/agents/orchestrator/PROMPT.md y actua como el orquestador de Gridwork."
```

Si hubo warnings no bloqueantes:

```text
Gridwork installed with warnings.

Warnings: 2
Report: .factory/init/20260604-120000-init/init-report.md
```

## Salida de error recomendada

Ejemplo:

```text
Gridwork init failed.

Reason: bundle hash mismatch
Exit code: 5
Report: .factory/init/20260604-120000-init/validation-report.md

No files were applied.
Lockfile was not updated.
```

La salida de error debe evitar imprimir tokens, headers, secretos o contenido completo de archivos.

## Reportes locales

Cada ejecucion de `init` debe dejar:

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

Segun el caso, tambien:

```text
conflicts.md
conflicts.json
candidates/
update-report.md
```

## Exit codes

Recomendacion de v1:

```text
0 = success
1 = general_failure
2 = usage_error
3 = preflight_blocked
4 = source_resolution_or_download_failed
5 = bundle_verification_failed
6 = validation_failed
7 = compatibility_failed
8 = file_conflict_blocked
9 = filesystem_apply_failed
10 = unsupported_runtime
```

## Warnings vs errores bloqueantes

Warnings no bloqueantes:

- Git no inicializado;
- no hay remote GitHub;
- no existe branch `develop`;
- `gh` no instalado;
- repo sin issues configuradas;
- layout del proyecto destino no detectado;
- `.factory/` ya existe.

Errores bloqueantes:

- no se puede escribir en el directorio actual;
- version de Node no soportada;
- source no resuelve;
- GitHub rate limit o auth failure al resolver/descargar source;
- asset faltante;
- hash no coincide;
- `bundle-manifest.json` invalido;
- `SHA256SUMS.txt` invalido;
- bundle contiene paths prohibidos;
- bundle incompatible con CLI/schema/contracts;
- `.gridwork/` existente tiene conflicto bloqueante;
- lockfile no se puede escribir despues de aplicar correctamente.

## Flags de salida

V1 puede soportar:

```text
--verbose
```

`--verbose` imprime mas pasos, pero nunca secretos.

No recomendar en v1:

```text
--json
--silent
--force
```

Razon:

- los reportes JSON ya viven en `.factory/init/`;
- `--silent` puede ocultar fallos importantes;
- `--force` contradice idempotencia segura y estrategia de conflictos.

## Idempotencia y mensajes

Si `init` se ejecuta de nuevo y no hay cambios:

```text
Gridwork already installed.

Factory version: 1.0.0
Action: repaired/validated locked version
Reports: .factory/init/<init-run-id>/
```

Si crea archivos faltantes:

```text
Gridwork repaired.

Created missing files: 3
Lockfile: unchanged
Reports: .factory/init/<init-run-id>/
```

Si hay conflictos:

```text
Gridwork init stopped due to conflicts.

Conflicts: 4
Candidates: .factory/init/<init-run-id>/candidates/
Report: .factory/init/<init-run-id>/conflicts.md

No conflicting files were overwritten.
```

## Tests de CLI

Los tests deben verificar:

- exit code correcto;
- resumen de consola;
- reportes generados;
- lockfile escrito solo cuando corresponde;
- no overwrite de conflictos;
- no secretos en salida;
- warnings no bloquean;
- errores bloqueantes no aplican archivos.
- e2e en repo temporal para new install, re-run, conflicto y fallo seguro.

## Propuesta inicial

```text
init_console_output_model = short_human_summary
init_reports_model = detailed_local_reports
init_reports_path = .factory/init/<init-run-id>/
init_exit_codes_stable = true
init_exit_code_success = 0
init_exit_code_general_failure = 1
init_exit_code_usage_error = 2
init_exit_code_preflight_blocked = 3
init_exit_code_source_or_download_failed = 4
init_exit_code_bundle_verification_failed = 5
init_exit_code_validation_failed = 6
init_exit_code_compatibility_failed = 7
init_exit_code_file_conflict_blocked = 8
init_exit_code_filesystem_apply_failed = 9
init_exit_code_unsupported_runtime = 10
init_verbose_flag_allowed = true
init_json_flag_v1 = false
init_silent_flag_v1 = false
init_force_flag_v1 = false
init_errors_print_report_path = true
init_errors_do_not_print_secrets = true
init_source_auth_errors_are_redacted = true
init_rate_limit_errors_write_report = true
init_download_report_enabled = true
init_cache_report_enabled = true
init_warnings_do_not_block_by_default = true
init_success_output_points_to_quickstart = true
init_success_output_points_to_orchestrator_prompt = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `init` imprima mucho detalle en consola,
o que imprima un resumen corto y deje el detalle en reportes locales?
```

Mi recomendacion: resumen corto en consola, reportes completos en `.factory/init/<init-run-id>/`, exit codes estables y `--verbose` como unico flag extra de salida en v1.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe imprimir un resumen corto en consola;
- los detalles deben quedar en reportes locales dentro de `.factory/init/<init-run-id>/`;
- los exit codes deben ser estables y documentados;
- `--verbose` sera el unico flag extra de salida en v1;
- v1 no tendra `--json`, `--silent` ni `--force`;
- los errores deben imprimir el path del reporte;
- la salida no debe imprimir secretos;
- warnings no bloqueantes no deben impedir la instalacion.

## Decision registrada

```text
init_console_output_model = short_human_summary
init_reports_model = detailed_local_reports
init_reports_path = .factory/init/<init-run-id>/
init_exit_codes_stable = true
init_exit_code_success = 0
init_exit_code_general_failure = 1
init_exit_code_usage_error = 2
init_exit_code_preflight_blocked = 3
init_exit_code_source_or_download_failed = 4
init_exit_code_bundle_verification_failed = 5
init_exit_code_validation_failed = 6
init_exit_code_compatibility_failed = 7
init_exit_code_file_conflict_blocked = 8
init_exit_code_filesystem_apply_failed = 9
init_exit_code_unsupported_runtime = 10
init_verbose_flag_allowed = true
init_json_flag_v1 = false
init_silent_flag_v1 = false
init_force_flag_v1 = false
init_errors_print_report_path = true
init_errors_do_not_print_secrets = true
init_source_auth_errors_are_redacted = true
init_rate_limit_errors_write_report = true
init_download_report_enabled = true
init_cache_report_enabled = true
init_warnings_do_not_block_by_default = true
init_success_output_points_to_quickstart = true
init_success_output_points_to_orchestrator_prompt = true
```

## Regla

```text
La consola resume.
`.factory/init/<init-run-id>/` explica.
Los exit codes son contrato.
`--verbose` existe para diagnostico.
V1 no tiene `--json`, `--silent` ni `--force`.
Errores bloqueantes no aplican archivos ni actualizan lockfile.
Errores de auth/rate limit se reportan sin tokens ni headers sensibles.
Download y cache dejan reportes locales.
```

## Supuestos

- El usuario quiere una CLI simple.
- La trazabilidad detallada vive en archivos locales.
- La CLI debe poder testearse en CI.
- No se debe imprimir informacion sensible.
- V1 prioriza instalacion segura sobre velocidad aparente.

## Riesgos

- Poca salida sin buenos reportes puede dificultar debugging.
- Mucha salida puede abrumar y filtrar datos.
- Exit codes demasiado granulares pueden ser dificiles de mantener.
- `--force` puede romper el contrato de no sobrescribir personalizaciones.

## Artefactos a crear o actualizar

- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/init-report.ts`
- `packages/cli/src/init/errors.ts`
- `packages/cli/src/init/exit-codes.ts`
- `packages/cli/src/init/console-output.ts`
- `packages/cli/tests/init-output.test.ts`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta convierte `init` en una experiencia auditable y testeable.
- Complementa GQ-030: preflight checks.
- Complementa GQ-066: reparacion/update explicito.
- Complementa GQ-068, GQ-069 y GQ-070: verification, source resolution y compatibility deben tener salida clara.
- Decision del usuario: aceptar consola breve, reportes detallados, exit codes estables y `--verbose` como unico flag extra de salida v1.
- Revision posterior GQ-083: fallos de GitHub auth/rate limit usan exit code de source/download, escriben reporte y no imprimen secretos.
- Revision posterior GQ-084: `init` debe generar `download-report` y `cache-report`; cache/offline limitado no cambia los exit codes base.
- Revision posterior GQ-086: salida, reportes y exit codes de `init` deben verificarse en acceptance tests e2e.
- Revision posterior GQ-088: la salida exitosa de `init` debe apuntar a `.gridwork/QUICKSTART.md` y al prompt del orquestador.
