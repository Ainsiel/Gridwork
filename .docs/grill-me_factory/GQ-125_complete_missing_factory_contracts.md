# GQ-125 - Completar agentes, workflows y skills faltantes

- Estado: accepted
- Fuente: solicitud directa del usuario despues de GQ-124
- Pregunta origen: GQ-125
- Fecha de apertura: 2026-06-06
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: fabrica `full-v1`, contratos operativos y validacion CLI

## Pregunta

Que agentes, workflows y skills acordados durante el grill-me faltan por implementar en la fabrica `full-v1`?

## Auditoria

```text
agents_promised = 6
agents_actual_before = 6
agents_missing = none

workflows_promised = 5
workflows_actual_before = 5
workflows_missing = none

skills_promised = 12
skills_actual_core_before = 10
skills_missing = tdd,git-branch-management,github-label-manager
```

El catalogo de agentes y workflows ya estaba completo. El trabajo faltante era convertir tres decisiones del grill-me en skills operativas e integrarlas a los contratos existentes.

## Decision

Aceptada:

```text
add_new_agents = false
add_new_workflows = false
add_skills = tdd,git-branch-management,github-label-manager
integrate_existing_agents_and_workflows = true
enforce_full_v1_inventory = true
```

### Skill `tdd`

- usada por Implementador y Verificador;
- obliga ciclos RED, GREEN y REFACTOR con evidencia;
- prioriza comportamiento observable e interfaces publicas;
- trabaja una rebanada vertical pequena por ciclo;
- permite excepciones no testeables solo mediante gate humano.

### Skill `git-branch-management`

- usada por Orquestador, Implementador y Verificador;
- separa approval gates para crear rama, stage, commit, push y PR;
- prohibe merge automatico en v1;
- registra cada accion Git propuesta o ejecutada.

### Skill `github-label-manager`

- usada por Planner;
- audita labels remotas contra el catalogo local predefinido;
- permite crear o actualizar labels solo con aprobacion;
- prohibe eliminar labels en v1.

## Integracion

Los agentes, workflows, policies, templates y catalogos fueron actualizados para referenciar las nuevas skills. La validacion `full-v1` de la CLI tambien exige sus archivos, evitando bundles incompletos.

## Resultado

```text
agents_actual_after = 6
workflows_actual_after = 5
skills_actual_core_after = 13
stack_skills = 4
skills_missing = none
contract_graph_validation = pass
npm_test = pass
npm_test_count = 27
npm_pack_cli_dry_run = pass
factory_release_dry_run = pass
remote_publish = not_executed
```

El numero de core skills es 13 porque `github-cli` es una capacidad operativa registrada adicional al conjunto de 12 skills originalmente prometidas.

## Siguiente gate

```text
GQ-126 - Validar la fabrica expandida mediante dogfooding end-to-end
```

La siguiente recomendacion es instalar esta revision en un repositorio sandbox y ejecutar un caso pequeno con `intake-existing-code` antes de preparar una nueva release de fabrica.
