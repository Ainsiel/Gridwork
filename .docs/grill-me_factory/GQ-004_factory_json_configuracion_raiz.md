# GQ-004 - Configuracion raiz en `.gridwork/factory.json`

- Estado: accepted
- Fuente: decision aceptada en GQ-003, revisada despues de GQ-018
- Pregunta origen: GQ-004
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/factory.json`

## Pregunta

Que debe contener el archivo raiz `.gridwork/factory.json` que crea `npx gridwork init`?

## Por que importa

Este archivo sera el manifiesto principal de la fabrica dentro de cada repo. En v1 no debe configurar un comando `run` ni un runner de ejecucion de agentes.

Su responsabilidad es declarar donde viven agentes, workflows, skills, policies, schemas, templates, stack packs y runtime local. Tambien debe declarar version, reglas globales, observabilidad, trazabilidad y defaults del proyecto sin guardar secretos.

## Respuesta recomendada

Usar `factory.json` como manifest declarativo minimo y referencial.

Debe contener referencias, no duplicar todo. El archivo no ejecuta la fabrica: ayuda a que el agente, leyendo el prompt de orquestador, encuentre la definicion versionada correcta.

Propuesta revisada:

```json
{
  "schemaVersion": "1.0.0",
  "factoryVersion": "1.0.0",
  "factoryProfile": "full-v1",
  "contractVersions": {
    "agent": "1.0.0",
    "workflow": "1.0.0",
    "skill": "1.0.0",
    "workOrder": "1.0.0",
    "run": "1.0.0"
  },
  "project": {
    "id": "unknown",
    "name": "unknown",
    "root": "."
  },
  "cli": {
    "package": "gridwork",
    "commandsV1": ["init"],
    "workflowRunCommand": false
  },
  "activation": {
    "mode": "manual-chat-agent-prompt",
    "entryAgent": "orchestrator",
    "entryPrompt": ".gridwork/agents/orchestrator/PROMPT.md",
    "entryContract": ".gridwork/agents/orchestrator/AGENT.md"
  },
  "paths": {
    "agents": ".gridwork/agents",
    "skills": ".gridwork/skills",
    "workflows": ".gridwork/workflows",
    "policies": ".gridwork/policies",
    "schemas": ".gridwork/schemas",
    "templates": ".gridwork/templates",
    "stackPacks": ".gridwork/stack-packs",
    "runtime": ".factory"
  },
  "defaults": {
    "orchestrator": "orchestrator",
    "issueTracker": "github",
    "observability": "file-based",
    "traceability": "required",
    "humanGate": "required_for_side_effects"
  },
  "workflows": [
    "intake-existing-code",
    "ideation-from-zero",
    "architecture-ddd",
    "tdd-implementation",
    "verification-pr"
  ],
  "skills": [
    "sdd-requirements",
    "backlog-planning",
    "github-actions-cicd",
    "diagnose-bug",
    "handoff"
  ],
  "security": {
    "allowExternalSideEffects": false,
    "requireDryRun": true,
    "secretsPolicy": "no-secrets-in-config"
  }
}
```

## Respuesta del usuario

El usuario acepta la recomendacion original, con revision posterior:

- `.gridwork/factory.json` sera un manifest raiz liviano.
- Debe ser seguro para commitear.
- No debe contener secretos.
- Debe apuntar a carpetas y configuraciones, no duplicarlo todo.
- En v1 no debe declarar `gridwork run` ni un runner obligatorio.
- Debe declarar que la activacion ocurre por prompts Markdown usados en chat.
- Los prompts de activacion viven junto al agente correspondiente, no como contratos globales mezclados con workflows o skills.
- Debe apuntar al prompt principal del orquestador.

## Decision registrada

Decision aceptada:

```text
factory_json_model = minimal_referential_manifest
factory_json_committable = true
factory_json_contains_secrets = false
factory_json_activation_model = manual_chat_agent_prompt
factory_json_declares_init_only_cli = true
factory_json_declares_contract_versions = true
factory_json_declares_factory_profile = true
```

Regla:

```text
factory.json declara donde esta la fabrica.
La CLI instala con init.
El prompt activa al agente.
AGENT.md define el contrato del agente.
WORKFLOW.md define el proceso.
SKILL.md define la capacidad reusable.
El agente ejecuta siguiendo orquestador, workflows, skills y policies.
```

## Supuestos

- `factory.json` debe ser seguro para commitear.
- No debe contener tokens, API keys ni secretos.
- La configuracion detallada vive en archivos separados.
- `npx gridwork init` puede validar este archivo contra un schema al instalar o actualizar la fabrica.
- El agente que lea el prompt puede usar `factory.json` como mapa para encontrar los artefactos de Gridwork.

## Riesgos

- Si `factory.json` crece demasiado, se vuelve dificil de mantener.
- Si contiene secretos, compromete el repo.
- Si no tiene version de schema, futuras migraciones seran dificiles.
- Si no declara paths, los prompts pueden depender de convenciones rigidas.
- Si no declara el modelo `init-only`, puede volver la confusion de un comando `run` inexistente.

## Preguntas abiertas

- El prompt principal debe llamarse `PROMPT.md`, `START.md` o `CHAT.md` dentro del agente orquestador?
- Los prompts deben copiar instrucciones criticas de policies o solo referenciarlas?
- El proyecto debe declarar nombre/id durante `init` o dejarlo como `unknown` hasta que el orquestador pregunte?
- Debe existir `.gridwork/prompts/` como indice/alias o eliminarse por completo en v1?

## Artefactos a crear o actualizar

- `.gridwork/factory.json`
- `.gridwork/schemas/factory.schema.json`
- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/agents/orchestrator/AGENT.md`
- `docs/OPERATING_MODEL.md`
- `docs/PROJECT_LAYOUT.md`

## Evidencia y notas

- Este archivo cumple el rol de manifest raiz.
- Mantiene separada la configuracion versionada de la operacion local en `.factory/`.
- La revision posterior de GQ-018 elimina `gridwork run` de v1 y mueve la activacion a prompts Markdown.
- La revision posterior de GQ-019 separa prompts de activacion, contratos de agentes, workflows y skills.
- La revision posterior de GQ-070 agrega `contractVersions` para validar compatibilidad entre CLI, fabrica, schemas y manifests.
- La revision posterior de GQ-087 agrega `factoryProfile` para distinguir inventario `minimal-mvp` e inventario `full-v1`.
