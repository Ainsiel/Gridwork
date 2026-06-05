# GQ-066 - Actualizacion de fabrica instalada con `init`

- Estado: accepted
- Fuente: decisiones GQ-003, GQ-029, GQ-030, GQ-062, GQ-064 y GQ-065
- Pregunta origen: GQ-066
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, `.gridwork/`, `.gridwork-lock.json`, `.factory/init/<init-run-id>/`, release/tag de fabrica

## Pregunta

Como debe comportarse `npx gridwork init` cuando se ejecuta en un repositorio donde ya existe una fabrica Gridwork instalada y hay una nueva version disponible en un release/tag?

## Por que importa

GQ-064 decidio que `init` descarga la fabrica desde releases/tags versionados. GQ-029 ya habia decidido que `init` es idempotente y no sobrescribe personalizaciones.

Ahora hay que unir ambas reglas:

```text
lockfile existente + nuevo release disponible + cambios manuales en .gridwork/
```

Si `init` actualiza automaticamente, puede pisar personalizaciones. Si nunca actualiza, cada repo queda congelado para siempre.

## Respuesta recomendada

Usar un modelo conservador:

```text
init default = reparar version bloqueada por lockfile
init explicit version = preparar actualizacion
no sobrescribir archivos existentes por defecto
conflictos en .factory/init/<init-run-id>/
lockfile se actualiza solo si la actualizacion queda aplicada de forma segura
```

Esto mantiene `init` como unico comando, pero permite updates con flags explicitos.

## Modos recomendados

### 1. Primera instalacion

Si no existe `.gridwork-lock.json`:

```bash
npx gridwork init
```

Instala el ultimo release estable permitido por default o la version indicada por el usuario.

Output:

```text
.gridwork/
.gridwork-lock.json
.factory/init/<init-run-id>/
```

### 2. Re-run sin version explicita

Si existe `.gridwork-lock.json`:

```bash
npx gridwork init
```

Debe usar la version registrada en el lockfile.

Objetivo:

- reparar archivos faltantes;
- reparar archivos faltantes usando cache verificada si esta disponible;
- validar estructura;
- actualizar `.gitignore`;
- no cambiar version de fabrica;
- no descargar `latest` automaticamente;
- no usar cache para decidir `latest`;
- no sobrescribir cambios manuales.

### 3. Check de nuevas versiones

Opcion permitida:

```bash
npx gridwork init --check-updates
```

Debe ser read-only respecto de `.gridwork/`:

- lee lockfile;
- consulta releases disponibles;
- reporta version instalada y version disponible;
- no modifica `.gridwork/`;
- puede escribir reporte en `.factory/init/<init-run-id>/`.

### 4. Actualizacion explicita

Para actualizar:

```bash
npx gridwork init --factory-version 1.1.0
```

Para actualizar a un prerelease:

```bash
npx gridwork init --factory-version 1.1.0-beta.1 --allow-prerelease
```

Tambien podria existir:

```bash
npx gridwork init --latest
```

Pero la recomendacion es preferir `--factory-version <version>` para que la actualizacion sea deterministicamente auditable.

## Politica de conflictos

Si un archivo existe y difiere de la version nueva:

```text
no sobrescribir
guardar candidato en .factory/init/<init-run-id>/candidates/
registrar conflicto en conflicts.json y conflicts.md
mantener lockfile apuntando a la version anterior si el update queda incompleto
```

Si un archivo falta:

```text
crear archivo faltante si no hay conflicto
```

Si un archivo nuevo existe en la version nueva y no existe localmente:

```text
crear archivo nuevo
```

## Lockfile

`.gridwork-lock.json` debe actualizarse solo cuando:

- bundle descargado;
- hash verificado;
- validacion minima pasa;
- no hay conflictos bloqueantes;
- archivos aplicados correctamente.

Si hay conflictos bloqueantes:

```text
lockfile_update = false
update_status = pending_conflict_resolution
```

## Reportes

Cada update debe escribir:

```text
.factory/init/<init-run-id>/
  init-report.md
  preflight.json
  validation-report.md
  validation.json
  update-report.md
  conflicts.md
  conflicts.json
  lockfile-report.md
  candidates/
```

## Propuesta inicial

```text
init_default_uses_existing_lockfile_version = true
init_default_checks_latest = false
init_default_updates_to_latest = false
init_can_check_updates = true
init_check_updates_is_read_only = true
init_can_update_with_factory_version_flag = true
init_prerelease_update_requires_exact_factory_version = true
init_prerelease_update_requires_allow_flag = true
init_update_channel_flag_v1 = false
init_cache_can_repair_locked_version = true
init_cache_can_resolve_latest = false
init_offline_repair_with_verified_cache_v1 = true
init_latest_flag_allowed = true
init_prefer_explicit_factory_version = true
init_update_overwrite_existing_files_by_default = false
init_update_conflict_strategy = save_candidates_in_factory
init_updates_lockfile_only_after_success = true
init_update_incomplete_keeps_previous_lockfile = true
init_update_report_path = .factory/init/<init-run-id>/
```

## Pregunta para decidir

La duda clave:

```text
Cuando ya existe `.gridwork-lock.json`, quieres que `npx gridwork init`
actualice automaticamente a la ultima version disponible,
o que repare la version instalada y solo actualice si pasas una version explicita?
```

Mi recomendacion: no actualizar automaticamente. Por defecto debe reparar la version del lockfile. Para actualizar, usar `npx gridwork init --factory-version <version>`, guardando candidatos de conflicto en `.factory/`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `npx gridwork init` no debe actualizar automaticamente a la ultima version.
- Si ya existe `.gridwork-lock.json`, `init` debe reparar la version instalada.
- Para actualizar, el usuario debe pasar una version explicita con `--factory-version <version>`.
- Los conflictos deben guardarse en `.factory/init/<init-run-id>/`.
- El lockfile solo se actualiza cuando la actualizacion se aplica correctamente.

## Decision registrada

```text
init_default_uses_existing_lockfile_version = true
init_default_checks_latest = false
init_default_updates_to_latest = false
init_can_check_updates = true
init_check_updates_is_read_only = true
init_can_update_with_factory_version_flag = true
init_prerelease_update_requires_exact_factory_version = true
init_prerelease_update_requires_allow_flag = true
init_update_channel_flag_v1 = false
init_cache_can_repair_locked_version = true
init_cache_can_resolve_latest = false
init_offline_repair_with_verified_cache_v1 = true
init_latest_flag_allowed = true
init_prefer_explicit_factory_version = true
init_update_overwrite_existing_files_by_default = false
init_update_conflict_strategy = save_candidates_in_factory
init_updates_lockfile_only_after_success = true
init_update_incomplete_keeps_previous_lockfile = true
init_update_report_path = .factory/init/<init-run-id>/
```

## Regla

```text
`init` sin version repara.
`init --factory-version` actualiza.
`init --factory-version <prerelease> --allow-prerelease` actualiza a prerelease.
`init` no usa canales automaticos en v1.
`init` puede reparar la version bloqueada usando cache verificada.
`init` no usa cache para decidir `latest`.
`init` no pisa personalizaciones.
El lockfile cambia solo despues de un update exitoso.
Los conflictos viven en `.factory/init/`.
```

## Supuestos

- La fabrica puede ser modificada manualmente despues de instalar.
- `.gridwork/` es versionado.
- `.factory/` guarda reportes de runtime local.
- La CLI v1 solo tiene comando `init`, pero puede aceptar flags.
- Los releases de fabrica son versionados y tienen hash.

## Riesgos

- Auto-update puede romper repos con personalizaciones.
- No auto-update puede hacer que el usuario olvide actualizar.
- `--latest` puede ser menos auditable que una version explicita.
- Si el lockfile cambia antes de aplicar archivos, se puede registrar una version que no esta realmente instalada.

## Artefactos a crear o actualizar

- `src/init/lockfile.ts`
- `src/init/update.ts`
- `src/init/conflict-report.ts`
- `src/init/init-report.ts`
- `.gridwork-lock.json`
- `.factory/init/<init-run-id>/update-report.md`
- `.factory/init/<init-run-id>/conflicts.json`
- `.factory/init/<init-run-id>/candidates/`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta complementa GQ-029: idempotencia local.
- Tambien complementa GQ-064: instalacion desde release/tag con lockfile.
- La recomendacion evita que `init` se vuelva destructivo cuando hay nuevas versiones de la fabrica.
- Decision del usuario: aceptar actualizacion explicita por version, sin auto-update.
- Revision posterior GQ-082: updates a prerelease requieren version exacta y `--allow-prerelease`; no hay canales automaticos en v1.
- Revision posterior GQ-084: `init` puede reparar con cache local verificada, pero cache no decide updates ni `latest`.
