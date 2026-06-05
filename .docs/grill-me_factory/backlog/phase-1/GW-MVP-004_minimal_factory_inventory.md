---
id: GW-MVP-004
title: Crear inventario `minimal-mvp` de `factory/.gridwork/`
phase: phase-1
status: ready
readiness: ready
implementation_status: completed
factory_profile: minimal-mvp
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:1
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-028
  - GQ-062
  - GQ-085
  - GQ-087
  - GQ-088
acceptance_status: ready
github_issue: null
---

# GW-MVP-004 - Crear inventario `minimal-mvp` de `factory/.gridwork/`

## Objetivo

Crear la estructura minima de fabrica que el primer `init` podra instalar y validar.

## Contexto

El primer MVP no instala `full-v1`. Instala una fabrica minima con `factoryProfile = minimal-mvp`, suficiente para activar el orquestador y probar `init`.

## Alcance incluido

- Crear `factory/.gridwork/factory.json`.
- Declarar `factoryProfile = minimal-mvp`.
- Crear estructura minima de carpetas:
  - `agents/orchestrator/`
  - `workflows/intake-existing-code/`
  - `skills/handoff/`
  - `policies/`
  - `schemas/`
  - `templates/`
- Mantener el inventario sin frontend, backend, database ni Docker.
- Asegurar que `.gridwork/README.md` y `.gridwork/QUICKSTART.md` esten en el inventario, aunque se detallen en otro draft.

## Fuera de alcance

- Implementar `full-v1`.
- Crear stack pack completo.
- Crear agentes especializados.
- Implementar CLI `init`.
- Generar codigo productivo.

## Criterios de aceptacion

- `factory/.gridwork/factory.json` existe y parsea como JSON valido.
- `factoryProfile` es `minimal-mvp`.
- Las rutas minimas existen.
- El inventario no incluye codigo productivo.
- El inventario permite ubicar prompt, agente, workflow, skill, policies, schemas y templates.

## Pruebas esperadas

- Test o script de validacion de estructura minima.
- Parseo JSON de `factory.json`.
- Check de ausencia de carpetas productivas: `frontend/`, `backend/`, `database/`, `docker/`.

## Archivos probables

- `factory/.gridwork/factory.json`
- `factory/.gridwork/agents/orchestrator/`
- `factory/.gridwork/workflows/intake-existing-code/`
- `factory/.gridwork/skills/handoff/`
- `factory/.gridwork/policies/`
- `factory/.gridwork/schemas/`
- `factory/.gridwork/templates/`

## Riesgos

- Hacer el inventario minimo demasiado grande.
- Dejarlo tan pequeno que no pueda activar al orquestador.
- Mezclar `minimal-mvp` con `full-v1`.

## Trazabilidad

- GQ-087 define inventario `minimal-mvp`.
- GQ-088 agrega README y QUICKSTART.
- GQ-062 define validacion minima.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: objetivo claro, alcance incluido, fuera de alcance, criterios verificables, pruebas esperadas, decisiones GQ correctas, labels presentes, `factory_profile` declarado y sin decisiones pendientes.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_1
factory_profile = minimal-mvp
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Archivos principales:

- `factory/.gridwork/factory.json`
- `factory/.gridwork/README.md`
- `factory/.gridwork/QUICKSTART.md`
- `factory/.gridwork/agents/orchestrator/`
- `factory/.gridwork/workflows/intake-existing-code/`
- `factory/.gridwork/skills/handoff/`
- `factory/.gridwork/policies/`
- `factory/.gridwork/schemas/`
- `factory/.gridwork/templates/`
