# Backlog inicial de Gridwork

Este directorio contiene drafts locales para convertir el grill-me en trabajo implementable.

## Estado

```text
status = draft
github_published = false
source = .docs/grill-me_factory/GQ-*.md
phase_0_implementation_status = completed
phase_1_implementation_status = completed
phase_2_draft_status = detailed
phase_2_implementation_status = completed
phase_3_draft_status = detailed
phase_3_implementation_status = completed
phase_4_draft_status = detailed
phase_4_implementation_status = completed
phase_5_draft_status = detailed
phase_5_implementation_status = completed
phase_6_draft_status = detailed
phase_6_implementation_status = completed
```

## Regla

Los drafts de este directorio no son issues reales de GitHub. Primero se revisan localmente. Despues, si el usuario aprueba un publish plan, `github-issue-publisher` puede publicarlos por lotes pequenos usando `gh issue create`.

## Estructura

```text
backlog/
  README.md
  phase-index.md
  review-report.md
  publish-plan.md
  phase-0/
  phase-1/
  phase-2/
  phase-3/
  phase-4/
  phase-5/
  phase-6/
```

## Alcance del primer lote

El primer lote sigue GQ-090:

- mapa liviano de todas las fases;
- drafts detallados de fase 0;
- drafts detallados de fase 1;
- fase 2 en adelante queda mapeada, no detallada;
- no se publica nada en GitHub todavia.

## Drafts detallados

Fase 0:

- `GW-MVP-001` - Scaffold monorepo Gridwork con npm workspaces. Implementado localmente.
- `GW-MVP-002` - Configurar paquete CLI TypeScript con bin `gridwork`. Implementado localmente.
- `GW-MVP-003` - Configurar CI base del repositorio fuente. Implementado localmente.

Fase 1:

- `GW-MVP-004` - Crear inventario `minimal-mvp` de `factory/.gridwork/`. Implementado localmente.
- `GW-MVP-005` - Crear prompt y contrato minimo del orquestador. Implementado localmente.
- `GW-MVP-006` - Crear workflow, skill, policies y schemas minimos. Implementado localmente.
- `GW-MVP-007` - Crear README y QUICKSTART instalados en `.gridwork/`. Implementado localmente.

Fase 2:

- `GW-MVP-008` - Copiar fabrica minima desde source a `.gridwork/`. Implementado localmente.
- `GW-MVP-009` - Crear reportes locales de `init` en `.factory/init/`. Implementado localmente.
- `GW-MVP-010` - Crear `.gridwork-lock.json` con hashes por archivo. Implementado localmente.
- `GW-MVP-011` - Implementar idempotencia y estrategia de conflictos. Implementado localmente.
- `GW-MVP-012` - Validar inventario `minimal-mvp` durante `init`. Implementado localmente.
- `GW-MVP-013` - Actualizar `.gitignore` y salida de consola de `init`. Implementado localmente.

Fase 3:

- `GW-MVP-014` - Resolver source y version de fabrica para `init`. Implementado localmente.
- `GW-MVP-015` - Descargar bundle y checksums desde GitHub Releases. Implementado localmente.
- `GW-MVP-016` - Verificar SHA256 y manifest del bundle. Implementado localmente.
- `GW-MVP-017` - Inspeccionar y extraer zip seguro a staging. Implementado localmente.
- `GW-MVP-018` - Aplicar staging usando el flujo existente de fase 2. Implementado localmente.
- `GW-MVP-019` - Implementar cache local verificada para version exacta. Implementado localmente.
- `GW-MVP-020` - Probar fallos seguros de bundle, compatibilidad y prerelease. Implementado localmente.

Fase 4:

- `GW-MVP-021` - Alinear contrato productor-consumidor de release de fabrica. Implementado localmente.
- `GW-MVP-022` - Crear contrato de skill `gridwork-release-publisher`. Implementado localmente.
- `GW-MVP-023` - Construir bundle de fabrica en dry-run local. Implementado localmente.
- `GW-MVP-024` - Generar manifest, checksums y release notes. Implementado localmente.
- `GW-MVP-025` - Validar bundle de release antes de publicar. Implementado localmente.
- `GW-MVP-026` - Preparar publish plan y approval gate. Implementado localmente.
- `GW-MVP-027` - Probar `gridwork-release-publisher` end to end en dry-run. Implementado localmente.

Fase 5:

- `GW-MVP-028` - Verificar package name y ownership npm de la CLI. Implementado localmente.
- `GW-MVP-029` - Definir versionado y tag `cli-v<version>`. Implementado localmente.
- `GW-MVP-030` - Agregar modo CLI release a `gridwork-release-publisher`. Implementado localmente.
- `GW-MVP-031` - Crear workflow `publish-cli.yml`. Implementado localmente.
- `GW-MVP-032` - Validar npm pack y seguridad del paquete CLI. Implementado localmente.
- `GW-MVP-033` - Definir dist-tags npm y politica prerelease de CLI. Implementado localmente.
- `GW-MVP-034` - Probar publish CLI end to end sin publicar npm. Implementado localmente.

Fase 6:

- `GW-MVP-035` - Definir inventario `full-v1` de la fabrica instalada. Implementado localmente.
- `GW-MVP-036` - Crear contratos full-v1 de agentes base. Implementado localmente.
- `GW-MVP-037` - Crear playbooks full-v1 de workflows base. Implementado localmente.
- `GW-MVP-038` - Crear catalogo full-v1 de skills base. Implementado localmente.
- `GW-MVP-039` - Detallar contrato TDD inspirado en Matt para implementacion AFK. Implementado localmente.
- `GW-MVP-040` - Crear stack pack guidance Next.js + Spring Boot + PostgreSQL. Implementado localmente.
- `GW-MVP-041` - Completar policies, permisos, path scopes y labels full-v1. Implementado localmente.
- `GW-MVP-042` - Completar templates y observabilidad local full-v1. Implementado localmente.
- `GW-MVP-043` - Validar full-v1 end to end sin generar codigo productivo. Implementado localmente.

## Labels

Los drafts usan labels de GQ-031 mas la extension aceptada en GQ-091:

```text
gridwork
type:feature
slice:enabling
phase:0 | phase:1 | phase:2 | phase:3 | phase:4 | phase:5 | phase:6
area:source-repo | area:cli | area:init | area:source-resolution | area:bundle | area:cache | area:supply-chain | area:factory | area:ci | area:docs | area:release | area:github | area:npm | area:agents | area:workflows | area:skills | area:stack-pack | area:policies | area:templates | area:observability
status:needs-refinement
mode:assisted
workflow:tdd-implementation
agent:implementer
```

La extension local queda registrada en `label-catalog-extension.json`. Antes de publicar en GitHub, `.gridwork/policies/github-labels.json` debe incluir estas labels. Crear labels reales en GitHub sigue requiriendo aprobacion.

## Reglas de revision

Antes de publicar:

- el lote debe pasar por `review-report.md`;
- cada draft debe tener criterios de aceptacion verificables;
- cada draft debe listar pruebas esperadas;
- cada draft debe referenciar decisiones GQ;
- el publish plan debe estar aprobado;
- no se deben inventar labels fuera del catalogo;
- las labels `phase:*`, `area:*` y `slice:enabling` deben existir en el catalogo;
- solo drafts `ready` pueden publicarse;
- implementar un draft no ready requiere excepcion explicita documentada;
- no se deben publicar issues si el scope sigue ambiguo.
