# GQ-095 - Implementar fase 0 localmente

- Estado: accepted
- Fuente: decisiones GQ-085, GQ-092, GQ-093 y GQ-094
- Pregunta origen: GQ-095
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `package.json`, `packages/cli/`, `.github/workflows/ci.yml`, monorepo Gridwork

## Pregunta

Implementamos fase 0 localmente ahora?

La duda concreta:

```text
Despues de marcar `GW-MVP-001`, `GW-MVP-002` y `GW-MVP-003` como ready,
quieres que empecemos a crear el monorepo, CLI package y CI base?
```

## Por que importa

Fase 0 ya paso review de readiness. Ahora podemos pasar de documentos a codigo/estructura real.

Fase 0 incluye:

```text
GW-MVP-001 - Scaffold monorepo Gridwork con npm workspaces
GW-MVP-002 - Configurar paquete CLI TypeScript con bin `gridwork`
GW-MVP-003 - Configurar CI base del repositorio fuente
```

## Opciones

### Opcion A - Implementar fase 0 completa ahora

Crear monorepo, CLI package y CI base en una sola pasada.

Ventajas:

- deja el repo fuente listo para fase 1;
- reduce trabajo de coordinacion;
- aprovecha que los tres drafts estan relacionados.

Desventajas:

- toca varios archivos de golpe;
- puede requerir ajustar detalles de toolchain si el repo ya tiene contenido.

### Opcion B - Implementar solo GW-MVP-001

Crear solo el scaffold del monorepo.

Ventajas:

- cambio mas pequeno;
- mas facil de revisar;
- reduce riesgo inicial.

Desventajas:

- deja CLI y CI para despues;
- puede requerir varios ciclos antes de tener fase 0 completa.

### Opcion C - No implementar todavia

Dejar todo listo y esperar.

Ventajas:

- evita tocar codigo sin confirmacion explicita adicional;
- permite revisar manualmente los drafts.

Desventajas:

- no avanza el MVP;
- mantiene el proyecto en fase documental.

## Respuesta recomendada

Usar Opcion A:

```text
phase_0_implementation_mode = implement_all_ready_phase_0_drafts
```

Implementar `GW-MVP-001`, `GW-MVP-002` y `GW-MVP-003` juntos, porque forman una rebanada habilitante coherente: monorepo, CLI package y CI base.

## Propuesta inicial

```text
phase_0_implementation_mode = implement_all_ready_phase_0_drafts
implement_gw_mvp_001 = true
implement_gw_mvp_002 = true
implement_gw_mvp_003 = true
github_publish_before_implementation = false
phase_1_implementation_now = false
```

## Pregunta para decidir

La duda clave:

```text
Quieres que implemente fase 0 completa ahora,
solo el scaffold `GW-MVP-001`,
o prefieres no tocar codigo todavia?
```

Mi recomendacion: implementar fase 0 completa ahora. Ya paso readiness y es la base minima para que Gridwork deje de ser solo documentacion.

## Respuesta del usuario

El usuario acepta la recomendacion:

- implementar fase 0 completa ahora;
- implementar `GW-MVP-001`;
- implementar `GW-MVP-002`;
- implementar `GW-MVP-003`;
- no publicar issues en GitHub antes de implementar;
- no implementar fase 1 todavia.

## Decision registrada

```text
phase_0_implementation_mode = implement_all_ready_phase_0_drafts
implement_gw_mvp_001 = true
implement_gw_mvp_002 = true
implement_gw_mvp_003 = true
github_publish_before_implementation = false
phase_1_implementation_now = false
```

## Regla

```text
Fase 0 se implementa localmente completa.
No se publica GitHub antes de fase 0.
No se implementa fase 1 en este paso.
La implementacion debe verificarse con comandos locales razonables.
```

## Supuestos

- No se publica GitHub.
- No se implementa fase 1 todavia.
- Se respetan decisiones de npm workspaces y CLI TypeScript.
- Se verifica con comandos locales razonables despues de editar.

## Riesgos

- El repo podria tener estructura previa no esperada.
- El package name `gridwork` puede requerir ajuste posterior si npm ownership falla.
- El CI puede necesitar ajuste cuando existan tests reales.

## Artefactos a crear o actualizar

- `package.json`
- `package-lock.json`
- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/src/commands/init.ts`
- `.github/workflows/ci.yml`
- `README.md`

## Evidencia y notas

- Esta pregunta ya cruza el umbral de documentacion a implementacion.
- Complementa GQ-094: fase 0 esta `ready`.
- Complementa GQ-085: fase 0 prepara el repo fuente.
- Decision del usuario: aceptar implementacion completa de fase 0.

## Resultado de implementacion

```text
phase_0_implemented = true
gw_mvp_001_status = implemented
gw_mvp_002_status = implemented
gw_mvp_003_status = implemented
npm_install_completed = true
npm_build_passed = true
npm_test_passed = true
npm_pack_dry_run_passed = true
github_publish_performed = false
phase_1_implementation_performed = false
```

Archivos creados o actualizados:

- `package.json`
- `package-lock.json`
- `.gitignore`
- `README.md`
- `docs/README.md`
- `factory/.gridwork/.gitkeep`
- `packages/cli/package.json`
- `packages/cli/README.md`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/src/cli.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/test/init.test.mjs`
- `.github/workflows/ci.yml`

Verificaciones ejecutadas:

```text
npm install
npm run build
npm test
npm pack -w packages/cli --dry-run
```

Notas de verificacion:

- `npm install` requirio permiso externo por escritura de cache npm fuera del workspace.
- `npm pack -w packages/cli --dry-run` requirio permiso externo por escritura de cache npm fuera del workspace.
- El dry-run final del paquete solo incluye `README.md`, `package.json` y `dist/` de produccion.
- No se genero comando `gridwork run`.
- No se genero codigo productivo de frontend, backend, database ni docker.
