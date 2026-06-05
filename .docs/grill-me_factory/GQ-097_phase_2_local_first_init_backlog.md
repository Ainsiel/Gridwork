# GQ-097 - Detallar fase 2 para `gridwork init` local-first

- Estado: accepted
- Fuente: decisiones GQ-064, GQ-074, GQ-075, GQ-076, GQ-077, GQ-085, GQ-086, GQ-087, GQ-088, GQ-095 y GQ-096
- Pregunta origen: GQ-097
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog fase 2, `packages/cli/src/`, `factory/.gridwork/`, `.gridwork-lock.json`, `.factory/init/`

## Pregunta

Ahora que fase 0 y fase 1 ya quedaron implementadas localmente, como avanzamos hacia `gridwork init` real?

La duda concreta:

```text
Quieres que detallemos fase 2 en drafts implementables antes de tocar el init,
o prefieres implementar directamente el init local-first?
```

## Por que importa

Fase 2 es el primer comportamiento real de la CLI. Hasta ahora `gridwork init` solo reconoce el comando. La siguiente rebanada debe hacer que el CLI instale o repare una fabrica local desde `factory/.gridwork/` hacia `.gridwork/`, sin descargar releases todavia.

Esta fase debe cuidar:

- idempotencia;
- no sobrescribir personalizaciones;
- reportes en `.factory/init/`;
- `.gridwork-lock.json`;
- validacion minima;
- actualizacion de `.gitignore`;
- mensajes de consola;
- ausencia de codigo productivo generado.

## Opciones

### Opcion A - Crear drafts detallados de fase 2 y revisarlos antes de implementar

Crear un lote `phase-2/` con drafts detallados para el `init` local-first, luego revisarlos con el checklist comun.

Ventajas:

- mantiene el proceso de readiness que ya funciono en fases 0 y 1;
- evita meter demasiadas reglas en una sola implementacion;
- permite separar instalacion, lockfile, reportes, conflictos y validacion;
- deja mejor trazabilidad para publicar issues despues.

Desventajas:

- agrega una iteracion documental antes de escribir mas codigo;
- retrasa un poco el primer `init` funcional.

### Opcion B - Implementar directamente `gridwork init` local-first

Usar las decisiones GQ existentes y escribir el init real sin drafts nuevos.

Ventajas:

- avance rapido hacia un CLI util;
- reduce documentacion intermedia.

Desventajas:

- riesgo alto de mezclar descarga, lockfile, conflictos y validacion;
- podria romper reglas de no overwrite;
- menos trazabilidad para issues futuras.

### Opcion C - Publicar issues de fase 0 y fase 1 antes de fase 2

Usar `github-issue-publisher` despues de aprobar un publish plan.

Ventajas:

- deja backlog remoto visible;
- permite trazabilidad con GitHub.

Desventajas:

- no desbloquea `init`;
- requiere definir repo destino y approvals;
- fase 0 y 1 ya estan implementadas localmente.

### Opcion D - Pausar

Detener el avance despues de la fabrica minima.

Ventajas:

- permite revisar manualmente lo creado.

Desventajas:

- `npx gridwork init` sigue sin instalar la fabrica real.

## Respuesta recomendada

Usar Opcion A:

```text
phase_2_strategy = create_detailed_drafts_then_review
implement_phase_2_now = false
github_publish_before_phase_2 = false
phase_2_focus = local_first_init
```

Mi recomendacion es crear primero drafts detallados de fase 2. Esta fase ya toca comportamiento real de instalacion y reglas de no sobrescritura, asi que conviene dividirla antes de implementar.

## Drafts sugeridos para fase 2

```text
GW-MVP-008 - Copiar fabrica minima desde source a .gridwork/
GW-MVP-009 - Crear reportes locales de init en .factory/init/
GW-MVP-010 - Crear .gridwork-lock.json con hashes por archivo
GW-MVP-011 - Implementar idempotencia y estrategia de conflictos
GW-MVP-012 - Validar inventario minimal-mvp durante init
GW-MVP-013 - Actualizar .gitignore y salida de consola de init
```

## Pregunta para decidir

La duda clave:

```text
Quieres que cree el lote de drafts detallados de fase 2,
que implemente init directamente,
que publiquemos issues primero,
o que pausemos aqui?
```

Mi recomendacion: crear los drafts detallados de fase 2 y revisarlos antes de implementar.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_2_strategy = create_detailed_drafts_then_review
implement_phase_2_now = false
github_publish_before_phase_2 = false
phase_2_focus = local_first_init
```

Resultado:

```text
phase_2_drafts_created = true
phase_2_drafts_reviewed = false
phase_2_implementation_performed = false
```

## Regla propuesta

```text
Fase 2 no se implementa sin drafts detallados y review de readiness.
Fase 2 no descarga releases todavia.
Fase 2 instala desde la fabrica fuente local.
Fase 2 no genera codigo productivo.
Fase 2 debe producir reportes locales en .factory/init/.
```

## Supuestos

- Fase 0 y fase 1 ya estan implementadas localmente.
- `factory/.gridwork/` es la fuente local de la fabrica minima.
- `.gridwork/` en el repo destino sera la carpeta instalada.
- `.factory/` queda como runtime local ignorado.

## Riesgos

- Implementar init sin separar responsabilidades puede crear una funcion grande y dificil de testear.
- No modelar conflictos puede sobrescribir personalizaciones.
- No crear lockfile puede hacer imposible detectar cambios manuales.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/phase-2/`
- `.docs/grill-me_factory/backlog/phase-index.md`
- `.docs/grill-me_factory/backlog/review-report.md`
- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/`
- `packages/cli/test/`

## Evidencia y notas

- GQ-096 implemento `minimal-mvp`.
- GQ-086 define DoD e2e de `init`.
- GQ-074 define salida, errores y exit codes.
- GQ-076 define estrategia de no overwrite.
- GQ-077 define lockfile.

## Resultado documental

Drafts creados:

```text
GW-MVP-008 - Copiar fabrica minima desde source a .gridwork/
GW-MVP-009 - Crear reportes locales de init en .factory/init/
GW-MVP-010 - Crear .gridwork-lock.json con hashes por archivo
GW-MVP-011 - Implementar idempotencia y estrategia de conflictos
GW-MVP-012 - Validar inventario minimal-mvp durante init
GW-MVP-013 - Actualizar .gitignore y salida de consola de init
```

Archivos creados:

- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-008_local_init_copy_minimal_factory.md`
- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-009_init_reports_runtime.md`
- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-010_gridwork_lockfile_hashes.md`
- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-011_init_idempotency_conflicts.md`
- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-012_init_minimal_validation.md`
- `.docs/grill-me_factory/backlog/phase-2/GW-MVP-013_init_gitignore_console_output.md`

Regla mantenida:

```text
No se implementa codigo de fase 2 sin review de readiness.
```
