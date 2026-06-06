# GQ-127 - Implementar en profundidad skills de arquitectura y stack

- Estado: accepted
- Fuente: correccion directa del usuario despues de GQ-125
- Pregunta origen: GQ-127
- Fecha de apertura: 2026-06-06
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: skills core, stack pack, agente Arquitecto, workflows, policies y validacion CLI

## Problema detectado

La auditoria de GQ-125 completo el inventario nominal, pero varias skills seguian siendo descripciones cortas sin procedimiento, decisiones, criterios de calidad, evidencia o salidas suficientemente definidas.

```text
core_skills_before = 13
stack_skills_before = 4
shallow_skill_examples = diagnose-bug,html-architecture-diagrams,nextjs-frontend-guidance,springboot-backend-guidance
architecture_skill_gap = DDD,Clean Architecture,APIs,data,ADRs,patterns,specialized diagrams
```

## Decision

Implementar las skills como contratos operativos accionables y ampliar el catalogo:

```text
core_skills_after = 25
stack_skills_after = 10
total_actionable_skills = 35
agents = 6
workflows = 5
init_generates_product_code = false
stack_skills_may_modify_confirmed_scope_under_work_order = true
```

## Skills arquitectonicas agregadas

```text
architecture-grill-me
ubiquitous-language
domain-driven-design
clean-architecture
architecture-pattern-selection
design-pattern-selection
api-contract-design
relational-data-modeling
architecture-decision-records
c4-html-diagrams
erd-html-diagrams
uml-html-diagrams
```

El workflow `architecture-ddd` inicia con un grill-me adaptativo. Las skills tecnicas y de diagramas son opcionales y deben seleccionarse solamente cuando respondan una decision o pregunta concreta.

## Stack pack implementado

```text
Next.js = frontend guidance, UI design, performance
Spring Boot = backend guidance, performance
PostgreSQL = persistence guidance, performance
Docker = Dockerfile authoring, Compose local guidance, Compose optimization
```

Las cuatro skills iniciales fueron profundizadas y se agregaron seis skills especializadas. El stack pack no genera codigo durante `init`; un Implementador puede usarlo posteriormente solo dentro de un work order aprobado y rutas confirmadas.

## Skills core profundizadas

```text
sdd-requirements
backlog-planning
diagnose-bug
github-actions-cicd
github-cli
github-issue-discovery
github-issue-publisher
html-architecture-diagrams
```

## Policies y templates

Se agregaron policies para diseño arquitectonico, diagramas HTML y uso de stack skills. Tambien se agregaron templates para cuestionario, overview, bounded contexts, ADRs, decisiones de patrones, APIs, datos, notas de diagramas y un shell HTML autocontenido.

## Validacion

```text
skill_catalog_registration = pass
agent_workflow_skill_graph = pass
all_skills_have_actionable_instructions = pass
npm_test = pass
npm_test_count = 29
npm_pack_cli_dry_run = pass
factory_ascii_check = pass
factory_release_dry_run = pass
factory_release_bundle_file_count = 179
remote_publish = not_executed
```

La suite ahora rechaza skills core o stack que no contengan instrucciones sustantivas y una seccion de ejecucion accionable.
Tambien valida que las skills de stack no generen codigo durante `init` y que el template HTML no tenga dependencias remotas.

## Siguiente gate

```text
GQ-126 - Validar la fabrica expandida mediante dogfooding end-to-end
```

El siguiente paso recomendado sigue siendo probar la fabrica en un repositorio sandbox antes de preparar otra release.
