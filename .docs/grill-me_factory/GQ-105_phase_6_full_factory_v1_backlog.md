# GQ-105 - Detallar fase 6 para expandir la fabrica full-v1

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-013, GQ-047, GQ-058, GQ-059, GQ-060 y GQ-104
- Pregunta origen: GQ-105
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog fase 6, agentes, workflows, skills, stack pack Next.js/Spring Boot/PostgreSQL

## Pregunta

Ahora que el MVP tecnico de distribucion esta cubierto localmente, avanzamos a completar la fabrica full-v1?

La duda concreta:

```text
Quieres que detalle los drafts de fase 6 para expandir agentes,
workflows, skills, policies, templates y stack pack v1?
```

## Por que importa

Las fases 0 a 5 dejaron:

- repositorio fuente;
- fabrica minima;
- `gridwork init`;
- consumo de bundles verificables;
- release publisher de fabrica dry-run;
- publish CLI dry-run.

Pero la fabrica instalada aun es `minimal-mvp`. Fase 6 debe acercarla a la vision original del usuario:

- orquestador completo;
- agentes base;
- workflows de intake, ideation, architecture-ddd, tdd-implementation y verification-pr;
- skills predefinidas;
- stack pack Next.js + Spring Boot + PostgreSQL;
- labels, policies y templates completos;
- observabilidad local.

## Opciones

### Opcion A - Detallar fase 6 sin implementar todavia

Crear drafts por grupos: agentes, workflows, skills, stack pack, policies, templates, observabilidad.

Ventajas:

- evita expandir la fabrica sin orden;
- permite decidir inventario full-v1 antes de codigo;
- mantiene review antes de implementacion.

Desventajas:

- no expande aun la fabrica.

### Opcion B - Detallar e implementar si queda ready

Crear drafts, revisar e implementar full-v1 localmente.

Ventajas:

- acerca Gridwork a la fabrica utilizable real;
- aprovecha que `init` y release tooling ya funcionan.

Desventajas:

- es una fase grande;
- requiere mantener mucha documentacion y contratos.

### Opcion C - Pausar

Detenerse antes de expandir full-v1.

Ventajas:

- permite revisar el MVP tecnico.

Desventajas:

- Gridwork sigue siendo una fabrica minima.

## Respuesta recomendada

Usar Opcion A:

```text
phase_6_strategy = create_detailed_drafts_then_review
implement_phase_6_now = false
full_v1_focus = agents_workflows_skills_stack_pack
```

Mi recomendacion es detallar fase 6 primero. Esta fase ya no es solo infraestructura; define el contenido real de la fabrica, asi que conviene dividirla en slices claros antes de tocar archivos.

## Pregunta para decidir

La duda clave:

```text
Quieres que detalle fase 6 como drafts de backlog,
la detalle y la implemente si queda ready,
o pausemos aqui?
```

Mi recomendacion: crear drafts detallados de fase 6 y revisarlos antes de implementar.

## Decision registrada

El usuario acepta la recomendacion:

```text
phase_6_strategy = create_detailed_drafts_then_review
implement_phase_6_now = false
full_v1_focus = agents_workflows_skills_stack_pack
```

Resultado:

```text
phase_6_drafts_created = true
phase_6_drafts_reviewed = false
phase_6_implementation_performed = false
```

## Regla propuesta

```text
Fase 6 no genera codigo productivo de frontend/backend/database.
Fase 6 expande contratos, prompts, workflows, skills, policies y templates.
Fase 6 mantiene stack pack como guidance predefinida, no scaffold de producto.
Fase 6 debe mantener init sin comando run.
```

## Supuestos

- Fase 0 a fase 5 ya estan implementadas localmente.
- `minimal-mvp` sigue siendo instalable.
- Full-v1 puede agregarse gradualmente manteniendo validacion.

## Riesgos

- Mezclar demasiados agentes/workflows sin contratos claros.
- Generar codigo productivo por accidente.
- Romper `init` minimal-mvp.
- Crear skills demasiado abstractas o inutiles.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/phase-6/`
- `factory/.gridwork/agents/`
- `factory/.gridwork/workflows/`
- `factory/.gridwork/skills/`
- `factory/.gridwork/stack-packs/`
- `factory/.gridwork/policies/`
- `factory/.gridwork/templates/`

## Resultado documental

Drafts creados:

```text
GW-MVP-035 - Definir inventario full-v1 de la fabrica instalada
GW-MVP-036 - Crear contratos full-v1 de agentes base
GW-MVP-037 - Crear playbooks full-v1 de workflows base
GW-MVP-038 - Crear catalogo full-v1 de skills base
GW-MVP-039 - Detallar contrato TDD inspirado en Matt para implementacion AFK
GW-MVP-040 - Crear stack pack guidance Next.js + Spring Boot + PostgreSQL
GW-MVP-041 - Completar policies, permisos, path scopes y labels full-v1
GW-MVP-042 - Completar templates y observabilidad local full-v1
GW-MVP-043 - Validar full-v1 end to end sin generar codigo productivo
```

Archivos creados:

- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-035_full_v1_factory_profile_inventory.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-036_full_v1_agent_contracts.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-037_full_v1_workflow_playbooks.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-038_full_v1_skill_catalog_contracts.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-039_tdd_implementation_matt_inspired_contract.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-040_stack_pack_next_spring_postgres_guidance.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-041_full_v1_policies_permissions_labels.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-042_full_v1_templates_observability.md`
- `.docs/grill-me_factory/backlog/phase-6/GW-MVP-043_full_v1_validation_e2e.md`

Fase 6 queda lista para review en GQ-106.
