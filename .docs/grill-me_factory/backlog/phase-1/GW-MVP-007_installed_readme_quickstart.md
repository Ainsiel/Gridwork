---
id: GW-MVP-007
title: Crear README y QUICKSTART instalados en `.gridwork/`
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
  - area:docs
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-018
  - GQ-019
  - GQ-061
  - GQ-087
  - GQ-088
acceptance_status: ready
github_issue: null
---

# GW-MVP-007 - Crear README y QUICKSTART instalados en `.gridwork/`

## Objetivo

Crear la documentacion minima instalada para que el usuario sepa que hacer despues de `npx gridwork init`.

## Contexto

Gridwork no debe crear docs en la raiz del proyecto destino en v1. La documentacion instalada vive dentro de `.gridwork/`.

## Alcance incluido

- Crear `factory/.gridwork/README.md`.
- Crear `factory/.gridwork/QUICKSTART.md`.
- Explicar que Gridwork instalo la fabrica, no codigo productivo.
- Apuntar al prompt del orquestador.
- Explicar donde viven agentes, workflows, skills, policies, schemas y templates.
- Explicar que `.factory/` guarda reportes locales.
- Mantener el quickstart breve y accionable.

## Fuera de alcance

- Crear docs en la raiz del proyecto destino.
- Duplicar contratos completos de agentes, workflows o skills.
- Crear documentacion completa de `full-v1`.
- Crear landing page o docs de marketing.

## Criterios de aceptacion

- `factory/.gridwork/README.md` existe.
- `factory/.gridwork/QUICKSTART.md` existe.
- `QUICKSTART.md` apunta a `.gridwork/agents/orchestrator/PROMPT.md`.
- Los docs no duplican `AGENT.md`, `WORKFLOW.md` ni `SKILL.md`.
- Los docs declaran que no se genera codigo productivo.
- No se crea ningun `GRIDWORK.md` ni `README-gridwork.md` en la raiz del proyecto destino.

## Pruebas esperadas

- Check de existencia de README y QUICKSTART.
- Check textual del path del prompt del orquestador.
- Check textual de ausencia de instrucciones `gridwork run`.
- E2E futuro de `init` assertando que ambos archivos se instalan.

## Archivos probables

- `factory/.gridwork/README.md`
- `factory/.gridwork/QUICKSTART.md`
- `factory/.gridwork/agents/orchestrator/PROMPT.md`

## Riesgos

- Hacer el quickstart demasiado largo.
- Duplicar contratos y desincronizar documentacion.
- No dejar claro el siguiente paso despues de instalar.

## Trazabilidad

- GQ-088 define docs instalados dentro de `.gridwork/`.
- GQ-061 define prompt del orquestador.
- GQ-087 agrega README y QUICKSTART al inventario.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: los docs viven dentro de `.gridwork/`, apuntan al prompt del orquestador, no duplican contratos y no crean documentacion en la raiz del proyecto destino.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_1
installed_docs_path = .gridwork/
root_docs_created_by_init = false
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Archivos principales:

- `factory/.gridwork/README.md`
- `factory/.gridwork/QUICKSTART.md`
- `factory/.gridwork/agents/orchestrator/PROMPT.md`
