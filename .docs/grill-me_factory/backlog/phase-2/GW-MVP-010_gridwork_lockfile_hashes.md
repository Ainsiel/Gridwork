---
id: GW-MVP-010
title: Crear `.gridwork-lock.json` con hashes por archivo
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
  - GQ-076
  - GQ-077
  - GQ-086
acceptance_status: ready
github_issue: null
---

# GW-MVP-010 - Crear `.gridwork-lock.json` con hashes por archivo

## Objetivo

Crear un lockfile versionable, deterministico y seguro para Git despues de una instalacion local-first exitosa.

## Contexto

El lockfile protege personalizaciones y permite reproducibilidad. En fase 2 el source es local, por lo que el lockfile debe representar la fabrica instalada sin depender aun de release tags reales.

## Alcance incluido

- Crear `.gridwork-lock.json` en la raiz del repo destino.
- Registrar `lockfileVersion`.
- Registrar factory source como `local-source`.
- Registrar `factoryProfile = minimal-mvp`.
- Registrar version de fabrica leida desde `.gridwork/factory.json`.
- Registrar version del instalador CLI.
- Calcular `sha256:` por cada archivo instalado dentro de `.gridwork/`.
- Ordenar files por path.
- Usar JSON pretty-print con 2 espacios.
- Usar paths relativos con `/`.
- No guardar paths absolutos, secrets, logs ni contenido de archivos.

## Fuera de alcance

- Registrar release remoto, tag, asset zip o bundle hash real.
- Resolver prereleases.
- Cache local.
- Editar lockfile manualmente.

## Criterios de aceptacion

- `.gridwork-lock.json` existe despues de `gridwork init`.
- El JSON parsea.
- El lockfile no vive dentro de `.gridwork/` ni `.factory/`.
- Todos los paths en `files` empiezan con `.gridwork/`.
- No hay paths duplicados.
- Los hashes tienen prefijo `sha256:`.
- Dos ejecuciones equivalentes producen orden estable.
- El lockfile no contiene tokens ni paths absolutos.

## Pruebas esperadas

- Unit test de hashing por archivo.
- Unit test de escritura deterministica.
- E2E de instalacion nueva assertando lockfile.
- Test de no secrets/no absolute paths.
- Test de re-run sin cambios que mantiene hashes coherentes.

## Archivos probables

- `packages/cli/src/init/file-hashes.ts`
- `packages/cli/src/init/lockfile.ts`
- `packages/cli/src/init/lockfile-report.ts`
- `packages/cli/test/lockfile.test.mjs`

## Riesgos

- Introducir timestamps volatiles que generen diffs innecesarios.
- Guardar rutas absolutas del entorno.
- Actualizar lockfile antes de una aplicacion segura.

## Trazabilidad

- GQ-076 define hashes por archivo para no sobrescribir personalizaciones.
- GQ-077 define `.gridwork-lock.json` versionado y deterministico.
- GQ-086 exige assertions de lockfile.

## Review de readiness

```text
review_status = ready
review_scope = full
blocking_findings = none
implementation_allowed = true
```

El draft pasa el checklist comun: lockfile versionable, deterministico, sin secretos, con hashes por archivo y sin paths absolutos.

## Resultado de implementacion

```text
implemented = true
implemented_in = local_phase_2
lockfile_path = .gridwork-lock.json
lockfile_records_file_hashes = true
verification = npm_test,npm_pack_cli_dry_run,ascii_check
```

El lockfile registra source local, profile `minimal-mvp`, version de fabrica, version de instalador y hashes `sha256:` por archivo instalado.
