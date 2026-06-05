# GQ-029 - Idempotencia y actualizaciones de `npx gridwork init`

- Estado: accepted
- Fuente: decision GQ-028 sobre instalacion completa del paquete base
- Pregunta origen: GQ-029
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/`, `.factory/`, `.gitignore`

## Pregunta

Que debe pasar si el usuario ejecuta `npx gridwork init` en un repositorio donde ya existe `.gridwork/`?

## Por que importa

Como Gridwork permite cambios manuales despues de instalar la fabrica, `init` no debe sobrescribir sin cuidado archivos que el usuario haya editado.

Al mismo tiempo, debe ser posible ejecutar `init` mas de una vez para reparar archivos faltantes, actualizar templates base o completar una instalacion incompleta.

## Respuesta recomendada

`init` debe ser idempotente y conservador.

Regla base:

```text
Si falta un archivo base, init lo puede crear.
Si existe un archivo, init no lo sobrescribe sin aprobacion.
Si hay conflicto, init guarda la version candidata en `.factory/init/<init-run-id>/`.
```

## Comportamiento recomendado

Primera instalacion:

```text
crea .gridwork/
crea .factory/
actualiza .gitignore
instala paquete base completo
```

Segunda ejecucion:

```text
detecta .gridwork/
valida factory.json
verifica archivos faltantes
no sobrescribe cambios existentes
reporta diferencias
crea archivos faltantes si no hay conflicto
```

## Politica de sobrescritura

```text
overwrite_existing_files_by_default = false
create_missing_files = true
update_gitignore_idempotently = true
preserve_user_changes = true
conflict_strategy = save_candidates_in_factory
```

## Reporte de init

`init` debe generar un resumen en consola y, si hay conflictos, un reporte local:

```text
.factory/init/INIT-20260602-001/
  init-report.md
  conflicts.json
```

Como es runtime local, queda dentro de `.factory/`.

## Propuesta inicial

```text
init_idempotent = true
init_overwrite_existing_files_by_default = false
init_create_missing_files = true
init_preserve_user_changes = true
init_update_gitignore_idempotently = true
init_validate_factory_json = true
init_conflict_strategy = save_candidates_in_factory
init_conflict_report_path = .factory/init/<init-run-id>/
init_can_repair_missing_base_files = true
```

## Pregunta para decidir

La duda clave:

```text
Cuando hay conflicto entre un archivo existente y la version nueva de Gridwork,
prefieres que init cree archivos `.new` junto al original,
o que guarde todos los conflictos en `.factory/init/<init-run-id>/`?
```

Mi recomendacion: guardar conflictos en `.factory/init/<init-run-id>/` para no ensuciar `.gridwork/` con archivos `.new`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe ser idempotente.
- `init` no debe sobrescribir archivos existentes por defecto.
- `init` puede reparar archivos faltantes.
- Si hay conflicto, debe preservar el archivo existente.
- La version candidata nueva debe guardarse en `.factory/init/<init-run-id>/`.
- No se deben crear archivos `.new` dentro de `.gridwork/`.

## Decision registrada

```text
init_idempotent = true
init_overwrite_existing_files_by_default = false
init_create_missing_files = true
init_preserve_user_changes = true
init_update_gitignore_idempotently = true
init_validate_factory_json = true
init_conflict_strategy = save_candidates_in_factory
init_conflict_report_path = .factory/init/<init-run-id>/
init_conflicts_do_not_pollute_gridwork = true
init_can_repair_missing_base_files = true
```

## Regla

```text
.gridwork/ queda limpio y versionable.
.factory/init/ guarda reportes y candidatos de conflicto.
init repara faltantes, pero no pisa personalizaciones.
```

## Supuestos

- El usuario puede editar `.gridwork/` manualmente.
- `init` no tiene comandos extra como `update` en v1.
- `.factory/` es runtime local ignorado.
- No se deben perder cambios manuales.

## Riesgos

- Si `init` nunca actualiza archivos existentes, puede quedar una fabrica vieja.
- Si sobrescribe automaticamente, puede destruir personalizaciones.
- Si los conflictos quedan en `.factory/`, el usuario podria ignorarlos.
- Si los conflictos quedan como `.new` en `.gridwork/`, se ensucia el repo versionado.

## Artefactos a crear o actualizar

- `.gridwork/factory.json`
- `.factory/init/<init-run-id>/init-report.md`
- `.factory/init/<init-run-id>/conflicts.json`
- `.gitignore`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta protege la decision de permitir cambios manuales despues de instalar Gridwork.
- Mantiene `init` como unico comando de CLI v1, pero evita que sea destructivo.
- Decision del usuario: guardar conflictos en `.factory/init/<init-run-id>/`, sin archivos `.new` en `.gridwork/`.
