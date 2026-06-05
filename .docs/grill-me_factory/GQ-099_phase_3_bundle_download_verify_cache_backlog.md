# GQ-099 - Detallar fase 3 para bundle, descarga, verificacion y cache

- Estado: accepted
- Fuente: decisiones GQ-068, GQ-069, GQ-070, GQ-075, GQ-078, GQ-083, GQ-084, GQ-086 y GQ-098
- Pregunta origen: GQ-099
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog fase 3, bundle de fabrica, descarga desde GitHub Releases, verificacion, cache local, CLI `init`

## Pregunta

Ahora que `gridwork init` local-first ya funciona, como avanzamos hacia instalar desde un bundle/release verificable?

La duda concreta:

```text
Quieres que detallemos fase 3 en drafts implementables antes de tocar descarga,
zip, verificacion y cache?
```

## Por que importa

Fase 3 conecta el instalador con GitHub Releases y supply chain:

- resolver source oficial o override;
- descargar bundle zip;
- verificar SHA256;
- inspeccionar paths seguros;
- extraer a staging;
- cachear versiones exactas;
- bloquear prereleases sin approval;
- no imprimir tokens ni headers;
- no actualizar lockfile si falla.

Esto es mas riesgoso que fase 2 porque introduce red, assets externos y verificacion de integridad.

## Opciones

### Opcion A - Crear drafts detallados de fase 3 y revisarlos antes de implementar

Crear `phase-3/` con drafts detallados para source resolution, descarga, checksum, extraccion segura, cache y compatibilidad.

Ventajas:

- mantiene disciplina de readiness;
- reduce riesgo de mezclar red, zip y apply;
- permite auditar la dependencia zip antes de adoptarla;
- prepara tests de fallo seguro.

Desventajas:

- agrega una iteracion documental antes de codigo.

### Opcion B - Implementar fase 3 directamente

Usar decisiones GQ existentes y pasar directo a codigo.

Ventajas:

- avanza rapido hacia releases reales;
- acerca `npx gridwork init --factory-version` a su comportamiento final.

Desventajas:

- riesgo alto de errores de seguridad o paths;
- puede mezclar demasiadas responsabilidades;
- dificulta revisar dependencia zip.

### Opcion C - Publicar issues antes de fase 3

Usar `github-issue-publisher` con approval.

Ventajas:

- deja el backlog visible en GitHub.

Desventajas:

- requiere repo destino y approvals;
- no desbloquea tecnicamente fase 3.

### Opcion D - Pausar

Detenerse despues de init local-first.

Ventajas:

- permite revisar manualmente fase 2.

Desventajas:

- Gridwork aun no instala desde releases verificables.

## Respuesta recomendada

Usar Opcion A:

```text
phase_3_strategy = create_detailed_drafts_then_review
implement_phase_3_now = false
github_publish_before_phase_3 = false
phase_3_focus = bundle_download_verify_cache
```

Mi recomendacion es detallar fase 3 antes de implementar. Esta fase cruza a red, cache y verificacion de bundles; conviene hacerla por slices pequenos y revisables.

## Drafts sugeridos para fase 3

```text
GW-MVP-014 - Resolver source y version de fabrica para init
GW-MVP-015 - Descargar bundle y checksums desde GitHub Releases
GW-MVP-016 - Verificar SHA256 y manifest del bundle
GW-MVP-017 - Inspeccionar y extraer zip seguro a staging
GW-MVP-018 - Aplicar staging usando el flujo existente de fase 2
GW-MVP-019 - Implementar cache local verificada para version exacta
GW-MVP-020 - Probar fallos seguros de bundle, compatibilidad y prerelease
```

## Pregunta para decidir

La duda clave:

```text
Quieres que cree el lote de drafts detallados de fase 3,
que implemente fase 3 directamente,
que publiquemos issues primero,
o que pausemos aqui?
```

Mi recomendacion: crear drafts detallados de fase 3 y revisarlos antes de implementar.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_3_strategy = create_detailed_drafts_then_review
implement_phase_3_now = false
github_publish_before_phase_3 = false
phase_3_focus = bundle_download_verify_cache
```

Resultado:

```text
phase_3_drafts_created = true
phase_3_drafts_reviewed = false
phase_3_implementation_performed = false
```

## Regla propuesta

```text
Fase 3 no se implementa sin drafts detallados y review de readiness.
Fase 3 debe mantener el apply/no-overwrite/lockfile de fase 2.
Fase 3 no imprime secretos.
Fase 3 no usa herramientas del sistema para extraer zip.
Fase 3 debe bloquear ante hash mismatch, paths prohibidos o compatibilidad fallida.
```

## Supuestos

- Fase 2 ya implemento init local-first.
- El apply seguro y lockfile se reutilizan.
- La dependencia zip concreta se elige durante implementacion con mini auditoria.
- GitHub Releases sera publico por defecto, con token opcional solo en memoria.

## Riesgos

- Una mala extraccion zip puede escribir fuera de `.gridwork/`.
- Cache sin hash puede instalar assets incorrectos.
- Manejar tokens mal puede filtrar secretos en reportes.
- Implementar todo junto puede ocultar fallos de supply chain.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/phase-3/`
- `.docs/grill-me_factory/backlog/phase-index.md`
- `.docs/grill-me_factory/backlog/review-report.md`
- `packages/cli/src/init/`
- `packages/cli/test/`

## Evidencia y notas

- GQ-098 implemento `gridwork init` local-first.
- GQ-075 define zip seguro con dependencia minima auditada.
- GQ-083 define auth y rate limits.
- GQ-084 define cache local verificada.
- GQ-086 exige e2e de fallo seguro.

## Resultado documental

Drafts creados:

```text
GW-MVP-014 - Resolver source y version de fabrica para init
GW-MVP-015 - Descargar bundle y checksums desde GitHub Releases
GW-MVP-016 - Verificar SHA256 y manifest del bundle
GW-MVP-017 - Inspeccionar y extraer zip seguro a staging
GW-MVP-018 - Aplicar staging usando el flujo existente de fase 2
GW-MVP-019 - Implementar cache local verificada para version exacta
GW-MVP-020 - Probar fallos seguros de bundle, compatibilidad y prerelease
```

Archivos creados:

- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-014_init_source_version_resolution.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-015_download_release_assets.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-016_verify_bundle_manifest_checksums.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-017_secure_zip_inspection_staging.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-018_apply_staging_with_phase_2_flow.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-019_verified_local_cache.md`
- `.docs/grill-me_factory/backlog/phase-3/GW-MVP-020_bundle_failure_e2e.md`

Regla mantenida:

```text
No se implementa codigo de fase 3 sin review de readiness.
```
