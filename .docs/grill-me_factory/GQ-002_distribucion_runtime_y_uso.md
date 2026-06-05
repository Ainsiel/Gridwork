# GQ-002 - Distribucion, runtime y uso de la fabrica

- Estado: accepted
- Fuente: respuesta del usuario a GQ-001
- Pregunta origen: GQ-002
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `docs/OPERATING_MODEL.md`

## Pregunta

Como quieres descargar, instalar y ejecutar la fabrica personal?

Opciones iniciales:

- A. Repo template: clonas o copias una carpeta de fabrica dentro de cada proyecto.
- B. CLI instalada una vez: una herramienta central gestiona multiples proyectos/repos.
- C. Bundle portable: una carpeta autocontenida que se copia a cualquier repo y se ejecuta con scripts minimos.
- D. Hibrido: bundle portable para el nucleo y adapters opcionales por stack/agente/tool.

## Por que importa

Esta decision condiciona casi todo: dependencias, portabilidad, estructura de carpetas, forma de cargar skills, como se guardan logs, como se conecta con GitHub, como se ejecutan agentes externos y que tan facil es reutilizar la fabrica en distintos stacks.

Tambien tensiona un requisito clave: el usuario quiere evitar dependencias externas y versiones especificas de lenguaje, pero una fabrica con orquestador real normalmente necesita algun runtime o convencion minima.

## Respuesta recomendada vigente

Usar D: un hibrido portable, revisado para v1 como `init-only`.

El nucleo de la fabrica deberia instalarse dentro del repo como una carpeta autocontenida, principalmente `.gridwork/`, con:

- templates Markdown;
- schemas JSON;
- workflows declarativos;
- definiciones de agentes;
- catalogo de skills;
- reglas de permisos;
- prompts Markdown;
- stack packs predefinidos;
- policies de trazabilidad, permisos y uso de herramientas.

Para v1, no se ejecutan workflows con la CLI. La CLI en TypeScript solo instala o actualiza la fabrica:

```bash
npx gridwork init
```

Luego el usuario activa un workflow pasando un prompt Markdown al agente por chat:

```text
Quiero que leas `.gridwork/agents/orchestrator/PROMPT.md`
y actues como el orquestador de Gridwork.
```

Recomendacion concreta:

```text
distribution_model = portable_bundle_installed_by_npx_init
runtime_model = no_workflow_runner_in_v1
cli_model = typescript_init_only
workflow_execution_model = prompt_md_used_in_agent_chat
```

Esto mantiene la fabrica reutilizable y agnostica, evita dependencias operativas fuertes y deja abierta la automatizacion futura sin meter `gridwork run` en v1.

## Analisis profundo de opciones

### Opcion A - Repo template

La fabrica se distribuye como una plantilla de repositorio. Para usarla, se clona un repo base o se copia una estructura inicial dentro de cada proyecto.

Ejemplo conceptual:

```text
mi-proyecto/
  .factory/
    agents/
    skills/
    workflows/
    schemas/
    runs/
  docs/
  src/
```

#### Ventajas

- Es facil de entender: todo vive dentro del repo del proyecto.
- La trazabilidad queda junto al codigo, lo que facilita auditar cambios.
- No requiere una instalacion global.
- Funciona bien para proyectos nuevos.
- Permite versionar la configuracion de la fabrica junto con el proyecto.
- Es compatible con GitHub, issues, PRs, CI/CD y ramas por dominio.
- Si el proyecto se comparte, otro agente o humano puede leer el estado completo sin depender de una maquina especifica.

#### Desventajas

- Puede contaminar el repo con muchos archivos operativos si no se separa bien `.factory/runs`.
- Actualizar la fabrica en muchos proyectos puede ser tedioso.
- Cada repo podria terminar con una version distinta de agentes, workflows y skills.
- Si la fabrica incluye scripts, cada repo hereda tambien sus dependencias.
- No es ideal si quieres operar sobre muchos repos desde un panel central.

#### Riesgos

- Drift entre proyectos: cada copia de la fabrica evoluciona distinto.
- Dificultad para aplicar updates globales.
- Duplicacion de skills y workflows.
- Si el template esta demasiado cargado, instalarlo se siente pesado.

#### Cuando conviene

- Cuando la fabrica se usa principalmente en proyectos nuevos.
- Cuando quieres que la auditoria viva dentro del repo.
- Cuando prefieres simplicidad y cero instalacion global.
- Cuando el usuario principal eres tu y no un equipo grande.

#### Impacto en agentes, skills y workflows

- Agentes: se definen dentro del repo.
- Skills: pueden vivir dentro del repo o copiarse como packs.
- Workflows: versionados por proyecto.
- Logs: quedan en `.factory/runs`.
- GitHub: integracion natural, porque todo esta en el repo.

### Opcion B - CLI instalada una vez

La fabrica se instala como una herramienta central. Por ejemplo, un comando `factory` que puede operar sobre cualquier repo.

Ejemplo conceptual:

```text
factory init
factory run intake
factory run architecture
factory runs list
factory attach ../mi-proyecto
```

La fabrica vive fuera del proyecto, por ejemplo en una carpeta global:

```text
~/.factory/
  agents/
  skills/
  workflows/
  registry/
```

Y cada proyecto puede tener solo una configuracion minima:

```text
mi-proyecto/
  .factory-project.json
  docs/
  src/
```

#### Ventajas

- Una sola instalacion para multiples proyectos.
- Mas facil actualizar el core de la fabrica.
- Permite operar varios repos desde una vista central.
- Puede tener comandos estandarizados.
- Facilita un futuro dashboard.
- Permite separar el core de los artefactos del proyecto.
- Es mas parecido a una herramienta profesional reutilizable.

#### Desventajas

- Requiere instalacion de algun runtime o binario.
- Pierde algo de portabilidad si la maquina no tiene la CLI.
- Si la configuracion global se rompe, afecta a todos los proyectos.
- La trazabilidad puede quedar partida entre el repo y la carpeta global.
- Puede ser mas dificil para otro agente entender el estado completo si no sabe donde esta la instalacion global.

#### Riesgos

- Acoplamiento a una version de CLI.
- Problemas de compatibilidad entre versiones del core y configuraciones de proyecto.
- Mayor complejidad inicial.
- Requiere una estrategia clara de updates, backups y migraciones.

#### Cuando conviene

- Cuando ya tienes muchos proyectos.
- Cuando quieres una experiencia tipo herramienta personal.
- Cuando aceptas instalar una dependencia minima.
- Cuando quieres comandos y monitoreo centralizado.

#### Impacto en agentes, skills y workflows

- Agentes: pueden vivir en un registry global.
- Skills: se instalan y actualizan centralmente.
- Workflows: pueden versionarse globalmente y sobreescribirse por proyecto.
- Logs: pueden quedar en el proyecto, globales, o ambos.
- GitHub: la CLI puede manejar tokens/adapters, pero debe cuidar secretos.

### Opcion C - Bundle portable

La fabrica se entrega como una carpeta autocontenida que puedes copiar a cualquier proyecto. No es exactamente un template completo ni una CLI global. Es mas parecido a un kit portable.

Ejemplo conceptual:

```text
mi-proyecto/
  .gridwork-factory/
    README.md
    agents/
    workflows/
    skills/
    schemas/
    templates/
    scripts/
  .factory/
    runs/
    state/
```

El bundle contiene todo lo necesario para gobernar la fabrica, y los scripts pueden ser opcionales.

#### Ventajas

- Muy portable.
- No requiere instalacion global.
- Se puede copiar, inspeccionar y versionar.
- El core puede ser mayormente declarativo: Markdown, JSON, schemas.
- Permite funcionar en modo manual/HITL aunque no se ejecute ningun script.
- Encaja muy bien con tu idea de archivos `.md`, `.json` y trazabilidad simple.
- Puede ser agnostico a stacks si los stack packs son carpetas opcionales.

#### Desventajas

- Actualizar muchos bundles puede ser incomodo.
- Si no hay runner, algunas partes quedan manuales.
- Si cada proyecto modifica el bundle, aparece drift.
- Puede duplicar muchos archivos.
- No resuelve por si solo comandos, dashboard o ejecucion multi-repo.

#### Riesgos

- Que se convierta en documentacion bonita sin automatizacion real.
- Que los scripts opcionales terminen siendo necesarios pero no esten estandarizados.
- Que sea dificil saber que version del bundle tiene cada proyecto.

#### Cuando conviene

- Cuando quieres maxima portabilidad.
- Cuando no quieres depender de instalacion global.
- Cuando quieres poder abrir un repo y entender toda la fabrica desde archivos.
- Cuando el MVP prioriza claridad, trazabilidad y workflows antes que automatizacion completa.

#### Impacto en agentes, skills y workflows

- Agentes: declarados como archivos dentro del bundle.
- Skills: carpetas portables con manifest y reglas.
- Workflows: Markdown/JSON versionados.
- Logs: dentro de `.factory/runs`.
- GitHub: puede existir como adapter opcional.

### Opcion D - Hibrido portable + runner/adapters opcionales

Esta opcion combina el core declarativo de C con la posibilidad de ejecutar automatizaciones mediante un runner opcional. La fabrica no depende conceptualmente de un lenguaje, pero si quieres orquestacion automatica, usas un runner.

Ejemplo conceptual:

```text
mi-proyecto/
  .gridwork/
    factory.json
    agents/
    skills/
    workflows/
    schemas/
    policies/
    stack-packs/
      python-fastapi/
      node-nextjs/
      dotnet/
    adapters/
      github/
      codex/
      claude/
      openai/
  .factory/
    runs/
    logs/
    artifacts/
```

Y opcionalmente:

```text
factory run intake
factory run architecture
factory run backlog
factory run implement --issue 123
```

#### Ventajas

- Mantiene el core portable y legible.
- Permite operar manualmente si no hay runner.
- Permite automatizar cuando si hay runtime.
- Facilita stacks especificos mediante `stack-packs`.
- Facilita agentes especificos mediante `agent-adapters`.
- Permite empezar simple y crecer sin cambiar el modelo mental.
- Encaja bien con fabrica personal, agnostica y extensible.
- Permite monitoreo file-based desde el inicio.
- Reduce el acoplamiento a GitHub, modelos LLM o stacks concretos.

#### Desventajas

- Hay que disenar buenos contratos desde el inicio.
- Es mas complejo que un template puro.
- Requiere decidir que vive en el core, que vive en el runner y que vive en adapters.
- Si se abusa de adapters, puede volverse dificil de mantener.
- Requiere una convencion clara de versionado.

#### Riesgos

- Disenar demasiada abstraccion antes de validar workflows reales.
- Crear un sistema extensible pero dificil de usar.
- Que "agnostico" se vuelva sinonimo de "sin decisiones".
- Que los stack packs no tengan suficiente poder para ser utiles.

#### Cuando conviene

- Cuando quieres una fabrica personal reutilizable en muchos stacks.
- Cuando quieres evitar dependencia fuerte de un lenguaje, pero aceptas un runner minimo.
- Cuando quieres que la fabrica funcione con distintos agentes.
- Cuando quieres crear skills especificas para stacks despues de instalarla.
- Cuando quieres crecer hacia CLI, GitHub, CI/CD y dashboard sin redisenar todo.

#### Impacto en agentes, skills y workflows

- Agentes: contratos declarativos + adapters para ejecutarlos.
- Skills: manifest + instrucciones + permisos + outputs esperados.
- Workflows: declarativos, ejecutables por runner si existe.
- Logs: file-based en JSONL/MD.
- GitHub: adapter opcional.
- Stack tecnologico: stack packs opcionales.

## Comparacion rapida

| Criterio | A. Repo template | B. CLI global | C. Bundle portable | D. Hibrido |
|---|---|---|---|---|
| Portabilidad | Media | Media | Alta | Alta |
| Automatizacion | Media | Alta | Baja/Media | Alta gradual |
| Sin instalacion global | Si | No | Si | Si, si el runner es opcional |
| Multi-repo | Baja/Media | Alta | Media | Alta futura |
| Versionado por proyecto | Alto | Bajo/Medio | Alto | Alto con core versionado |
| Actualizaciones globales | Dificil | Facil | Dificil/Media | Media |
| Agnostico a stacks | Medio | Alto si esta bien disenada | Alto | Alto |
| Agnostico a agentes | Medio | Alto | Alto | Alto |
| Complejidad inicial | Baja | Media/Alta | Baja/Media | Media |
| Mejor para tu vision | Parcial | Parcial | Muy buena | Mejor equilibrio |

## Recomendacion arquitectonica refinada

La opcion mas alineada con la vision actual es D, pero implementada en fases para no sobrediseniar:

### Fase 1 - Core declarativo portable

Crear una carpeta de fabrica que pueda copiarse a cualquier repo:

```text
.gridwork/
  factory.json
  agents/
  workflows/
  skills/
  schemas/
  policies/
  templates/
```

Y una carpeta operacional:

```text
.factory/
  runs/
  logs/
  artifacts/
  memory/
```

En esta fase, la fabrica ya sirve como guia, sistema de trazabilidad y estructura de trabajo HITL.

### Fase 2 - Runner minimo opcional y diferido

Agregar un runner opcional que ejecute workflows declarativos podria ser una fase futura, no parte de v1.

En v1, el "runner" efectivo es el agente leyendo prompts Markdown en el chat. Si mas adelante se quisiera automatizar, un runner podria leer los mismos archivos `.gridwork/`, pero esa decision queda diferida.

Regla:

```text
El core define que se debe hacer.
El prompt activa el workflow.
El agente ejecuta siguiendo orquestador, skills y policies.
Un runner futuro solo podria automatizar ese contrato.
Los stack packs especializan tecnologia.
```

### Fase 3 - Stack packs

Permitir paquetes por stack:

```text
stack-packs/
  python-fastapi/
    skills/
    workflows/
    test-policy.md
    architecture-defaults.md
  nextjs/
  dotnet/
  laravel/
```

Cada stack pack debe declarar:

- cuando aplica;
- skills que agrega;
- workflows que modifica;
- comandos permitidos;
- tests recomendados;
- convenciones de arquitectura;
- limites y riesgos.

### Fase 4 - Agent adapters

Permitir que distintos agentes se conecten a la fabrica:

```text
adapters/
  codex/
  claude/
  openai/
  local-llm/
```

Cada adapter debe traducir el contrato de la fabrica al formato del agente, sin cambiar las reglas del core.

## Pregunta mas importante dentro de GQ-002

La decision real no es solo "como descargar". La decision critica es esta:

```text
Quieres que la fabrica sea primero un sistema declarativo portable que luego gana automatizacion,
o quieres que desde el inicio sea una CLI ejecutable?
```

Mi recomendacion:

```text
Primero sistema declarativo portable.
Despues runner minimo.
Despues adapters y stack packs.
```

## Caso simulado historico: CLI en TypeScript con `run` (obsoleto)

> Nota vigente: esta seccion quedo obsoleta por la decision posterior `gridwork_run_command_v1 = false`.
> Se conserva como contraste historico, pero no representa el modelo actual de Gridwork v1.
> Los comandos `gridwork run`, `gridwork stack add`, `gridwork agent add`, `gridwork github connect` y `gridwork issues publish` no existen en v1.
> El modelo actual es: `npx gridwork init` instala la fabrica y el usuario activa workflows pasando prompts Markdown al agente por chat.

Este caso asume que Gridwork existe como una CLI escrita en TypeScript y distribuida como paquete ejecutable.

### 1. Crear y clonar un repositorio nuevo

El usuario crea un repositorio nuevo en GitHub, por ejemplo:

```text
github.com/usuario/mi-app
```

Luego lo clona y abre en el IDE:

```bash
git clone git@github.com:usuario/mi-app.git
cd mi-app
code .
```

En este punto el proyecto puede estar vacio o puede tener ya un stack, por ejemplo Next.js, NestJS, Laravel, .NET, FastAPI u otro.

### 2. Descargar o ejecutar Gridwork

Si Gridwork es una CLI TypeScript, hay varias formas posibles de usarla:

```bash
npx gridwork init
```

o:

```bash
pnpm dlx gridwork init
```

o instalacion global:

```bash
npm install -g gridwork
gridwork init
```

La opcion mas portable para empezar seria `npx` o `pnpm dlx`, porque no obliga a una instalacion global permanente.

### 3. Inicializar la fabrica dentro del repo

El comando:

```bash
gridwork init
```

crea el nucleo declarativo de la fabrica dentro del proyecto:

```text
mi-app/
  .gridwork/
    factory.json
    agents/
      orchestrator.md
      intake-agent.md
      architect-agent.md
      planner-agent.md
      implementer-agent.md
      verifier-agent.md
    workflows/
      01-intake-existing-code.md
      02-ideation-from-zero.md
      03-sdd-requirements.md
      04-architecture-ddd.md
      05-backlog-planning.md
      06-tdd-implementation.md
      07-verification-pr.md
      08-cicd-release.md
    skills/
      grill-me/
      to-prd/
      to-issues/
      tdd/
      review/
      diagnose/
      handoff/
    policies/
      permissions.md
      tool-allowlist.md
      human-gates.md
      traceability.md
    schemas/
      work-order.schema.json
      agent-run.schema.json
      workflow-run.schema.json
      tool-call.schema.json
    templates/
      sdd.md
      adr.md
      issue.md
      final-report.md

  .factory/
    runs/
    logs/
    artifacts/
    memory/
```

La carpeta `.gridwork/` representa el diseno y las reglas de la fabrica.

La carpeta `.factory/` representa la operacion: corridas, logs, evidencias, reportes y memoria.

### 4. Elegir modo de uso

Despues del init, la CLI pregunta o permite configurar:

```text
Como quieres usar Gridwork?

1. Solo documentos y workflows manuales
2. Workflows asistidos por CLI
3. Workflows con agentes conectados
```

Para la vision del usuario, lo recomendado seria:

```text
2 primero, 3 despues.
```

Es decir: partir con workflows asistidos, trazabilidad y archivos; despues conectar agentes concretos.

### 5. Detectar o instalar stack packs

Si el repo esta vacio, Gridwork puede preguntar:

```text
Quieres crear un proyecto desde cero o conectar Gridwork a un proyecto existente?
```

Si el repo ya tiene codigo, la CLI puede detectar stack:

```bash
gridwork stack detect
```

Ejemplo de salida:

```text
Detected:
- package.json
- tsconfig.json
- next.config.ts

Suggested stack pack:
- nextjs-typescript
```

Luego el usuario puede instalar un stack pack:

```bash
gridwork stack add nextjs-typescript
```

Eso agregaria:

```text
.gridwork/stack-packs/nextjs-typescript/
  skills/
  workflows/
  testing-policy.md
  architecture-defaults.md
  allowed-commands.json
```

Asi la fabrica base sigue siendo agnostica, pero gana conocimiento especifico para Next.js.

### 6. Conectar agentes

Gridwork no deberia asumir un unico agente.

Podria tener adapters:

```bash
gridwork agent add codex
gridwork agent add claude
gridwork agent add openai
gridwork agent add local
```

Esto no cambia los workflows base. Solo agrega una forma de ejecutar agentes respetando contratos:

```text
.gridwork/adapters/codex/
.gridwork/adapters/claude/
.gridwork/adapters/openai/
```

Regla:

```text
El adapter traduce.
El adapter no decide permisos.
El adapter no cambia workflows.
```

### 7. Ejecutar un flujo de ideacion desde cero

Si el proyecto esta vacio:

```bash
gridwork run ideation
```

La CLI crea una corrida:

```text
.factory/runs/RUN-20260602-001/
  state.json
  user-input.md
  agent_logs/
  decisions.md
  final-report.md
```

Y va generando archivos del grill-me:

```text
docs/gridwork/intake/
  GQ-001_product_idea.md
  GQ-002_users.md
  GQ-003_core_use_cases.md
```

Cuando el grill-me termina, se pasa al flujo de SDD:

```bash
gridwork run sdd
```

Y se genera algo como:

```text
docs/sdd/
  SDD.md
  use-cases.md
  test-cases.md
  acceptance-criteria.md
```

### 8. Ejecutar diseno DDD y arquitectura

Despues del SDD:

```bash
gridwork run architecture-ddd
```

Esto crea:

```text
docs/architecture/
  domain-model.md
  ubiquitous-language.md
  bounded-contexts.md
  api-design.md
  data-model.md
  adr/
    ADR-001-architecture-style.md
    ADR-002-database-choice.md
```

### 9. Crear backlog e issues de GitHub

Luego:

```bash
gridwork run backlog
```

Si GitHub esta configurado:

```bash
gridwork github connect
gridwork issues publish
```

El flujo crea issues como vertical slices:

```text
Issue #1 - Crear flujo de registro de usuario end-to-end
Issue #2 - Crear flujo de login end-to-end
Issue #3 - Crear dashboard inicial end-to-end
```

Cada issue deberia tener:

- descripcion;
- criterios de aceptacion;
- tests esperados;
- trazabilidad a SDD;
- agente sugerido;
- bloqueo/dependencias;
- tipo `AFK` o `HITL`.

### 10. Implementacion con TDD

Cuando una issue esta lista:

```bash
gridwork run implement --issue 1
```

El orquestador:

1. Lee la issue.
2. Verifica permisos.
3. Crea run.
4. Activa Implementer.
5. Exige TDD:
   - escribir test;
   - ver test fallar;
   - implementar;
   - ver test pasar;
   - refactorizar;
   - registrar evidencia.

Los logs quedan en:

```text
.factory/runs/RUN-.../
  state.json
  agent_logs/implementer.jsonl
  tool_calls.jsonl
  test-report.md
  traceability.md
```

### 11. Verificacion y PR

Luego:

```bash
gridwork run verify --pr local
```

O si existe PR:

```bash
gridwork run verify --pr 12
```

El Verificador revisa:

- si cumple la issue;
- si cumple criterios de aceptacion;
- si respeta DDD;
- si los tests son adecuados;
- si hay scope creep;
- si hay riesgos;
- si puede sugerir merge a `develop`.

Si falla:

```text
Verifier -> finding -> Implementer -> fix -> tests -> verify again
```

### 12. CI/CD opcional

Finalmente:

```bash
gridwork run release --target develop
```

El flujo puede:

- verificar estado;
- revisar gates;
- preparar push;
- ejecutar dry-run;
- pedir aprobacion;
- hacer push o sugerir merge;
- ejecutar deploy opcional.

## Idea central del caso TypeScript

Aunque la CLI este hecha en TypeScript, la fabrica no queda atada a TypeScript porque:

- los workflows son Markdown/JSON;
- los agentes se definen por contratos;
- las skills son carpetas declarativas;
- los stack packs agregan conocimiento especifico;
- los adapters conectan agentes concretos;
- los logs y reportes son archivos simples.

La CLI TypeScript solo es el runner inicial.

Si algun dia se quisiera otro runner, por ejemplo Python o Go, podria leer los mismos archivos `.gridwork/`.

## Respuesta del usuario

El usuario acepta la opcion D:

- Gridwork sera una fabrica hibrida.
- La CLI se implementara en TypeScript.
- La forma inicial de uso sera mediante `npx`.
- El usuario ejecutara `gridwork init` despues de clonar o abrir un repo.
- El core sera portable y declarativo.
- Correccion posterior: en v1 la CLI no ejecutara workflows con comandos `run`.
- Correccion posterior: en v1 la CLI solo instalara/descargara la fabrica con agentes, skills, workflows, policies y prompts.
- Correccion posterior: para usar un workflow, el usuario tomara un prompt Markdown generado y se lo pasara al agente por chat.

## Decision registrada

Se acepta el modelo revisado:

```text
distribution_model = portable_bundle_plus_optional_runner
runtime_model = typescript_init_cli_only_for_v1
install_model = npx_gridwork_init
workflow_execution_model = prompt_md_used_in_agent_chat
gridwork_run_command_v1 = false
```

Flujo inicial esperado:

```bash
npx gridwork init
```

Luego el repo queda preparado con carpetas de definicion de fabrica, agentes, skills, workflows, prompts y carpetas operativas de runtime. El usuario activa el orquestador manualmente por chat con un prompt Markdown.

## Supuestos

- La fabrica debe poder copiarse o instalarse en distintos repos.
- El nucleo debe ser legible aun sin ejecutar codigo.
- Los adapters para stacks, agentes y herramientas deben ser opcionales.
- La ejecucion automatizada queda diferida. En v1 el "runner" real es el agente leyendo prompts Markdown en el chat.

## Riesgos

- Sin prompts estrictos, la fabrica puede quedar como documentacion sin gobernanza real.
- Con un runtime demasiado especifico, se pierde portabilidad.
- Si la fabrica vive dentro de cada repo, mantener versiones entre proyectos puede ser dificil.
- Si la fabrica vive fuera de los repos, puede costar integrarla con contexto, logs y artifacts locales.

## Preguntas abiertas

- La fabrica debe vivir dentro del repo del proyecto o en una ubicacion central?
- Debe existir un comando tipo `factory init`?
- Los stack packs se descargan desde un repo, se copian localmente o se generan con un workflow?
- La fabrica debe poder funcionar offline?
- Que carpetas se versionan en Git y cuales quedan ignoradas?
- El paquete npm se llamara `gridwork`, `@gridwork/cli` u otro nombre?

## Artefactos a crear o actualizar

- `docs/OPERATING_MODEL.md`
- `docs/DISTRIBUTION_MODEL.md`
- `docs/RUNTIME_MODEL.md`
- `docs/STACK_EXTENSION_MODEL.md`
- `docs/ADAPTER_MODEL.md`

## Evidencia y notas

- La fabrica de `.example/Fabrica BASICA APP WEB` usa Python como runner operativo.
- La fabrica destilada demuestra que gran parte del gobierno puede vivir en Markdown sin runtime complejo.
- Una arquitectura hibrida permite tener gobierno declarativo y automatizacion incremental.
- Revision posterior: para v1, Gridwork no tendra `run`; solo `init` y prompts Markdown para chat.
