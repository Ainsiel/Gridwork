# Phase Index - Backlog MVP Gridwork

## Estado

```text
phase_map_status = draft
detailed_phases = phase-0, phase-1
detailed_phase_2 = true
detailed_phase_3 = true
detailed_phase_4 = true
detailed_phase_5 = true
detailed_phase_6 = true
github_published = false
phase_0_implementation_status = completed
phase_1_implementation_status = completed
phase_2_implementation_status = completed
phase_3_implementation_status = completed
phase_4_implementation_status = completed
phase_5_implementation_status = completed
phase_6_implementation_status = completed
```

## Fases

| Fase | Nombre | Estado de backlog | Objetivo |
|---|---|---|---|
| phase-0 | source_repo_scaffold | implemented | Crear el esqueleto del monorepo Gridwork. |
| phase-1 | minimal_factory_definition | implemented | Crear la fabrica minima `minimal-mvp`. |
| phase-2 | local_first_init | implemented | Implementar `gridwork init` local-first. |
| phase-3 | bundle_download_verify_cache | implemented | Descargar, verificar, extraer y cachear bundle. |
| phase-4 | factory_release_publisher | implemented | Publicar la primera release consumible de fabrica. |
| phase-5 | npm_cli_publish | implemented | Publicar la CLI para usar `npx gridwork init`. |
| phase-6 | full_factory_v1_expansion | implemented | Completar agentes, workflows, skills y stack pack v1. |

## Orden recomendado

```text
phase-0 -> phase-1 -> phase-2 -> phase-3 -> phase-4 -> phase-5 -> phase-6
```

## Criterio de avance

No detallar fase 2 hasta que:

- fase 0 tenga monorepo y CLI package base;
- fase 1 tenga inventario `minimal-mvp`;
- el usuario haya revisado los drafts iniciales;
- no haya conflictos importantes en labels o scope.

Estado actual: fase 0 ya tiene monorepo, CLI package base y CI base implementados localmente. Fase 1 ya tiene fabrica minima `minimal-mvp` implementada localmente.

Fase 2 puede detallarse ahora porque:

- fase 0 tiene monorepo y CLI package base;
- fase 1 tiene inventario `minimal-mvp`;
- los drafts iniciales fueron revisados;
- no hay conflictos importantes de labels o scope.

Fase 2 ya fue revisada e implementada localmente con drafts `GW-MVP-008` a `GW-MVP-013`.

Fase 3 ya fue detallada, revisada e implementada localmente con drafts `GW-MVP-014` a `GW-MVP-020`.

Fase 4 ya fue detallada, revisada e implementada localmente en modo dry-run/plan con drafts `GW-MVP-021` a `GW-MVP-027`. No se publico ningun release real.

Fase 5 ya fue detallada, revisada e implementada localmente en modo dry-run/plan con drafts `GW-MVP-028` a `GW-MVP-034`. No se publico npm.

Fase 6 ya fue detallada, revisada e implementada localmente con drafts `GW-MVP-035` a `GW-MVP-043`.

## Trazabilidad principal

- GQ-067: layout del repositorio fuente.
- GQ-072: npm workspaces y toolchain.
- GQ-073: CI del repo fuente.
- GQ-085: roadmap MVP.
- GQ-086: DoD e2e de `init`.
- GQ-087: inventario `minimal-mvp` / `full-v1`.
- GQ-088: README y QUICKSTART instalados.
- GQ-089: backlog local primero.
- GQ-090: primer lote de drafts.
- GQ-101: drafts de fase 4.
- GQ-103: drafts de fase 5.
- GQ-105: drafts de fase 6.
