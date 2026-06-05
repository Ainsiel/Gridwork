---
id: GW-MVP-024
title: Generar manifest, checksums y release notes
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
  - area:bundle
  - area:supply-chain
  - area:docs
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-068
  - GQ-070
  - GQ-078
  - GQ-081
  - GQ-082
  - GQ-101
acceptance_status: ready
github_issue: null
---

# GW-MVP-024 - Generar manifest, checksums y release notes

## Objetivo

Generar los assets auxiliares del release de fabrica de forma compatible con `gridwork init`: manifest, checksums y notas humanas.

## Contexto

El release no puede ser solo un ZIP. Fase 3 espera metadata verificable y checksums para bloquear bundles manipulados, incompatibles o ambiguos.

## Alcance incluido

- Generar `gridwork-factory-v<version>.manifest.json`.
- Generar `gridwork-factory-v<version>.sha256`.
- Generar `gridwork-factory-v<version>.release-notes.md`.
- Registrar:
  - factory version;
  - factory profile;
  - release channel;
  - prerelease;
  - source commit;
  - source tag;
  - release mode;
  - asset name;
  - ZIP hash;
  - required CLI version;
  - schema/contract versions si aplican.
- Incluir hashes de ZIP y manifest en checksums.
- Evitar secretos, tokens y paths absolutos.
- Hacer release notes legibles para humanos.

## Fuera de alcance

- Crear ZIP.
- Publicar release.
- Crear tag.
- Cambiar version de npm.

## Criterios de aceptacion

- Manifest parsea como JSON.
- Checksums usan SHA256 y nombres de assets exactos.
- Manifest y checksums coinciden con el ZIP generado.
- Release notes no sustituyen al manifest.
- Prerelease queda marcado en manifest y notes.
- `requiredCliVersion` es compatible con la CLI actual o bloquea el release.
- No aparecen secretos ni paths absolutos.

## Pruebas esperadas

- Test de manifest valido.
- Test de checksum de ZIP.
- Test de checksum de manifest.
- Test de prerelease metadata.
- Test de redaccion de secretos/paths absolutos.
- Test de compatibilidad con verifier de fase 3.

## Archivos probables

- `packages/cli/src/release/create-factory-manifest.ts`
- `packages/cli/src/release/create-checksums.ts`
- `packages/cli/src/release/create-release-notes.ts`
- `packages/cli/test/factory-release-assets.test.mjs`
- `factory/.gridwork/templates/factory-release-notes.md`

## Riesgos

- Manifest con nombres distintos a los que `init` descarga.
- Checksums que no cubren manifest.
- Release notes con datos sensibles.

## Trazabilidad

- GQ-068 exige manifest, SHA256 y release notes.
- GQ-070 exige compatibilidad estricta.
- GQ-078 define supply chain v1 sin firmas externas.

## Review e implementacion

```text
readiness_review = pass
implementation_status = completed
implemented_files = packages/cli/src/release/factory-release.ts,factory/.gridwork/templates/factory-release-notes.md
tests = npm test
```

Decision de implementacion: los assets usan nombres versionados `gridwork-factory-v<version>.*` y el manifest declara `sourceTag = factory-v<version>`.
