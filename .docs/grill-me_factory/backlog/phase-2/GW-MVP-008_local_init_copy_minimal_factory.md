---
id: GW-MVP-008
title: Copiar fabrica minima desde source a `.gridwork/`
phase: phase-2
status: ready
readiness: ready
implementation_status: completed
factory_profile: local-first-init
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:2
  - area:init
  - area:cli
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-028
  - GQ-074
  - GQ-085
  - GQ-086
  - GQ-087
  - GQ-096
acceptance_status: ready
github_issue: null
---

# GW-MVP-008 - Copiar fabrica minima desde source a `.gridwork/`

## Objetivo

Implementar el primer comportamiento real de `gridwork init`: instalar la fabrica minima local desde `factory/.gridwork/` hacia `.gridwork/` dentro de un repo destino.

## Contexto

Fase 2 es local-first. Todavia no descarga releases, no extrae zip, no usa cache y no publica npm. El objetivo es probar la experiencia real de instalacion usando la fabrica fuente local creada en fase 1.

## Alcance incluido

- Reemplazar el stub de `gridwork init` por una instalacion local-first.
- Resolver la fuente local de desarrollo `factory/.gridwork/`.
- Crear `.gridwork/` en el directorio destino.
- Crear `.factory/` como runtime local si falta.
- Copiar los archivos del inventario `minimal-mvp`.
- Mantener paths relativos y normalizados con `/`.
- No copiar `.docs/`, `node_modules/`, `.git/`, `.factory/` ni carpetas de producto.
- Preparar la integracion con reportes, lockfile, validacion e idempotencia en los drafts siguientes.

## Fuera de alcance

- Descargar desde GitHub Releases.
- Extraer bundles zip.
- Implementar cache.
- Publicar npm.
- Crear stack pack completo.
- Generar codigo productivo.
- Implementar `gridwork run`.

## Criterios de aceptacion

- `gridwork init` crea `.gridwork/` en un repo temporal.
- `.gridwork/factory.json` existe y declara `factoryProfile = minimal-mvp`.
- `.gridwork/README.md` y `.gridwork/QUICKSTART.md` se instalan.
- `.gridwork/agents/orchestrator/PROMPT.md` se instala.
- `.factory/` se crea como runtime local.
- No se crean `frontend/`, `backend/`, `database/`, `docker/` ni `docker-compose.yml`.
- El comando sigue sin exponer `gridwork run`.

## Pruebas esperadas

- Test e2e en directorio temporal para instalacion nueva.
- Test de inventario instalado contra rutas `minimal-mvp`.
- Test de ausencia de carpetas productivas.
- Test de que `gridwork run` sigue sin existir.

## Archivos probables

- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/install-local-factory.ts`
- `packages/cli/src/init/paths.ts`
- `packages/cli/test/init-local-install.test.mjs`

## Riesgos

- Acoplar el CLI a una ruta absoluta de desarrollo.
- Copiar mas archivos que el profile `minimal-mvp`.
- Mezclar instalacion local-first con descarga remota de fases posteriores.
- Escribir fuera del repo destino.

## Trazabilidad

- GQ-085 define fase 2 como `local-first-init`.
- GQ-086 exige e2e de instalacion nueva.
- GQ-087 define inventario `minimal-mvp`.
- GQ-096 implemento la fabrica fuente minima.

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
implemented_in = local_phase_2
init_source = factory/.gridwork
installed_target = .gridwork/
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

Archivos principales:

- `packages/cli/src/commands/init.ts`
- `packages/cli/src/init/local-init.ts`
- `packages/cli/src/init/fs-utils.ts`
- `packages/cli/src/init/constants.ts`
- `packages/cli/test/init-local-first.test.mjs`
