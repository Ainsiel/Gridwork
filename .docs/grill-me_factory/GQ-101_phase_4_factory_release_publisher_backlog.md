# GQ-101 - Detallar fase 4 para publicar release de fabrica

- Estado: accepted
- Fuente: decisiones GQ-065, GQ-068, GQ-081, GQ-099 y GQ-100
- Pregunta origen: GQ-101
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog fase 4, skill `gridwork-release-publisher`, contrato de bundles

## Pregunta

Ahora que `init` puede consumir un bundle verificable desde GitHub Releases, que hacemos con fase 4?

La duda concreta:

```text
Quieres que detalle los drafts de fase 4 para crear la skill y proceso
que empaqueta `factory/.gridwork/` como release consumible por `gridwork init`?
```

## Por que importa

Fase 3 consume releases, pero aun no existe un flujo local para producirlas. Fase 4 debe definir como crear:

- zip `gridwork-factory-v<version>.zip`;
- manifest `gridwork-factory-v<version>.manifest.json`;
- checksums `gridwork-factory-v<version>.sha256`;
- release notes;
- publish plan con comandos `gh release create`;
- approval gate antes de tag/release real.

## Opciones

### Opcion A - Detallar fase 4 sin implementar todavia

Crear drafts `GW-MVP-021+` para release publisher, bundle builder, manifest/checksums, dry-run y publish plan.

Ventajas:

- mantiene el ritmo de backlog primero;
- permite revisar el contrato antes de publicar nada;
- evita crear tags/releases reales por accidente.

Desventajas:

- no produce todavia una release consumible.

### Opcion B - Detallar y luego implementar si queda ready

Crear los drafts, hacer review y, si quedan listos, implementar la skill/proceso local de release.

Ventajas:

- deja a Gridwork cerca de una release real;
- conecta directamente con lo que fase 3 ya puede consumir.

Desventajas:

- es una fase sensible porque puede preparar acciones de tag/release;
- requiere approval gates muy claros.

### Opcion C - Pausar fase 4 y avanzar a npm publish

Saltar a fase 5.

Ventajas:

- enfoca el paquete `npx`.

Desventajas:

- el CLI publicado no tendria una release de fabrica lista para consumir.

## Respuesta recomendada

Usar Opcion A por ahora:

```text
phase_4_strategy = create_detailed_drafts_then_review
implement_phase_4_now = false
github_release_publish_now = false
```

Mi recomendacion es detallar fase 4 primero y no publicar nada real todavia. El siguiente paso natural es que `gridwork-release-publisher` prepare artefactos y un publish plan, pero cualquier `gh release create` debe quedar bloqueado por aprobacion explicita.

## Pregunta para decidir

La duda clave:

```text
Quieres que detalle fase 4 como drafts de backlog,
la detalle y la implemente si queda ready,
o prefieres pausar fase 4?
```

Mi recomendacion: crear los drafts detallados de fase 4 y revisarlos antes de implementar.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_4_strategy = create_detailed_drafts_then_review
implement_phase_4_now = false
github_release_publish_now = false
phase_4_focus = factory_release_publisher
```

Resultado:

```text
phase_4_drafts_created = true
phase_4_drafts_reviewed = false
phase_4_implementation_performed = false
github_release_publish_performed = false
```

## Regla propuesta

```text
Fase 4 no publica tags ni releases reales sin aprobacion explicita.
Fase 4 debe poder correr en dry-run local.
Fase 4 debe producir artefactos compatibles con fase 3.
Fase 4 no debe escribir secretos en reportes.
```

## Supuestos

- Fase 3 ya consume bundles verificables.
- El repo fuente usa npm workspaces y Node >=20.
- El publish real se hara con GitHub CLI bajo approval gate.

## Riesgos

- Crear tags/releases reales antes de revisar.
- Producir manifest que no coincida con lo que `init` verifica.
- Mezclar publish npm con publish de fabrica.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/phase-4/`
- `.docs/grill-me_factory/backlog/phase-index.md`
- `.docs/grill-me_factory/backlog/review-report.md`
- posible skill `factory/.gridwork/skills/gridwork-release-publisher/`

## Resultado documental

Drafts creados:

```text
GW-MVP-021 - Alinear contrato productor-consumidor de release de fabrica
GW-MVP-022 - Crear contrato de skill gridwork-release-publisher
GW-MVP-023 - Construir bundle de fabrica en dry-run local
GW-MVP-024 - Generar manifest, checksums y release notes
GW-MVP-025 - Validar bundle de release antes de publicar
GW-MVP-026 - Preparar publish plan y approval gate
GW-MVP-027 - Probar gridwork-release-publisher end to end en dry-run
```

Archivos creados:

- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-021_factory_release_contract_alignment.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-022_gridwork_release_publisher_skill_contract.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-023_build_factory_bundle_dry_run.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-024_generate_manifest_checksums_notes.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-025_validate_release_bundle_before_publish.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-026_prepare_publish_plan_and_approval_gate.md`
- `.docs/grill-me_factory/backlog/phase-4/GW-MVP-027_factory_release_publisher_e2e.md`

Nota de review:

```text
known_review_item = resolve_factory_tag_contract
```

Los drafts dejaron explicito el punto a resolver antes de implementar: decisiones anteriores usaban `factory-v<version>`, mientras la implementacion inicial de fase 3 consumia `v<version>`. GQ-102 resolvio el contrato: el tag canonical de fabrica es `factory-v<version>`.
