# GQ-089 - Backlog inicial de implementacion desde el grill-me

- Estado: accepted
- Fuente: decisiones GQ-024, GQ-031, GQ-049, GQ-050, GQ-085, GQ-086, GQ-087 y GQ-088
- Pregunta origen: GQ-089
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog inicial de Gridwork, issues GitHub, drafts locales, trazabilidad desde decisiones GQ, roadmap MVP

## Pregunta

Como se debe convertir todo este grill-me en un backlog inicial para implementar Gridwork?

La duda concreta:

```text
Debemos crear issues reales de GitHub inmediatamente,
o primero generar drafts locales revisables con trazabilidad a cada GQ?
```

## Por que importa

El grill-me ya tiene muchas decisiones aceptadas. Si se empieza a implementar sin transformarlas en backlog, se corre el riesgo de:

- crear tareas demasiado grandes;
- perder decisiones importantes;
- mezclar fases del MVP;
- implementar `full-v1` antes de tener `minimal-mvp`;
- crear issues sin criterios de aceptacion;
- perder trazabilidad entre requerimiento, decision, test y codigo.

El backlog inicial debe ser el puente entre:

```text
docs del grill-me -> roadmap MVP -> issues verticales -> implementacion TDD -> verifier
```

## Opciones

### Opcion A - Implementar desde los documentos directamente

Usar los GQ como referencia y empezar a escribir codigo sin crear issues.

Ventajas:

- rapido al inicio;
- evita trabajo administrativo;
- sirve para experimentos muy pequenos.

Desventajas:

- poca trazabilidad;
- dificil saber que esta hecho;
- dificil revisar avance;
- no encaja con el modelo de agentes e issues;
- puede producir una implementacion desordenada.

### Opcion B - Crear issues reales de GitHub inmediatamente

Usar `gh issue create` para publicar el backlog completo desde el grill-me.

Ventajas:

- GitHub queda como fuente visible de trabajo;
- permite asignar labels, milestones y estados;
- encaja con implementer/verifier.

Desventajas:

- puede publicar issues inmaduras;
- puede crear demasiadas issues de golpe;
- obliga a corregir en GitHub decisiones que aun son de diseno;
- requiere approval y estado del repo GitHub listo.

### Opcion C - Generar drafts locales primero y publicar por lotes

Crear un backlog local revisable a partir del grill-me, y publicar issues reales solo despues de aprobar lotes.

Ventajas:

- mantiene trazabilidad sin apresurar GitHub;
- permite revisar y ordenar antes de publicar;
- respeta las fases del MVP;
- permite crear vertical slices mejores;
- reduce ruido en GitHub;
- encaja con `github-issue-publisher` y approval gates.

Desventajas:

- agrega un paso antes de publicar;
- requiere definir formato de draft;
- hay que evitar que los drafts queden obsoletos.

## Respuesta recomendada

Usar Opcion C:

```text
backlog_generation_model = local_drafts_first_then_github_publish_batches
```

Primero crear drafts locales de issues desde los documentos GQ. Despues, cuando el usuario apruebe un lote, usar la skill `github-issue-publisher` para crear issues reales con `gh`.

## Formato recomendado de drafts

Los drafts deben ser archivos Markdown con front matter YAML:

```yaml
---
id: GW-MVP-001
title: Scaffold monorepo Gridwork
phase: phase-0
status: draft
labels:
  - gridwork
  - type:feature
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-067
  - GQ-072
  - GQ-073
acceptance_status: draft
github_issue: null
---
```

Cada draft debe incluir:

- objetivo;
- contexto;
- alcance incluido;
- fuera de alcance;
- criterios de aceptacion;
- pruebas esperadas;
- archivos probables;
- decisiones GQ relacionadas;
- riesgos;
- agente recomendado;
- si requiere trabajo AFK o HITL;
- labels predefinidas.

## Ubicacion recomendada

Para este repositorio fuente de Gridwork:

```text
.docs/grill-me_factory/backlog/
  README.md
  phase-0/
  phase-1/
  phase-2/
  phase-3/
  phase-4/
  phase-5/
  phase-6/
```

Razon: estos drafts nacen del grill-me y sirven para disenar el backlog inicial. Cuando Gridwork ya exista como fabrica operativa, los drafts de workflows normales podran vivir en `.factory/` segun las reglas previas.

## Agrupacion por fases

El backlog inicial debe seguir GQ-085:

```text
phase-0 = source_repo_scaffold
phase-1 = minimal_factory_definition
phase-2 = local_first_init
phase-3 = bundle_download_verify_cache
phase-4 = factory_release_publisher
phase-5 = npm_cli_publish
phase-6 = full_factory_v1_expansion
```

No mezclar issues de fase 6 con el primer corte si no son necesarias para validar `init`.

## Trazabilidad minima

Cada issue draft debe declarar:

```text
source_decisions = GQ ids
acceptance_criteria = criterios verificables
test_evidence = que test o evidencia prueba que esta listo
phase = fase MVP
factory_profile = minimal-mvp | full-v1 | source-repo
```

Ejemplo:

```text
Issue: Crear inventario minimal-mvp instalable
source_decisions: GQ-087, GQ-088
factory_profile: minimal-mvp
tests: e2e init new install asserts README, QUICKSTART, PROMPT, factoryProfile
```

## Publicacion a GitHub

La publicacion debe ser opcional y por lotes:

```text
drafts locales -> publish plan -> approval -> gh issue create
```

Reglas:

- no publicar todo el backlog de golpe;
- empezar con fase 0 y fase 1;
- usar labels predefinidas;
- no inventar labels fuera del catalogo;
- registrar el numero de issue publicado en el draft;
- generar `published-issues.md`.

## Propuesta inicial

```text
backlog_generation_model = local_drafts_first_then_github_publish_batches
initial_backlog_source = grill_me_gq_documents
initial_backlog_path = .docs/grill-me_factory/backlog/
initial_backlog_grouping = mvp_phases
initial_backlog_issue_shape = vertical_slice_or_enabling_slice
initial_backlog_uses_gq_traceability = true
initial_backlog_requires_acceptance_criteria = true
initial_backlog_requires_test_expectations = true
initial_backlog_requires_predefined_labels = true
initial_backlog_publish_to_github_immediately = false
initial_backlog_requires_batch_review = true
github_publish_requires_approval = true
github_publish_batch_size = small
first_publish_batch = phase-0_and_phase-1_only
```

## Pregunta para decidir

La duda clave:

```text
Quieres publicar issues reales de GitHub inmediatamente,
o primero generar drafts locales del backlog con trazabilidad a los GQ
y luego publicar por lotes con aprobacion?
```

Mi recomendacion: drafts locales primero. Asi podemos revisar el backlog inicial con calma, mantener cada issue conectada a sus decisiones, y publicar en GitHub solo cuando el lote sea suficientemente bueno.

## Respuesta del usuario

El usuario acepta la recomendacion:

- primero generar drafts locales del backlog inicial;
- no publicar issues reales de GitHub inmediatamente;
- los drafts deben tener trazabilidad a los documentos GQ;
- los drafts deben agruparse por fases del roadmap MVP;
- cada draft debe incluir criterios de aceptacion y pruebas esperadas;
- las labels deben salir del catalogo predefinido;
- la publicacion en GitHub ocurre despues, por lotes pequenos y con aprobacion;
- el primer lote de publicacion recomendado sera fase 0 y fase 1.

## Decision registrada

```text
backlog_generation_model = local_drafts_first_then_github_publish_batches
initial_backlog_source = grill_me_gq_documents
initial_backlog_path = .docs/grill-me_factory/backlog/
initial_backlog_grouping = mvp_phases
initial_backlog_issue_shape = vertical_slice_or_enabling_slice
initial_backlog_uses_gq_traceability = true
initial_backlog_requires_acceptance_criteria = true
initial_backlog_requires_test_expectations = true
initial_backlog_requires_predefined_labels = true
initial_backlog_publish_to_github_immediately = false
initial_backlog_requires_batch_review = true
github_publish_requires_approval = true
github_publish_batch_size = small
first_publish_batch = phase-0_and_phase-1_only
```

## Regla

```text
El backlog inicial de implementacion de Gridwork nace como drafts locales.
Los drafts viven en `.docs/grill-me_factory/backlog/`.
Cada draft referencia decisiones GQ, fase MVP, criterios de aceptacion, pruebas y labels.
No se crean issues reales en GitHub sin publish plan y aprobacion.
La publicacion se hace por lotes pequenos.
El primer publish batch recomendado incluye fase 0 y fase 1.
```

## Supuestos

- El repo GitHub puede existir, pero no conviene llenarlo de issues inmaduras.
- El usuario quiere mantener trazabilidad desde decisiones a implementacion.
- El MVP debe respetar fases y vertical slices.
- El backlog inicial de Gridwork es distinto a los backlogs que Gridwork generara para otros proyectos.

## Riesgos

- Si los drafts no tienen owner o fase, pueden quedar como documentacion muerta.
- Si se publican issues muy temprano, GitHub se llena de ruido.
- Si no se publican nunca, el implementer/verifier no tendran cola real.
- Si las issues no tienen criterios de aceptacion, TDD y verificacion quedan debiles.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/README.md`
- `.docs/grill-me_factory/backlog/phase-0/*.md`
- `.docs/grill-me_factory/backlog/phase-1/*.md`
- `.docs/grill-me_factory/backlog/phase-2/*.md`
- `.docs/grill-me_factory/backlog/publish-plan.md`
- `.gridwork/policies/github-labels.json`
- `factory/.gridwork/templates/github-issue.md`
- `factory/.gridwork/templates/publish-plan.md`

## Evidencia y notas

- Esta pregunta prepara el paso desde diseno a implementacion.
- Complementa GQ-024: issues como vertical slices.
- Complementa GQ-049 y GQ-050: drafts locales primero, publicacion GitHub con approval.
- Complementa GQ-085: el backlog debe respetar fases MVP.
- Complementa GQ-086: cada issue debe incluir criterios testeables.
- Decision del usuario: aceptar drafts locales primero y publicacion GitHub posterior por lotes con aprobacion.
- Revision posterior GQ-090: el primer lote crea mapa liviano de todas las fases y drafts detallados para fase 0 y fase 1.
- Revision posterior GQ-092: el primer lote requiere review por lote con checklist antes de publicarse o implementarse sin excepcion.
