# GQ-075 - Estrategia de extraccion segura del bundle

- Estado: accepted
- Fuente: decisiones GQ-064, GQ-068, GQ-070, GQ-072 y GQ-074
- Pregunta origen: GQ-075
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `packages/cli/src/init/extract-bundle.ts`, `packages/cli/package.json`, bundle zip, validacion de paths, reportes de `init`

## Pregunta

Como debe extraer la CLI el bundle `gridwork-factory-v<version>.zip` de forma segura sin inflar dependencias ni depender de herramientas externas del sistema?

## Por que importa

GQ-068 decidio que el release de fabrica publica:

```text
gridwork-factory-v<version>.zip
bundle-manifest.json
SHA256SUMS.txt
gridwork-release-notes.md
```

GQ-072 decidio que la CLI debe tener runtime dependencies cero o minimas.

Ahora aparece una tension real:

```text
zip es conveniente para releases
pero la extraccion segura necesita codigo confiable
```

Si la CLI extrae mal el zip, puede:

- escribir archivos fuera de `.gridwork/`;
- aceptar path traversal;
- sobrescribir personalizaciones;
- seguir symlinks peligrosos;
- instalar un bundle incompleto;
- depender de `unzip`, `tar` u otras herramientas que el usuario tal vez no tenga.

## Opciones

### Opcion A - Mantener zip y usar una dependencia minima auditada

La CLI usa una libreria npm pequena y auditada para leer/extractar zip.

Ventajas:

- mantiene el contrato `.zip` ya aceptado;
- evita depender de herramientas externas del sistema;
- permite testear comportamiento en Windows, macOS y Linux;
- el usuario no instala nada manualmente: la dependencia viene dentro del paquete npm;
- reduce riesgo frente a implementar un parser zip propio.

Desventajas:

- agrega una runtime dependency;
- hay que auditarla;
- hay que vigilar cambios de mantenimiento;
- el paquete npm crece un poco.

### Opcion B - Cambiar bundle a tar.gz

Cambiar release asset a:

```text
gridwork-factory-v<version>.tar.gz
```

Ventajas:

- formato comun en ecosistemas Unix;
- compresion buena;
- puede ser mas natural en algunos pipelines.

Desventajas:

- cambia GQ-068;
- Windows puede ser menos directo si se depende de herramientas externas;
- Node tiene zlib, pero no por eso queda resuelto todo el manejo seguro de tar;
- introduce otra decision cuando ya habiamos cerrado zip.

### Opcion C - Implementar extractor zip propio

La CLI implementa lectura de zip sin dependencias.

Ventajas:

- cero runtime dependencies;
- control total;
- paquete teoricamente mas pequeno.

Desventajas:

- alto riesgo;
- zip tiene detalles complejos;
- puede introducir bugs de seguridad;
- requeriria muchas pruebas;
- no es el core de valor de Gridwork.

### Opcion D - Usar herramientas del sistema

La CLI invoca:

```text
unzip
tar
powershell Expand-Archive
```

Ventajas:

- evita dependency npm;
- aprovecha herramientas existentes.

Desventajas:

- no es portable de forma limpia;
- requiere detectar OS;
- puede fallar por PATH o permisos;
- hace mas dificil testear;
- contradice la idea de no requerir dependencias externas.

## Respuesta recomendada

Usar Opcion A:

```text
bundle_format = zip
zip_extraction = minimal_audited_runtime_dependency
```

La excepcion a "cero dependencies" queda justificada porque:

- extraer zip de forma segura no es trivial;
- no debe depender de herramientas externas;
- el usuario final no instala nada adicional;
- el riesgo se controla con allowlist, validacion previa y tests.

No elegir el paquete exacto durante el grill-me. La seleccion se debe hacer durante implementacion con una mini auditoria.

## Criterios para elegir dependencia

La dependencia debe cumplir:

- pequena;
- mantenida;
- sin postinstall scripts;
- sin binarios nativos obligatorios;
- compatible con Windows, macOS y Linux;
- compatible con Node minimo soportado;
- permite listar entradas antes de extraer;
- permite leer entradas sin escribir automaticamente;
- no sigue symlinks por defecto o permite rechazarlos;
- licencia permisiva;
- sin arbol grande de dependencias;
- validada por `npm audit` y `npm pack --dry-run`.

## Reglas de extraccion segura

La CLI debe:

- descargar zip a un directorio temporal de `.factory/init/<init-run-id>/`;
- calcular hash antes de abrir;
- listar entradas antes de escribir;
- rechazar paths absolutos;
- rechazar `..`;
- rechazar separadores raros o path traversal;
- normalizar paths con reglas cross-platform;
- exigir que todo este debajo de `.gridwork/`;
- exigir `.gridwork/factory.json`;
- rechazar `.factory/`;
- rechazar `.git/`;
- rechazar `node_modules/`;
- rechazar symlinks;
- rechazar archivos demasiado grandes;
- rechazar cantidad excesiva de archivos;
- rechazar zip vacio;
- extraer a staging primero;
- validar staging;
- aplicar a `.gridwork/` solo despues de validacion;
- no sobrescribir conflictos;
- guardar candidatos en `.factory/init/<init-run-id>/candidates/`.

## Staging recomendado

Proceso:

```text
download -> verify hash -> inspect zip -> extract to staging -> validate staging -> apply safe files -> write lockfile
```

Rutas:

```text
.factory/init/<init-run-id>/
  downloads/
    gridwork-factory-v<version>.zip
  staging/
    .gridwork/
  candidates/
```

Si falla antes de aplicar:

```text
.gridwork/ unchanged
.gridwork-lock.json unchanged
```

## Limites recomendados

V1 debe definir limites defensivos:

```text
max_zip_size_mb = 25
max_uncompressed_size_mb = 100
max_file_count = 2000
max_single_file_size_mb = 10
allow_symlinks = false
allow_executable_files = false_by_default
```

Estos limites pueden ajustarse despues, pero deben existir desde el inicio.

## Reportes

`init` debe registrar:

```text
.factory/init/<init-run-id>/
  extraction-report.md
  extraction.json
```

Debe incluir:

- asset name;
- zip size;
- hash verificado;
- entradas inspeccionadas;
- archivos aceptados;
- archivos rechazados;
- motivo de rechazo;
- staging path;
- aplicacion final;
- conflictos.

## Tests requeridos

La CLI debe testear:

- zip valido instala `.gridwork/`;
- zip sin `.gridwork/factory.json` falla;
- path traversal falla;
- paths absolutos fallan;
- `.factory/` dentro del zip falla;
- `.git/` dentro del zip falla;
- `node_modules/` dentro del zip falla;
- symlink falla;
- zip con hash incorrecto falla antes de extraer;
- zip demasiado grande falla;
- conflicto local no sobrescribe archivo;
- lockfile no cambia si falla.

## Propuesta inicial

```text
bundle_extraction_format = zip
bundle_zip_dependency_allowed = true
bundle_zip_dependency_must_be_minimal = true
bundle_zip_dependency_must_be_audited = true
bundle_zip_dependency_selected_during_implementation = true
bundle_extraction_uses_system_tools = false
bundle_extraction_custom_zip_parser = false
bundle_extraction_lists_entries_before_writing = true
bundle_extraction_rejects_path_traversal = true
bundle_extraction_rejects_absolute_paths = true
bundle_extraction_rejects_symlinks = true
bundle_extraction_rejects_paths_outside_gridwork = true
bundle_extraction_rejects_runtime_factory = true
bundle_extraction_uses_staging_directory = true
bundle_extraction_applies_after_validation = true
bundle_extraction_writes_report = true
bundle_extraction_limits_enabled = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres mantener `.zip` y permitir una dependencia runtime minima
para extraerlo de forma segura, o prefieres cambiar el formato del bundle
para intentar evitar esa dependencia?
```

Mi recomendacion: mantener `.zip` y permitir una unica dependencia runtime pequena, auditada y encapsulada para extraccion. No usar herramientas del sistema ni implementar un parser zip propio.

## Respuesta del usuario

El usuario acepta la recomendacion:

- mantener `.zip` como formato del bundle;
- permitir una unica dependencia runtime minima para extraccion zip;
- la dependencia debe ser pequena, auditada y encapsulada;
- la dependencia concreta se seleccionara durante implementacion con mini auditoria;
- no usar herramientas del sistema para extraer;
- no implementar un parser zip propio;
- extraer siempre a staging antes de aplicar;
- rechazar paths inseguros, symlinks y paths fuera de `.gridwork/`.

## Decision registrada

```text
bundle_extraction_format = zip
bundle_zip_dependency_allowed = true
bundle_zip_dependency_must_be_minimal = true
bundle_zip_dependency_must_be_audited = true
bundle_zip_dependency_selected_during_implementation = true
bundle_extraction_uses_system_tools = false
bundle_extraction_custom_zip_parser = false
bundle_extraction_lists_entries_before_writing = true
bundle_extraction_rejects_path_traversal = true
bundle_extraction_rejects_absolute_paths = true
bundle_extraction_rejects_symlinks = true
bundle_extraction_rejects_paths_outside_gridwork = true
bundle_extraction_rejects_runtime_factory = true
bundle_extraction_uses_staging_directory = true
bundle_extraction_applies_after_validation = true
bundle_extraction_writes_report = true
bundle_extraction_limits_enabled = true
```

## Regla

```text
El bundle sigue siendo zip.
La CLI puede tener una dependencia runtime minima para extraer zip.
La dependencia se audita antes de adoptarla.
La CLI no usa herramientas del sistema para extraer.
La CLI no implementa un parser zip propio.
Todo zip se inspecciona, valida y extrae a staging antes de aplicar.
```

## Supuestos

- El bundle zip ya fue aceptado como contrato de release.
- La CLI se ejecutara en Windows, macOS y Linux.
- El usuario final no debe instalar herramientas extra.
- La seguridad de extraccion importa mas que tener cero dependencias absolutas.
- La dependencia concreta se elegira durante implementacion con auditoria.

## Riesgos

- Una dependencia mal elegida puede introducir vulnerabilidades.
- Un extractor propio puede tener bugs mas graves que una dependencia auditada.
- Usar herramientas del sistema puede fallar de forma distinta por OS.
- Sin staging, un fallo parcial podria dejar `.gridwork/` en estado mixto.

## Artefactos a crear o actualizar

- `packages/cli/package.json`
- `packages/cli/src/init/extract-bundle.ts`
- `packages/cli/src/init/verify-bundle.ts`
- `packages/cli/src/init/path-safety.ts`
- `packages/cli/src/init/extraction-report.ts`
- `packages/cli/tests/extract-bundle.test.ts`
- `.gridwork/templates/extraction-report.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`

## Evidencia y notas

- Esta pregunta mantiene GQ-068 sin abrir una guerra de formatos.
- Complementa GQ-072: runtime dependencies deben ser cero o minimas.
- Complementa GQ-074: fallos de extraccion deben producir reportes y exit codes claros.
- Decision del usuario: aceptar zip con una dependencia runtime minima, auditada y encapsulada para extraccion segura.
