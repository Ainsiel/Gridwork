# GQ-062 - Validacion de manifests, schemas y estructura

- Estado: accepted
- Fuente: decisiones GQ-004, GQ-028, GQ-030, GQ-038, GQ-041, GQ-043, GQ-044, GQ-045, GQ-046 y GQ-061
- Pregunta origen: GQ-062
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/schemas/`, `.gridwork/factory.json`, `.gridwork/agents/`, `.gridwork/workflows/`, `.gridwork/skills/`, `.factory/init/<init-run-id>/`

## Pregunta

Como debe validar Gridwork sus manifests, schemas, contracts y estructura instalada, considerando que v1 solo tendra `npx gridwork init` y que la fabrica debe mantenerse portable y facil de editar manualmente?

## Por que importa

Gridwork se basa en archivos declarativos:

```text
factory.json
agent.json
workflow.json
skill.json
stack-pack.json
policies/*.md
schemas/*.json
templates/*.md
```

Si estos archivos se rompen, el orquestador puede cargar reglas incompletas, los agentes pueden operar con permisos ambiguos, y los workflows pueden apuntar a skills o templates inexistentes.

Pero si la validacion exige tooling pesado, contradice la idea de una fabrica portable instalada con `npx gridwork init`.

## Respuesta recomendada

Usar validacion hibrida:

```text
schemas JSON versionados + validador minimo en init + checklists semanticos para agentes
```

La v1 no necesita un motor complejo de runtime. Necesita detectar errores comunes, evitar manifests rotos y dejar reportes claros.

## Niveles de validacion

### 1. Validacion de instalacion

La hace `npx gridwork init`.

Verifica:

- `.gridwork/` existe o se puede crear;
- `.factory/` existe o se puede crear;
- `.factory/` esta en `.gitignore`;
- archivos base existen;
- manifests JSON se pueden parsear;
- schemas JSON se pueden parsear;
- no hay conflictos de overwrite no resueltos.

Salida:

```text
.factory/init/<init-run-id>/init-report.md
.factory/init/<init-run-id>/preflight.json
```

### 2. Validacion estructural de manifests

La hace `init` con un validador minimo.

Debe revisar required fields, tipos simples y enums principales para:

```text
.gridwork/factory.json
.gridwork/agents/*/agent.json
.gridwork/workflows/*/workflow.json
.gridwork/skills/*/skill.json
.gridwork/stack-packs/*/stack-pack.json
.gridwork/policies/github-labels.json
```

Ejemplos:

```text
id existe
version existe
kind existe
referencias a archivos existen
agents referenciados existen
workflows referenciados existen
skills referenciadas existen
path scopes referenciados existen
```

### 3. Validacion semantica ligera

No basta con que el JSON sea valido. Tambien debe tener sentido.

Checks recomendados:

- cada workflow tiene agente principal existente;
- cada skill permitida por workflow existe;
- cada agente tiene `AGENT.md`;
- el orquestador tiene `PROMPT.md`;
- los permisos efectivos no violan deny-by-default;
- labels usadas por templates existen en `github-labels.json`;
- stack pack default existe;
- templates requeridos por skills existen;
- schemas de runtime existen para runs, events, approvals, metrics y work orders.

### 4. Validacion de runtime artifacts

Cuando un agente crea artefactos en `.factory/`, debe respetar schemas y templates.

Artefactos importantes:

```text
run.json
timeline.jsonl
metrics.json
approvals.jsonl
tool-calls.jsonl
work-order.md
```

En v1, esta validacion puede ser checklist-driven:

- el agente compara contra templates y schemas;
- el verifier puede marcar `needs_more_evidence` si falta estructura;
- el orquestador registra warnings si un artefacto no cumple.

### 5. Validacion de workflows

Antes de activar un workflow, el orquestador debe comprobar:

- workflow existe;
- agente principal existe;
- skills requeridas existen;
- policies relevantes existen;
- path scopes estan definidos;
- si el workflow es AFK, existe work order;
- si requiere GitHub, se cumple el gate correspondiente.

Si falta algo:

```text
status = blocked | waiting_user
```

segun corresponda.

## Validador minimo recomendado para CLI

El CLI TypeScript puede incluir un validador pequeno, sin dependencias runtime externas.

Debe soportar:

```text
required properties
primitive types
arrays
objects
enum values
file existence references
simple cross references
```

No necesita implementar JSON Schema completo en v1.

Los JSON Schemas se mantienen porque sirven para:

- documentar contratos;
- guiar agentes;
- permitir tooling futuro;
- validar con herramientas externas si el usuario quiere.

## Severidad de resultados

Usar tres niveles:

```text
error
warning
info
```

Reglas:

- `error`: bloquea instalacion o workflow cuando el problema impide operar.
- `warning`: no bloquea `init`, pero puede bloquear un workflow especifico cuando sea necesario.
- `info`: dato util para trazabilidad.

## Reportes recomendados

`init` debe generar:

```text
.factory/init/<init-run-id>/validation-report.md
.factory/init/<init-run-id>/validation.json
```

Ejemplo:

```json
{
  "schema_version": "1.0.0",
  "status": "warning",
  "results": [
    {
      "id": "workflow_skill_reference_exists",
      "severity": "error",
      "target": ".gridwork/workflows/tdd-implementation/workflow.json",
      "message": "Skill tdd not found.",
      "blocking": true
    }
  ]
}
```

## Propuesta inicial

```text
validation_model = schemas_plus_minimal_cli_validator_plus_agent_checklists
json_schemas_versioned = true
cli_implements_full_json_schema = false
cli_validator_has_no_runtime_external_dependencies = true
init_validates_installed_structure = true
init_validates_manifest_json_parse = true
init_validates_required_fields = true
init_validates_basic_cross_references = true
init_validator_uses_factory_profile = true
init_validator_supports_minimal_mvp_profile = true
init_validator_supports_full_v1_profile = true
init_validation_blocks_installation_critical_errors = true
init_validation_warns_for_operational_issues = true
workflow_activation_validates_required_contracts = true
runtime_artifact_validation_is_checklist_driven_v1 = true
validation_report_path = .factory/init/<init-run-id>/
```

## Pregunta para decidir

La duda clave:

```text
Quieres que Gridwork use un validador completo de JSON Schema,
o un validador minimo sin dependencias externas para v1,
manteniendo los schemas como contratos versionados?
```

Mi recomendacion: validador minimo sin dependencias externas en v1, mas schemas versionados como contrato. Es mas portable, suficiente para `init`, y deja abierta la puerta a validacion completa en futuras versiones.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Gridwork v1 debe usar un validador minimo sin dependencias externas.
- Los JSON Schemas deben mantenerse versionados como contratos.
- El CLI no necesita implementar JSON Schema completo en v1.
- `init` debe validar estructura instalada, parseo JSON, campos requeridos y referencias basicas.
- Los agentes deben usar checklists para validar artefactos de runtime durante workflows.

## Decision registrada

```text
validation_model = schemas_plus_minimal_cli_validator_plus_agent_checklists
json_schemas_versioned = true
cli_implements_full_json_schema = false
cli_validator_has_no_runtime_external_dependencies = true
init_validates_installed_structure = true
init_validates_manifest_json_parse = true
init_validates_required_fields = true
init_validates_basic_cross_references = true
init_validator_uses_factory_profile = true
init_validator_supports_minimal_mvp_profile = true
init_validator_supports_full_v1_profile = true
init_validation_blocks_installation_critical_errors = true
init_validation_warns_for_operational_issues = true
workflow_activation_validates_required_contracts = true
runtime_artifact_validation_is_checklist_driven_v1 = true
validation_report_path = .factory/init/<init-run-id>/
```

## Regla

```text
Schemas documentan contratos.
El CLI valida lo minimo necesario.
`init` no se convierte en runtime complejo.
Los workflows validan precondiciones al activarse.
Los agentes validan artefactos con checklists en v1.
```

## Supuestos

- El CLI v1 esta hecho en TypeScript y se usa con `npx gridwork init`.
- El paquete puede compilarse y publicarse, pero el usuario no debe instalar herramientas extra para usarlo.
- El usuario puede editar `.gridwork/` manualmente despues de instalar.
- Los agents tambien deben usar checklists para validar artefactos creados durante workflows.

## Riesgos

- Un validador minimo no detecta todos los problemas posibles.
- Un validador JSON Schema completo puede agregar dependencias y complejidad.
- Validar solo en `init` no captura ediciones manuales posteriores.
- Validar demasiado estricto puede bloquear cambios manuales razonables.

## Artefactos a crear o actualizar

- `.gridwork/schemas/*.schema.json`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/policies/skill-policy.md`
- `.gridwork/policies/traceability.md`
- `.gridwork/templates/validation-report.md`
- `.factory/init/<init-run-id>/validation-report.md`
- `.factory/init/<init-run-id>/validation.json`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta conecta `init`, schemas, manifests, policies y orquestador.
- La recomendacion protege la fabrica sin convertir `init` en un runtime complejo.
- Decision del usuario: aceptar validador minimo sin dependencias externas y schemas versionados como contratos.
- Revision posterior GQ-087: el validador usa `factoryProfile` para exigir inventario `minimal-mvp` o `full-v1`.
