# GQ-100 - Revisar fase 3 e implementar bundle verificable

- Estado: accepted
- Fuente: decisiones GQ-086, GQ-098 y GQ-099
- Pregunta origen: GQ-100
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: drafts `GW-MVP-014` a `GW-MVP-020`, `packages/cli/src/init/`, tests de bundle/cache

## Pregunta

Ahora que los drafts de fase 3 existen, que hacemos con ellos?

La duda concreta:

```text
Quieres que haga review completo de GW-MVP-014 a GW-MVP-020
y, si quedan ready, implemente bundle, descarga, verificacion y cache?
```

## Por que importa

Fase 3 introduce red, assets remotos, checksums, zip, staging y cache. Antes de tocar codigo conviene confirmar que los drafts cubren:

- source resolution;
- descarga sin `gh`;
- manifest y SHA256;
- compatibilidad estricta;
- zip seguro;
- staging;
- apply seguro reutilizando fase 2;
- cache local verificada;
- fallos seguros e2e.

## Opciones

### Opcion A - Review completo y luego implementar si todo queda ready

Revisar `GW-MVP-014` a `GW-MVP-020` con el checklist comun. Si todos quedan `ready`, implementar fase 3 completa localmente.

Ventajas:

- mantiene disciplina de readiness;
- reduce riesgos de supply chain;
- evita meter red, zip y cache en una sola bola opaca;
- permite auditar dependencia zip antes de adoptarla.

Desventajas:

- es una iteracion grande;
- puede requerir refinar algun draft antes de codigo.

### Opcion B - Solo review completo, sin implementar

Revisar los drafts y detenerse.

Ventajas:

- deja claridad sin tocar codigo;
- permite inspeccion manual posterior.

Desventajas:

- Gridwork seguiria sin instalar desde release verificable.

### Opcion C - Implementar solo source resolution

Implementar `GW-MVP-014` primero.

Ventajas:

- cambio mas pequeno;
- permite preparar flags y lockfile antes de red.

Desventajas:

- no valida bundle, zip ni cache;
- no entrega fase 3 completa.

### Opcion D - Pausar

No revisar ni implementar fase 3 todavia.

Ventajas:

- permite revisar fase 2 y los drafts nuevos.

Desventajas:

- detiene el MVP antes de releases verificables.

## Respuesta recomendada

Usar Opcion A:

```text
phase_3_strategy = review_full_then_implement_if_ready
review_gw_mvp_014 = true
review_gw_mvp_015 = true
review_gw_mvp_016 = true
review_gw_mvp_017 = true
review_gw_mvp_018 = true
review_gw_mvp_019 = true
review_gw_mvp_020 = true
implement_phase_3_if_all_ready = true
github_publish_before_phase_3 = false
```

Mi recomendacion es revisar fase 3 completa y despues implementar todo si los siete drafts quedan `ready`. Esta fase tiene piezas muy dependientes: descargar sin verificar, o extraer sin staging, no seria una rebanada segura.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 3 completa y la implemente si queda ready,
solo la revise,
implemente solo source resolution,
o pausemos aqui?
```

Mi recomendacion: review completo de fase 3 y luego implementacion completa si todos los drafts pasan readiness.

## Decision registrada

```text
phase_3_strategy = review_full_then_implement_if_ready
review_gw_mvp_014 = completed
review_gw_mvp_015 = completed
review_gw_mvp_016 = completed
review_gw_mvp_017 = completed
review_gw_mvp_018 = completed
review_gw_mvp_019 = completed
review_gw_mvp_020 = completed
implement_phase_3_if_all_ready = true
phase_3_implementation_completed = true
github_publish_before_phase_3 = false
```

El usuario continuo el grill-me y se tomo la recomendacion como aprobacion de la opcion A. Los siete drafts de fase 3 pasaron readiness y se implementaron localmente.

## Regla propuesta

```text
Fase 3 no se implementa si algun draft queda needs-refinement o blocked.
Fase 3 no publica releases reales.
Fase 3 debe usar fixtures o mocks para tests sin depender de GitHub real.
Fase 3 no imprime ni escribe secretos.
Fase 3 debe mantener el no-overwrite y lockfile de fase 2.
```

## Supuestos

- Fase 2 ya implemento `gridwork init` local-first.
- Fase 3 puede usar fixtures locales para pruebas.
- GitHub Releases real se integra como cliente HTTP, pero tests no dependen de red real.
- La dependencia zip se elige durante implementacion con mini auditoria.

## Riesgos

- Tests de red reales serian fragiles.
- Una dependencia zip mal elegida puede introducir riesgo.
- Cache mal validada puede instalar assets corruptos.
- Compatibilidad tratada como warning podria instalar fabrica rota.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-3/*.md`
- `packages/cli/src/init/`
- `packages/cli/test/`

## Evidencia y notas

- GQ-099 creo los drafts detallados de fase 3.
- GQ-086 exige DoD e2e de fallo seguro.
- GQ-075 exige zip seguro con dependencia minima auditada.
- Implementacion: `gridwork init --factory-version <version> --source owner/repo` descarga, verifica, extrae a staging y aplica con el flujo seguro existente.
- Dependencia zip elegida: `fflate`.
- Tests: `npm test` paso con 17 tests.
- Pack: `npm pack -w packages/cli --dry-run` paso.
- No se publico GitHub Release real ni paquete npm.
