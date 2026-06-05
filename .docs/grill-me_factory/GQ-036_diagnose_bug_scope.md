# GQ-036 - Alcance de la skill `diagnose-bug`

- Estado: accepted
- Fuente: decisiones GQ-011, GQ-034 y GQ-035 sobre skills reutilizables, TDD y permisos
- Pregunta origen: GQ-036
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/diagnose-bug/`, `.gridwork/workflows/intake-existing-code/`, `.gridwork/workflows/tdd-implementation/`, `.gridwork/workflows/verification-pr/`

## Pregunta

Que puede hacer exactamente la skill `diagnose-bug` en Gridwork v1?

## Por que importa

`diagnose-bug` aparece en varios contextos:

- `intake-existing-code`, para entender un bug reportado;
- `tdd-implementation`, cuando el implementer encuentra un fallo durante una tarea;
- `verification-pr`, cuando el verifier necesita explicar por que una PR falla.

Si la skill puede modificar codigo en cualquier contexto, se mezcla diagnostico con implementacion. Si solo puede reportar, puede quedarse corta durante un flujo AFK de correccion.

## Respuesta recomendada

Definir `diagnose-bug` con modos segun workflow:

```text
diagnose-only
diagnose-and-propose-fix
diagnose-for-implementation
```

## Modos recomendados

### `diagnose-only`

Usado por:

```text
intake-existing-code
verification-pr
```

Puede:

- reproducir o describir el fallo;
- identificar sintomas;
- formular hipotesis;
- proponer comandos de test permitidos;
- sugerir archivos sospechosos;
- generar reporte local.

No puede:

- modificar codigo;
- crear fixes;
- cambiar dependencias;
- editar issues/PRs sin approval gate.

### `diagnose-and-propose-fix`

Usado cuando el usuario esta presente.

Puede:

- proponer cambios;
- crear plan de correccion;
- pedir aprobacion para pasar a implementacion;
- convertir hallazgos en work order si sera AFK.

No modifica codigo por si misma.

### `diagnose-for-implementation`

Usado dentro de `tdd-implementation` por el `implementer-agent`.

Puede contribuir a una correccion solo porque el agente implementador ya tiene:

- work order AFK;
- path scopes;
- allowlist de comandos;
- skill TDD activa;
- human gates.

En este modo, la correccion sigue siendo responsabilidad del `implementer-agent`, no de la skill aislada.

## Artefactos recomendados

```text
.factory/runs/<run-id>/artifacts/diagnose/
  diagnosis.md
  reproduction.md
  hypotheses.md
  suspected-files.md
  recommended-tests.md
```

## Propuesta inicial

```text
diagnose_bug_skill_modes = diagnose-only,diagnose-and-propose-fix,diagnose-for-implementation
diagnose_bug_default_mode = diagnose-only
diagnose_bug_can_modify_code_by_default = false
diagnose_bug_can_modify_code_inside_tdd_implementation = false
implementer_can_use_diagnose_bug_to_inform_code_changes = true
diagnose_bug_outputs_local_artifacts = true
diagnose_bug_artifacts_path = .factory/runs/<run-id>/artifacts/diagnose/
diagnose_bug_requires_tdd_for_regression_fix = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `diagnose-bug` sea siempre solo diagnostico,
o que pueda apoyar correcciones cuando esta siendo usada por `implementer-agent` dentro de `tdd-implementation`?
```

Mi recomendacion: que la skill no modifique codigo por si sola, pero que pueda apoyar al implementer dentro de `tdd-implementation`.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `diagnose-bug` no debe modificar codigo por si sola.
- Puede apoyar al `implementer-agent` dentro de `tdd-implementation`.
- La correccion sigue perteneciendo al flujo TDD del implementer.
- Si el bug requiere fix, debe existir test de regresion cuando aplique.

## Decision registrada

```text
diagnose_bug_skill_modes = diagnose-only,diagnose-and-propose-fix,diagnose-for-implementation
diagnose_bug_default_mode = diagnose-only
diagnose_bug_can_modify_code_by_default = false
diagnose_bug_can_modify_code_inside_tdd_implementation = false
implementer_can_use_diagnose_bug_to_inform_code_changes = true
diagnose_bug_outputs_local_artifacts = true
diagnose_bug_artifacts_path = .factory/runs/<run-id>/artifacts/diagnose/
diagnose_bug_requires_tdd_for_regression_fix = true
```

## Regla

```text
diagnose-bug diagnostica.
diagnose-bug puede proponer.
diagnose-bug no implementa.
El implementer-agent implementa bajo TDD cuando corresponde.
```

## Supuestos

- Las skills no elevan permisos.
- El implementer-agent es quien modifica codigo en flujo AFK.
- El verifier-agent no corrige codigo directamente en v1.
- La correccion de un bug debe incluir test de regresion cuando aplique.

## Riesgos

- Si `diagnose-bug` modifica codigo en intake, se salta el flujo de implementacion.
- Si no puede apoyar al implementer, el flujo AFK pierde capacidad de resolver fallos reales.
- Si no se exige test de regresion, se puede corregir el sintoma sin capturar el bug.

## Artefactos a crear o actualizar

- `.gridwork/skills/diagnose-bug/SKILL.md`
- `.gridwork/skills/diagnose-bug/skill.json`
- `.gridwork/templates/diagnosis.md`
- `.gridwork/workflows/intake-existing-code/WORKFLOW.md`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/workflows/verification-pr/WORKFLOW.md`

## Evidencia y notas

- Esta pregunta separa diagnostico, propuesta y correccion para evitar mezcla de responsabilidades.
- Decision del usuario: usar la recomendacion propuesta.
