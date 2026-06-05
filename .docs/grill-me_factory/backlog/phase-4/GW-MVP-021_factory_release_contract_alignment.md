---
id: GW-MVP-021
title: Alinear contrato productor-consumidor de release de fabrica
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
  - area:init
  - area:supply-chain
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-065
  - GQ-068
  - GQ-081
  - GQ-082
  - GQ-100
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-021 - Alinear contrato productor-consumidor de release de fabrica

## Objetivo

Resolver y documentar un unico contrato de tag, nombres de assets y manifest para que `gridwork-release-publisher` produzca exactamente lo que `gridwork init` consume.

## Contexto

Las decisiones tempranas hablan de tag `factory-v<version>`. Antes de esta fase, la implementacion de fase 3 consumia tag `v<version>` y assets `gridwork-factory-v<version>.*`. Fase 4 cierra esa diferencia y define `factory-v<version>` como tag canonical.

## Alcance incluido

- Elegir el tag canonical de fabrica para v1.
- Alinear `gridwork init` con ese tag si hace falta.
- Alinear `gridwork-release-publisher` con ese tag.
- Definir nombres exactos de assets:
  - `gridwork-factory-v<version>.zip`;
  - `gridwork-factory-v<version>.manifest.json`;
  - `gridwork-factory-v<version>.sha256`;
  - `gridwork-factory-v<version>.release-notes.md`.
- Definir campos canonical del manifest que fase 3 debe verificar.
- Documentar diferencias con decisiones antiguas si se corrige el prefijo.
- Mantener prerelease solo con version exacta y approval.

## Fuera de alcance

- Publicar releases reales.
- Implementar el builder del bundle.
- Publicar npm.
- Crear GitHub Actions de publish automatico.

## Criterios de aceptacion

- Existe un contrato escrito de tag y assets.
- Productor y consumidor usan el mismo tag prefix.
- Tests de `init` remoto reflejan el contrato canonical.
- El manifest generado por fase 4 es aceptado por fase 3.
- No queda ambiguedad entre `v<version>` y `factory-v<version>` antes de publish real.
- El contrato no permite branches, `main`, URLs arbitrarias ni latest.

## Pruebas esperadas

- Test de parser/tag canonical.
- Test e2e de `init` contra bundle fixture con tag canonical.
- Test de rechazo si release tag y manifest no coinciden.
- Test de prerelease gate.

## Archivos probables

- `packages/cli/src/init/remote-init.ts`
- `packages/cli/test/init-remote-release.test.mjs`
- `.docs/grill-me_factory/GQ-081_factory_publish_mechanism.md`
- `.docs/grill-me_factory/GQ-068_factory_release_bundle_contract.md`
- `factory/.gridwork/templates/factory-release-manifest.json`

## Riesgos

- Publicar el primer release con tag distinto al que `init` espera.
- Mantener dos contratos paralelos.
- Hacer que el lockfile pierda trazabilidad del source tag.

## Trazabilidad

- GQ-081 definio `factory-v<version>` como tag de fabrica.
- GQ-100 implemento consumo remoto inicial con tag `v<version>`.
- GQ-102 resolvio el desacople: `factory-v<version>` es el tag canonical de fabrica.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
canonical_factory_tag = factory-v<version>
implemented_files = packages/cli/src/init/remote-init.ts,packages/cli/test/init-remote-release.test.mjs,packages/cli/src/init/constants.ts
tests = npm test
```

Decision de implementacion: tanto `gridwork init` como `gridwork release factory --dry-run` usan `factory-v<version>` para releases de fabrica.
