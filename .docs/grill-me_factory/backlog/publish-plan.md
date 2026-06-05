# Publish Plan - Primer lote MVP

## Estado

```text
status = draft
approved = false
github_publish = false
readiness = phase_0_ready_phase_1_waiting_full_review
phase_0_readiness = ready
phase_0_implementation_status = completed
phase_1_readiness = ready
phase_1_implementation_status = completed
batch = phase-0_and_phase-1
publish_timing = after_phase_0_revisit
```

## Decision

Este plan no publica issues. Solo deja preparado el lote para revision humana.

## Drafts incluidos

| Draft | Fase | Titulo | Estado | Readiness | Implementacion |
|---|---|---|---|---|---|
| GW-MVP-001 | phase-0 | Scaffold monorepo Gridwork con npm workspaces | ready | ready | completed |
| GW-MVP-002 | phase-0 | Configurar paquete CLI TypeScript con bin `gridwork` | ready | ready | completed |
| GW-MVP-003 | phase-0 | Configurar CI base del repositorio fuente | ready | ready | completed |
| GW-MVP-004 | phase-1 | Crear inventario `minimal-mvp` de `factory/.gridwork/` | ready | ready | completed |
| GW-MVP-005 | phase-1 | Crear prompt y contrato minimo del orquestador | ready | ready | completed |
| GW-MVP-006 | phase-1 | Crear workflow, skill, policies y schemas minimos | ready | ready | completed |
| GW-MVP-007 | phase-1 | Crear README y QUICKSTART instalados en `.gridwork/` | ready | ready | completed |

## Validaciones antes de publicar

- Revisar que cada draft tenga criterios de aceptacion.
- Revisar que cada draft tenga pruebas esperadas.
- Revisar que cada draft referencie GQ correctas.
- Completar `review-report.md`.
- Marcar como `ready` solo drafts que pasen checklist.
- Revisar labels contra `.gridwork/policies/github-labels.json`.
- Confirmar que la extension GQ-091 exista en el catalogo antes de publicar.
- Confirmar repo GitHub destino.
- Crear approval gate antes de ejecutar `gh issue create`.

## Comandos

No ejecutar comandos todavia.

No publicar sin approval gate explicito.

Fase 0 y fase 1 ya fueron implementadas localmente. El lote puede convertirse en issues solo si el usuario aprueba un publish plan y se define repo GitHub destino.

GQ-093 decide que no se publican issues antes de fase 0. La publicacion se retoma despues de tener monorepo, CLI package y CI base.

Cuando se apruebe, `github-issue-publisher` preparara comandos de este tipo:

```text
gh issue create --repo <owner/repo> --title <title> --body-file <draft-file> --label <labels>
```

## Riesgo

```text
risk = low
reason = local drafts only, no remote write
```
