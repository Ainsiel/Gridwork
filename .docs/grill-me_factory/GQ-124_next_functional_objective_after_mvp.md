# GQ-124 - Elegir siguiente objetivo funcional despues del MVP publicado

- Estado: accepted
- Fuente: GQ-123
- Pregunta origen: GQ-124
- Fecha de apertura: 2026-06-06
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: roadmap posterior a `gridwork@0.1.0`, futura version CLI/fabrica

## Pregunta

Gridwork `0.1.0` ya esta publicado, instalable y cuenta con pipeline de release validado en dry-run. Cual debe ser el siguiente objetivo funcional antes de preparar otra release?

La duda concreta:

```text
Quieres probar Gridwork de punta a punta en un repositorio limpio,
expandir directamente agentes/workflows/skills,
o mejorar primero la CLI?
```

## Contexto

Estado actual:

```text
factory_release = factory-v0.1.0
cli_release = gridwork@0.1.0
npx_install_smoke = pass
init_idempotency = pass
trusted_publishing_configured = true
publish_cli_remote_dry_run = pass
next_cli_release_requires_meaningful_change = true
```

Las piezas individuales han sido verificadas, pero todavia falta usar la fabrica publicada como lo haria una persona en un proyecto real:

```text
crear o usar repositorio limpio
npx gridwork@0.1.0 init --factory-version 0.1.0
leer .gridwork/agents/orchestrator/PROMPT.md
activar orquestador mediante chat
ejecutar un workflow pequeno
observar .factory/ y artefactos generados
detectar fricciones, contratos ambiguos y faltantes
```

## Opciones

### Opcion A - Dogfooding end-to-end en un repositorio limpio

Crear un repositorio de prueba separado, instalar la version publica y ejecutar un caso real pequeno usando el orquestador.

Caso recomendado:

```text
scenario = refinar una mejora pequena sobre un repositorio existente
workflow = intake-existing-code
mode = HITL
expected_output = requerimiento normalizado + issue draft local + trazabilidad
code_changes = false
github_issue_publish = false
```

Ventajas:

- valida la experiencia real, no solo archivos y comandos;
- descubre problemas antes de ampliar el alcance;
- prueba orquestador, workflow, skill, policies y observabilidad juntos;
- produce cambios funcionales justificados para la siguiente release;
- evita desarrollar nuevas capacidades sobre contratos que aun no fueron usados.

Desventajas:

- requiere un repositorio sandbox separado;
- parte de la validacion sera cualitativa;
- puede descubrir varios problemas que necesiten priorizacion.

### Opcion B - Expandir agentes, workflows y skills inmediatamente

Agregar nuevas capacidades antes de realizar dogfooding.

Ventajas:

- aumenta rapidamente el catalogo disponible;
- permite cubrir mas casos de uso.

Desventajas:

- aumenta superficie sin validar la experiencia base;
- puede repetir problemas de contrato o usabilidad;
- hace mas dificil identificar que cambio produjo cada friccion.

### Opcion C - Mejorar primero la CLI

Agregar comandos, flags o automatizaciones nuevas a la CLI.

Ventajas:

- puede mejorar ergonomia de instalacion y mantenimiento;
- produciria un cambio funcional claro para `0.1.1`.

Desventajas:

- contradice la decision v1 de CLI `init`-only si se agregan comandos prematuramente;
- no valida si la fabrica instalada realmente funciona bien con agentes;
- puede optimizar una entrada cuyo flujo posterior aun no fue probado.

## Respuesta recomendada

Usar Opcion A:

```text
next_functional_objective = dogfood_public_v0_1_0_end_to_end
test_repository = separate_sandbox_repository
initial_workflow = intake-existing-code
interaction_mode = HITL
publish_github_issue = false
modify_product_code = false
collect_findings = true
next_release_based_on_findings = true
```

Mi recomendacion es probar primero la fabrica publicada en un repositorio limpio mediante un caso pequeno y controlado. Los hallazgos de ese ejercicio deben convertirse en el backlog funcional que justifique la siguiente version.

## Pregunta para decidir

La duda clave:

```text
Quieres hacer dogfooding end-to-end de Gridwork 0.1.0 en un repositorio sandbox separado?
```

Mi recomendacion: si, comenzar con `intake-existing-code` en modo HITL, sin modificar codigo ni publicar issues.

## Decision registrada

Aceptada con una prioridad elegida por el usuario distinta a la recomendacion inicial:

```text
selected_option = expand_agents_workflows_skills
requested_scope = complete_missing_factory_contracts
new_agents_required = false
new_workflows_required = false
missing_skills = tdd,git-branch-management,github-label-manager
implementation_gate = GQ-125
```

La auditoria confirmo que los agentes y workflows aprobados ya existian. La expansion se concentro en completar skills faltantes e integrarlas a los contratos operativos.

## Siguiente gate

```text
GQ-125 - Completar agentes, workflows y skills faltantes
```
