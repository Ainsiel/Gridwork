---
id: GW-MVP-034
title: Probar publish CLI end to end sin publicar npm
phase: phase-5
status: ready
readiness: ready
implementation_status: completed
factory_profile: npm-cli-publish
issue_shape: enabling-slice
suggested_agent: verifier-agent
suggested_workflow: verification-pr
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:5
  - area:npm
  - area:cli
  - area:ci
  - status:needs-refinement
  - mode:assisted
  - workflow:verification-pr
  - agent:verifier
source_decisions:
  - GQ-071
  - GQ-073
  - GQ-086
  - GQ-103
acceptance_status: ready
github_issue: null
---

# GW-MVP-034 - Probar publish CLI end to end sin publicar npm

## Objetivo

Probar el flujo completo de publish CLI en modo dry-run, sin crear tag real ni publicar en npm.

## Contexto

Antes de activar publish real, fase 5 debe demostrar que el paquete se puede preparar, validar y empaquetar; tambien que los gates impiden publicar por accidente.

## Alcance incluido

- Generar release plan de CLI.
- Validar metadata del paquete.
- Validar tag esperado `cli-v<version>`.
- Ejecutar build.
- Ejecutar tests.
- Ejecutar pack dry-run.
- Validar tarball contents.
- Simular workflow publish sin ejecutar npm publish.
- Confirmar que no se toca release de fabrica.
- Confirmar que no se crea tag real.

## Fuera de alcance

- Publicar npm real.
- Crear tag real.
- Push remoto.
- Publicar GitHub Release de fabrica.

## Criterios de aceptacion

- Dry-run exitoso genera todos los reportes.
- Falla si package name/ownership no esta confirmado para publish real.
- Falla si tag y version no coinciden.
- Falla si tarball contiene rutas prohibidas.
- No ejecuta `npm publish`.
- No ejecuta `git push`.
- No usa tokens reales en tests.

## Pruebas esperadas

- `e2e:cli-publish-dry-run-success`.
- `e2e:cli-publish-blocks-placeholder-source`.
- `e2e:cli-publish-tag-version-mismatch`.
- `e2e:cli-publish-pack-contents`.
- `e2e:cli-publish-no-secret-leak`.

## Archivos probables

- `packages/cli/test/cli-publish-dry-run.test.mjs`
- `packages/cli/src/release/cli-release.ts`
- `.github/workflows/publish-cli.yml`
- `factory/.gridwork/templates/cli-release-plan.md`

## Riesgos

- Test demasiado cercano a publish real.
- Saltarse pack validation.
- No detectar tags/versiones reutilizadas.

## Trazabilidad

- GQ-086 exige e2e de fallos seguros.
- GQ-071 exige plan local + approval + GitHub Actions.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/test/cli-release-publisher.test.mjs
tests = npm test
```

Cobertura agregada: dry-run preparado, bloqueo de ownership/source placeholder y rechazo de modo publish sin `--dry-run`.
