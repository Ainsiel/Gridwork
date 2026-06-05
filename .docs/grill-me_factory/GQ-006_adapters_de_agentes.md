# GQ-006 - Adapters de agentes

- Estado: accepted
- Fuente: decision aceptada en GQ-005
- Pregunta origen: GQ-006
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/adapters/`

## Pregunta

Como deben funcionar los adapters que conectan agentes declarativos de Gridwork con agentes reales como Codex, Claude, OpenAI, agentes locales u otros?

## Por que importa

Los adapters permiten que Gridwork sea agnostico a proveedores. Pero tambien son una superficie de riesgo: si un adapter puede cambiar permisos, saltarse workflows o ocultar logs, rompe la gobernanza de la fabrica.

## Respuesta recomendada

Definir adapters como conectores limitados, no como agentes.

Un adapter debe:

- recibir un `agent_run_request` validado por el orquestador;
- traducirlo al formato del proveedor real;
- ejecutar o entregar instrucciones al proveedor;
- capturar salida;
- normalizar salida al `agent_run_result`;
- registrar provider, modelo, tokens, tool calls y errores;
- devolver evidencia al orquestador.

Un adapter no debe:

- decidir permisos;
- cambiar workflow;
- elegir tareas por su cuenta;
- ocultar errores;
- escribir archivos fuera del contrato;
- leer secretos sin policy explicita;
- hacer side effects externos sin dry-run/aprobacion.

## Modelo propuesto

```text
Orchestrator
  -> valida workflow
  -> valida permisos del agente
  -> valida tool policy
  -> crea AgentRunRequest
  -> llama Adapter
  -> Adapter ejecuta proveedor real
  -> Adapter devuelve AgentRunResult
  -> Orchestrator registra logs/evidencia
```

## Ejemplo de manifest de adapter

```json
{
  "id": "codex",
  "version": "0.1.0",
  "type": "agent-provider-adapter",
  "supports": {
    "executionModes": ["interactive", "assisted"],
    "streaming": true,
    "toolCalling": true
  },
  "security": {
    "canReadSecrets": false,
    "canEscalatePermissions": false,
    "requiresApprovalForExternalSideEffects": true
  },
  "logging": {
    "recordProvider": true,
    "recordModel": true,
    "recordUsage": true,
    "recordToolCalls": true
  }
}
```

## Respuesta del usuario

El usuario acepta la recomendacion:

- Adapter `manual` para flujos HITL y ejecucion asistida sin llamar automaticamente a un proveedor.
- Adapter `codex` como primer adapter para un agente real.
- Adapter `mock` para probar workflows, orquestador, logs y contratos sin gastar tokens ni tocar codigo real.
- Revision posterior: como v1 no tendra `gridwork run`, el adapter activo de v1 sera realmente `manual-chat`: el usuario pasa prompts Markdown al agente por chat. `codex` y `mock` quedan como ideas diferidas o internas para versiones posteriores.

## Decision registrada

Decision aceptada:

```text
initial_adapters = manual-chat
deferred_adapters = codex,mock
adapter_model = technical_connector_only
adapter_cannot_decide_permissions = true
adapter_cannot_change_workflow = true
```

Regla:

```text
El orquestador decide.
El agente define rol y permisos.
En v1 el usuario ejecuta el adapter manual-chat pasando prompts MD al agente por chat.
```

## Supuestos

- El orquestador siempre valida antes de llamar un adapter.
- El adapter no es dueno de la politica de permisos.
- Los resultados de adapters deben normalizarse a schemas comunes.
- Un agente declarativo puede ejecutarse con distintos adapters.

## Riesgos

- Si el adapter implementa demasiada logica, se vuelve un orquestador escondido.
- Si el adapter no registra uso, se pierde monitoreo.
- Si el adapter permite herramientas propias sin allowlist, se rompe la seguridad.
- Si cada adapter devuelve formatos distintos, la trazabilidad se complica.

## Preguntas abiertas

- Los adapters viven versionados en `.gridwork/adapters/` o se instalan como paquetes npm?
- Como se configuran credenciales sin poner secretos en el repo?

## Artefactos a crear o actualizar

- `.gridwork/adapters/`
- `.gridwork/schemas/agent-run-request.schema.json`
- `.gridwork/schemas/agent-run-result.schema.json`
- `.gridwork/schemas/adapter.schema.json`
- `.gridwork/policies/adapter-policy.md`
- `docs/ADAPTER_MODEL.md`

## Evidencia y notas

- Esta decision complementa el modelo de agente agnostico.
- El adapter es una traduccion tecnica, no una autoridad de gobierno.
- La separacion agente/adaptador permite cambiar proveedor sin cambiar workflows.
