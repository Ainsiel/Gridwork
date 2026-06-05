# GQ-003 - Versionado Git y runtime local

- Estado: accepted
- Fuente: decision aceptada en GQ-002
- Pregunta origen: GQ-003
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `docs/PROJECT_LAYOUT.md`

## Pregunta

Cuando `npx gridwork init` prepare un repo, que carpetas y archivos deben quedar versionados en Git y cuales deben quedar como runtime local ignorado?

## Por que importa

Esta decision define si la fabrica sera auditable y portable sin ensuciar el repositorio con logs, cache, tokens, archivos temporales o corridas historicas demasiado pesadas.

Tambien define como otro agente, otra maquina o un futuro clone del repo podra entender las reglas de la fabrica sin necesitar tu estado local.

## Respuesta recomendada

Versionar la definicion de la fabrica, no todo su historial operativo.

Recomendacion concreta:

```text
.gridwork/          => versionado en Git
.gridwork-lock.json => versionado en Git
.factory/           => parcialmente ignorado
```

`.gridwork/` contiene reglas, workflows, agentes, skills, schemas, policies y templates. Debe commitearse porque es la fuente de verdad de como opera la fabrica en ese repo.

`.gridwork-lock.json` contiene la version instalada de la fabrica, source, hashes y metadata reproducible. Debe commitearse para que otro clone use la misma fabrica y pueda validar cambios.

`.factory/` contiene runs, logs, cache, artifacts temporales, memoria local y evidencias. Debe ignorarse por defecto, salvo reportes o artefactos explicitos que se decida publicar.

## Respuesta del usuario

El usuario acepta la sugerencia:

- `.gridwork/` debe versionarse en Git.
- `.factory/` debe ser runtime local e ignorarse por defecto.
- `gridwork init` debe actualizar `.gitignore`.
- Se deben ignorar especialmente runs, logs, cache y temporales.

## Decision registrada

Decision aceptada:

```text
git_versioned_factory_definition = .gridwork/
git_versioned_factory_lockfile = .gridwork-lock.json
local_factory_runtime = .factory/
local_factory_cache = .factory/cache/
gridwork_init_updates_gitignore = true
```

Regla:

```text
La definicion de la fabrica se versiona.
La operacion local de la fabrica no se versiona por defecto.
La cache local verificada vive en `.factory/cache/` y no se versiona.
```

## Propuesta de layout

```text
mi-proyecto/
  .gridwork/
    factory.json
    agents/
    skills/
    workflows/
    policies/
    schemas/
    templates/
    stack-packs/
    adapters/

  .gridwork-lock.json

  .factory/
    runs/
    logs/
    cache/
    tmp/
    memory/
    artifacts/

  docs/
    sdd/
    architecture/
    adr/
    backlog/
```

## Propuesta de versionado

| Ruta | Git | Motivo |
|---|---|---|
| `.gridwork/factory.json` | si | Configuracion canonica de la fabrica para el repo. |
| `.gridwork/agents/` | si | Define agentes disponibles y sus reglas. |
| `.gridwork/skills/` | si | Define skills instaladas o creadas para el repo. |
| `.gridwork/workflows/` | si | Define workflows permitidos. |
| `.gridwork/policies/` | si | Permisos, gates, tool allowlist y reglas. |
| `.gridwork/schemas/` | si | Contratos machine-readable. |
| `.gridwork/templates/` | si | Plantillas de artefactos. |
| `.gridwork/stack-packs/` | si | Especializacion del stack, si aplica al repo. |
| `.gridwork/adapters/` | si/parcial | Solo manifests/config sin secretos. |
| `.gridwork-lock.json` | si | Version instalada, source, hashes y reproducibilidad de la fabrica. |
| `.factory/runs/` | no por defecto | Historial operativo local y potencialmente voluminoso. |
| `.factory/logs/` | no | Logs locales, pueden tener datos sensibles o ruido. |
| `.factory/cache/` | no | Cache local invalidable. |
| `.factory/tmp/` | no | Archivos temporales. |
| `.factory/memory/` | depende | Solo memoria aprobada y sanitizada podria versionarse. |
| `.factory/artifacts/` | depende | Evidencia final puede moverse a `docs/` si debe versionarse. |

## Supuestos

- La fabrica debe poder entenderse desde el repo clonado.
- Los logs crudos no deberian commitearse por defecto.
- La memoria permanente requiere una politica de aprobacion.
- Los reportes finales importantes pueden copiarse a `docs/` para versionarse.

## Riesgos

- Si `.factory/` se commitea completo, el repo puede llenarse de ruido y datos sensibles.
- Si `.gridwork/` no se commitea, el repo pierde su definicion de fabrica.
- Si la memoria se ignora siempre, se pierde aprendizaje entre maquinas.
- Si la memoria se versiona sin filtros, puede contaminar futuros ciclos o filtrar informacion sensible.

## Preguntas abiertas

- Quieres que `.factory/memory/` tenga una parte versionada y otra local?
- Los final reports deben quedarse en `.factory/runs` o copiarse a `docs/gridwork/reports/`?
- Debe existir un comando para publicar evidencia desde `.factory/` hacia `docs/`?

## Artefactos a crear o actualizar

- `docs/PROJECT_LAYOUT.md`
- `docs/GIT_VERSIONING_POLICY.md`
- `docs/MEMORY_POLICY.md`
- `.gitignore`

## Evidencia y notas

- `.example/Fabrica BASICA APP WEB` guarda runs en `.factory/runs/`.
- La fabrica destilada usa documentos versionables simples como `AGENTS.md`, `FACTORY.md`, `rules/` y `workflows/`.
- Para Gridwork conviene separar definicion versionada de operacion local.
- Revision posterior GQ-077: `.gridwork-lock.json` tambien se versiona en la raiz, con contrato deterministico y sin secretos.
- Revision posterior GQ-084: `.factory/cache/` guarda cache local verificada de bundles y permanece ignorada por Git.
