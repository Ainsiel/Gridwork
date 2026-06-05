# GQ-048 - Activacion y uso de stack packs durante workflows

- Estado: accepted
- Fuente: decisiones GQ-008, GQ-016, GQ-017, GQ-028, GQ-042, GQ-046 y GQ-047
- Pregunta origen: GQ-048
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/factory.json`, `.gridwork/stack-packs/`, `.gridwork/agents/orchestrator/AGENT.md`, `.gridwork/policies/workflow-policy.md`

## Pregunta

Como debe activar y usar el orquestador un stack pack durante un workflow?

## Por que importa

Gridwork v1 instala un stack pack predefinido para Next.js + Spring Boot + PostgreSQL. Pero tambien se decidio que:

- `init` no genera codigo;
- el orquestador pregunta o detecta rutas reales;
- las rutas del stack pack son hints;
- las skills del stack no elevan permisos;
- la fabrica no debe romper si el repo tiene un layout distinto.

Entonces falta definir cuando el orquestador puede usar el stack pack y cuando debe pedir confirmacion.

## Respuesta recomendada

Usar el stack pack como perfil activo por defecto, pero no como verdad absoluta:

```text
default_stack_pack = nextjs-springboot-postgresql
stack_pack_usage = guidance_confirmed_or_detected
```

El orquestador puede asumir que el stack pack esta disponible como conocimiento, pero debe confirmar o detectar el layout real antes de aplicar path hints, comandos o guidance especifica.

## Modos de activacion

### `default_available`

El stack pack esta instalado por `init` y disponible para consulta.

Esto no significa que el repo ya tenga Next.js, Spring Boot o PostgreSQL.

### `candidate_detected`

El orquestador ve senales del stack:

```text
package.json
next.config.*
pom.xml
build.gradle
src/main/java
docker-compose.yml
migrations
schema.sql
```

Estas senales aumentan confianza, pero no autorizan cambios por si solas.

### `user_confirmed`

El usuario confirma que el repo usa ese stack.

Ejemplo:

```text
Este repo usa Next.js en apps/web, Spring Boot en apps/api y PostgreSQL con migraciones en infra/db.
```

### `workflow_bound`

El stack pack queda asociado al run o workflow actual.

Ejemplo en `run.json`:

```text
active_stack_pack = nextjs-springboot-postgresql
stack_pack_confidence = confirmed
stack_layout_refs = .factory/runs/<run-id>/artifacts/stack-layout.md
```

## Reglas de uso

El orquestador puede usar el stack pack para:

- sugerir preguntas de intake;
- ayudar a detectar carpetas reales;
- proponer path scopes;
- elegir skills de guidance;
- seleccionar comandos allowlisted;
- crear issues vertical slice;
- orientar arquitectura DDD;
- orientar tests de frontend, backend y persistencia.

El orquestador no puede usar el stack pack para:

- generar codigo automaticamente;
- asumir rutas fijas;
- ampliar permisos;
- saltarse human gates;
- ejecutar comandos no allowlisted;
- instalar dependencias;
- crear Docker o app scaffolding.

## Confianza recomendada

Usar:

```text
stack_pack_confidence = none | candidate | confirmed | mismatch
```

### `none`

No hay senales claras. El stack pack queda disponible como referencia, pero no se aplica al workflow.

### `candidate`

Hay senales, pero falta confirmacion. Se puede usar para hacer mejores preguntas.

### `confirmed`

El usuario o evidencia suficiente confirma el stack. El workflow puede usar sus policies, templates y skills como guidance.

### `mismatch`

El repo parece usar otro stack. El orquestador debe evitar aplicar guidance especifica y pedir instrucciones.

## Archivo de layout detectado

Cuando el stack se use en un run, se recomienda crear:

```text
.factory/runs/<run-id>/artifacts/stack-layout.md
```

Contenido:

```text
frontend_path
backend_path
database_path
docker_compose_path
detected_files
confidence
user_confirmations
open_questions
```

Este archivo no se versiona porque es runtime local.

## Relacion con path scopes

El stack pack puede sugerir path scopes, pero la autorizacion final viene de:

```text
policies
agent contract
workflow contract
work order
human approval
```

Si hay conflicto, aplica GQ-046:

```text
la regla mas restrictiva gana
```

## Propuesta inicial

```text
default_stack_pack_available = nextjs-springboot-postgresql
stack_pack_activation_model = guidance_confirmed_or_detected
stack_pack_can_be_candidate_without_confirmation = true
stack_pack_requires_confirmation_for_path_scopes = true
stack_pack_requires_confirmation_for_commands = true
stack_pack_confidence_values = none,candidate,confirmed,mismatch
stack_pack_can_generate_code = false
stack_pack_can_expand_permissions = false
stack_pack_paths_are_hints = true
stack_pack_layout_artifact = .factory/runs/<run-id>/artifacts/stack-layout.md
```

## Pregunta para decidir

La duda clave:

```text
Quieres que el stack pack se use automaticamente como default,
o solo despues de confirmacion/deteccion explicita en cada repo?
```

Mi recomendacion: que este disponible como default, pero que se aplique al workflow solo despues de deteccion o confirmacion. Asi el orquestador puede usarlo para preguntar mejor, pero no actua ciegamente.

## Respuesta del usuario

El usuario acepta la recomendacion:

```text
stack pack disponible como default, aplicado solo despues de deteccion o confirmacion
```

## Decision registrada

```text
default_stack_pack_available = nextjs-springboot-postgresql
stack_pack_activation_model = guidance_confirmed_or_detected
stack_pack_can_be_candidate_without_confirmation = true
stack_pack_requires_confirmation_for_path_scopes = true
stack_pack_requires_confirmation_for_commands = true
stack_pack_confidence_values = none,candidate,confirmed,mismatch
stack_pack_can_generate_code = false
stack_pack_can_expand_permissions = false
stack_pack_paths_are_hints = true
stack_pack_layout_artifact = .factory/runs/<run-id>/artifacts/stack-layout.md
```

## Regla

```text
El stack pack esta disponible por defecto.
El stack pack no se aplica ciegamente al workflow.
El stack pack requiere deteccion o confirmacion para rutas, comandos y guidance especifica.
```

## Supuestos

- `npx gridwork init` instala el stack pack v1.
- El usuario puede modificar manualmente la fabrica luego de instalarla.
- El stack pack no genera codigo.
- El repo puede tener layouts distintos.
- Las skills del stack son guidance.

## Riesgos

- Aplicarlo automaticamente puede producir path scopes incorrectos.
- Requerir confirmacion para todo puede hacer mas lento el uso.
- Si no se guarda el layout detectado, cada agente tendra que redescubrirlo.
- Si el stack pack eleva permisos, contradice GQ-046.

## Artefactos a crear o actualizar

- `.gridwork/factory.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/stack-pack.json`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/path-hints.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/policies/workflow-policy.md`
- `.gridwork/templates/agent-log.md`

## Evidencia y notas

- Esta pregunta evita que el stack pack sea aplicado como una suposicion rigida.
- La recomendacion conserva el valor del stack pack sin volverlo intrusivo.
- Decision del usuario: disponible como default, aplicado solo despues de deteccion o confirmacion.
