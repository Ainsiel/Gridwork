---
id: GW-MVP-028
title: Verificar package name y ownership npm de la CLI
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
  - area:cli
  - area:release
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-071
  - GQ-079
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-028 - Verificar package name y ownership npm de la CLI

## Objetivo

Definir y verificar el nombre npm que se usara para publicar la CLI Gridwork sin prometer un package name que el proyecto no controla.

## Contexto

La experiencia ideal es `npx gridwork init`, pero GQ-079 acepta fallback scoped `@<scope>/gridwork` si `gridwork` no esta disponible o no esta bajo control.

## Alcance incluido

- Confirmar package name preferido `gridwork`.
- Definir fallback scoped si hace falta.
- Mantener `bin.gridwork` como nombre del comando.
- Documentar comandos npx para nombre preferido y fallback.
- Registrar owner npm esperado.
- Registrar GitHub owner/repo oficial esperado.
- Bloquear publish si ownership no esta confirmado.
- Bloquear publish si `DEFAULT_FACTORY_SOURCE` sigue placeholder.

## Fuera de alcance

- Publicar npm.
- Reclamar ownership npm.
- Crear cuenta, organizacion o scope npm.
- Cambiar package name sin aprobacion.

## Criterios de aceptacion

- Existe decision local de package name objetivo.
- Si no esta verificado, el draft queda como blocking item para publish real.
- `bin` sigue siendo `gridwork`.
- La documentacion no promete `npx gridwork init` como disponible si el ownership no esta confirmado.
- El publish plan falla si source oficial o package ownership estan en placeholder.

## Pruebas esperadas

- Test o script de validacion de package metadata.
- Test de bloqueo si package name queda placeholder/no verificado.
- Test de `bin.gridwork`.

## Archivos probables

- `packages/cli/package.json`
- `packages/cli/src/init/constants.ts`
- `docs/CLI_PUBLISH_PROCESS.md`
- `.docs/grill-me_factory/backlog/phase-5/`

## Riesgos

- Publicar con nombre equivocado.
- Documentar un comando npx no disponible.
- Apuntar `DEFAULT_FACTORY_SOURCE` a un repo incorrecto.

## Trazabilidad

- GQ-079 define `gridwork` como preferido y fallback scoped.
- GQ-071 exige bloquear publish si ownership no esta confirmado.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/cli-release.ts,packages/cli/src/commands/release.ts
tests = npm test
```

Decision de implementacion: `gridwork release cli --dry-run` exige `--confirm-package-ownership` para un plan preparado; sin confirmacion genera reportes pero queda bloqueado.
