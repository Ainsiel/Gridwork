# GQ-093 - Estrategia para iniciar la implementacion del MVP

- Estado: accepted
- Fuente: decisiones GQ-085, GQ-089, GQ-090, GQ-091 y GQ-092
- Pregunta origen: GQ-093
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog local, review report, publish plan, fase 0, implementacion inicial del monorepo

## Pregunta

Como se debe iniciar la implementacion real del MVP despues de tener drafts y review report?

La duda concreta:

```text
Publicamos primero issues en GitHub,
implementamos fase 0 desde drafts locales,
o revisamos y marcamos ready antes de cualquier implementacion?
```

## Por que importa

Ya existe un backlog local inicial, pero aun no hay review de readiness. Tambien se decidio que GitHub publishing requiere approval y drafts `ready`.

La siguiente decision define si Gridwork pasa a implementacion local, publica issues o sigue refinando backlog.

## Opciones

### Opcion A - Publicar issues GitHub primero

Revisar rapidamente, publicar el lote y empezar desde GitHub.

Ventajas:

- GitHub queda como fuente visible de trabajo;
- facilita seguimiento externo;
- encaja con `github-issue-discovery`.

Desventajas:

- requiere repo y labels listas;
- requiere approval;
- puede publicar demasiado pronto;
- bloquea avance si aun no queremos usar GitHub.

### Opcion B - Implementar fase 0 desde drafts locales

Usar los drafts locales como guia y empezar por `GW-MVP-001` a `GW-MVP-003`.

Ventajas:

- permite avanzar sin GitHub;
- fase 0 prepara el repo para CI, CLI y publicacion futura;
- evita publicar issues antes de que el monorepo exista bien;
- mantiene trazabilidad local.

Desventajas:

- GitHub no tendra issues aun;
- hay que documentar excepcion si se implementa antes de marcar `ready`;
- requiere disciplina para no saltar fases.

### Opcion C - Primero ejecutar review y marcar readiness

Completar `review-report.md`, marcar drafts `ready` o `needs-refinement`, y despues decidir publicar o implementar.

Ventajas:

- respeta GQ-092;
- evita implementar drafts incompletos;
- deja evidencia clara;
- permite publicar o implementar con menos ambiguedad.

Desventajas:

- agrega un paso antes de tocar codigo;
- puede sentirse lento si los drafts ya son suficientemente claros.

## Respuesta recomendada

Usar Opcion C primero, y luego Opcion B:

```text
implementation_start_strategy = review_then_implement_phase_0_locally
```

Primero completar el review del lote y marcar `GW-MVP-001` a `GW-MVP-003` como `ready` si pasan checklist. Despues implementar fase 0 localmente desde drafts, sin publicar GitHub todavia. Publicar issues puede esperar hasta que el repo fuente y el catalogo de labels esten listos.

## Propuesta inicial

```text
implementation_start_strategy = review_then_implement_phase_0_locally
github_publish_before_phase_0 = false
phase_0_requires_ready_drafts = true
phase_0_can_start_without_github_issues = true
phase_0_implementation_source = .docs/grill-me_factory/backlog/phase-0/
phase_0_first_draft = GW-MVP-001
github_publish_revisited_after_phase_0 = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres publicar issues primero,
empezar a implementar fase 0 desde drafts locales,
o hacer primero el review de readiness y luego implementar fase 0 localmente?
```

Mi recomendacion: hacer primero el review de readiness y luego implementar fase 0 localmente, sin publicar GitHub todavia.

## Respuesta del usuario

El usuario acepta la recomendacion:

- primero ejecutar el review de readiness;
- marcar `GW-MVP-001`, `GW-MVP-002` y `GW-MVP-003` como `ready` solo si pasan checklist;
- despues implementar fase 0 localmente desde drafts;
- no publicar issues en GitHub antes de fase 0;
- usar `.docs/grill-me_factory/backlog/phase-0/` como fuente de implementacion;
- retomar publicacion GitHub despues de fase 0.

## Decision registrada

```text
implementation_start_strategy = review_then_implement_phase_0_locally
github_publish_before_phase_0 = false
phase_0_requires_ready_drafts = true
phase_0_can_start_without_github_issues = true
phase_0_implementation_source = .docs/grill-me_factory/backlog/phase-0/
phase_0_first_draft = GW-MVP-001
github_publish_revisited_after_phase_0 = true
```

## Regla

```text
No se implementa fase 0 desde drafts no revisados.
No se publican issues GitHub antes de fase 0.
Primero se completa el review de readiness.
Despues se implementa fase 0 localmente desde `GW-MVP-001` a `GW-MVP-003`.
La publicacion GitHub se retoma despues de tener monorepo/CLI/CI base.
```

## Supuestos

- El usuario quiere conservar trazabilidad.
- No hace falta publicar GitHub antes de tener monorepo y CLI package base.
- Fase 0 es habilitante y puede trabajarse localmente.
- El publish plan se retomara despues.

## Riesgos

- Implementar sin review puede llevar a trabajo ambiguo.
- Publicar antes de tiempo puede llenar GitHub de issues inmaduras.
- Posponer demasiado GitHub puede alejarse del modelo de issues.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/review-report.md`
- `.docs/grill-me_factory/backlog/phase-0/*.md`
- `package.json`
- `packages/cli/`
- `.github/workflows/ci.yml`

## Evidencia y notas

- Esta pregunta prepara el paso desde diseno/documentacion hacia implementacion real.
- Complementa GQ-092: no se debe implementar sin readiness o excepcion.
- Complementa GQ-085: fase 0 es el primer paso del roadmap MVP.
- Decision del usuario: aceptar review primero, implementacion local de fase 0 despues, sin publicar GitHub todavia.
