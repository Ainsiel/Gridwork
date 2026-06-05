---
id: GW-MVP-031
title: Crear workflow `publish-cli.yml`
phase: phase-5
status: ready
readiness: ready
implementation_status: completed
factory_profile: npm-cli-publish
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:5
  - area:npm
  - area:ci
  - area:github
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-071
  - GQ-073
  - GQ-078
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-031 - Crear workflow `publish-cli.yml`

## Objetivo

Definir el workflow de GitHub Actions que publicara la CLI npm solo con tags `cli-v*` aprobados.

## Contexto

El CI normal no publica. `publish-cli.yml` debe ser separado, trazable y limitado a npm CLI. No debe publicar fabrica ni GitHub Release de fabrica.

## Alcance incluido

- Crear `.github/workflows/publish-cli.yml`.
- Trigger solo para tags `cli-v*`.
- Ejecutar:
  - checkout;
  - setup Node;
  - `npm ci`;
  - `npm run build`;
  - `npm test`;
  - `npm pack -w packages/cli --dry-run`;
  - validacion de metadata npm.
- Publicar con provenance/trusted publishing si esta configurado.
- Usar `NPM_TOKEN` solo si trusted publishing no esta disponible.
- Bloquear si tag no coincide con package version.
- Bloquear si source oficial sigue placeholder.

## Fuera de alcance

- Publicar fabrica.
- Crear tag.
- Crear release notes de fabrica.
- Hacer merge.

## Criterios de aceptacion

- Workflow no se dispara con `factory-v*`.
- Workflow no se dispara en push normal.
- Workflow valida antes de publicar.
- Workflow usa permisos minimos.
- Workflow no imprime tokens.
- Workflow falla si package metadata es invalida.

## Pruebas esperadas

- Validacion YAML.
- Test o script de tag/package version.
- Dry-run local del pack.
- Revision de permisos del workflow.
- Test documental de que no toca releases de fabrica.

## Archivos probables

- `.github/workflows/publish-cli.yml`
- `packages/cli/package.json`
- `packages/cli/src/release/validate-cli-publish.ts`
- `docs/CLI_PUBLISH_PROCESS.md`

## Riesgos

- Tag creado por error publica npm.
- Workflow publica desde package version incorrecta.
- Token npm aparece en logs.
- Workflow se mezcla con publish de fabrica.

## Trazabilidad

- GQ-071 define publish npm por GitHub Actions.
- GQ-073 separa CI de publish.
- GQ-078 recomienda provenance/trusted publishing.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = .github/workflows/publish-cli.yml
tests = npm test
```

Decision de implementacion: `publish-cli.yml` se dispara solo con tags `cli-v*`; falla si el tag no coincide con package version o si `DEFAULT_FACTORY_SOURCE` sigue placeholder.
