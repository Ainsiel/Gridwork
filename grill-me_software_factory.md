# Grill-me de Arquitectura para una Fabrica de Software Agentica

## Proposito

Este documento es una guia de entrevista dura para disenar una fabrica de software con orquestador, agentes, skills, workflows, trazabilidad, monitoreo, metricas y logs por agente.

La idea es que un arquitecto de software use este grill-me para hacer preguntas una por una, tensionar las decisiones, registrar supuestos y convertir respuestas en artefactos de diseno.

## Regla central del grill-me

El arquitecto debe entrevistar al usuario de forma progresiva:

1. Hacer una sola pregunta por turno.
2. Explicar por que importa esa pregunta.
3. Dar una respuesta recomendada.
4. Esperar respuesta del usuario antes de avanzar.
5. Si la respuesta se puede descubrir leyendo codigo, documentos o configuracion, revisar primero el repo.
6. Convertir cada respuesta en una decision, supuesto, riesgo, artefacto o pregunta abierta.
7. No cerrar una rama del diseno hasta entender sus dependencias.

Formato sugerido por pregunta:

```markdown
## Pregunta N: [tema]

Pregunta:

Por que importa:

Respuesta recomendada:

Decision que deberia quedar registrada:

Artefacto que se actualiza:
```

## Inspiracion revisada en `.example`

### Fabrica destilada

La carpeta `.example/fabrica destilada` propone una fabrica minima con gobierno claro:

- `AGENTS.md` como punto de entrada.
- `FACTORY.md` como descripcion operativa.
- Agentes: `Orchestrator`, `Product Planner`, `System Designer`, `Builder`, `Validator`.
- Reglas comunes: evidencia obligatoria, trazabilidad minima, control de alcance, no cerrar sin validar y escalar contradicciones.
- Workflows: planning mode, backlog, implementacion y validacion.
- Artefactos minimos: `docs/BACKLOG.md`, `docs/TRACEABILITY.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/VALIDATION_REPORT.md`.

Leccion para esta fabrica: empezar con un nucleo gobernable antes de agregar complejidad. El orquestador no debe esperar instrucciones manuales paso a paso si ya existe una idea de producto.

### Fabrica Basica APP WEB

La carpeta `.example/Fabrica BASICA APP WEB` contiene una fabrica mas operable:

- Orquestador Python con ciclo de 12 pasos.
- Agentes: `sdd_spec_agent`, `clarifier_qa_agent`, `architect_agent`, `task_analyzer_agent`, `implementer_agent`, `validation_agent`, `ops_security_agent`.
- Nucleo: `orchestrator.py`, `logger.py`, `usage_ledger.py`, `index_manager.py`, `cache_manager.py`, `sandbox.py`.
- Estado por corrida en `.factory/runs/<cycle_id>/state.json`.
- Logs JSONL por ciclo y por agente.
- Ledger de tokens, tool calls y costo estimado.
- Index y cache por hashes.
- Sandbox local para validar proyectos generados.
- Artefactos SDD: work order, spec, clarifications, checklist, plan, data model, test plan, tasks, analyze report, traceability matrix, test report, validation report, security review, deployment plan, rollback plan y final report.

Leccion para esta fabrica: la operabilidad debe ser parte del diseno inicial, no un agregado posterior. Cada agente debe producir artefactos verificables.

### Skills en `.example/.agents/skills`

Las skills revisadas sugieren patrones de trabajo reutilizables:

- `grill-me`: entrevista una pregunta a la vez y entrega recomendacion por pregunta.
- `grill-with-docs`: tensiona decisiones contra glosario, docs y ADRs.
- `to-prd`: convierte contexto en PRD sin sobreentrevistar.
- `to-issues`: divide planes en vertical slices verificables.
- `tdd`: trabaja en ciclos red-green-refactor con tracer bullets.
- `diagnose`: reproduce, minimiza, hipotetiza, instrumenta, corrige y agrega regresion.
- `triage`: usa maquina de estados para issues.
- `review`: separa revision por estandares y por cumplimiento de spec.
- `improve-codebase-architecture`: busca modulos profundos, seams y testabilidad.
- `prototype`: crea prototipos desechables para responder preguntas.
- `write-a-skill`: define estructura de skills con frontmatter, instrucciones concisas y recursos opcionales.
- `handoff`: deja traspasos compactos para que otro agente continue.

Leccion para esta fabrica: cada skill debe tener gatillos claros, outputs esperados, restricciones y criterios de exito.

## Hipotesis de arquitectura recomendada inicial

Esta no es una decision final. Es el punto de partida recomendado para el grill-me:

- Fabrica local-first y repo-first en la primera version.
- Orquestador propio por maquina de estados, con posibilidad de migrar despues a Temporal, Dagster, Prefect u otro motor si el volumen lo justifica.
- Artefactos Markdown para decisiones humanas y JSON/JSONL para estado, logs y metricas.
- Pydantic o equivalente para contratos de entrada/salida de agentes.
- `.factory/` como directorio operativo para runs, memoria, index, cache, logs y reports.
- Agentes pequenos con responsabilidades cerradas.
- Workflows SDD obligatorios para features, bugs, refactors, releases e incidentes.
- Sandbox obligatorio antes de validar cambios.
- Tool registry con allowlist, dry-run, idempotency keys, timeouts y approval gates.
- Observabilidad desde el dia uno: logs, metricas, traces, usage ledger, final report y dashboard futuro.

## Principios no negociables

1. No hay implementacion sin Work Order o entrada trazable.
2. No hay feature nueva sin spec o backlog minimo.
3. No hay cambio complejo sin plan.
4. No hay cierre sin validacion y evidencia.
5. No hay aprendizaje permanente sin aprobacion.
6. No hay shell libre ni secretos por defecto.
7. No hay dependencia nueva sin registro y aprobacion.
8. No hay cambios fuera de alcance sin escalamiento.
9. Toda decision critica tiene fuente, responsable y evidencia.
10. Todo agente deja logs, outputs y estado verificable.

## Modelo de sesion del arquitecto

El arquitecto debe recorrer este arbol de decisiones:

```text
Vision y alcance
-> Tipo de fabrica
-> Usuarios y productos objetivo
-> Workflows principales
-> Agentes y responsabilidades
-> Skills y herramientas
-> Orquestador y maquina de estados
-> Artefactos y contratos
-> Trazabilidad
-> Observabilidad
-> Seguridad y permisos
-> Ejecucion, sandbox y CI/CD
-> Memoria y aprendizaje
-> Stack tecnologico
-> Roadmap incremental
```

Cada respuesta debe producir una de estas salidas:

- `DECISION`: algo ya resuelto.
- `SUPUESTO`: algo asumido hasta confirmacion.
- `RIESGO`: algo que puede romper el diseno.
- `PREGUNTA_ABIERTA`: algo que bloquea decisiones posteriores.
- `ARTEFACTO`: documento, contrato, schema, log o reporte a crear.

## Preguntas del grill-me

### 1. Vision, negocio y alcance

#### Q001 - Que tipo de fabrica quieres construir primero?

Pregunta: La fabrica sera una herramienta personal/local, una plataforma para varios proyectos internos, o una fabrica multi-tenant para clientes?

Por que importa: Define seguridad, aislamiento, storage, UX, permisos, costos y complejidad operativa.

Respuesta recomendada: Empezar local-first y multi-proyecto, no multi-tenant. Permitir evolucionar a plataforma despues.

Decision esperada: `factory_scope = local_first_multi_project`.

Artefacto: `docs/FACTORY_CONSTITUTION.md`.

#### Q002 - Que tipo de software debe producir la fabrica en la primera version?

Pregunta: La fabrica generara apps web CRUD, APIs, automatizaciones, librerias, agentes, documentacion, o todo lo anterior?

Por que importa: Una fabrica que intenta producir todo desde el inicio pierde criterios de validacion.

Respuesta recomendada: Primera version enfocada en apps web pequenas, APIs y herramientas internas con SDD.

Decision esperada: catalogo inicial de productos soportados.

Artefacto: `docs/SERVICE_CATALOG.md`.

#### Q003 - Cual es el criterio de exito de la fabrica?

Pregunta: Que significa que la fabrica funciona bien: velocidad, calidad, autonomia, trazabilidad, ahorro de costo, aprendizaje, o despliegue continuo?

Por que importa: Las metricas y gates dependen de esta respuesta.

Respuesta recomendada: Exito = entregar cambios verificables con trazabilidad completa, pruebas ejecutadas, costo visible y bajo retrabajo.

Decision esperada: definicion de "done" de fabrica.

Artefacto: `docs/QUALITY_MODEL.md`.

#### Q004 - Que no debe hacer la fabrica?

Pregunta: Que cosas quedan fuera de alcance: produccion automatica, manejo de secretos, microservicios, pagos, datos sensibles, cambios destructivos?

Por que importa: Los limites evitan scope creep y reducen riesgo.

Respuesta recomendada: Fuera de alcance inicial: deploy productivo automatico, secretos, datos sensibles reales, microservicios complejos y acciones destructivas sin aprobacion.

Decision esperada: lista de exclusiones.

Artefacto: `docs/OUT_OF_SCOPE.md`.

### 2. Usuarios, roles y operacion humana

#### Q005 - Quienes usaran la fabrica?

Pregunta: La usara solo el owner, desarrolladores, PMs, QA, clientes, agentes AFK, o un equipo completo?

Por que importa: Cambia la UX, permisos, auditoria y lenguaje de los artefactos.

Respuesta recomendada: Disenar para owner + desarrollador + agente AFK en v1.

Decision esperada: roles humanos.

Artefacto: `docs/ROLES_AND_PERMISSIONS.md`.

#### Q006 - Donde debe vivir la interaccion principal?

Pregunta: El usuario interactuara por CLI, chat, UI web, issues, IDE, o una combinacion?

Por que importa: Define la API del orquestador y el formato de estados/progreso.

Respuesta recomendada: CLI/chat en v1, UI web de monitoreo en v2.

Decision esperada: canal primario de operacion.

Artefacto: `docs/OPERATING_MODEL.md`.

#### Q007 - Cuando debe intervenir un humano?

Pregunta: Que decisiones deben tener gate humano obligatorio?

Por que importa: La autonomia sin limites rompe seguridad y confianza.

Respuesta recomendada: Gate humano para dependencias nuevas, migraciones, secrets, deploy, borrados, acciones externas, presupuesto excedido y cambios de alcance.

Decision esperada: matriz HITL/AFK.

Artefacto: `docs/HUMAN_GATES.md`.

### 3. Orquestador

#### Q008 - El orquestador sera codigo propio, motor de workflows o ambos?

Pregunta: Quieres un orquestador simple por estados en el repo, o usar un motor como Temporal, Prefect, Dagster, Airflow u otro?

Por que importa: Afecta persistencia de estado, retries, UI, despliegue y complejidad.

Respuesta recomendada: Estado propio en v1 con interfaz que permita migrar a motor de workflows luego.

Decision esperada: `orchestrator_runtime = local_state_machine`.

Artefacto: `docs/ORCHESTRATOR_ARCHITECTURE.md`.

#### Q009 - Cual sera el ciclo obligatorio?

Pregunta: El ciclo sera el de 12 pasos de la fabrica basica, el flujo minimo de la fabrica destilada, o una mezcla?

Por que importa: El ciclo define gates, logs, estado y artefactos.

Respuesta recomendada: Usar una mezcla: ciclo compacto de 8 fases para v1, expandible a 12 pasos para operabilidad madura.

Decision esperada: fases canonicas.

Artefacto: `docs/WORKFLOW_LIFECYCLE.md`.

#### Q010 - Que estados canonicos tendra una corrida?

Pregunta: Que estados puede tener un run: queued, running, needs_user_input, blocked, failed, cancelled, complete?

Por que importa: Los agentes, dashboards y reintentos dependen de estados precisos.

Respuesta recomendada: `queued`, `running`, `needs_user_input`, `blocked`, `failed`, `cancelled`, `complete`, `complete_with_risk`.

Decision esperada: enum de estados.

Artefacto: `schemas/run_state.schema.json`.

#### Q011 - Como se identifican ciclos, trabajos y trazas?

Pregunta: Usaras `cycle_id`, `work_order_id`, `trace_id`, `agent_run_id`, `task_id`, `artifact_id`?

Por que importa: Sin IDs no hay auditoria ni correlacion entre logs, metricas y artefactos.

Respuesta recomendada: Mantener todos esos IDs, generados por el orquestador al inicio.

Decision esperada: estrategia de identificadores.

Artefacto: `docs/IDENTIFIERS.md`.

#### Q012 - Como decide el orquestador que agente activar?

Pregunta: El routing se hara por reglas deterministicas, por LLM, por labels, por tipo de Work Order, o por una mezcla?

Por que importa: El routing opaco hace dificil depurar y auditar.

Respuesta recomendada: Routing deterministico por tipo de trabajo, con clasificacion LLM solo como sugerencia registrada.

Decision esperada: reglas de routing.

Artefacto: `docs/ROUTING_RULES.md`.

### 4. Agentes

#### Q013 - Cuales son los agentes minimos?

Pregunta: Que agentes son indispensables para v1?

Por que importa: Muchos agentes al inicio agregan latencia y confusion.

Respuesta recomendada: Orchestrator, Intake/SDD, Architect, Planner, Builder, Validator, Ops/Security y Observability Reporter.

Decision esperada: roster v1.

Artefacto: `docs/AGENTS.md`.

#### Q014 - Que agente puede escribir codigo?

Pregunta: Solo Builder escribe codigo, o tambien Architect, Validator u Ops?

Por que importa: Separar diseno, implementacion y validacion reduce autojustificacion.

Respuesta recomendada: Solo Builder escribe codigo en v1. Validator puede proponer fixes, pero no cerrarlos sin nueva pasada.

Decision esperada: permisos por agente.

Artefacto: `docs/AGENT_PERMISSIONS.md`.

#### Q015 - Los agentes seran prompts, procesos, clases Python, servicios o workers?

Pregunta: Cual sera la representacion tecnica de un agente?

Por que importa: Define testing, despliegue, versionado y observabilidad.

Respuesta recomendada: Definir agente como contrato versionado: prompt + input schema + output schema + tool allowlist + runner.

Decision esperada: contrato de agente.

Artefacto: `schemas/agent_contract.schema.json`.

#### Q016 - Como se versionan agentes y prompts?

Pregunta: Se versionaran prompts, modelos, skills y tool policies por separado?

Por que importa: Sin versionado no se puede reproducir una decision o regresion.

Respuesta recomendada: Versionar `agent_version`, `prompt_version`, `skill_version`, `model_id` y `tool_policy_version` en cada run.

Decision esperada: politica de versionado.

Artefacto: `docs/VERSIONING.md`.

#### Q017 - Que hace un agente cuando falta informacion?

Pregunta: Debe preguntar, asumir MVP, bloquear, o elevar al orquestador?

Por que importa: La fabrica debe controlar la invencion.

Respuesta recomendada: Si es critico, `needs_user_input`; si no es critico, asumir MVP y registrar supuesto.

Decision esperada: politica de missing info.

Artefacto: `docs/MISSING_INFO_POLICY.md`.

### 5. Skills y tool registry

#### Q018 - Que es una skill en tu fabrica?

Pregunta: Una skill sera una instruccion Markdown, una herramienta ejecutable, un workflow, una plantilla, o una combinacion?

Por que importa: El termino "skill" puede volverse ambiguo.

Respuesta recomendada: Skill = capacidad versionada con triggers, instrucciones, inputs, outputs, permisos y evidencia esperada.

Decision esperada: definicion canonica.

Artefacto: `docs/GLOSSARY.md`.

#### Q019 - Que skills deben existir en v1?

Pregunta: Cuales son las skills basicas?

Por que importa: Las skills son la unidad reutilizable de la fabrica.

Respuesta recomendada: `grill-me`, `sdd-intake`, `to-prd`, `to-issues`, `planning-mode`, `tdd`, `diagnose`, `review`, `validate`, `handoff`, `write-a-skill`.

Decision esperada: catalogo inicial.

Artefacto: `docs/SKILL_CATALOG.md`.

#### Q020 - Como se activa una skill?

Pregunta: Por keywords, descripcion semantica, routing del orquestador, seleccion manual, o labels?

Por que importa: Activacion incorrecta genera workflows equivocados.

Respuesta recomendada: Activacion por routing del orquestador + triggers declarativos en la skill.

Decision esperada: mecanismo de activacion.

Artefacto: `schemas/skill_manifest.schema.json`.

#### Q021 - Que herramientas puede llamar cada skill?

Pregunta: Cada skill tendra tool allowlist, permisos por fase y aprobaciones?

Por que importa: Las tools son la superficie de riesgo.

Respuesta recomendada: Tool allowlist por agente y skill, con `read`, `write`, `execute`, `external_side_effect` y `requires_approval`.

Decision esperada: matriz de herramientas.

Artefacto: `docs/TOOL_POLICY.md`.

### 6. Workflows

#### Q022 - Cuales son los workflows principales?

Pregunta: Que workflows tendra la fabrica: intake, PRD, backlog, implementacion, validacion, release, debug, arquitectura, skill creation?

Por que importa: El orquestador necesita rutas explicitas.

Respuesta recomendada: V1 con `intake_sdd`, `planning`, `implementation`, `validation`, `review`, `diagnose`, `release_dry_run`, `handoff`.

Decision esperada: workflow catalog.

Artefacto: `docs/WORKFLOWS.md`.

#### Q023 - Como se rompe trabajo en unidades pequenas?

Pregunta: Usaras historias, vertical slices, tasks, issues, commits, o una mezcla?

Por que importa: Define trazabilidad y autonomia de agentes.

Respuesta recomendada: Work Order -> PRD/spec -> vertical slices -> tasks -> changes -> tests -> evidence.

Decision esperada: modelo de descomposicion.

Artefacto: `docs/WORK_BREAKDOWN.md`.

#### Q024 - Que diferencia hay entre HITL y AFK?

Pregunta: Que tareas puede ejecutar un agente sin humano y cuales requieren aprobacion?

Por que importa: La fabrica necesita autonomia segura.

Respuesta recomendada: AFK solo si tiene spec, tests, permisos, no toca secretos, no despliega y no cambia dependencias.

Decision esperada: regla HITL/AFK.

Artefacto: `docs/AUTONOMY_POLICY.md`.

#### Q025 - Que pasa si una validacion falla?

Pregunta: El sistema reintenta, bloquea, crea aprendizaje, pide humano, o abre issue?

Por que importa: El manejo de fallas es parte central del flujo.

Respuesta recomendada: Un retry acotado si el fix esta dentro de la task; si falla de nuevo, bloquear y registrar aprendizaje candidato.

Decision esperada: retry policy.

Artefacto: `docs/RETRY_AND_FAILURE_POLICY.md`.

### 7. Artefactos y contratos

#### Q026 - Cuales son los artefactos obligatorios por run?

Pregunta: Que debe existir siempre en `.factory/runs/<run_id>/`?

Por que importa: Observabilidad y auditoria dependen de artefactos estables.

Respuesta recomendada: `state.json`, `work_order.json`, `cycle_log.jsonl`, `agent_logs/`, `usage_ledger.jsonl`, `tool_calls.jsonl`, `artifacts.json`, `final-report.md`.

Decision esperada: run layout.

Artefacto: `docs/RUN_LAYOUT.md`.

#### Q027 - Cuales son los artefactos obligatorios por proyecto?

Pregunta: Que debe existir en cada proyecto gestionado?

Por que importa: Permite continuidad entre ciclos.

Respuesta recomendada: `docs/BACKLOG.md`, `docs/TRACEABILITY.md`, `docs/DECISIONS.md`, `docs/VALIDATION_REPORT.md`, `specs/`, `tests/` si aplica.

Decision esperada: project layout.

Artefacto: `docs/PROJECT_LAYOUT.md`.

#### Q028 - Que contratos usaran agentes entre si?

Pregunta: Los agentes se pasaran Markdown libre, JSON validado, archivos, eventos, o mensajes estructurados?

Por que importa: Markdown libre es bueno para humanos, JSON validado para automatizacion.

Respuesta recomendada: JSON para input/output machine-readable y Markdown para artefactos humanos.

Decision esperada: dual artifact policy.

Artefacto: `schemas/agent_io.schema.json`.

#### Q029 - Que schema debe tener una decision?

Pregunta: Como registraras decisiones tecnicas, de producto y operacion?

Por que importa: Las decisiones deben sobrevivir cambios de chat.

Respuesta recomendada: `decision_id`, fecha, owner, contexto, decision, alternativas, consecuencia, fuente, estado.

Decision esperada: decision record format.

Artefacto: `docs/DECISION_RECORD_TEMPLATE.md`.

### 8. Trazabilidad

#### Q030 - Cual es la cadena de trazabilidad minima?

Pregunta: Que quieres poder rastrear de punta a punta?

Por que importa: Sin cadena completa no puedes auditar ni depurar.

Respuesta recomendada: Work Order -> Requirement -> Acceptance Criteria -> Task -> Code Change -> Test -> Evidence -> Final Report.

Decision esperada: traceability chain.

Artefacto: `docs/TRACEABILITY_MODEL.md`.

#### Q031 - Como se actualiza la trazabilidad?

Pregunta: La actualizan los agentes, el orquestador, una herramienta automatica, o todos?

Por que importa: Si todos escriben sin reglas, se vuelve inconsistente.

Respuesta recomendada: Agentes proponen entradas; orquestador valida y consolida.

Decision esperada: ownership de trazabilidad.

Artefacto: `docs/TRACEABILITY_POLICY.md`.

#### Q032 - Que cobertura de trazabilidad es aceptable?

Pregunta: Debe ser 100% para requisitos funcionales? Que pasa con docs, refactors o bugs?

Por que importa: Define gates.

Respuesta recomendada: 100% para requisitos funcionales, bugs criticos y cambios de datos; parcial justificado para docs/refactors.

Decision esperada: traceability coverage gate.

Artefacto: `docs/GATES.md`.

### 9. Observabilidad, metricas y logs

#### Q033 - Que logs debe emitir cada agente?

Pregunta: Que campos minimos tendra un log de agente?

Por que importa: Logs pobres no sirven para depurar ni auditar.

Respuesta recomendada: timestamp, run_id, trace_id, agent_id, phase, skill_id, event, status, duration, evidence_path, error_code, model_id.

Decision esperada: log schema.

Artefacto: `schemas/agent_log.schema.json`.

#### Q034 - Que metricas importan desde v1?

Pregunta: Mediras productividad, calidad, IA, seguridad, operacion y costo?

Por que importa: Lo que no se mide se vuelve opinion.

Respuesta recomendada: cycle time, lead time, success rate, test pass rate, validation failures, rework, tokens, cost, latency, tool errors, cache hit rate, blocked runs.

Decision esperada: metric catalog.

Artefacto: `docs/METRICS_CATALOG.md`.

#### Q035 - Necesitas trazas distribuidas o basta con JSONL?

Pregunta: Usaras OpenTelemetry desde el inicio o JSONL compatible?

Por que importa: OTel es potente, pero puede ser demasiado para v1.

Respuesta recomendada: JSONL con campos compatibles con OTel en v1; exportador OTel en v2.

Decision esperada: observability backend.

Artefacto: `docs/OBSERVABILITY_ARCHITECTURE.md`.

#### Q036 - Como se vera el monitoreo?

Pregunta: Habra dashboard, reportes Markdown, CLI status, alertas, o todo?

Por que importa: La operacion necesita feedback claro.

Respuesta recomendada: `factory status` por CLI y `final-report.md` en v1; dashboard web en v2.

Decision esperada: interfaz de monitoreo.

Artefacto: `docs/MONITORING_UX.md`.

#### Q037 - Que eventos requieren alerta?

Pregunta: Que debe despertar atencion humana?

Por que importa: Demasiadas alertas se ignoran; pocas alertas ocultan fallas.

Respuesta recomendada: secret detected, budget exceeded, repeated validation failure, unsafe tool request, production gate, untraceable change, memory contamination.

Decision esperada: alert policy.

Artefacto: `docs/ALERTING_POLICY.md`.

### 10. Seguridad, permisos y compliance

#### Q038 - Cual es la politica de secretos?

Pregunta: Los agentes pueden leer, escribir, resumir o loggear secretos?

Por que importa: Es una de las superficies de mayor riesgo.

Respuesta recomendada: Por defecto no pueden leer secretos. Si se requiere, usar broker externo con redaccion y aprobacion.

Decision esperada: secrets policy.

Artefacto: `docs/SECRETS_POLICY.md`.

#### Q039 - Como se evita prompt injection?

Pregunta: Como distinguiras instrucciones confiables de contenido no confiable?

Por que importa: Documentos externos pueden intentar cambiar reglas de la fabrica.

Respuesta recomendada: Clasificar fuentes por trust level, sanitizar inputs, separar instrucciones de datos y bloquear cambios de policy desde artefactos no confiables.

Decision esperada: trust model.

Artefacto: `docs/TRUST_AND_INPUT_POLICY.md`.

#### Q040 - Que acciones requieren dry-run?

Pregunta: Crear PR, deploy, migracion, borrar archivos, tocar dependencias, publicar issues, enviar mensajes externos?

Por que importa: Dry-run reduce dano accidental.

Respuesta recomendada: Todo side effect externo o destructivo requiere dry-run y aprobacion.

Decision esperada: dry-run policy.

Artefacto: `docs/DRY_RUN_POLICY.md`.

#### Q041 - Como se auditan herramientas?

Pregunta: Cada tool call se registrara con input hash, output hash, agente, skill, permiso, resultado y evidencia?

Por que importa: Las herramientas son parte del comportamiento real de la fabrica.

Respuesta recomendada: Si, en `tool_calls.jsonl`.

Decision esperada: tool audit schema.

Artefacto: `schemas/tool_call.schema.json`.

### 11. Sandbox, validacion y CI/CD

#### Q042 - Donde ejecutan los agentes implementadores?

Pregunta: En el repo real, un workspace temporal, contenedor, sandbox local o VM?

Por que importa: Aislamiento y reproducibilidad dependen de esto.

Respuesta recomendada: Workspace temporal por run en v1; contenedor opcional en v2.

Decision esperada: execution sandbox.

Artefacto: `docs/SANDBOX_MODEL.md`.

#### Q043 - Que pruebas son obligatorias?

Pregunta: Unitarias, integracion, contrato API, UI, e2e, seguridad, smoke?

Por que importa: La validacion debe calzar con el tipo de cambio.

Respuesta recomendada: Requisitos + trazabilidad siempre; unit/integration/contract segun alcance; security si hay datos/deploy; smoke si se levanta app.

Decision esperada: test matrix.

Artefacto: `docs/VALIDATION_MATRIX.md`.

#### Q044 - Como se define evidencia suficiente?

Pregunta: Que evidencia permite cerrar una tarea?

Por que importa: "Funciona" no es evidencia.

Respuesta recomendada: Comando ejecutado, salida, archivo generado, test report, screenshot si UI, validacion manual razonada y hash de artefactos.

Decision esperada: evidence policy.

Artefacto: `docs/EVIDENCE_POLICY.md`.

#### Q045 - Como se integra con git?

Pregunta: La fabrica crea ramas, commits, PRs, issues, tags o changelog?

Por que importa: Versionado y entrega requieren reglas.

Respuesta recomendada: En v1 preparar cambios y reporte; commits/PRs con aprobacion. En v2 crear PR dry-run y real segun policy.

Decision esperada: git policy.

Artefacto: `docs/GIT_WORKFLOW.md`.

### 12. Memoria, aprendizaje y contexto

#### Q046 - Que se guarda como memoria?

Pregunta: Aprendizajes, decisiones, errores, preferencias, metricas, summaries de runs, o todo?

Por que importa: Memoria sin curacion contamina futuros ciclos.

Respuesta recomendada: Guardar solo aprendizajes aprobados, decisiones, errores verificados y preferencias explicitas.

Decision esperada: memory scope.

Artefacto: `docs/MEMORY_POLICY.md`.

#### Q047 - Quien aprueba aprendizaje permanente?

Pregunta: El orquestador, un agente reviewer, el usuario, o reglas automaticas?

Por que importa: Aprender cosas falsas es peor que no aprender.

Respuesta recomendada: Aprendizaje propuesto por agente, validado por policy, aprobado por humano o reviewer.

Decision esperada: learning gate.

Artefacto: `docs/LEARNING_GOVERNANCE.md`.

#### Q048 - Como se construye contexto para cada agente?

Pregunta: Se pasa todo el historial, un context pack, RAG, index, cache, o seleccion manual?

Por que importa: Contexto gigante sube costo y ruido.

Respuesta recomendada: Context pack minimo con source IDs, hashes, summaries y trust level.

Decision esperada: context manager design.

Artefacto: `docs/CONTEXT_MANAGER.md`.

#### Q049 - Que se cachea?

Pregunta: Specs, planes, tool results, tests, embeddings, context packs?

Por que importa: Cache mejora costo, pero puede traer datos viejos.

Respuesta recomendada: Cache por hash de spec, commit, env y policy; nunca cachear secretos.

Decision esperada: cache policy.

Artefacto: `docs/CACHE_POLICY.md`.

### 13. Stack tecnologico

#### Q050 - En que lenguaje se implementa el nucleo?

Pregunta: Python, TypeScript, Go, Rust u otro?

Por que importa: Define ecosistema de schemas, CLI, tests, integraciones y agentes.

Respuesta recomendada: Python para v1 por cercania con `.example`, Pydantic, FastAPI/Typer y facilidad de automatizacion.

Decision esperada: core language.

Artefacto: `docs/TECH_STACK.md`.

#### Q051 - Que storage usara la fabrica?

Pregunta: Archivos JSON/Markdown, SQLite, Postgres, object storage, vector DB?

Por que importa: Estado, busqueda y auditoria dependen del storage.

Respuesta recomendada: Archivos + SQLite en v1. Postgres si se vuelve multiusuario. Vector DB solo si el volumen lo justifica.

Decision esperada: persistence strategy.

Artefacto: `docs/PERSISTENCE.md`.

#### Q052 - Necesitas una API del orquestador?

Pregunta: Habra solo CLI, o tambien FastAPI para UI, integraciones y webhooks?

Por que importa: UI y automatizaciones futuras necesitan contrato.

Respuesta recomendada: CLI primero, FastAPI despues con el mismo dominio de comandos.

Decision esperada: interface strategy.

Artefacto: `docs/API_STRATEGY.md`.

#### Q053 - Que modelos LLM se usaran?

Pregunta: Un unico modelo, router por tarea, modelos locales, OpenAI, Anthropic, Gemini, otros?

Por que importa: Costo, calidad, privacidad y latencia dependen de esto.

Respuesta recomendada: Abstraer provider/modelo con `model_id` por run y presupuestos; no acoplar la fabrica a un proveedor.

Decision esperada: model provider abstraction.

Artefacto: `docs/MODEL_POLICY.md`.

### 14. Economia, presupuestos y circuit breakers

#### Q054 - Cual es el presupuesto por run?

Pregunta: Limites de tokens, costo, tool calls, duracion y retries?

Por que importa: Sin presupuesto no hay control operacional.

Respuesta recomendada: Definir budgets por modo: fast, normal, deep, human_gate.

Decision esperada: budget model.

Artefacto: `docs/BUDGET_POLICY.md`.

#### Q055 - Que rompe el circuito?

Pregunta: Que condiciones detienen el run?

Por que importa: Circuit breakers evitan gastar o romper cosas.

Respuesta recomendada: missing spec, ambiguity critica, dependency violation, test failure persistente, secret detected, scope creep, budget exceeded, unsafe tool.

Decision esperada: circuit breakers.

Artefacto: `docs/CIRCUIT_BREAKERS.md`.

#### Q056 - Como se calcula ROI?

Pregunta: Mediras tiempo ahorrado, defectos evitados, costo de tokens, retrabajo, throughput?

Por que importa: La fabrica debe justificar su complejidad.

Respuesta recomendada: Medir throughput, cycle time, rework, defectos post-cierre y costo por cambio validado.

Decision esperada: ROI metrics.

Artefacto: `docs/ROI_MODEL.md`.

### 15. Producto, UX y dashboard

#### Q057 - Que necesita ver el usuario durante un run?

Pregunta: Plan, fase actual, agentes activos, logs, costo, bloqueos, proximos pasos?

Por que importa: La confianza depende de feedback entendible.

Respuesta recomendada: Mostrar objetivo, fase, agente activo, artefactos creados, gates, costo parcial, riesgos y siguiente accion.

Decision esperada: run status view.

Artefacto: `docs/RUN_STATUS_UX.md`.

#### Q058 - Que se muestra al cierre?

Pregunta: Que debe contener el final report?

Por que importa: El cierre es la evidencia usable por humanos.

Respuesta recomendada: status, objetivo, resumen, artefactos, cambios, tests, riesgos, decisiones, tokens, costo, aprendizaje y proximo paso.

Decision esperada: final report format.

Artefacto: `docs/FINAL_REPORT_TEMPLATE.md`.

#### Q059 - Como se navega historial?

Pregunta: Se podran buscar runs por proyecto, agente, estado, fecha, costo, error, requisito?

Por que importa: Monitoreo sin busqueda se vuelve un cementerio de logs.

Respuesta recomendada: CLI `factory runs list/filter/show` en v1; dashboard con filtros en v2.

Decision esperada: history UX.

Artefacto: `docs/HISTORY_AND_SEARCH.md`.

### 16. Arquitectura interna y mantenibilidad

#### Q060 - Cuales son los modulos profundos del nucleo?

Pregunta: Que modulos deben ocultar complejidad tras una interfaz pequena?

Por que importa: La fabrica debe ser mantenible y testeable.

Respuesta recomendada: Orchestrator, Agent Runner, Tool Registry, Context Manager, Artifact Store, Policy Engine, Observability, Sandbox, Memory Store.

Decision esperada: core modules.

Artefacto: `docs/CORE_MODULES.md`.

#### Q061 - Donde estan los seams de test?

Pregunta: Que interfaces permiten probar sin llamar modelos reales ni herramientas reales?

Por que importa: Sin seams no hay tests deterministas.

Respuesta recomendada: ModelProvider, ToolExecutor, ArtifactStore, PolicyEngine, Clock, IdGenerator, SandboxRunner.

Decision esperada: test seams.

Artefacto: `docs/TESTABILITY_ARCHITECTURE.md`.

#### Q062 - Como se evita que el orquestador sea un dios?

Pregunta: Que responsabilidades se quedan fuera del orquestador?

Por que importa: Un orquestador enorme se vuelve imposible de probar.

Respuesta recomendada: Orquestador coordina estado y gates; no implementa logica de agentes, tools, storage ni policy directamente.

Decision esperada: orchestrator boundaries.

Artefacto: `docs/ORCHESTRATOR_BOUNDARIES.md`.

### 17. Roadmap

#### Q063 - Cual es el MVP mas pequeno?

Pregunta: Que version demuestra valor en pocos dias?

Por que importa: Una fabrica completa puede crecer demasiado antes de ser util.

Respuesta recomendada: MVP: CLI local que toma Work Order, genera spec/backlog/plan/tasks, ejecuta un Builder controlado, valida, registra logs/usage/final report.

Decision esperada: MVP definition.

Artefacto: `docs/ROADMAP.md`.

#### Q064 - Que queda para v2?

Pregunta: Que capacidades no deben entrar en el MVP?

Por que importa: Protege foco.

Respuesta recomendada: Dashboard web, OTel, multiusuario, provider router avanzado, PR automation, deploy staging, vector search, evals de agentes.

Decision esperada: v2 backlog.

Artefacto: `docs/ROADMAP.md`.

#### Q065 - Como se migrara de local-first a plataforma?

Pregunta: Que decisiones de v1 no deben bloquear multiusuario o SaaS futuro?

Por que importa: Hay que evitar deuda estructural temprana.

Respuesta recomendada: Interfaces limpias para storage, auth, model provider, tool executor y event bus. No depender de paths hardcodeados.

Decision esperada: migration constraints.

Artefacto: `docs/EVOLUTION_PATH.md`.

## Pregunta inicial recomendada

El arquitecto deberia comenzar con esta pregunta:

```markdown
## Pregunta 1: Alcance de la fabrica

Quieres que la primera version de la fabrica sea:

A. Una herramienta local para ti, orientada a un workspace y varios proyectos.
B. Una plataforma interna para varios usuarios de un equipo.
C. Un producto multi-tenant para clientes.

Por que importa:
Esta decision define almacenamiento, permisos, seguridad, dashboard, aislamiento de proyectos, costos y roadmap.

Respuesta recomendada:
Empezar con A: herramienta local-first, multi-proyecto, repo-first. Disenar las interfaces para evolucionar a B sin reescribir todo. Evitar C hasta validar el modelo operativo.

Decision a registrar:
factory_scope = local_first_multi_project
```

## Plantilla de decision por respuesta

```markdown
## DEC-YYYYMMDD-###

- Estado: proposed|accepted|rejected|superseded
- Fecha:
- Owner:
- Pregunta origen:
- Decision:
- Alternativas consideradas:
- Motivo:
- Consecuencias:
- Riesgos:
- Artefactos afectados:
- Evidencia:
```

## Plantilla de Work Order

```json
{
  "work_order_id": "WO-YYYYMMDD-HHMMSS",
  "project_id": "string",
  "request_type": "feature|bugfix|refactor|docs|release|incident|architecture|skill",
  "objective": "string",
  "scope": ["string"],
  "out_of_scope": ["string"],
  "constraints": {
    "allowed_stack": [],
    "requires_human_gate": false,
    "max_budget": {
      "tokens": 0,
      "tool_calls": 0,
      "minutes": 0
    }
  },
  "acceptance_criteria": ["string"],
  "evidence_required": ["string"]
}
```

## Plantilla de log de agente

```json
{
  "timestamp": "2026-06-01T00:00:00Z",
  "run_id": "RUN-YYYYMMDD-HHMMSS",
  "trace_id": "TRACE-YYYYMMDD-HHMMSS",
  "work_order_id": "WO-YYYYMMDD-HHMMSS",
  "agent_id": "architect_agent",
  "agent_version": "0.1.0",
  "phase": "plan",
  "skill_id": "write_plan_artifact",
  "event": "plan_created",
  "status": "success",
  "duration_ms": 0,
  "model_id": "string",
  "input_tokens": 0,
  "cached_input_tokens": 0,
  "output_tokens": 0,
  "tool_calls": 0,
  "estimated_cost": 0,
  "evidence_path": "docs/IMPLEMENTATION_PLAN.md",
  "error_code": null
}
```

## Plantilla de reporte final

```markdown
# Final Report

- run_id:
- work_order_id:
- project_id:
- status:
- started_at:
- ended_at:
- objective:
- agents_called:
- skills_used:
- artifacts:
- gates:
- tests:
- traceability_coverage:
- decisions:
- risks:
- errors:
- tokens_input:
- tokens_cached:
- tokens_output:
- estimated_cost:
- learning_recorded:
- next_step:
```

## Anti-patrones que el arquitecto debe atacar

- "Hagamos todo desde el principio".
- Agentes con responsabilidades ambiguas.
- Orquestador que tambien implementa.
- Skills sin triggers ni outputs claros.
- Logs legibles pero no estructurados.
- Artefactos humanos sin schema machine-readable cuando alimentan automatizacion.
- Tests por capas horizontales en vez de vertical slices.
- Aprendizaje automatico sin aprobacion.
- Cache sin invalidacion por hash.
- Cambios de dependencias sin decision registrada.
- Acciones externas sin dry-run.
- Cierre sin evidencia.

## Salida esperada al terminar el grill-me

Cuando el grill-me termine, deberian existir o quedar especificados estos documentos:

```text
docs/FACTORY_CONSTITUTION.md
docs/GLOSSARY.md
docs/AGENTS.md
docs/SKILL_CATALOG.md
docs/WORKFLOWS.md
docs/ORCHESTRATOR_ARCHITECTURE.md
docs/TRACEABILITY_MODEL.md
docs/OBSERVABILITY_ARCHITECTURE.md
docs/TOOL_POLICY.md
docs/SECURITY_POLICY.md
docs/MEMORY_POLICY.md
docs/TECH_STACK.md
docs/ROADMAP.md
schemas/work_order.schema.json
schemas/run_state.schema.json
schemas/agent_contract.schema.json
schemas/agent_io.schema.json
schemas/agent_log.schema.json
schemas/tool_call.schema.json
```

## Cierre del arquitecto

El arquitecto no debe intentar resolver todo de una vez. Su trabajo es forzar claridad, registrar decisiones y proteger el diseno de ambiguedades tempranas.

La fabrica deberia nacer pequena, observable, trazable y dificil de romper. Despues puede crecer.
