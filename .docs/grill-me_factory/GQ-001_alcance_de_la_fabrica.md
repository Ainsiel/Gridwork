# GQ-001 - Alcance de la fabrica

- Estado: accepted
- Fuente: `grill-me_software_factory.md`
- Pregunta origen: Q001
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `docs/FACTORY_CONSTITUTION.md`

## Pregunta

Que tipo de fabrica quieres construir primero?

Opciones iniciales:

- A. Una herramienta personal/local orientada a un workspace y varios proyectos.
- B. Una plataforma interna para varios usuarios de un equipo.
- C. Un producto multi-tenant para clientes.

## Por que importa

Esta decision define seguridad, aislamiento, storage, UX, permisos, costos, complejidad operativa, roadmap y nivel de observabilidad necesario desde la primera version.

## Respuesta recomendada

Empezar con A: herramienta local-first, multi-proyecto y repo-first. Disenar las interfaces para poder evolucionar a B sin reescribir todo. Evitar C hasta validar el modelo operativo, los workflows, los agentes y la trazabilidad.

## Respuesta del usuario

El usuario quiere una fabrica de software personal, reutilizable y agnostica:

- Debe poder utilizar cualquier tipo de agente.
- Debe poder reutilizarse con cualquier stack tecnologico.
- Debe permitir crear skills especificas para un stack despues de descargar o instalar la fabrica, idealmente mediante un workflow del orquestador u otro mecanismo gobernado.
- Debe tener trazabilidad de agentes y monitoreo simple basado en archivos como JSON, Markdown u otros formatos livianos.
- Los agentes pueden usar varias skills.
- Los agentes deben tener reglas estrictas de permisos y workflows.
- Debe existir un orquestador que delegue tareas a diferentes agentes.
- Deben existir varios flujos de trabajo.
- La forma de descargar, instalar o usar la fabrica aun no esta decidida.
- Se desea evitar dependencias externas y evitar depender de una version especifica de un lenguaje, aunque el usuario acepta evaluar ideas si alguna dependencia minima fuera necesaria.
- La fabrica debe soportar flujos HITL donde el usuario interactua con agentes y flujos AFK donde agentes ejecutan tareas delegadas.

Workflows iniciales propuestos por el usuario:

- Definicion y refinamiento sobre codigo existente: bugs, nuevas funcionalidades, mejoras y modificaciones. Usa un grill-me especializado para transformar requerimientos ambiguos en insumos normalizados para backlog.
- Ideacion de proyecto desde cero: usa grill-me para transformar ideas en varios archivos Markdown y despues generar un documento SDD/SRS enfocado en casos de uso y casos de prueba.
- Diseno de arquitectura del sistema: usa un grill-me especializado para DDD, APIs, base de datos, patrones de diseno, patrones arquitectonicos y ADRs.
- Backlog y planificacion: crea issues de GitHub en vertical slices completas, con criterios de aceptacion y delegacion a agentes.
- Implementacion: agente Implementador toma issues y trabaja con TDD: tests primero, codigo despues, refactor al final.
- Verificacion: agente Verificador revisa codigo/PR antes de decidir push o merge hacia `develop`.
- CI/CD: subir codigo a `develop` y ejecutar despliegue opcional. Si falla, Verificador devuelve trabajo al Implementador.

## Decision registrada

La fabrica se disena como una herramienta personal, agent-agnostic y stack-agnostic, con capacidad de operar sobre proyectos existentes o proyectos desde cero.

Decision inicial:

```text
factory_scope = personal_agent_agnostic_stack_agnostic
```

Se acepta la orientacion local-first/personal, pero se ajusta la recomendacion inicial: no solo multi-proyecto repo-first, sino una fabrica portable que pueda conectarse a distintos repos, stacks, agentes y workflows mediante contratos y skills.

Decision esperada si se acepta la recomendacion:

```text
factory_scope = local_first_multi_project
```

## Supuestos

- La primera version debe priorizar velocidad de aprendizaje, control operativo y portabilidad.
- La fabrica puede crecer hacia una plataforma interna si el MVP demuestra valor, pero no es el objetivo inicial.
- El diseno debe evitar acoplarse a rutas locales hardcodeadas, stacks especificos, proveedores LLM especificos o agentes especificos.
- Los stacks especificos se agregaran mediante skills, stack packs, adapters o workflows posteriores.
- La observabilidad inicial sera file-based y no dependera de una plataforma externa.
- GitHub sera importante para el flujo de backlog, issues, PRs y revision, pero la fabrica no deberia quedar conceptualmente atada solo a GitHub si se quiere mantener agnostica.

## Riesgos

- Si se empieza multi-tenant demasiado pronto, la seguridad y la operacion pueden dominar el proyecto antes de validar valor.
- Si se empieza solo como script local sin contratos, sera dificil evolucionar a plataforma.
- Si no se define aislamiento por proyecto desde v1, la trazabilidad se puede mezclar.
- Si se intenta soportar todos los stacks sin un mecanismo de extension claro, la fabrica se volvera generica pero poco util.
- Si se evita toda dependencia a cualquier costo, el nucleo puede quedar limitado o dificil de mantener.
- Si los agentes son completamente libres, la trazabilidad y los permisos seran dificiles de auditar.
- Si GitHub se integra antes de definir contratos de backlog/issues, el flujo puede quedar acoplado a una herramienta concreta.

## Preguntas abiertas

- Cuantos proyectos debe manejar la v1?
- La fabrica debe operar solo dentro de este repo o sobre multiples repos?
- Habra una sola persona usando la fabrica al inicio?
- Como se descarga, instala o reutiliza la fabrica?
- Que runtime minimo, si existe, se acepta para ejecutar el orquestador?
- Como se definen y cargan skills especificas de stack?
- Como se conectan agentes externos sin romper permisos y trazabilidad?
- Que partes seran HITL y que partes pueden ser AFK?
- Github sera obligatorio o solo un adapter inicial?

## Artefactos a crear o actualizar

- `docs/FACTORY_CONSTITUTION.md`
- `docs/OPERATING_MODEL.md`
- `docs/PROJECT_LAYOUT.md`
- `docs/ROADMAP.md`
- `docs/AGENT_MODEL.md`
- `docs/STACK_EXTENSION_MODEL.md`
- `docs/WORKFLOWS.md`
- `docs/GITHUB_WORKFLOW.md`
- `docs/TDD_IMPLEMENTATION_WORKFLOW.md`
- `docs/VERIFICATION_WORKFLOW.md`

## Evidencia y notas

- Inspirado en `.example/fabrica destilada`, que prioriza una fabrica minima gobernable.
- Inspirado en `.example/Fabrica BASICA APP WEB`, que usa `.factory/runs/<cycle_id>/` para estado, logs y evidencia por corrida.
