# GQ-011 - Workflows base de v1

- Estado: accepted
- Fuente: modelo de workflows aceptado en GQ-010
- Pregunta origen: GQ-011
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/workflows/`

## Pregunta

Que workflows base debe traer Gridwork v1 despues de ejecutar `npx gridwork init`, que capacidades deben ser skills y que rol cumple GitHub CLI?

## Por que importa

El usuario quiere flujos donde participa activamente y flujos donde puede estar AFK. Si no se define el modo por workflow, el orquestador no sabra cuando preguntar, cuando bloquear, cuando delegar y cuando puede avanzar solo.

## Respuesta recomendada

Revision aceptada por el usuario: instalar pocos workflows base y mover algunas capacidades a skills.

| Workflow | Modo | Proposito |
|---|---|---|
| `intake-existing-code` | `hitl` | Refinar bugs, mejoras o features sobre codigo existente. |
| `ideation-from-zero` | `hitl` | Convertir una idea ambigua en insumos iniciales de producto. |
| `architecture-ddd` | `hitl` | Disenar arquitectura DDD, APIs, datos, ADRs y patrones. |
| `tdd-implementation` | `afk` | Implementar una issue con TDD mediante Implementer. |
| `verification-pr` | `assisted` | Revisar codigo/PR con Verifier y decidir si vuelve al Implementer. |

Skills base relacionadas:

| Skill | Usada por | Proposito |
|---|---|---|
| `sdd-requirements` | `ideation-from-zero` | Generar el SDD/SRS despues de terminar el grill-me de ideacion. |
| `backlog-planning` | `architecture-ddd` | Crear issues de GitHub por dominios/vertical slices despues del diseno DDD. |
| `github-actions-cicd` | usuario / arquitectura / setup | Ayudar a crear pipelines CI/CD como archivos YAML de GitHub Actions. |
| `github-cli` | workflows que publican/leen issues o PRs | Usar `gh` para interactuar con GitHub de forma gobernada. |
| `github-issue-publisher` | `backlog-planning` | Crear issues reales en GitHub desde drafts aprobados usando `gh issue create`. |
| `github-issue-discovery` | `tdd-implementation`, `verification-pr`, `backlog-planning` | Buscar, filtrar y normalizar issues de GitHub para convertirlas en work orders utilizables por agentes. |
| `html-architecture-diagrams` | `architecture-ddd` | Crear graficos HTML versionados para representar context maps, dominios, flujos y relaciones arquitectonicas. |
| `diagnose-bug` | `intake-existing-code`, `tdd-implementation`, `verification-pr` | Reproducir, minimizar, hipotetizar, instrumentar, corregir y crear regresion para bugs. |
| `handoff` | cualquier workflow | Crear traspaso compacto de estado para otro agente, sesion o hilo. |

## Definiciones de modo

```text
hitl = Human In The Loop. El usuario responde, decide o aprueba pasos importantes.
assisted = El agente avanza, pero pide confirmacion en puntos de decision o side effects.
afk = El agente puede ejecutar la tarea dentro de permisos y gates, sin participacion continua del usuario.
disabled = Existe como workflow, pero no se puede ejecutar hasta activarlo.
```

## Recomendacion de seguridad

Solo `tdd-implementation` deberia ser realmente AFK en v1, y aun asi con limites:

- requiere issue;
- requiere criterios de aceptacion;
- requiere permisos validados;
- no puede hacer deploy;
- no puede leer secretos;
- no puede modificar dependencias sin gate;
- debe dejar evidencia de TDD.

No habra workflow `cicd-release` de agentes en v1. CI/CD se modela como archivos YAML de GitHub Actions, y Gridwork puede tener una skill para ayudar a generarlos.

Las acciones que usen GitHub CLI deben ser `assisted` o requerir aprobacion cuando tengan side effects externos, como crear issues, crear PRs, comentar, cambiar labels o hacer merge.

## Respuesta del usuario

El usuario acepta el catalogo general con estos ajustes:

- `cicd-release` no sera un workflow usado por agentes.
- CI/CD sera un archivo YAML de GitHub Actions.
- Puede existir una skill para ayudar a crear pipelines CI/CD con GitHub Actions.
- `sdd-requirements` se piensa mejor como skill: al terminar `ideation-from-zero`, el agente usa esa skill para generar el SDD.
- `architecture-ddd` si sera un workflow: toma el SDD, hace un grill-me de arquitecto de software y disena el sistema.
- Al finalizar `architecture-ddd`, se usa la skill `backlog-planning` para crear issues de los dominios/vertical slices a construir.
- `tdd-implementation` queda como workflow AFK.
- `verification-pr` queda como workflow.
- `diagnose-bug` se considera skill, no workflow.
- `handoff` se considera skill, no workflow.
- Revision posterior: buscar issues no sera un comando `run implementer`; sera una skill reusable, por ejemplo `github-issue-discovery`, que podra usar el implementador cuando el workflow lo permita.
- Revision posterior: crear issues en el repo debe hacerse mediante una skill, por ejemplo `github-issue-publisher`, usada por `backlog-planning` despues de aprobacion.
- Revision posterior: graficos de arquitectura deben crearse en HTML cuando aplique, posiblemente mediante una skill `html-architecture-diagrams`.
- Gridwork debe considerar el uso de GitHub CLI (`gh`) para flujos relacionados con GitHub.

## Decision registrada

Decision aceptada revisada:

```text
workflow_intake_existing_code = hitl
workflow_ideation_from_zero = hitl
skill_sdd_requirements = true
workflow_architecture_ddd = hitl
skill_backlog_planning = true
workflow_tdd_implementation = afk
workflow_verification_pr = assisted
skill_diagnose_bug = true
skill_handoff = true
workflow_cicd_release = false
skill_github_actions_cicd = true
skill_github_issue_discovery = true
skill_github_issue_publisher = true
skill_html_architecture_diagrams = true
tool_github_cli = supported_governed_tool
```

Regla:

```text
Los workflows coordinan sesiones o ejecuciones.
Las skills producen capacidades reutilizables dentro de esos workflows.
GitHub Actions vive como YAML del repo, no como workflow de agentes.
GitHub CLI se usa como herramienta gobernada, no libre.
```

## Supuestos

- Los workflows de ideacion y arquitectura son conversacionales y requieren usuario.
- La generacion del SDD se hace con una skill al cierre de ideacion.
- El workflow de implementacion puede ser AFK si la issue esta bien especificada.
- GitHub sera parte del flujo de backlog y PR, pero con aprobaciones.
- CI/CD se configura via GitHub Actions YAML.
- GitHub CLI estara disponible bajo policy.

## Riesgos

- Si demasiados workflows son AFK, la fabrica puede avanzar con supuestos no validados.
- Si todo es HITL, la fabrica pierde capacidad de delegacion.
- Si `backlog-planning` crea issues sin revision, puede generar trabajo mal dividido.
- Si GitHub CLI se usa sin allowlist, puede crear side effects no deseados.
- Si la skill de SDD genera un documento pobre, la arquitectura DDD arrastra ambiguedades.

## Preguntas abiertas

- Que labels/milestones debe aplicar `github-issue-publisher` por defecto?
- `verification-pr` puede aprobar merge o solo recomendar?
- `diagnose-bug` debe poder modificar codigo o solo producir reporte?
- Que workflow se ejecuta primero en un repo ya existente?
- Que comandos `gh` estaran permitidos por defecto?
- Donde se guardan los templates de GitHub Actions?

## Artefactos a crear o actualizar

- `.gridwork/workflows/intake-existing-code/`
- `.gridwork/workflows/ideation-from-zero/`
- `.gridwork/workflows/architecture-ddd/`
- `.gridwork/workflows/tdd-implementation/`
- `.gridwork/workflows/verification-pr/`
- `.gridwork/skills/sdd-requirements/`
- `.gridwork/skills/backlog-planning/`
- `.gridwork/skills/github-actions-cicd/`
- `.gridwork/skills/github-issue-publisher/`
- `.gridwork/skills/github-issue-discovery/`
- `.gridwork/skills/html-architecture-diagrams/`
- `.gridwork/skills/diagnose-bug/`
- `.gridwork/skills/handoff/`
- `.gridwork/policies/github-cli-policy.md`
- `docs/WORKFLOW_CATALOG.md`

## Evidencia y notas

- Refleja los workflows propuestos por el usuario durante GQ-001.
- Mantiene `create-skill`, `install-skill`, `create-stack-pack` e `install-stack-pack` fuera de v1.
- Se inspira en las skills de Matt Pocock para `to-issues`, `tdd`, `diagnose`, `review` y `handoff`.
- Corrige el modelo inicial: SDD y backlog planning son skills, no workflows independientes en v1.
- Corrige el modelo inicial: CI/CD no es workflow de agentes, sino GitHub Actions YAML asistido por skill.
- Corrige el modelo inicial: diagnose-bug y handoff tambien son skills reutilizables, no workflows base.
- Revision posterior: la skill `tdd` debe inspirarse en `.example/.agents/skills/tdd/`, usando tracer bullets verticales y tests de comportamiento por interfaces publicas.
