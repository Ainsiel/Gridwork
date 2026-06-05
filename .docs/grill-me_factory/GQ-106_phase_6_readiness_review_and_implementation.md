# GQ-106 - Revisar fase 6 e implementar full-v1

- Estado: accepted
- Fuente: GQ-105 y drafts `GW-MVP-035` a `GW-MVP-043`
- Pregunta origen: GQ-106
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: fabrica full-v1, agentes, workflows, skills, stack pack, policies, templates y validacion

## Pregunta

Ahora que los drafts detallados de fase 6 existen, que hacemos con ellos?

La duda concreta:

```text
Quieres que haga review completo de GW-MVP-035 a GW-MVP-043
y, si quedan ready, implemente la fabrica full-v1 sin generar codigo productivo?
```

## Por que importa

Fase 6 es la expansion real de la fabrica. Ya no se trata solo del mecanismo de distribucion; se trata del contenido que usaran el orquestador, los agentes y los workflows.

Antes de implementar conviene revisar:

- que los contratos no se contradigan;
- que las skills no eleven permisos;
- que el stack pack no genere codigo;
- que `tdd-implementation` conserve evidencia red/green/refactor;
- que `init` siga sin comando `run`;
- que `minimal-mvp` no se rompa.

## Opciones

### Opcion A - Review completo e implementar si queda ready

Revisar todos los drafts de fase 6, marcar como `ready` los que pasen y luego implementar full-v1 localmente.

Ventajas:

- acerca Gridwork a la fabrica personal completa;
- mantiene el orden backlog -> review -> implementacion;
- permite detectar contradicciones antes de tocar archivos instalables.

Desventajas:

- es una fase grande;
- requiere pruebas de inventario, manifests y no generacion de codigo.

### Opcion B - Solo review y refinamiento

Revisar los drafts, corregirlos y detenerse antes de implementar.

Ventajas:

- reduce riesgo;
- deja una especificacion mas solida.

Desventajas:

- la fabrica instalada sigue siendo minima.

### Opcion C - Implementar por subfases

Revisar todo, pero implementar primero agentes y workflows; luego skills; luego stack pack; luego validacion.

Ventajas:

- reduce el tamano de cada cambio;
- facilita pruebas incrementales.

Desventajas:

- tarda mas turnos;
- puede dejar full-v1 parcialmente instalado.

### Opcion D - Pausar

No revisar ni implementar fase 6 todavia.

Ventajas:

- permite revisar el MVP tecnico actual.

Desventajas:

- Gridwork sigue sin su contenido full-v1.

## Respuesta recomendada

Usar Opcion C:

```text
phase_6_strategy = review_full_then_implement_by_subphase
phase_6_subphase_order = agents_workflows,skills_policies,stack_pack,templates_observability,validation
product_code_generation = false
gridwork_run_command_v1 = false
```

Mi recomendacion es revisar fase 6 completa, pero implementarla por subfases. Asi mantenemos el contrato completo a la vista sin meter todos los archivos de fabrica en un solo cambio.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 6 completa y la implemente por subfases,
solo la revise,
la implemente completa en un lote,
o pausemos aqui?
```

Mi recomendacion: review completo y luego implementacion por subfases.

## Decision registrada

El usuario acepta la recomendacion:

```text
phase_6_strategy = review_full_then_implement_by_subphase
phase_6_subphase_order = agents_workflows,skills_policies,stack_pack,templates_observability,validation
product_code_generation = false
gridwork_run_command_v1 = false
```

Resultado:

```text
review_gw_mvp_035 = completed
review_gw_mvp_036 = completed
review_gw_mvp_037 = completed
review_gw_mvp_038 = completed
review_gw_mvp_039 = completed
review_gw_mvp_040 = completed
review_gw_mvp_041 = completed
review_gw_mvp_042 = completed
review_gw_mvp_043 = completed
phase_6_drafts_ready = true
phase_6_implementation_completed = true
factory_profile = full-v1
product_code_generation = false
npm_test_passed = true
npm_pack_dry_run_passed = true
```

## Regla propuesta

```text
Fase 6 no genera codigo productivo.
Fase 6 no crea frontend, backend, database ni Docker.
Fase 6 no agrega comando `gridwork run`.
Fase 6 mantiene skills como capacidades que no elevan permisos.
Fase 6 preserva `minimal-mvp`.
Fase 6 debe pasar validacion de manifests, inventario y no-product-code.
```

## Supuestos

- Fase 0 a fase 5 ya estan implementadas localmente.
- Los drafts de fase 6 ya existen.
- El usuario quiere avanzar hacia una fabrica personal full-v1.

## Riesgos

- Implementar demasiado contenido sin review suficiente.
- Romper la instalacion minimal existente.
- Duplicar instrucciones entre agentes, workflows y skills.
- Crear stack guidance que parezca scaffold.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/phase-6/*.md`
- `factory/.gridwork/agents/`
- `factory/.gridwork/workflows/`
- `factory/.gridwork/skills/`
- `factory/.gridwork/stack-packs/`
- `factory/.gridwork/policies/`
- `factory/.gridwork/templates/`
- `factory/.gridwork/schemas/`

## Resultado implementacion local

Fase 6 quedo implementada localmente como expansion `full-v1`:

- seis agentes base;
- cinco workflows base;
- skills base y release publisher alineado al contrato de skill;
- policies de permisos, dominios, gates, labels, precedencia y TDD;
- stack pack guidance-only `nextjs-springboot-postgresql`;
- templates de work orders, runs, metricas, TDD, verifier, PR comments y handoff;
- docs instalados de perfiles, agentes, workflows y skills;
- validacion full-v1 en `gridwork init`;
- release bundle actualizado para permitir `.gridwork/docs/`;
- tests de inventario full-v1.

Verificaciones:

```text
npm_test = pass
npm_pack_dry_run = pass
```

