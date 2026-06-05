# GQ-017 - Deteccion o declaracion de layout del proyecto

- Estado: accepted
- Fuente: decision aceptada en GQ-016
- Pregunta origen: GQ-017
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/project.json` o `.gridwork/factory.json`

## Pregunta

Si `gridwork init` no genera codigo de producto y no existen comandos `run`, `project detect` o `project configure` en v1, como debe Gridwork conocer rutas reales del proyecto?

## Por que importa

Los agentes necesitan path scopes concretos para leer, crear, modificar o validar archivos. Si las rutas del producto no existen o no estan declaradas, el orquestador no puede aplicar permisos por carpeta ni seleccionar skills de stack correctamente.

## Respuesta recomendada

No agregar comandos adicionales en v1.

El orquestador debe descubrir o preguntar rutas dentro del workflow activado por prompt, solo cuando las necesite.

Ejemplo:

```text
Usuario:
Quiero que leas `.gridwork/agents/orchestrator/PROMPT.md`
y actives el workflow `tdd-implementation`.

Orquestador:
No tengo configurada la ruta del backend. Donde esta?
```

El agente puede registrar la respuesta en un archivo de configuracion si el usuario lo permite.

## Configuracion propuesta

Guardar en:

```text
.gridwork/project.json
```

Ejemplo:

```json
{
  "schemaVersion": "1.0",
  "layout": {
    "frontend": {
      "type": "nextjs",
      "path": "frontend"
    },
    "backend": {
      "type": "springboot",
      "path": "backend"
    },
    "database": {
      "type": "postgresql",
      "migrationsPath": "backend/src/main/resources/db/migration"
    },
    "dockerCompose": {
      "path": "docker-compose.yml"
    },
    "githubActions": {
      "path": ".github/workflows"
    }
  }
}
```

## Reglas recomendadas

- `gridwork init` instala fabrica.
- No hay `gridwork project detect` en v1.
- No hay `gridwork project configure` en v1.
- Los prompts/workflows preguntan o infieren rutas cuando lo necesitan.
- Si una ruta no existe, queda como `missing` o `not_configured`.
- Los workflows que quieran crear carpetas de producto deben pedir aprobacion explicita.

## Respuesta del usuario

El usuario aclara:

- No quiere comandos adicionales como `gridwork run`, `project detect` o `project configure` para operar la fabrica.
- Solo quiere `npx gridwork init`.
- Gridwork debe generar prompts Markdown.
- Luego el usuario pasara esos prompts al agente por chat con instrucciones como: "Quiero que leas este prompt usando el orquestador".

## Decision registrada

Decision aceptada:

```text
project_layout_detection_command_v1 = false
project_layout_configuration_command_v1 = false
layout_discovery_model = prompt_driven_orchestrator_questioning
layout_config_can_be_written_by_agent_if_needed = true
```

Regla:

```text
Gridwork init no detecta ni configura producto.
El orquestador pregunta/detecta rutas dentro del flujo activado por prompt.
```

## Supuestos

- Gridwork debe poder trabajar en repos vacios o existentes.
- El layout puede variar entre proyectos.
- Los skills del stack predefinido deben consultar layout antes de actuar.
- El orquestador valida path scopes usando layout preguntado, inferido o registrado durante el workflow.

## Riesgos

- Deteccion automatica puede equivocarse.
- Declaracion manual puede quedar desactualizada.
- Si el layout no esta configurado, workflows AFK deben bloquearse.
- Si se permite crear carpetas sin decision, se vuelve a mezclar init con scaffold.

## Preguntas abiertas

- Prefieres que el agente guarde rutas descubiertas en `.gridwork/project.json` o en un MD de decisiones?
- Si el agente infiere Next.js/Spring Boot/PostgreSQL, debe pedir confirmacion antes de usar skills del stack?
- Que pasa si solo existe frontend o solo backend?
- Debe haber modo interactivo por chat para confirmar rutas detectadas?

## Artefactos a crear o actualizar

- `.gridwork/project.json` opcional
- `.gridwork/schemas/project.schema.json`
- `.gridwork/policies/path-scopes.md`
- `docs/PROJECT_LAYOUT.md`

## Evidencia y notas

- Esta pregunta existe porque `gridwork init` no genera codigo de producto.
- Mantiene separada la instalacion de fabrica de la configuracion del proyecto real.
- Corrige la propuesta inicial: no habra comandos extra para detectar/configurar en v1.
