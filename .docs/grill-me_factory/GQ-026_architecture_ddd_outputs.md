# GQ-026 - Artefactos de `architecture-ddd`

- Estado: accepted
- Fuente: decision GQ-025 sobre SDD aprobado versionado y flujo posterior de arquitectura DDD
- Pregunta origen: GQ-026
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/architecture-ddd/`, `.gridwork/templates/adr.md`, `docs/architecture/`

## Pregunta

Que artefactos debe producir el workflow `architecture-ddd` despues de leer el SDD aprobado?

## Por que importa

El SDD define que debe hacer el sistema. `architecture-ddd` debe definir como se organiza el sistema, sin saltar todavia a implementacion.

Este workflow es clave porque alimenta `backlog-planning`: si la arquitectura no define dominios, bounded contexts, APIs, datos, patrones y decisiones, las issues verticales salen flojas o inconsistentes.

## Respuesta recomendada

`architecture-ddd` debe producir un set de documentos versionados en `docs/architecture/`.

Los drafts durante la conversacion pueden vivir en `.factory/`, pero la arquitectura aprobada debe versionarse porque es especificacion tecnica del proyecto, no log operativo.

Estructura recomendada:

```text
docs/architecture/
  ARCHITECTURE.md
  ubiquitous-language.md
  domain-model.md
  bounded-contexts.md
  context-map.md
  application-services.md
  api-design.md
  data-model.md
  integration-events.md
  testing-strategy.md
  security-notes.md
  diagrams/
    context-map.html
    domain-model.html
    system-flow.html
  adr/
    ADR-001-architecture-style.md
    ADR-002-module-boundaries.md
    ADR-003-database-model.md
```

## Contenido esperado

El workflow debe cubrir:

- lenguaje ubicuo;
- dominios y subdominios;
- bounded contexts;
- context map;
- agregados;
- entidades;
- value objects;
- domain services;
- application services;
- repositorios;
- eventos de dominio/integracion;
- contratos API;
- modelo de datos conceptual;
- limites transaccionales;
- patrones arquitectonicos;
- convenciones del stack Next.js + Spring Boot + PostgreSQL;
- estrategia de testing;
- riesgos;
- graficos HTML cuando el diseno necesite representacion visual;
- ADRs.

## Relacion con DDD

El workflow debe seguir DDD de forma practica:

```text
SDD -> casos de uso -> dominios -> bounded contexts -> agregados -> servicios -> APIs -> datos -> ADRs -> backlog vertical
```

No debe empezar por tablas o endpoints aislados. Primero debe modelar el dominio.

## ADRs

Toda decision arquitectonica importante debe quedar como ADR.

Ejemplos:

- estilo arquitectonico;
- division frontend/backend;
- limites de bounded contexts;
- patrones de persistencia;
- manejo de transacciones;
- comunicacion entre dominios;
- estrategia de autenticacion/autorizacion;
- convenciones de testing;
- decisiones de CI/CD si aplica.

## Graficos HTML

Si un artefacto de arquitectura incluye un diseño visual, el grafico debe crearse como HTML para mejorar su representacion, navegacion e inspeccion.

Ejemplos de graficos HTML:

- context map;
- mapa de bounded contexts;
- modelo de dominios y agregados;
- flujo de casos de uso;
- secuencia entre frontend, backend y base de datos;
- dependencias entre modulos;
- vista de APIs y contratos.

Los graficos HTML aprobados viven versionados en:

```text
docs/architecture/diagrams/
```

Puede existir una skill especifica para esto:

```text
html-architecture-diagrams
```

Esta skill no decide la arquitectura; solo ayuda a convertir un diseño aprobado en una representacion HTML clara.

## Propuesta inicial

```text
architecture_model = ddd_first
architecture_workflow = architecture-ddd
architecture_input = docs/sdd/
architecture_draft_path_v1 = .factory/runs/<run-id>/artifacts/architecture/
architecture_approved_versioned = true
architecture_approved_versioned_path = docs/architecture/
adr_required_for_significant_decisions = true
architecture_feeds_backlog_planning = true
architecture_generates_code = false
```

## Pregunta para decidir

Mi recomendacion es versionar la arquitectura aprobada en `docs/architecture/` y exigir ADRs para decisiones importantes.

La duda clave:

```text
Quieres que `architecture-ddd` genere varios documentos separados como arriba,
o prefieres un unico `docs/architecture/ARCHITECTURE.md` con secciones internas?
```

## Respuesta del usuario

El usuario decide:

- `architecture-ddd` debe generar varios documentos separados.
- Si un documento incluye diseño grafico o visual, el grafico debe crearse en HTML para mejor representacion visual.
- Si es necesario, puede existir una skill especifica para crear graficos HTML.

## Decision registrada

```text
architecture_model = ddd_first
architecture_workflow = architecture-ddd
architecture_input = docs/sdd/
architecture_draft_path_v1 = .factory/runs/<run-id>/artifacts/architecture/
architecture_approved_versioned = true
architecture_approved_versioned_path = docs/architecture/
architecture_document_model = multiple_separate_documents
architecture_single_document_only = false
architecture_diagrams_format = html
architecture_diagrams_versioned_path = docs/architecture/diagrams/
skill_html_architecture_diagrams_candidate = true
adr_required_for_significant_decisions = true
architecture_feeds_backlog_planning = true
architecture_generates_code = false
```

## Regla

```text
Markdown documenta la arquitectura.
ADR registra decisiones.
HTML representa graficos de arquitectura.
La skill de graficos ayuda a visualizar, no decide el diseño.
```

## Supuestos

- El SDD aprobado vive en `docs/sdd/`.
- `architecture-ddd` es HITL y hace grill-me tecnico con el usuario.
- La arquitectura aprobada alimenta `backlog-planning`.
- Gridwork v1 no genera codigo productivo durante este workflow.
- HTML de diagramas se considera documentacion versionada, no codigo productivo de la app.

## Riesgos

- Demasiados documentos pueden sentirse pesados.
- Un unico documento puede volverse dificil de navegar.
- Si no hay ADRs, se pierde el razonamiento de decisiones importantes.
- Si se modela por tablas/endpoints antes que por dominio, se debilita DDD.
- Si los graficos HTML incluyen demasiada logica o dependencias, pueden ser dificiles de mantener.
- Si los graficos no tienen texto asociado, la arquitectura puede perder trazabilidad.

## Artefactos a crear o actualizar

- `.gridwork/workflows/architecture-ddd/WORKFLOW.md`
- `.gridwork/workflows/architecture-ddd/workflow.json`
- `.gridwork/templates/architecture.md`
- `.gridwork/templates/adr.md`
- `.gridwork/templates/architecture-diagram.html`
- `.gridwork/skills/html-architecture-diagrams/` (candidata)
- `.factory/runs/<run-id>/artifacts/architecture/`
- `docs/architecture/`
- `docs/architecture/diagrams/`
- `docs/architecture/adr/`

## Evidencia y notas

- Esta pregunta conecta el SDD con backlog-planning.
- Mantiene la separacion: requisitos en SDD, diseno tecnico en arquitectura, tareas en backlog.
- Decision del usuario: arquitectura en documentos separados y graficos en HTML cuando aplique.
