# GQ-059 - Grill-me de `architecture-ddd`

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-025, GQ-026, GQ-027, GQ-042, GQ-047, GQ-048, GQ-049 y GQ-058
- Pregunta origen: GQ-059
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/architecture-ddd/`, `.gridwork/skills/html-architecture-diagrams/`, `.gridwork/templates/`, `.factory/runs/<run-id>/artifacts/architecture/`, `docs/architecture/`

## Pregunta

Como debe funcionar el grill-me de `architecture-ddd` despues de leer el SDD aprobado, para disenar el sistema con Domain Driven Design sin saltar prematuramente a codigo, tablas o endpoints?

## Por que importa

El SDD define lo que el sistema debe lograr. `architecture-ddd` debe transformar esos requisitos en un diseno tecnico coherente:

```text
SDD aprobado -> modelo de dominio -> arquitectura -> ADRs -> insumos para backlog-planning
```

Si este flujo mezcla demasiado pronto tecnologia, tablas, endpoints y backlog, se puede perder el foco DDD. Si se queda solo en conceptos, luego el backlog no tendra suficiente precision para crear vertical slices implementables.

## Respuesta recomendada

Usar un grill-me en dos pasadas:

```text
pasada 1 = diseno de dominio DDD
pasada 2 = mapeo tecnico y decisiones arquitectonicas
```

La primera pasada fuerza claridad del dominio antes de hablar de implementacion. La segunda aterriza el modelo a stack, APIs, datos, seguridad, testing, observabilidad y ADRs.

## Fases recomendadas

### 0. Readiness check del SDD

Objetivo: confirmar que el SDD tiene suficiente informacion.

El workflow debe revisar:

- casos de uso;
- casos de prueba;
- requisitos funcionales;
- requisitos no funcionales;
- restricciones;
- actores;
- reglas de negocio;
- matriz de trazabilidad.

Si faltan datos esenciales, debe volver a `ideation-from-zero` o pedir aclaraciones antes de continuar.

Output:

```text
.factory/runs/<run-id>/artifacts/architecture/sdd-readiness-check.md
```

### 1. Strategic DDD

Objetivo: entender el dominio y sus limites.

Preguntas tipicas:

- Cuales son los subdominios principales?
- Cual es el core domain?
- Que partes son supporting o generic subdomains?
- Que bounded contexts parecen naturales?
- Donde cambian las reglas, el lenguaje o los actores?
- Que contextos deben comunicarse entre si?

Output:

```text
strategic-ddd.md
bounded-contexts.md
context-map.md
ubiquitous-language.md
```

### 2. Tactical DDD

Objetivo: modelar comportamiento e invariantes sin empezar por tablas.

Preguntas tipicas:

- Que agregados protegen invariantes importantes?
- Que entidades y value objects existen?
- Que reglas pertenecen al dominio y no a la UI?
- Que eventos de dominio ocurren?
- Que comandos cambian estado?
- Que consultas son relevantes?
- Que consistencia transaccional necesita cada agregado?

Output:

```text
domain-model.md
aggregates.md
domain-events.md
commands-and-queries.md
invariants.md
```

### 3. Application architecture

Objetivo: conectar casos de uso con servicios de aplicacion, interfaces y contratos.

Preguntas tipicas:

- Que application services orquestan cada caso de uso?
- Que entrada y salida necesita cada caso?
- Que errores de negocio se deben representar?
- Que permisos o policies aplican?
- Que contratos API hacen falta?
- Que operaciones deben ser sync o async?

Output:

```text
application-services.md
api-design.md
error-model.md
authorization-model.md
```

### 4. Data and persistence design

Objetivo: mapear el dominio a persistencia sin dejar que la base de datos dicte el diseno.

Preguntas tipicas:

- Que repositorios necesita cada agregado?
- Que datos se guardan por contexto?
- Que relaciones son transaccionales?
- Que relaciones son solo referencias?
- Que indices o constraints parecen importantes?
- Que migraciones iniciales serian necesarias?

Output:

```text
data-model.md
persistence-design.md
transaction-boundaries.md
```

### 5. Stack mapping

Objetivo: aterrizar el diseno al stack confirmado sin generar codigo.

Para el stack v1 puede producir guidance para:

- Next.js frontend;
- Spring Boot backend;
- PostgreSQL database;
- Docker Compose local;
- tests por capa;
- estructura modular sugerida.

Output:

```text
stack-mapping.md
module-boundaries.md
testing-strategy.md
```

### 6. Cross-cutting concerns

Objetivo: tomar decisiones que atraviesan el sistema.

Debe cubrir:

- seguridad;
- autenticacion;
- autorizacion;
- auditoria;
- logging;
- observabilidad;
- manejo de errores;
- performance;
- disponibilidad;
- privacidad;
- CI/CD si aplica.

Output:

```text
security-notes.md
observability-notes.md
quality-attributes.md
```

### 7. ADRs

Objetivo: registrar decisiones importantes y sus tradeoffs.

ADRs tipicos:

- estilo arquitectonico;
- division de bounded contexts;
- estrategia de persistencia;
- comunicacion entre contextos;
- modelo de autorizacion;
- estrategia de testing;
- decisiones de CI/CD si afectan arquitectura.

Output:

```text
adr/
  ADR-001-architecture-style.md
  ADR-002-bounded-contexts.md
  ADR-003-persistence-strategy.md
```

### 8. Diagramas HTML

Objetivo: representar graficamente decisiones complejas.

La skill `html-architecture-diagrams` puede generar:

- mapa de contextos;
- modelo de dominios y agregados;
- flujo de casos de uso;
- secuencia frontend/backend/database;
- dependencias entre modulos.

Output:

```text
diagrams/
  context-map.html
  domain-model.html
  system-flow.html
```

### 9. Architecture readiness para backlog

Objetivo: dejar insumos listos para `backlog-planning`.

El workflow debe producir:

- dominios y contextos aprobados;
- boundaries claros;
- lista de vertical slices candidatas;
- dependencias entre slices;
- riesgos de implementacion;
- ADRs requeridos;
- trazabilidad hacia casos de uso y casos de prueba.

Output:

```text
architecture-readiness-check.md
backlog-input-map.md
```

## Modelo recomendado

No mezclar todo en una sola conversacion plana. Usar dos pasadas:

```text
1. DDD primero: lenguaje, dominios, contextos, agregados, reglas.
2. Tecnologia despues: APIs, datos, stack, seguridad, tests, ADRs.
```

Esto permite que el arquitecto de software pregunte con orden y no convierta el diseno en una lista de endpoints.

## Propuesta inicial

```text
architecture_ddd_grill_me_model = two_pass_domain_then_technical
architecture_ddd_requires_approved_sdd = true
architecture_ddd_starts_with_sdd_readiness_check = true
architecture_ddd_pass_1 = strategic_and_tactical_ddd
architecture_ddd_pass_2 = technical_mapping_and_adrs
architecture_ddd_generates_code = false
architecture_ddd_generates_backlog_issues = false
architecture_ddd_outputs_drafts_in_factory = true
architecture_ddd_approved_output_path = docs/architecture/
architecture_ddd_uses_html_diagrams_when_visual_design_needed = true
architecture_ddd_feeds_backlog_planning = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `architecture-ddd` haga un solo grill-me mezclando dominio y tecnologia,
o que use dos pasadas: primero DDD puro y despues mapeo tecnico?
```

Mi recomendacion: dos pasadas. Primero se disena el dominio con DDD; despues se aterriza a APIs, datos, stack, seguridad, testing, diagramas y ADRs.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `architecture-ddd` debe usar dos pasadas.
- La primera pasada debe enfocarse en DDD: lenguaje, subdominios, bounded contexts, agregados, reglas y eventos.
- La segunda pasada debe aterrizar el diseno a APIs, datos, stack, seguridad, testing, diagramas HTML y ADRs.
- El workflow no debe generar codigo ni backlog de issues.
- `backlog-planning` ocurre despues de aprobar la arquitectura.

## Decision registrada

```text
architecture_ddd_grill_me_model = two_pass_domain_then_technical
architecture_ddd_requires_approved_sdd = true
architecture_ddd_starts_with_sdd_readiness_check = true
architecture_ddd_pass_1 = strategic_and_tactical_ddd
architecture_ddd_pass_2 = technical_mapping_and_adrs
architecture_ddd_generates_code = false
architecture_ddd_generates_backlog_issues = false
architecture_ddd_outputs_drafts_in_factory = true
architecture_ddd_approved_output_path = docs/architecture/
architecture_ddd_uses_html_diagrams_when_visual_design_needed = true
architecture_ddd_feeds_backlog_planning = true
```

## Regla

```text
Primero se modela el dominio.
Despues se mapea a tecnologia.
ADRs registran decisiones importantes.
Diagramas HTML representan estructuras complejas.
Backlog-planning empieza solo despues de arquitectura aprobada.
```

## Supuestos

- El SDD aprobado vive en `docs/sdd/`.
- El usuario participa activamente durante el grill-me de arquitectura.
- La arquitectura aprobada se versiona en `docs/architecture/`.
- El workflow no genera codigo productivo.
- `backlog-planning` ocurre despues de aprobar arquitectura.

## Riesgos

- Mezclar dominio y tecnologia desde el inicio puede empujar a un diseno por CRUD.
- Separar demasiado puede producir documentos conceptuales sin bajada tecnica.
- Crear backlog antes de terminar arquitectura puede generar issues mal cortadas.
- No registrar ADRs puede hacer que se pierdan tradeoffs importantes.

## Artefactos a crear o actualizar

- `.gridwork/workflows/architecture-ddd/WORKFLOW.md`
- `.gridwork/templates/strategic-ddd.md`
- `.gridwork/templates/bounded-contexts.md`
- `.gridwork/templates/context-map.md`
- `.gridwork/templates/domain-model.md`
- `.gridwork/templates/aggregates.md`
- `.gridwork/templates/domain-events.md`
- `.gridwork/templates/api-design.md`
- `.gridwork/templates/data-model.md`
- `.gridwork/templates/architecture-readiness-check.md`
- `.gridwork/templates/backlog-input-map.md`
- `.gridwork/templates/adr.md`
- `.gridwork/templates/architecture-diagram.html`
- `.factory/runs/<run-id>/artifacts/architecture/`
- `docs/architecture/`

## Evidencia y notas

- Esta pregunta profundiza GQ-026: ya se decidio que la arquitectura vive en documentos separados con ADRs y diagramas HTML; ahora se decide como se conduce el grill-me.
- La recomendacion mantiene la separacion del pipeline: SDD primero, arquitectura despues, backlog al final.
- Decision del usuario: aceptar dos pasadas, primero DDD y despues mapeo tecnico.
