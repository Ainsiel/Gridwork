# GQ-102 - Revisar fase 4 e implementar release publisher

- Estado: accepted
- Fuente: decisiones GQ-065, GQ-068, GQ-081, GQ-100 y GQ-101
- Pregunta origen: GQ-102
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: drafts `GW-MVP-021` a `GW-MVP-027`, skill `gridwork-release-publisher`, release builder, publish plan

## Pregunta

Ahora que los drafts de fase 4 existen, que hacemos con ellos?

La duda concreta:

```text
Quieres que haga review completo de GW-MVP-021 a GW-MVP-027,
resuelva el contrato de tag/assets y, si quedan ready,
implemente el release publisher en modo dry-run/plan?
```

## Por que importa

Fase 4 prepara el primer release consumible de la fabrica. Es sensible porque puede acercarnos a comandos reales:

- `git tag`;
- `git push`;
- `gh release create`;
- upload de assets;
- versionado SemVer;
- prerelease;
- source oficial embebido.

Tambien habia un punto conocido: decisiones anteriores usan tag `factory-v<version>`, mientras fase 3 consumia `v<version>`. Antes de publicar o implementar el publisher, este contrato debia quedar alineado.

## Opciones

### Opcion A - Review completo, resolver contrato e implementar si queda ready

Revisar `GW-MVP-021` a `GW-MVP-027`, cerrar el contrato de tag/assets, marcar drafts `ready` si pasan, e implementar fase 4 en modo local dry-run/plan.

Ventajas:

- conecta productor y consumidor;
- evita publicar releases incompatibles;
- mantiene approvals antes de acciones remotas;
- deja a Gridwork cerca de una release real.

Desventajas:

- es una iteracion grande;
- requiere decidir el tag canonical antes de codigo.

### Opcion B - Solo review y refinamiento

Revisar los drafts, resolver el contrato, pero no implementar todavia.

Ventajas:

- baja riesgo;
- deja el diseno claro.

Desventajas:

- no produce aun bundle ni release plan.

### Opcion C - Implementar solo alineacion de contrato

Resolver `factory-v<version>` vs `v<version>` en docs/tests/codigo, y detenerse.

Ventajas:

- cambio pequeno;
- elimina el bloqueo principal.

Desventajas:

- no crea release publisher ni bundle builder.

### Opcion D - Pausar

No revisar ni implementar fase 4 todavia.

Ventajas:

- permite inspeccion manual.

Desventajas:

- Gridwork puede consumir releases, pero aun no producirlos.

## Respuesta recomendada

Usar Opcion A, con una condicion:

```text
phase_4_strategy = review_full_resolve_contract_then_implement_if_ready
resolve_factory_tag_contract_first = true
implementation_mode = dry_run_and_plan_only
github_release_publish_now = false
```

Mi recomendacion es revisar fase 4 completa, resolver primero el contrato de tag/assets y despues implementar solo el modo seguro: generar bundle, manifest, checksums, notes, validacion y publish plan. No publicar releases reales en esta fase.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 4 completa y la implemente en modo dry-run/plan
si queda ready,
solo la revise,
implemente solo la alineacion del contrato,
o pausemos aqui?
```

Mi recomendacion: review completo, resolver contrato y luego implementacion dry-run/plan si todos los drafts quedan `ready`.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_4_strategy = review_full_resolve_contract_then_implement_if_ready
resolve_factory_tag_contract_first = true
canonical_factory_tag = factory-v<version>
implementation_mode = dry_run_and_plan_only
github_release_publish_now = false
phase_4_implementation_completed = true
```

Resultado:

```text
review_gw_mvp_021 = completed
review_gw_mvp_022 = completed
review_gw_mvp_023 = completed
review_gw_mvp_024 = completed
review_gw_mvp_025 = completed
review_gw_mvp_026 = completed
review_gw_mvp_027 = completed
phase_4_drafts_ready = true
github_release_publish_performed = false
```

## Regla propuesta

```text
Fase 4 no ejecuta git tag, git push ni gh release create sin aprobacion explicita.
Fase 4 no publica GitHub Release real durante implementacion local.
Fase 4 debe probar que el bundle generado se instala con fase 3.
Fase 4 debe bloquear si source oficial sigue placeholder.
Fase 4 debe resolver el tag canonical antes de publicar.
```

## Supuestos

- Fase 3 ya instala bundles verificables.
- Fase 4 puede usar fixtures locales y servidor HTTP local para tests.
- El publish real se deja para una decision posterior.

## Riesgos

- Implementar publisher sin alinear tag/assets.
- Ejecutar comandos remotos por accidente.
- Generar un manifest distinto al que fase 3 verifica.
- Mezclar release de fabrica con publish npm.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-4/*.md`
- `packages/cli/src/init/remote-init.ts`
- `packages/cli/src/release/`
- `factory/.gridwork/skills/gridwork-release-publisher/`
- `factory/.gridwork/templates/`

## Evidencia y notas

- GQ-101 creo los drafts detallados de fase 4.
- GQ-065 define approvals y autoridad de la skill.
- GQ-081 define publicacion v1 por `gh release create` bajo approval.
- GQ-100 implemento consumo remoto verificable.
- Implementacion: `gridwork release factory --dry-run --factory-version <version> --source owner/repo --source-commit <sha>`.
- Fase 4 genera ZIP, manifest, checksums, release notes, validation report y publish plan.
- Fase 4 no ejecuto `git tag`, `git push` ni `gh release create`.
- Tests: `npm test` paso con 20 tests.
