---
id: GW-MVP-027
title: Probar `gridwork-release-publisher` end to end en dry-run
phase: phase-4
status: ready
readiness: ready
implementation_status: completed
factory_profile: factory-release-publisher
issue_shape: enabling-slice
suggested_agent: verifier-agent
suggested_workflow: verification-pr
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:4
  - area:release
  - area:bundle
  - area:supply-chain
  - area:github
  - status:needs-refinement
  - mode:assisted
  - workflow:verification-pr
  - agent:verifier
source_decisions:
  - GQ-065
  - GQ-068
  - GQ-081
  - GQ-086
  - GQ-100
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-027 - Probar `gridwork-release-publisher` end to end en dry-run

## Objetivo

Probar que fase 4 prepara una release consumible completa en dry-run, sin crear tags, push ni GitHub Release reales.

## Contexto

Fase 4 queda lista solo si el flujo completo puede producir artefactos que fase 3 instala, y si los gates impiden publicacion accidental.

## Alcance incluido

- Crear fixture de repo fuente Gridwork.
- Ejecutar release publisher en modo dry-run.
- Verificar que se generan:
  - ZIP;
  - manifest;
  - checksums;
  - release notes;
  - release plan;
  - publish commands;
  - validation report.
- Servir los assets con servidor local o fixture HTTP.
- Ejecutar `gridwork init --factory-version` contra esos assets.
- Confirmar que no se ejecutaron comandos remotos.
- Probar fallos seguros de release plan bloqueado.

## Fuera de alcance

- Test contra GitHub real.
- Crear tag real.
- Crear release real.
- Publicar npm.

## Criterios de aceptacion

- Dry-run completo pasa con bundle valido.
- `gridwork init` instala el bundle generado por fase 4.
- Falla si falta manifest.
- Falla si falta checksum.
- Falla si el bundle contiene path prohibido.
- Falla si el source oficial sigue placeholder para publish real.
- No hay `git push` ni `gh release create` durante tests.
- Reportes no contienen secretos.

## Pruebas esperadas

- `e2e:factory-release-dry-run-success`
- `e2e:factory-release-installability`
- `e2e:factory-release-missing-manifest`
- `e2e:factory-release-hash-mismatch`
- `e2e:factory-release-publish-gate`
- `e2e:factory-release-no-secret-leak`

## Archivos probables

- `packages/cli/test/factory-release-publisher.e2e.test.mjs`
- `packages/cli/test/helpers/release-fixtures.mjs`
- `packages/cli/src/release/`
- `factory/.gridwork/skills/gridwork-release-publisher/`

## Riesgos

- Tests fragiles si dependen de GitHub real.
- Tests que simulan publish pero terminan ejecutando comandos reales.
- Validar solo artefactos, pero no instalabilidad real.

## Trazabilidad

- GQ-086 exige e2e con fallos seguros.
- GQ-100 ya probo consumo remoto con fixtures HTTP.
- Este draft conecta productor y consumidor antes de release real.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/test/factory-release-publisher.test.mjs
tests = npm test
```

Cobertura agregada: dry-run exitoso, instalabilidad con `gridwork init`, bloqueo de source placeholder, bloqueo de modo publish no soportado y prerelease sin approval.
