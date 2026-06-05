# GQ-090 - Primer lote de drafts del backlog MVP

- Estado: accepted
- Fuente: decisiones GQ-067, GQ-072, GQ-073, GQ-085, GQ-086, GQ-087, GQ-088 y GQ-089
- Pregunta origen: GQ-090
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.docs/grill-me_factory/backlog/`, primeros issue drafts MVP, publish plan inicial, trazabilidad GQ

## Pregunta

Que alcance debe tener el primer lote de drafts locales del backlog MVP?

La duda concreta:

```text
Debemos crear drafts detallados para todas las fases,
o empezar solo con las fases necesarias para construir la primera rebanada?
```

## Por que importa

GQ-089 decidio que el backlog inicial nace como drafts locales. Ahora hay que decidir cuanto detalle crear primero.

Si se detalla todo el backlog de una vez, se puede gastar mucho tiempo planificando fases lejanas. Si se detalla demasiado poco, no queda una ruta clara hacia `npx gridwork init`.

El primer lote debe permitir pasar de decisiones a trabajo implementable sin convertir el backlog en una novela eterna.

## Opciones

### Opcion A - Detallar todas las fases desde el inicio

Crear drafts completos para fase 0 a fase 6.

Ventajas:

- vision completa;
- permite estimar todo el proyecto;
- GitHub podria tener una hoja de ruta completa.

Desventajas:

- mucho trabajo antes de implementar;
- fases lejanas pueden cambiar;
- riesgo de crear issues prematuras;
- puede distraer del primer MVP instalable.

### Opcion B - Detallar solo fase 0 y fase 1

Crear drafts detallados solo para:

```text
phase-0 = source_repo_scaffold
phase-1 = minimal_factory_definition
```

Ventajas:

- enfocado;
- permite empezar pronto;
- reduce decisiones prematuras;
- coincide con el primer publish batch recomendado.

Desventajas:

- deja menos visible el camino completo;
- fase 2 puede quedar poco preparada;
- puede faltar una vista de dependencias futuras.

### Opcion C - Mapa completo liviano + drafts detallados fase 0 y fase 1

Crear:

```text
backlog/README.md
backlog/phase-index.md
backlog/phase-0/*.md
backlog/phase-1/*.md
backlog/publish-plan.md
```

El `phase-index.md` lista todas las fases, pero solo fase 0 y fase 1 tienen drafts detallados al inicio.

Ventajas:

- mantiene vision completa sin sobredetallar;
- deja fases 0 y 1 listas para revisar/publicar;
- evita inventar issues lejanas;
- permite avanzar hacia el primer MVP;
- conserva trazabilidad por fase.

Desventajas:

- requiere volver despues para detallar fase 2 en adelante;
- el mapa completo no reemplaza issues futuras;
- necesita disciplina para no saltar a fase 6.

## Respuesta recomendada

Usar Opcion C:

```text
first_backlog_draft_batch = phase_map_all_phases_plus_detailed_phase_0_and_phase_1
```

El primer lote debe preparar una vista completa del roadmap, pero solo crear issues detalladas para fase 0 y fase 1.

## Drafts recomendados de fase 0

```text
GW-MVP-001 - Scaffold monorepo Gridwork con npm workspaces
GW-MVP-002 - Configurar paquete CLI TypeScript con bin `gridwork`
GW-MVP-003 - Configurar CI base del repositorio fuente
```

Objetivo de fase 0:

```text
tener un repositorio fuente compilable, testeable y listo para alojar CLI + fabrica
```

## Drafts recomendados de fase 1

```text
GW-MVP-004 - Crear inventario `minimal-mvp` de `factory/.gridwork/`
GW-MVP-005 - Crear prompt y contrato minimo del orquestador
GW-MVP-006 - Crear workflow, skill, policies y schemas minimos
GW-MVP-007 - Crear README y QUICKSTART instalados en `.gridwork/`
```

Objetivo de fase 1:

```text
tener una fabrica minima instalable y activable por prompt, sin codigo productivo
```

## Reglas del primer lote

Cada draft debe incluir:

- front matter YAML;
- fase;
- `factory_profile`;
- labels del catalogo predefinido;
- decisiones GQ relacionadas;
- criterios de aceptacion;
- pruebas esperadas;
- fuera de alcance;
- agente recomendado;
- modo `HITL` o `AFK`;
- riesgos.

Para fase 0, `factory_profile` puede ser:

```text
source-repo
```

Para fase 1:

```text
minimal-mvp
```

## Propuesta inicial

```text
first_backlog_draft_batch = phase_map_all_phases_plus_detailed_phase_0_and_phase_1
first_backlog_creates_phase_index = true
first_backlog_details_all_phases = false
first_backlog_details_phase_0 = true
first_backlog_details_phase_1 = true
first_backlog_details_phase_2_plus = false
first_backlog_publish_plan_created = true
first_backlog_publish_to_github_now = false
first_backlog_phase_0_issue_count = 3
first_backlog_phase_1_issue_count = 4
first_backlog_requires_gq_traceability = true
first_backlog_requires_acceptance_criteria = true
first_backlog_requires_test_expectations = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el primer backlog tenga drafts detallados de todas las fases,
solo fase 0 y fase 1,
o un mapa liviano de todas las fases mas drafts detallados de fase 0 y fase 1?
```

Mi recomendacion: mapa liviano completo + drafts detallados de fase 0 y fase 1. Es suficiente para empezar a construir sin perder la vision de hacia donde va Gridwork.

## Respuesta del usuario

El usuario acepta la recomendacion:

- crear un mapa liviano de todas las fases del roadmap MVP;
- crear drafts detallados solo para fase 0 y fase 1;
- no detallar fase 2 en adelante todavia;
- crear un publish plan inicial, pero sin publicar en GitHub;
- mantener trazabilidad GQ, criterios de aceptacion y pruebas esperadas en cada draft;
- usar `source-repo` para issues de fase 0;
- usar `minimal-mvp` para issues de fase 1.

## Decision registrada

```text
first_backlog_draft_batch = phase_map_all_phases_plus_detailed_phase_0_and_phase_1
first_backlog_creates_phase_index = true
first_backlog_details_all_phases = false
first_backlog_details_phase_0 = true
first_backlog_details_phase_1 = true
first_backlog_details_phase_2_plus = false
first_backlog_publish_plan_created = true
first_backlog_publish_to_github_now = false
first_backlog_phase_0_issue_count = 3
first_backlog_phase_1_issue_count = 4
first_backlog_requires_gq_traceability = true
first_backlog_requires_acceptance_criteria = true
first_backlog_requires_test_expectations = true
```

## Regla

```text
El primer backlog crea mapa completo de fases.
Solo fase 0 y fase 1 tienen drafts detallados al inicio.
Fase 2 en adelante queda mapeada, no detallada.
No se publican issues reales en GitHub todavia.
El publish plan inicial queda en estado draft.
```

## Supuestos

- Aun no queremos publicar issues reales en GitHub.
- El primer lote debe ser revisable antes de publicarse.
- Fase 0 y fase 1 son suficientes para preparar el primer trabajo serio.
- Fase 2 se detallara despues, cuando el esqueleto del repo y la fabrica minima esten claros.

## Riesgos

- Si se detallan todas las fases, el backlog puede quedar rigido demasiado pronto.
- Si se detalla solo fase 0, la fabrica minima queda poco preparada.
- Si no hay phase index, se pierde contexto de roadmap.
- Si se publican issues ahora, se puede subir trabajo aun no revisado.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/README.md`
- `.docs/grill-me_factory/backlog/phase-index.md`
- `.docs/grill-me_factory/backlog/phase-0/GW-MVP-001_scaffold_monorepo.md`
- `.docs/grill-me_factory/backlog/phase-0/GW-MVP-002_cli_typescript_package.md`
- `.docs/grill-me_factory/backlog/phase-0/GW-MVP-003_source_repo_ci.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-004_minimal_factory_inventory.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-005_orchestrator_prompt_contract.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-006_minimal_workflow_skill_policies_schemas.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-007_installed_readme_quickstart.md`
- `.docs/grill-me_factory/backlog/publish-plan.md`

## Evidencia y notas

- Esta pregunta concreta el primer output operativo de GQ-089.
- Complementa GQ-085: fase 0 y fase 1 preceden al `init` local-first.
- Complementa GQ-087: fase 1 debe implementar inventario `minimal-mvp`.
- Complementa GQ-088: fase 1 debe incluir onboarding instalado.
- Decision del usuario: aceptar mapa liviano completo mas drafts detallados de fase 0 y fase 1.
