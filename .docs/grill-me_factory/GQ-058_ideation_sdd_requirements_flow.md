# GQ-058 - Workflow `ideation-from-zero` y skill `sdd-requirements`

- Estado: accepted
- Fuente: decisiones GQ-010, GQ-011, GQ-019, GQ-020, GQ-025, GQ-026, GQ-042 y GQ-044
- Pregunta origen: GQ-058
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/ideation-from-zero/`, `.gridwork/skills/sdd-requirements/`, `.gridwork/templates/`, `.factory/runs/<run-id>/artifacts/ideation/`, `docs/sdd/`

## Pregunta

Como debe funcionar el workflow `ideation-from-zero` para transformar una idea ambigua de producto en insumos completos para un SDD, y como debe usar la skill `sdd-requirements` al final?

## Por que importa

Este flujo es la entrada principal cuando se quiere crear un sistema desde cero. Debe evitar saltar directo a codigo o arquitectura sin entender el dominio, los usuarios, los casos de uso, los escenarios de prueba, las restricciones y los riesgos.

Tambien debe separar dos responsabilidades:

```text
ideation-from-zero = conversar, preguntar, descubrir, normalizar y ordenar ideas
sdd-requirements = convertir los insumos aprobados en documentos SDD consistentes
```

## Respuesta recomendada

Usar un flujo por fases, con grill-me especializado, documentacion local y cierre con SDD consolidado.

El flujo no debe crear arquitectura tecnica final ni backlog de issues. Debe entregar requisitos suficientemente claros para que luego `architecture-ddd` pueda disenar el sistema con DDD.

## Fases recomendadas

### 1. Intake de idea

Objetivo: entender la idea inicial sin exigir precision temprana.

Preguntas tipicas:

- Que problema quieres resolver?
- Quien tiene ese problema?
- Que resultado esperas obtener?
- Que existe hoy y que duele?
- Que seria un MVP aceptable?

Output:

```text
.factory/runs/<run-id>/artifacts/ideation/idea-brief.md
```

### 2. Descubrimiento de dominio

Objetivo: identificar lenguaje del negocio, conceptos, reglas, eventos y limites naturales.

Preguntas tipicas:

- Cuales son las entidades o conceptos principales del dominio?
- Que reglas no se pueden romper?
- Que eventos importantes ocurren en el negocio?
- Que areas del dominio parecen independientes?
- Que terminos deben usarse siempre igual?

Output:

```text
domain-notes.md
ubiquitous-language-draft.md
business-rules.md
```

### 3. Usuarios, roles y contexto

Objetivo: definir actores, permisos conceptuales y diferencias entre perfiles.

Preguntas tipicas:

- Quienes usan el sistema?
- Que rol tiene cada usuario?
- Que acciones puede o no puede realizar cada rol?
- Existen usuarios internos, externos, admins o invitados?
- Que informacion es sensible para cada rol?

Output:

```text
actors-and-roles.md
permissions-notes.md
```

### 4. Casos de uso

Objetivo: transformar necesidades en interacciones observables.

Cada caso de uso debe capturar:

```text
id
actor principal
objetivo
precondiciones
flujo principal
variantes
errores
postcondiciones
reglas involucradas
criterios de aceptacion
```

Output:

```text
use-cases/
  UC-001_<slug>.md
  UC-002_<slug>.md
```

### 5. Requisitos funcionales y no funcionales

Objetivo: separar comportamiento de restricciones de calidad.

Requisitos funcionales:

- operaciones que el sistema debe soportar;
- validaciones;
- estados;
- notificaciones;
- integraciones;
- reglas de negocio.

Requisitos no funcionales:

- seguridad;
- rendimiento;
- disponibilidad;
- auditabilidad;
- mantenibilidad;
- observabilidad;
- privacidad;
- portabilidad;
- restricciones del stack.

Output:

```text
functional-requirements.md
non-functional-requirements.md
constraints.md
```

### 6. Casos de prueba y criterios de aceptacion

Objetivo: preparar el sistema para TDD y verificacion futura.

Cada caso de uso debe tener al menos:

- escenario feliz;
- escenario de error;
- validaciones importantes;
- permisos;
- datos limite si aplica.

Output:

```text
test-cases/
  TC-001_<slug>.md
  TC-002_<slug>.md
acceptance-criteria.md
```

### 7. Riesgos, supuestos y preguntas abiertas

Objetivo: no esconder incertidumbre.

El flujo debe separar:

```text
decisiones confirmadas
supuestos razonables
preguntas abiertas
riesgos funcionales
riesgos tecnicos
dependencias externas
```

Output:

```text
assumptions.md
open-questions.md
risks.md
decision-log.md
```

### 8. Normalizacion de insumos

Objetivo: preparar todo para que `sdd-requirements` no tenga que adivinar.

El orquestador o intake-agent debe revisar que existan:

- problema;
- objetivo;
- alcance;
- actores;
- casos de uso;
- requisitos;
- casos de prueba;
- restricciones;
- supuestos;
- riesgos.

Si falta algo esencial, debe volver al grill-me antes de generar SDD.

Output:

```text
requirements-input-map.md
readiness-check.md
```

### 9. Generacion SDD con skill `sdd-requirements`

Objetivo: convertir insumos en un SDD completo, legible y verificable.

La skill debe producir un draft local:

```text
.factory/runs/<run-id>/artifacts/sdd/
  sdd-draft.md
  use-cases/
  test-cases/
  requirements-traceability-matrix.md
```

Cuando el usuario lo apruebe, puede versionarse en:

```text
docs/sdd/
  sdd.md
  use-cases/
  test-cases/
  requirements-traceability-matrix.md
```

## Modelo de documentos recomendado

Usar varios documentos separados durante el descubrimiento, y un SDD consolidado al final.

Esto permite:

- editar preguntas y respuestas sin romper un documento gigante;
- trazar cada decision;
- reutilizar casos de uso y casos de prueba;
- pasar una entrada mas limpia a `architecture-ddd`;
- versionar un SDD aprobado sin perder los borradores locales.

## Propuesta inicial

```text
ideation_from_zero_mode = grill_me_guided_discovery
ideation_from_zero_outputs_multiple_local_documents = true
ideation_from_zero_generates_code = false
ideation_from_zero_generates_architecture = false
ideation_from_zero_generates_backlog_issues = false
ideation_from_zero_uses_sdd_requirements_skill_at_end = true
sdd_requirements_outputs_draft_in_factory = true
sdd_requirements_approved_output_path = docs/sdd/
sdd_requirements_includes_use_cases = true
sdd_requirements_includes_test_cases = true
sdd_requirements_includes_traceability_matrix = true
sdd_requirements_requires_user_approval_before_versioning = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `ideation-from-zero` produzca un unico SDD grande desde el principio,
o que produzca varios documentos separados y luego use `sdd-requirements`
para generar un SDD consolidado?
```

Mi recomendacion: varios documentos separados durante el grill-me y un SDD consolidado al final. El SDD aprobado debe ir en `docs/sdd/`; los borradores, preguntas y trazas del proceso deben quedarse en `.factory/`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `ideation-from-zero` debe producir varios documentos separados durante el grill-me.
- La skill `sdd-requirements` debe generar un SDD consolidado al final.
- Los borradores, preguntas y trazas del proceso quedan en `.factory/`.
- El SDD aprobado se versiona en `docs/sdd/`.
- Este flujo no genera codigo, arquitectura final ni backlog de issues.

## Decision registrada

```text
ideation_from_zero_mode = grill_me_guided_discovery
ideation_from_zero_outputs_multiple_local_documents = true
ideation_from_zero_outputs_single_sdd_from_start = false
ideation_from_zero_generates_code = false
ideation_from_zero_generates_architecture = false
ideation_from_zero_generates_backlog_issues = false
ideation_from_zero_uses_sdd_requirements_skill_at_end = true
sdd_requirements_outputs_consolidated_sdd = true
sdd_requirements_outputs_draft_in_factory = true
sdd_requirements_approved_output_path = docs/sdd/
sdd_requirements_includes_use_cases = true
sdd_requirements_includes_test_cases = true
sdd_requirements_includes_traceability_matrix = true
sdd_requirements_requires_user_approval_before_versioning = true
```

## Regla

```text
`ideation-from-zero` descubre y normaliza.
`sdd-requirements` consolida requisitos en SDD.
`.factory/` guarda borradores y trazas.
`docs/sdd/` guarda el SDD aprobado.
Arquitectura y backlog ocurren despues.
```

## Supuestos

- Este flujo aplica a proyectos desde cero.
- El objetivo no es disenar arquitectura tecnica todavia.
- `sdd-requirements` es una skill, no un workflow independiente.
- La arquitectura DDD ocurre despues, usando el SDD como entrada.
- El usuario participa activamente durante el grill-me.

## Riesgos

- Un unico documento grande puede volverse dificil de revisar durante la conversacion.
- Demasiados documentos sin consolidacion pueden dispersar decisiones.
- Generar arquitectura antes de cerrar requisitos puede introducir supuestos prematuros.
- Crear backlog antes del SDD puede producir issues incompletas o mal partidas.

## Artefactos a crear o actualizar

- `.gridwork/workflows/ideation-from-zero/WORKFLOW.md`
- `.gridwork/skills/sdd-requirements/SKILL.md`
- `.gridwork/templates/idea-brief.md`
- `.gridwork/templates/domain-notes.md`
- `.gridwork/templates/use-case.md`
- `.gridwork/templates/test-case.md`
- `.gridwork/templates/functional-requirements.md`
- `.gridwork/templates/non-functional-requirements.md`
- `.gridwork/templates/requirements-traceability-matrix.md`
- `.gridwork/templates/sdd.md`

## Evidencia y notas

- Esta pregunta baja a detalle el flujo que el usuario describio: ir desde una idea, hacer grill-me, normalizar requisitos, generar SDD, y recien despues pasar a arquitectura DDD.
- La recomendacion mantiene el modelo local-first: drafts en `.factory/`, documentos aprobados en `docs/sdd/`.
- Decision del usuario: aceptar documentos separados durante ideacion y SDD consolidado al cierre.
