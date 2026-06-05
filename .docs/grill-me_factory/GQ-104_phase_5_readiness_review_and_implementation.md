# GQ-104 - Revisar fase 5 e implementar publish CLI dry-run

- Estado: accepted
- Fuente: decisiones GQ-071, GQ-073, GQ-079, GQ-103
- Pregunta origen: GQ-104
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: drafts `GW-MVP-028` a `GW-MVP-034`, publish CLI workflow, release publisher modo CLI

## Pregunta

Ahora que los drafts de fase 5 existen, que hacemos con ellos?

La duda concreta:

```text
Quieres que haga review completo de GW-MVP-028 a GW-MVP-034
y, si quedan ready, implemente el flujo de publish CLI en modo dry-run,
sin publicar npm?
```

## Por que importa

Fase 5 toca una frontera externa sensible: npm. Antes de implementar o publicar hay dos blockers conocidos:

- ownership del package npm `gridwork` o fallback scoped;
- source oficial embebido distinto de placeholder.

Tambien debe mantenerse separada de fase 4:

- `factory-v<version>` publica fabrica;
- `cli-v<version>` publica CLI npm.

## Opciones

### Opcion A - Review completo e implementar solo dry-run si queda ready

Revisar fase 5, marcar drafts `ready` si pasan y crear solo tooling seguro: release plan CLI, pack validation y workflow draft sin ejecutar npm publish real.

Ventajas:

- acerca `npx gridwork init` al flujo real;
- mantiene publish bloqueado;
- permite validar pack y metadata antes de tokens npm.

Desventajas:

- no publica aun la CLI.

### Opcion B - Solo review y refinamiento

Revisar los drafts y detenerse.

Ventajas:

- evita tocar workflows de publish.

Desventajas:

- no avanza la automatizacion.

### Opcion C - Implementar solo ownership/package metadata

Resolver package name/source oficial y detenerse.

Ventajas:

- elimina el bloqueo principal.

Desventajas:

- no deja pipeline ni pack validation.

### Opcion D - Pausar

No revisar ni implementar fase 5.

Ventajas:

- evita cualquier riesgo npm.

Desventajas:

- Gridwork sigue sin camino a `npx` real.

## Respuesta recomendada

Usar Opcion B o A segun el nivel de confirmacion:

```text
preferred_next_step = review_full_first
implementation_allowed_only_if_blockers_are_resolved_or_kept_as_safe_dry_run_blocks
npm_publish_now = false
```

Mi recomendacion concreta: hacer review completo y, si implementamos, limitarlo a dry-run y validaciones locales. El publish real debe seguir bloqueado hasta confirmar ownership npm y source oficial.

## Pregunta para decidir

La duda clave:

```text
Quieres que revise fase 5 completa y la implemente en modo dry-run si queda lista,
solo la revise,
implemente solo package/source ownership,
o pausemos aqui?
```

Mi recomendacion: review completo; implementacion solo si queda claro que no publicaremos npm ni ejecutaremos tags reales.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_5_strategy = review_full_then_implement_safe_dry_run
npm_publish_now = false
create_cli_tag_now = false
push_cli_tag_now = false
phase_5_implementation_completed = true
```

Resultado:

```text
review_gw_mvp_028 = completed
review_gw_mvp_029 = completed
review_gw_mvp_030 = completed
review_gw_mvp_031 = completed
review_gw_mvp_032 = completed
review_gw_mvp_033 = completed
review_gw_mvp_034 = completed
phase_5_drafts_ready = true
npm_publish_performed = false
```

## Regla propuesta

```text
Fase 5 no ejecuta npm publish.
Fase 5 no crea ni pushea tag cli-v<version> sin aprobacion explicita.
Fase 5 no declara npx gridwork disponible sin ownership verificado.
Fase 5 no se mezcla con factory-v<version>.
Fase 5 debe bloquear publish real si source oficial sigue placeholder.
```

## Supuestos

- Fase 0 a fase 4 ya estan implementadas localmente.
- El paquete CLI compila y pasa pack dry-run.
- Los secretos npm no estan disponibles ni deben usarse en tests.

## Riesgos

- Publicar npm por accidente.
- Crear tag real por accidente.
- Documentar ownership inexistente.
- Filtrar tokens en logs.

## Artefactos a revisar o actualizar

- `.docs/grill-me_factory/backlog/phase-5/*.md`
- `.github/workflows/publish-cli.yml`
- `packages/cli/package.json`
- `factory/.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `factory/.gridwork/templates/cli-release-plan.md`
- `docs/CLI_PUBLISH_PROCESS.md`

## Evidencia y notas

- GQ-103 creo los drafts detallados de fase 5.
- GQ-071 define publish npm por tag `cli-v<version>` y GitHub Actions.
- GQ-079 exige confirmar ownership del package.
- GQ-073 separa CI de publish.
- Implementacion: `gridwork release cli --dry-run --source owner/repo --source-commit <sha> --confirm-package-ownership --confirm-official-source`.
- Fase 5 genera CLI release plan, notes, pack report, validation report y publish commands.
- Fase 5 no ejecuto `npm publish`, `git tag` ni `git push`.
- Tests: `npm test` paso con 23 tests.
