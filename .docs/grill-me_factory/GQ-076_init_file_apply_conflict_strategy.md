# GQ-076 - Aplicacion de archivos y conflictos de `init`

- Estado: accepted
- Fuente: decisiones GQ-029, GQ-064, GQ-066, GQ-068, GQ-074 y GQ-075
- Pregunta origen: GQ-076
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork-lock.json`, `packages/cli/src/init/apply-files.ts`, `packages/cli/src/init/conflict-report.ts`, `.factory/init/<init-run-id>/candidates/`

## Pregunta

Como debe aplicar `init` los archivos extraidos desde staging hacia `.gridwork/` sin sobrescribir personalizaciones del usuario?

## Por que importa

GQ-029 y GQ-066 ya decidieron:

```text
init no sobrescribe personalizaciones
init puede reparar archivos faltantes
conflictos van a .factory/init/<init-run-id>/
lockfile solo cambia despues de exito
```

GQ-075 agrego staging:

```text
zip -> staging/.gridwork/ -> validar -> aplicar
```

Pero falta el mecanismo exacto para decidir:

- que archivo se puede crear;
- que archivo se puede actualizar;
- que archivo debe bloquearse como conflicto;
- como saber si el usuario modifico un archivo instalado antes;
- como dejar trazabilidad de esa decision.

## Opciones

### Opcion A - Nunca sobrescribir archivos existentes

Si un archivo existe en `.gridwork/`, `init` nunca lo cambia.

Ventajas:

- muy seguro;
- simple;
- imposible pisar personalizaciones.

Desventajas:

- updates de fabrica casi nunca se aplican completo;
- bugfixes de templates, policies o agents no llegan si el archivo ya existe;
- demasiados conflictos/candidates;
- dificulta reparar instalaciones antiguas.

### Opcion B - Sobrescribir todo despues de validar bundle

Si el bundle verifica, `init` reemplaza `.gridwork/`.

Ventajas:

- simple;
- deja la fabrica exactamente igual al release;
- updates son faciles.

Desventajas:

- destruye personalizaciones;
- contradice GQ-029 y GQ-066;
- riesgoso para una fabrica personal;
- reduce confianza en `init`.

### Opcion C - Hashes de archivos instalados

`init` guarda en `.gridwork-lock.json` un inventario de archivos instalados con hash.

Al aplicar un nuevo bundle:

```text
archivo no existe -> crear
archivo existe y hash actual == hash instalado anterior -> actualizar
archivo existe y hash actual != hash instalado anterior -> conflicto
archivo existe y no esta en lockfile -> conflicto conservador
```

Ventajas:

- protege personalizaciones;
- permite updates automaticos de archivos no modificados;
- repara faltantes;
- deja trazabilidad fuerte;
- encaja con lockfile y releases versionados.

Desventajas:

- lockfile crece;
- requiere calcular hashes por archivo;
- si el lockfile se pierde, `init` debe ser mas conservador;
- necesita reportes claros.

## Respuesta recomendada

Usar Opcion C:

```text
file_apply_strategy = installed_file_hash_manifest
```

La CLI debe guardar hashes de los archivos aplicados. Eso permite actualizar de forma segura los archivos que siguen iguales desde la instalacion anterior y proteger los que fueron modificados manualmente.

## Lockfile con inventario

`.gridwork-lock.json` debe incluir un inventario de archivos instalados:

```json
{
  "factory": {
    "version": "1.0.0",
    "tag": "factory-v1.0.0",
    "sha256": "sha256:<bundle-hash>"
  },
  "files": [
    {
      "path": ".gridwork/factory.json",
      "sha256": "sha256:<file-hash>",
      "source": "gridwork-factory-v1.0.0.zip"
    },
    {
      "path": ".gridwork/agents/orchestrator/PROMPT.md",
      "sha256": "sha256:<file-hash>",
      "source": "gridwork-factory-v1.0.0.zip"
    }
  ]
}
```

El lockfile no debe registrar `.factory/`, logs, caches ni archivos del proyecto destino.

## Reglas de aplicacion

### Primera instalacion

Si no existe `.gridwork/`:

```text
crear .gridwork/
copiar archivos validados desde staging
calcular hashes finales
escribir lockfile
```

### Archivo faltante

Si un archivo del bundle no existe localmente:

```text
crear archivo
registrar como repaired_or_created
```

### Archivo existente sin cambios

Si existe y su hash coincide con el hash anterior en lockfile:

```text
puede actualizarse desde staging
registrar como updated_from_release
```

### Archivo existente personalizado

Si existe y su hash no coincide con el hash anterior:

```text
no sobrescribir
guardar candidato en .factory/init/<init-run-id>/candidates/
registrar conflicto
bloquear update completo si el archivo es requerido
```

### Archivo existente sin registro en lockfile

Si existe pero no aparece en lockfile:

```text
tratar como user_owned_or_unknown
no sobrescribir
guardar candidato si el release trae ese path
registrar conflicto conservador
```

### Archivo removido del nuevo release

En v1, `init` no debe eliminar archivos instalados anteriormente de `.gridwork/` automaticamente.

Recomendacion:

```text
deletion_v1 = report_only
```

Si un archivo ya no existe en el release nuevo:

- registrar `removed_from_release`;
- no borrarlo localmente;
- sugerir revision manual;
- no bloquear si no afecta validacion.

## Aplicacion atomica por etapas

Proceso:

```text
1. validar bundle
2. extraer a staging
3. calcular diff local vs lockfile vs staging
4. generar apply-plan.json
5. si hay conflictos bloqueantes, no aplicar cambios conflictivos
6. aplicar creates/updates seguros
7. validar .gridwork resultante
8. escribir lockfile nuevo solo si aplicacion completa es segura
```

## Apply plan

`init` debe generar:

```text
.factory/init/<init-run-id>/
  apply-plan.md
  apply-plan.json
```

Debe clasificar cada archivo:

```text
create
update_safe
unchanged
conflict_modified
conflict_unknown_owner
removed_from_release
skipped
```

## Conflictos bloqueantes

Debe bloquear update completo si hay conflicto en:

- `factory.json`;
- manifests de agents/workflows/skills;
- schemas requeridos;
- policies requeridas;
- prompt del orquestador;
- archivos necesarios para validar la fabrica.

Puede permitir instalacion parcial solo para reparacion de archivos faltantes no conflictivos, manteniendo lockfile sin upgrade si el update no queda completo.

## Reportes

`init` debe escribir:

```text
.factory/init/<init-run-id>/
  apply-plan.md
  apply-plan.json
  conflicts.md
  conflicts.json
  candidates/
  lockfile-report.md
```

`conflicts.md` debe explicar:

- path local;
- hash esperado anterior;
- hash actual;
- hash candidato;
- tipo de conflicto;
- accion sugerida;
- path del candidato.

## Propuesta inicial

```text
init_file_apply_strategy = installed_file_hash_manifest
init_lockfile_records_file_hashes = true
init_creates_missing_files = true
init_updates_files_only_if_current_hash_matches_previous_lockfile_hash = true
init_unknown_existing_files_are_conflicts = true
init_user_modified_files_are_conflicts = true
init_conflict_candidates_path = .factory/init/<init-run-id>/candidates/
init_apply_plan_required = true
init_apply_plan_path = .factory/init/<init-run-id>/apply-plan.json
init_deletes_removed_files_v1 = false
init_removed_files_are_report_only_v1 = true
init_lockfile_updates_only_after_safe_apply = true
init_conflicts_block_full_update = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `init` nunca actualice archivos existentes,
o que use hashes en `.gridwork-lock.json` para actualizar solo
archivos que no fueron modificados manualmente?
```

Mi recomendacion: usar hashes en `.gridwork-lock.json`. Asi `init` puede reparar y actualizar archivos seguros, pero protege cualquier personalizacion real enviando la version candidata a `.factory/init/<init-run-id>/candidates/`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe usar hashes en `.gridwork-lock.json`;
- `init` puede crear archivos faltantes;
- `init` puede actualizar archivos existentes solo si no fueron modificados manualmente;
- archivos modificados por el usuario se consideran conflictos;
- archivos existentes que no estan en lockfile se consideran `user_owned_or_unknown`;
- los candidatos de conflicto viven en `.factory/init/<init-run-id>/candidates/`;
- v1 no debe eliminar automaticamente archivos removidos del release;
- el lockfile solo se actualiza despues de una aplicacion segura.

## Decision registrada

```text
init_file_apply_strategy = installed_file_hash_manifest
init_lockfile_records_file_hashes = true
init_creates_missing_files = true
init_updates_files_only_if_current_hash_matches_previous_lockfile_hash = true
init_unknown_existing_files_are_conflicts = true
init_user_modified_files_are_conflicts = true
init_conflict_candidates_path = .factory/init/<init-run-id>/candidates/
init_apply_plan_required = true
init_apply_plan_path = .factory/init/<init-run-id>/apply-plan.json
init_deletes_removed_files_v1 = false
init_removed_files_are_report_only_v1 = true
init_lockfile_updates_only_after_safe_apply = true
init_conflicts_block_full_update = true
```

## Regla

```text
`init` aplica archivos usando hashes del lockfile.
Si un archivo no cambio desde la instalacion previa, puede actualizarse.
Si el usuario lo cambio, no se sobrescribe.
Si el owner del archivo es desconocido, se trata como conflicto.
V1 no borra archivos removidos del release.
El lockfile cambia solo despues de una aplicacion segura.
```

## Supuestos

- `.gridwork-lock.json` sera versionable junto a `.gridwork/`.
- El usuario puede modificar manualmente archivos de `.gridwork/`.
- Los updates de fabrica deben ser utiles sin ser destructivos.
- `.factory/` sigue siendo runtime local ignorado.
- El lockfile puede crecer de forma moderada con hashes por archivo.

## Riesgos

- Si el lockfile se borra, `init` debe tratar archivos existentes como unknown y ser conservador.
- Si se guardan demasiados hashes, el lockfile puede ser largo.
- Si se actualizan archivos antes de detectar todos los conflictos, puede quedar una instalacion parcial.
- Si se borran archivos automaticamente, se puede eliminar personalizacion; por eso v1 debe reportar removals sin borrar.
- Si no se prueba el conflicto en e2e, el contrato puede romperse sin notarse.

## Artefactos a crear o actualizar

- `.gridwork-lock.json`
- `packages/cli/src/init/apply-files.ts`
- `packages/cli/src/init/file-hashes.ts`
- `packages/cli/src/init/apply-plan.ts`
- `packages/cli/src/init/conflict-report.ts`
- `packages/cli/src/init/lockfile.ts`
- `.gridwork/templates/apply-plan.md`
- `.gridwork/templates/conflicts.md`
- `.gridwork/templates/lockfile-report.md`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta agrega el mecanismo que faltaba bajo las reglas de GQ-029 y GQ-066.
- Complementa GQ-075: staging no basta; tambien se necesita una estrategia segura de aplicacion.
- Complementa GQ-074: conflictos y apply plan deben tener salida clara y exit codes consistentes.
- Decision del usuario: aceptar hashes por archivo en `.gridwork-lock.json` para aplicar updates sin pisar personalizaciones.
- Revision posterior GQ-086: conflicto seguro debe cubrirse con acceptance test e2e y exit code `8`.
