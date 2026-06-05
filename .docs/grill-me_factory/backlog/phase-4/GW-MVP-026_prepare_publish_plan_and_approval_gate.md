---
id: GW-MVP-026
title: Preparar publish plan y approval gate
phase: phase-4
status: ready
readiness: ready
implementation_status: completed
factory_profile: factory-release-publisher
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:4
  - area:release
  - area:github
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-012
  - GQ-023
  - GQ-056
  - GQ-065
  - GQ-081
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-026 - Preparar publish plan y approval gate

## Objetivo

Crear el plan local de publicacion que muestra comandos exactos para tag, push y GitHub Release, pero no ejecuta nada remoto sin aprobacion explicita.

## Contexto

En v1, `gridwork-release-publisher` es el publicador autoritativo de fabrica con `manual_gh_release`. Esto exige que el usuario vea exactamente que se va a ejecutar antes de crear un tag o release.

## Alcance incluido

- Crear `factory-release-plan.md`.
- Crear `publish-commands.md`.
- Preparar comandos:
  - `git tag <factory-tag>`;
  - `git push origin <factory-tag>`;
  - `gh release create <factory-tag> <assets...> --notes-file <notes>`;
  - `gh release view <factory-tag>` para verificacion posterior.
- Validar que tag no existe localmente.
- Validar que tag no existe remotamente.
- Validar que release no existe en GitHub.
- Bloquear si `DEFAULT_FACTORY_SOURCE` sigue placeholder.
- Registrar approval gates por accion remota.
- Registrar `release_mode = manual_gh_release`.

## Fuera de alcance

- Ejecutar comandos remotos por defecto.
- Publicar npm.
- Hacer merge.
- Activar GitHub Actions publish automatico.

## Criterios de aceptacion

- Publish plan contiene comandos exactos y assets exactos.
- Publish plan indica que comandos requieren approval.
- No se ejecuta `git tag`, `git push` ni `gh release create` sin approval.
- Si tag/release ya existen, el plan queda bloqueado.
- Si source oficial es placeholder, el plan queda bloqueado.
- El plan no contiene secretos ni tokens.

## Pruebas esperadas

- Test de publish plan dry-run.
- Test de tag existente local bloqueado.
- Test de release existente bloqueado con mock de `gh`.
- Test de source placeholder bloqueado.
- Test de no ejecucion remota en default mode.

## Archivos probables

- `packages/cli/src/release/create-publish-plan.ts`
- `packages/cli/src/release/github-release-checks.ts`
- `packages/cli/test/factory-publish-plan.test.mjs`
- `factory/.gridwork/templates/factory-release-plan.md`
- `factory/.gridwork/templates/publish-commands.md`

## Riesgos

- Ejecutar publish real durante dry-run.
- Reutilizar tags o releases publicados.
- Filtrar `GITHUB_TOKEN` o `GH_TOKEN` en reportes.

## Trazabilidad

- GQ-065 define approvals.
- GQ-081 define publicacion v1 por `gh release create`.
- GQ-056 define politica de ramas, push y PR.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/factory-release.ts,factory/.gridwork/templates/publish-commands.md
tests = npm test
```

Decision de implementacion: `publish-commands.md` se genera solo como plan; `git tag`, `git push` y `gh release create` no se ejecutan.
