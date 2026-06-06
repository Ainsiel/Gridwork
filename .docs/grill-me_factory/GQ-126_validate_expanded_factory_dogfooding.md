# GQ-126 - Validar la fabrica expandida mediante dogfooding end-to-end

- Estado: pending
- Fuente: GQ-125
- Pregunta origen: GQ-126
- Fecha de apertura: 2026-06-06
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: experiencia instalada de Gridwork y backlog de la siguiente release

## Pregunta

Como debe validarse la fabrica expandida antes de preparar una nueva release?

## Contexto

La fabrica ya contiene todos los agentes, workflows y skills acordados hasta GQ-125. Las pruebas estructurales y el release dry-run pasan, pero falta observar los contratos durante un caso de uso real.

## Recomendacion

Ejecutar dogfooding en un repositorio sandbox separado:

```text
scenario = refinar una mejora pequena sobre codigo existente
workflow = intake-existing-code
interaction_mode = HITL
github_writes = false
product_code_changes = false
collect_runtime_artifacts = true
```

Despues del intake, continuar opcionalmente con un work order pequeno para probar `tdd-implementation` y `verification-pr` sin push ni PR remota.

## Criterios de validacion

- el orquestador selecciona correctamente el workflow;
- los agentes respetan sus path scopes y permisos;
- las skills se usan sin elevar permisos;
- los gates humanos aparecen antes de efectos sensibles;
- `.factory/` conserva trazabilidad suficiente;
- los handoffs aparecen solo al transferir agente o sesion;
- las fricciones encontradas producen cambios concretos para la siguiente release.

## Decision registrada

Pendiente.
