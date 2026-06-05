# GQ-098 - Revisar fase 2 e implementar `init` local-first

- Estado: accepted
- Fuente: decisiones GQ-085, GQ-086, GQ-095, GQ-096 y GQ-097
- Pregunta origen: GQ-098
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: drafts `GW-MVP-008` a `GW-MVP-013`, `packages/cli/src/`, tests de `init`

## Pregunta

Ahora que los drafts de fase 2 existen, que hacemos con ellos?

La duda concreta:

```text
Quieres que haga review completo de GW-MVP-008 a GW-MVP-013
y, si quedan ready, implemente el init local-first?
```

## Por que importa

Fase 2 es la primera fase que cambia el comportamiento real de `gridwork init`. Antes de tocar codigo conviene confirmar que los drafts cubren:

- instalacion nueva;
- reportes;
- lockfile;
- idempotencia;
- conflictos;
- validacion minima;
- `.gitignore`;
- salida de consola;
- e2e en repos temporales.

## Opciones

### Opcion A - Review completo y luego implementar si todo queda ready

Revisar `GW-MVP-008` a `GW-MVP-013` con el checklist comun. Si todos quedan `ready`, implementar fase 2 completa localmente.

Ventajas:

- mantiene el proceso usado en fase 0 y fase 1;
- reduce riesgo antes de tocar el instalador;
- permite implementar una rebanada local-first coherente;
- deja trazabilidad de readiness.

Desventajas:

- es una iteracion grande;
- si algun draft queda flojo, se debe refinar antes de codigo.

### Opcion B - Solo review completo, sin implementar

Revisar los drafts y detenerse.

Ventajas:

- deja claridad sin tocar codigo;
- permite inspeccion manual posterior.

Desventajas:

- `gridwork init` sigue siendo stub.

### Opcion C - Implementar solo GW-MVP-008

Implementar solo la copia local de `factory/.gridwork/` hacia `.gridwork/`.

Ventajas:

- cambio mas pequeno;
- permite probar una instalacion simple temprano.

Desventajas:

- quedaria sin lockfile, reportes completos, idempotencia y conflictos;
- no cumple el DoD e2e de `init`.

### Opcion D - Pausar

No revisar ni implementar fase 2 todavia.

Ventajas:

- permite revisar manualmente los drafts.

Desventajas:

- detiene el MVP antes del primer `init` funcional.

## Respuesta recomendada

Usar Opcion A:

```text
phase_2_strategy = review_full_then_implement_if_ready
review_gw_mvp_008 = true
review_gw_mvp_009 = true
review_gw_mvp_010 = true
review_gw_mvp_011 = true
review_gw_mvp_012 = true
review_gw_mvp_013 = true
implement_phase_2_if_all_ready = true
github_publish_before_phase_2 = false
```

Mi recomendacion es revisar fase 2 completa y despues implementar todo si los seis drafts quedan `ready`. Las piezas estan muy acopladas: instalar sin reportes, lockfile o conflictos no representa el MVP prometido.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 2 completa y la implemente si queda ready,
solo la revise,
implemente solo GW-MVP-008,
o pausemos aqui?
```

Mi recomendacion: review completo de fase 2 y luego implementacion completa si todos los drafts pasan readiness.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_2_strategy = review_full_then_implement_if_ready
review_gw_mvp_008 = true
review_gw_mvp_009 = true
review_gw_mvp_010 = true
review_gw_mvp_011 = true
review_gw_mvp_012 = true
review_gw_mvp_013 = true
implement_phase_2_if_all_ready = true
github_publish_before_phase_2 = false
```

Resultado del review:

```text
gw_mvp_008_readiness = ready
gw_mvp_009_readiness = ready
gw_mvp_010_readiness = ready
gw_mvp_011_readiness = ready
gw_mvp_012_readiness = ready
gw_mvp_013_readiness = ready
phase_2_ready_for_implementation = true
```

## Regla propuesta

```text
Fase 2 no se implementa si algun draft queda needs-refinement o blocked.
Fase 2 no descarga releases ni usa cache remota.
Fase 2 no genera codigo productivo.
Fase 2 debe pasar e2e local-first antes de considerarse completa.
```

## Supuestos

- Fase 0 y fase 1 ya estan implementadas localmente.
- Los drafts `GW-MVP-008` a `GW-MVP-013` existen.
- `factory/.gridwork/` es la fuente local.
- `.gridwork/` y `.gridwork-lock.json` seran versionables en repos destino.

## Riesgos

- Implementar fase 2 parcialmente puede crear un init que parece funcionar pero no protege personalizaciones.
- Tests e2e pueden requerir ajustar helpers de CLI.
- Lockfile y reportes pueden crecer si no se mantienen deterministas.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-2/*.md`
- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/`
- `packages/cli/test/`

## Evidencia y notas

- GQ-097 creo los drafts detallados de fase 2.
- GQ-086 exige DoD e2e para `init`.
- GQ-076 y GQ-077 hacen que lockfile y conflictos sean parte del mismo corte.

## Resultado de implementacion

```text
phase_2_implemented = true
gw_mvp_008_status = implemented
gw_mvp_009_status = implemented
gw_mvp_010_status = implemented
gw_mvp_011_status = implemented
gw_mvp_012_status = implemented
gw_mvp_013_status = implemented
npm_build_passed = true
npm_test_passed = true
npm_pack_dry_run_passed = true
ascii_check_passed = true
github_publish_performed = false
phase_3_implementation_performed = false
```

Archivos creados o actualizados:

- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/constants.ts`
- `packages/cli/src/init/fs-utils.ts`
- `packages/cli/src/init/local-init.ts`
- `packages/cli/test/init-local-first.test.mjs`

Verificaciones ejecutadas:

```text
npm run build
npm test
npm pack -w packages/cli --dry-run
rg -n '[^\x00-\x7F]' . --glob '!node_modules/**' --glob '!packages/*/dist/**' --glob '!.git/**' --glob '!.example/**'
```

Notas de verificacion:

- `npm test` pasa con 14 tests.
- El dry-run del paquete CLI no incluye `factory/.gridwork/`, `.docs/` ni tests.
- `gridwork init` instala local-first desde `factory/.gridwork/`.
- Se crean `.gridwork/`, `.factory/`, `.gridwork-lock.json` y reportes en `.factory/init/<init-run-id>/`.
- Se cubren e2e de instalacion nueva, re-run idempotente, reparacion de archivo faltante, conflicto seguro y flags no soportados.
- No se implemento descarga, zip, cache ni release remoto.
