# GQ-025 - Estructura del SDD generado por `sdd-requirements`

- Estado: accepted
- Fuente: requisitos iniciales sobre ideacion, SDD/SRS, casos de uso y casos de prueba
- Pregunta origen: GQ-025
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/sdd-requirements/`, `.gridwork/templates/sdd.md`

## Pregunta

Que debe contener el SDD que genera la skill `sdd-requirements` al terminar el workflow `ideation-from-zero`?

## Por que importa

El SDD sera el puente entre la idea conversacional y el diseno DDD posterior. Si queda incompleto, la arquitectura arrastra ambiguedad. Si queda demasiado tecnico antes de tiempo, puede cerrar decisiones que deberian tomarse en `architecture-ddd`.

El usuario quiere algo parecido a un SRS, pero mas enfocado en casos de uso, criterios de aceptacion y casos de prueba.

## Respuesta recomendada

El SDD de v1 debe ser un documento de requisitos funcionales y de comportamiento, no todavia una arquitectura completa.

Debe contener:

- vision del producto;
- problema y objetivos;
- usuarios/personas;
- alcance MVP;
- fuera de alcance;
- supuestos;
- restricciones;
- glosario inicial;
- casos de uso;
- flujos principales;
- flujos alternativos;
- reglas de negocio;
- datos conceptuales;
- integraciones esperadas;
- criterios de aceptacion;
- casos de prueba esperados;
- riesgos y preguntas abiertas;
- trazabilidad hacia respuestas del grill-me.

## Estructura recomendada

```text
docs/sdd/
  SDD.md
  use-cases.md
  acceptance-criteria.md
  test-cases.md
  open-questions.md
```

Como v1 deja artefactos operativos en `.factory/`, la generacion inicial puede vivir durante el run en:

```text
.factory/runs/<run-id>/artifacts/sdd/
```

Pero el SDD aprobado deberia poder copiarse al repo como documento versionado:

```text
docs/sdd/SDD.md
```

## Pregunta para decidir

Aqui hay una decision importante:

```text
Quieres que el SDD aprobado sea un artefacto versionado en `docs/sdd/`,
o que en v1 tambien quede solo en `.factory/` como los logs/runs?
```

Mi recomendacion es que el SDD aprobado si sea versionado, porque no es log operativo: es especificacion del producto.

## Propuesta inicial

```text
sdd_model = requirements_focused_sdd
sdd_skill = sdd-requirements
sdd_generated_after = ideation-from-zero
sdd_contains_use_cases = true
sdd_contains_acceptance_criteria = true
sdd_contains_test_cases = true
sdd_contains_architecture = false
sdd_feeds_architecture_ddd = true
sdd_draft_path_v1 = .factory/runs/<run-id>/artifacts/sdd/
sdd_approved_versioned_path = docs/sdd/
```

## Respuesta del usuario

El usuario acepta la recomendacion:

- El SDD aprobado debe ser un artefacto versionado.
- Los drafts y artefactos temporales del run pueden vivir en `.factory/`.
- El documento aprobado vive en `docs/sdd/` porque es especificacion del producto, no log operativo.

## Decision registrada

```text
sdd_model = requirements_focused_sdd
sdd_skill = sdd-requirements
sdd_generated_after = ideation-from-zero
sdd_contains_use_cases = true
sdd_contains_acceptance_criteria = true
sdd_contains_test_cases = true
sdd_contains_architecture = false
sdd_feeds_architecture_ddd = true
sdd_draft_path_v1 = .factory/runs/<run-id>/artifacts/sdd/
sdd_approved_versioned = true
sdd_approved_versioned_path = docs/sdd/
sdd_is_product_specification_not_runtime_log = true
```

## Supuestos

- El SDD no reemplaza el diseno de arquitectura DDD.
- El SDD aprobado alimenta `architecture-ddd`.
- Las preguntas abiertas del SDD deben resolverse antes de pasar a backlog.
- El SDD debe ser suficientemente claro para generar casos de uso y pruebas.

## Riesgos

- Si el SDD incluye arquitectura prematura, se mezcla con `architecture-ddd`.
- Si el SDD no incluye casos de prueba, backlog-planning genera issues debiles.
- Si el SDD queda solo en `.factory/`, se pierde como especificacion del repo.
- Si se versionan drafts sin aprobar, puede haber ruido documental.

## Artefactos a crear o actualizar

- `.gridwork/skills/sdd-requirements/SKILL.md`
- `.gridwork/skills/sdd-requirements/skill.json`
- `.gridwork/templates/sdd.md`
- `.gridwork/templates/use-case.md`
- `.gridwork/templates/test-case.md`
- `.factory/runs/<run-id>/artifacts/sdd/`
- `docs/sdd/`

## Evidencia y notas

- Esta pregunta aterriza el flujo: idea -> grill-me -> SDD -> arquitectura DDD -> backlog.
- Separa requisitos de arquitectura para mantener responsabilidades claras.
- Decision del usuario: el SDD aprobado se versiona en `docs/sdd/`.
