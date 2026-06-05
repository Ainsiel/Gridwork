# GQ-096 - Revisar fase 1 e implementar fabrica minima

- Estado: accepted
- Fuente: decisiones GQ-085, GQ-087, GQ-088, GQ-092, GQ-094 y GQ-095
- Pregunta origen: GQ-096
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `factory/.gridwork/`, drafts `GW-MVP-004` a `GW-MVP-007`

## Pregunta

Ahora que fase 0 ya quedo implementada localmente, que hacemos con fase 1?

La duda concreta:

```text
Quieres que hagamos review completo de GW-MVP-004 a GW-MVP-007
y, si pasan el checklist, implementemos la fabrica minima minimal-mvp?
```

## Por que importa

Fase 0 creo el esqueleto fuente: monorepo, CLI TypeScript y CI base. Fase 1 es el primer paso para que Gridwork deje de ser solo una CLI scaffold y empiece a contener la fabrica instalable.

Fase 1 incluye:

```text
GW-MVP-004 - Crear inventario minimal-mvp de factory/.gridwork/
GW-MVP-005 - Crear prompt y contrato minimo del orquestador
GW-MVP-006 - Crear workflow, skill, policies y schemas minimos
GW-MVP-007 - Crear README y QUICKSTART instalados en .gridwork/
```

Estos drafts pasaron auditoria liviana, pero aun no pasaron review completo de readiness.

## Opciones

### Opcion A - Review completo de fase 1 y luego implementar todo si queda ready

Revisar `GW-MVP-004` a `GW-MVP-007` con el checklist completo. Si todos quedan `ready`, implementar fase 1 completa localmente.

Ventajas:

- mantiene disciplina de readiness antes de tocar mas archivos;
- convierte `factory/.gridwork/` en una fabrica minima real;
- deja preparada la base para que `gridwork init` instale contenido util en fases posteriores;
- evita implementar piezas sueltas que dependan entre si.

Desventajas:

- es mas trabajo en una sola iteracion;
- puede requerir ajustar drafts antes de implementar.

### Opcion B - Review completo de fase 1, pero no implementar todavia

Revisar los drafts, marcarlos como `ready` o `needs-refinement`, y detenerse antes de editar `factory/.gridwork/`.

Ventajas:

- reduce riesgo de cambios grandes;
- deja decisiones cerradas antes de implementar;
- permite revisar manualmente el plan.

Desventajas:

- Gridwork seguiria sin fabrica minima real;
- agrega un ciclo adicional antes de avanzar.

### Opcion C - Implementar solo GW-MVP-004

Crear solo el inventario `minimal-mvp` de `factory/.gridwork/`.

Ventajas:

- cambio mas pequeno;
- permite validar layout antes de crear contratos internos.

Desventajas:

- deja orquestador, workflow, skill, policies, schemas y quickstart para despues;
- puede producir una fabrica incompleta que aun no se puede leer comodamente desde un agente.

### Opcion D - Pausar fase 1

No revisar ni implementar fase 1 todavia.

Ventajas:

- permite inspeccionar fase 0 primero;
- evita agregar mas alcance.

Desventajas:

- detiene el avance del MVP;
- no acerca todavia el `init` a instalar una fabrica util.

## Respuesta recomendada

Usar Opcion A:

```text
phase_1_strategy = review_full_then_implement_if_ready
review_gw_mvp_004 = true
review_gw_mvp_005 = true
review_gw_mvp_006 = true
review_gw_mvp_007 = true
implement_phase_1_if_all_ready = true
github_publish_before_phase_1 = false
```

Mi recomendacion es hacer review completo de fase 1 y despues implementar todo si los cuatro drafts quedan `ready`. Fase 1 tiene alta cohesion: inventario, orquestador minimo, contracts minimos y quickstart se necesitan juntos para que la fabrica instalada sea legible y usable.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 1 completa y la implemente si queda ready,
solo la revise,
implemente solo el inventario,
o pausemos aqui?
```

Mi recomendacion: review completo de fase 1 y luego implementacion completa si todos los drafts pasan readiness.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_1_strategy = review_full_then_implement_if_ready
review_gw_mvp_004 = true
review_gw_mvp_005 = true
review_gw_mvp_006 = true
review_gw_mvp_007 = true
implement_phase_1_if_all_ready = true
github_publish_before_phase_1 = false
```

Resultado del review:

```text
gw_mvp_004_readiness = ready
gw_mvp_005_readiness = ready
gw_mvp_006_readiness = ready
gw_mvp_007_readiness = ready
phase_1_ready_for_implementation = true
```

## Regla propuesta

```text
Fase 1 no se implementa si algun draft queda needs-refinement o blocked.
No se publica GitHub antes de fase 1.
No se implementa descarga, verificacion de bundles ni lockfile todavia.
La fabrica minima no genera codigo productivo de apps externas.
```

## Supuestos

- Fase 0 ya esta implementada localmente.
- `factory/.gridwork/` existe como raiz fuente de la fabrica instalable.
- La fabrica minima debe ser documentacion/contratos/policies, no codigo productivo de frontend, backend, database ni docker.

## Riesgos

- Implementar contratos demasiado grandes para `minimal-mvp`.
- Mezclar `minimal-mvp` con alcance `full-v1`.
- Crear schemas o policies mas estrictos que lo que el orquestador minimo necesita.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-004_minimal_factory_inventory.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-005_orchestrator_prompt_contract.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-006_minimal_workflow_skill_policies_schemas.md`
- `.docs/grill-me_factory/backlog/phase-1/GW-MVP-007_installed_readme_quickstart.md`
- `factory/.gridwork/`

## Evidencia y notas

- Fase 1 fue auditada livianamente en GQ-094.
- GQ-095 implemento fase 0 y dejo el repo fuente listo.
- Esta pregunta decide si pasamos de scaffold fuente a fabrica minima instalable.

## Resultado de implementacion

```text
phase_1_implemented = true
gw_mvp_004_status = implemented
gw_mvp_005_status = implemented
gw_mvp_006_status = implemented
gw_mvp_007_status = implemented
npm_test_passed = true
npm_pack_dry_run_passed = true
ascii_check_passed = true
github_publish_performed = false
phase_2_implementation_performed = false
```

Archivos creados o actualizados:

- `factory/.gridwork/factory.json`
- `factory/.gridwork/README.md`
- `factory/.gridwork/QUICKSTART.md`
- `factory/.gridwork/agents/orchestrator/PROMPT.md`
- `factory/.gridwork/agents/orchestrator/AGENT.md`
- `factory/.gridwork/agents/orchestrator/agent.json`
- `factory/.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `factory/.gridwork/workflows/intake-existing-code/workflow.json`
- `factory/.gridwork/skills/handoff/SKILL.md`
- `factory/.gridwork/skills/handoff/skill.json`
- `factory/.gridwork/policies/security-policy.md`
- `factory/.gridwork/policies/logging-policy.md`
- `factory/.gridwork/policies/github-cli-policy.md`
- `factory/.gridwork/policies/path-scopes.md`
- `factory/.gridwork/schemas/*.schema.json`
- `factory/.gridwork/templates/*.md`
- `packages/cli/test/factory-inventory.test.mjs`
- `packages/cli/package.json`

Verificaciones ejecutadas:

```text
npm test
npm pack -w packages/cli --dry-run
rg -n '[^\x00-\x7F]' . --glob '!node_modules/**' --glob '!packages/*/dist/**' --glob '!.git/**' --glob '!.example/**'
```

Notas de verificacion:

- `npm test` pasa con 8 tests.
- El dry-run final del paquete CLI no incluye `factory/.gridwork/`, `.docs/` ni tests.
- No se generaron carpetas de producto `frontend/`, `backend/`, `database/` ni `docker/`.
- No se implemento `gridwork init` real todavia.
