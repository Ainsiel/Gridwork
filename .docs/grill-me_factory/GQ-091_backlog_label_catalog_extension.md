# GQ-091 - Extension del catalogo de labels para el backlog inicial

- Estado: accepted
- Fuente: decisiones GQ-031, GQ-089 y GQ-090
- Pregunta origen: GQ-091
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/github-labels.json`, drafts del backlog inicial, publish plan de GitHub

## Pregunta

Debe ampliarse el catalogo de labels para publicar mejor el backlog inicial de Gridwork?

La duda concreta:

```text
Usamos solo las labels ya definidas en GQ-031,
o agregamos labels especificas para phase, area y enabling slices?
```

## Por que importa

GQ-031 definio una taxonomia minima de labels para issues generadas por Gridwork. Esa taxonomia sirve bien para issues de producto, pero el backlog inicial de Gridwork tambien necesita distinguir:

- fase MVP;
- area tecnica del repo fuente;
- trabajo habilitante vs vertical slice;
- CLI, fabrica, CI, release o docs;
- issues listas para publicar vs todavia en revision.

Si se publican los drafts actuales con labels demasiado genericas, GitHub quedara menos filtrable. Si se agregan demasiadas labels, el catalogo puede crecer sin necesidad.

## Opciones

### Opcion A - Usar solo labels actuales

Usar labels como:

```text
gridwork
type:feature
status:needs-refinement
mode:assisted
workflow:tdd-implementation
agent:implementer
```

Ventajas:

- simple;
- no requiere extender catalogo;
- evita sobrecargar GitHub.

Desventajas:

- no se puede filtrar por fase;
- no se puede filtrar por area tecnica;
- no distingue bien enabling slices.

### Opcion B - Ampliar catalogo con labels minimas para Gridwork MVP

Agregar labels como:

```text
phase:0
phase:1
area:source-repo
area:cli
area:factory
area:ci
area:docs
slice:enabling
```

Ventajas:

- mejora filtrado;
- mantiene catalogo pequeno;
- ayuda a publicar fase 0 y fase 1;
- separa issues habilitantes de vertical slices de producto.

Desventajas:

- requiere actualizar catalogo JSON;
- si se crean labels en GitHub, requiere aprobacion;
- puede requerir ajustar drafts antes de publicar.

### Opcion C - Usar metadata en body, no labels nuevas

Mantener labels actuales y poner fase/area/slice en el body de cada issue.

Ventajas:

- no crece el catalogo;
- conserva trazabilidad;
- reduce side effects al publicar.

Desventajas:

- GitHub filtra peor;
- los agentes deben leer body para clasificar;
- menos comodo para tablero o busquedas.

## Respuesta recomendada

Usar Opcion B:

```text
backlog_label_catalog_extension = minimal_gridwork_mvp_labels
```

Agregar pocas labels especificas para el backlog inicial de Gridwork, antes de publicar issues reales.

## Propuesta inicial

```text
extend_label_catalog_for_gridwork_mvp = true
add_phase_labels = phase:0,phase:1
add_area_labels = area:source-repo,area:cli,area:factory,area:ci,area:docs
add_slice_label = slice:enabling
github_create_missing_labels_requires_approval = true
drafts_can_use_new_labels_after_catalog_update = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres mantener las labels actuales,
agregar un set minimo de labels para el backlog inicial de Gridwork,
o dejar fase/area solo como metadata dentro del body?
```

Mi recomendacion: agregar un set minimo de labels para Gridwork MVP. Es pequeno, mejora mucho el filtrado y evita que los agentes tengan que inferir fase/area desde texto libre.

## Respuesta del usuario

El usuario acepta la recomendacion:

- ampliar el catalogo de labels para el backlog inicial de Gridwork;
- agregar labels minimas de fase;
- agregar labels minimas de area tecnica;
- agregar `slice:enabling`;
- actualizar drafts locales para usar estas labels;
- mantener aprobacion obligatoria si luego se crean labels reales en GitHub;
- no publicar issues todavia.

## Decision registrada

```text
backlog_label_catalog_extension = minimal_gridwork_mvp_labels
extend_label_catalog_for_gridwork_mvp = true
add_phase_labels = phase:0,phase:1
add_area_labels = area:source-repo,area:cli,area:factory,area:ci,area:docs
add_slice_label = slice:enabling
github_create_missing_labels_requires_approval = true
drafts_can_use_new_labels_after_catalog_update = true
github_publish_still_disabled = true
```

## Regla

```text
El backlog inicial de Gridwork puede usar labels `phase:*`, `area:*` y `slice:enabling`.
Estas labels deben existir en el catalogo local antes de publicar issues.
Crear labels reales en GitHub sigue siendo side effect externo y requiere aprobacion.
Los drafts locales pueden actualizarse con estas labels sin publicar nada.
```

## Supuestos

- Aun no estamos publicando issues reales.
- Crear labels en GitHub sigue requiriendo aprobacion.
- Actualizar el catalogo local no crea side effects remotos.
- Las labels nuevas deben mantenerse pocas y con prefijos.

## Riesgos

- Crear demasiadas labels puede ensuciar el repositorio.
- No crear labels de fase puede dificultar filtrar el primer MVP.
- Si los drafts usan labels que no existen en el catalogo, `github-issue-publisher` debe bloquear.

## Artefactos a crear o actualizar

- `.gridwork/policies/github-labels.json`
- `.docs/grill-me_factory/backlog/phase-0/*.md`
- `.docs/grill-me_factory/backlog/phase-1/*.md`
- `.docs/grill-me_factory/backlog/publish-plan.md`

## Evidencia y notas

- Esta pregunta surge al crear los primeros drafts locales de GQ-090.
- Complementa GQ-031: los agentes no inventan labels fuera del catalogo.
- Complementa GQ-050: publicar labels faltantes en GitHub requiere aprobacion.
- Decision del usuario: aceptar extension minima de labels para el backlog inicial de Gridwork.
