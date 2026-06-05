# GQ-103 - Detallar fase 5 para publicar la CLI npm

- Estado: accepted
- Fuente: decisiones GQ-064, GQ-071, GQ-073, GQ-079, GQ-100 y GQ-102
- Pregunta origen: GQ-103
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: backlog fase 5, paquete npm `gridwork`, GitHub Actions publish CLI, tags `cli-v<version>`

## Pregunta

Ahora que la fabrica puede producir un release dry-run consumible, como avanzamos hacia publicar la CLI para usar `npx gridwork init`?

La duda concreta:

```text
Quieres que detalle los drafts de fase 5 para publicar el paquete npm `gridwork`
con GitHub Actions y tag `cli-v<version>`?
```

## Por que importa

El flujo deseado del usuario es:

```text
npx gridwork init
```

Para que eso sea real, la CLI debe publicarse en npm de forma controlada. Esta fase es distinta a la fase 4:

- fase 4 publica releases de fabrica con tag `factory-v<version>`;
- fase 5 publica la CLI npm con tag `cli-v<version>`.

No conviene mezclar ambos procesos.

## Opciones

### Opcion A - Detallar fase 5 sin implementar todavia

Crear drafts para publish CLI, versionado npm, pack verification, GitHub Actions, dist-tags y approval gates.

Ventajas:

- mantiene backlog primero;
- evita publicar npm por accidente;
- deja claro el contrato antes de tocar workflows de publish.

Desventajas:

- no publica todavia el paquete.

### Opcion B - Detallar y luego implementar si queda ready

Crear los drafts, revisarlos y, si quedan listos, implementar el pipeline de publish CLI en modo seguro.

Ventajas:

- deja el proyecto cerca de `npx gridwork init` real;
- conecta con el pack dry-run que ya pasa.

Desventajas:

- publishing npm requiere mucho cuidado con tokens, registry y versiones.

### Opcion C - Pausar fase 5

Detenerse antes de npm publish.

Ventajas:

- evita riesgo de publish.

Desventajas:

- Gridwork sigue usable solo localmente.

## Respuesta recomendada

Usar Opcion A por ahora:

```text
phase_5_strategy = create_detailed_drafts_then_review
implement_phase_5_now = false
npm_publish_now = false
```

Mi recomendacion es detallar fase 5 primero y no publicar nada real todavia. npm publish es una frontera externa sensible: tokens, ownership, version y dist-tags deben quedar cerrados antes de codigo.

## Pregunta para decidir

La duda clave:

```text
Quieres que detalle fase 5 como drafts de backlog,
la detalle y la implemente si queda ready,
o pausemos aqui?
```

Mi recomendacion: crear los drafts detallados de fase 5 y revisarlos antes de implementar.

## Decision registrada

El usuario pide continuar y se toma como aceptacion de la recomendacion:

```text
phase_5_strategy = create_detailed_drafts_then_review
implement_phase_5_now = false
npm_publish_now = false
phase_5_focus = npm_cli_publish
```

Resultado:

```text
phase_5_drafts_created = true
phase_5_drafts_reviewed = false
phase_5_implementation_performed = false
npm_publish_performed = false
```

## Regla propuesta

```text
Fase 5 no publica npm sin aprobacion explicita.
Fase 5 no mezcla tag `factory-v<version>` con tag `cli-v<version>`.
Fase 5 debe pasar npm pack dry-run antes de cualquier publish.
Fase 5 debe bloquear si el package name/ownership no esta confirmado.
Fase 5 debe usar GitHub Actions para publish real, no publish local directo.
```

## Supuestos

- Fase 0 a fase 4 ya estan implementadas localmente.
- El paquete CLI ya compila y pasa `npm pack --dry-run`.
- El publish real requiere registry ownership y secrets configurados.

## Riesgos

- Publicar un paquete con nombre incorrecto.
- Publicar version equivocada o reutilizada.
- Filtrar npm token en logs.
- Mezclar release de fabrica y release de CLI.

## Artefactos a crear o actualizar

- `.docs/grill-me_factory/backlog/phase-5/`
- `.github/workflows/publish-cli.yml`
- `packages/cli/package.json`
- `docs/CLI_PUBLISH_PROCESS.md`
- `factory/.gridwork/skills/gridwork-release-publisher/SKILL.md`

## Resultado documental

Drafts creados:

```text
GW-MVP-028 - Verificar package name y ownership npm de la CLI
GW-MVP-029 - Definir versionado y tag cli-v<version>
GW-MVP-030 - Agregar modo CLI release a gridwork-release-publisher
GW-MVP-031 - Crear workflow publish-cli.yml
GW-MVP-032 - Validar npm pack y seguridad del paquete CLI
GW-MVP-033 - Definir dist-tags npm y politica prerelease de CLI
GW-MVP-034 - Probar publish CLI end to end sin publicar npm
```

Archivos creados:

- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-028_cli_package_name_ownership.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-029_cli_version_tag_contract.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-030_cli_release_plan_skill_mode.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-031_publish_cli_github_actions_workflow.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-032_cli_pack_validation_and_secret_safety.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-033_npm_dist_tags_prerelease_policy.md`
- `.docs/grill-me_factory/backlog/phase-5/GW-MVP-034_cli_publish_e2e_dry_run.md`

Notas de review:

```text
known_review_item = confirm_npm_package_ownership
known_review_item = confirm_official_factory_source
```

Fase 5 queda bloqueada para publish real hasta confirmar ownership del package npm y source oficial embebido.

Revision posterior GQ-104: fase 5 fue implementada localmente en modo dry-run/plan; no se publico npm ni se crearon tags reales.
