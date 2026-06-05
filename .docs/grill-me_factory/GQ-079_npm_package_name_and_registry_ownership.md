# GQ-079 - Nombre npm y ownership del paquete `gridwork`

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-064, GQ-069, GQ-071 y GQ-078
- Pregunta origen: GQ-079
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: paquete npm, `packages/cli/package.json`, `npx gridwork init`, docs de instalacion, source oficial embebido, GitHub owner/repo

## Pregunta

Como debe manejar Gridwork el nombre del paquete npm y el ownership del source oficial si el nombre `gridwork` no esta disponible o no esta bajo control del proyecto?

## Por que importa

El flujo deseado es:

```bash
npx gridwork init
```

Pero eso solo funciona si el paquete npm unscoped:

```text
gridwork
```

esta disponible y controlado por el proyecto.

Si no lo esta, hay que decidir un fallback antes de implementar docs, workflows, package metadata y GitHub Actions.

## Opciones

### Opcion A - Exigir paquete unscoped `gridwork`

Publicar exactamente:

```text
package name = gridwork
command = npx gridwork init
```

Ventajas:

- UX ideal;
- comando corto;
- coincide con la vision original;
- facil de recordar.

Desventajas:

- depende de que el nombre este disponible o sea recuperable;
- si no esta disponible, bloquea publicacion;
- puede requerir disputa, compra, renombre o contacto con owner.

### Opcion B - Usar paquete scoped

Publicar:

```text
package name = @<scope>/gridwork
bin = gridwork
command = npx @<scope>/gridwork init
```

Ventajas:

- mas probable de controlar si tienes scope propio;
- separa ownership;
- evita bloquearse por el nombre unscoped;
- mantiene el bin interno `gridwork`.

Desventajas:

- el comando `npx` ya no es exactamente `npx gridwork init`;
- menos elegante;
- exige elegir scope npm.

### Opcion C - Usar nombre alternativo unscoped

Ejemplos:

```text
gridwork-cli
gridwork-factory
create-gridwork
```

Ventajas:

- puede preservar comando corto si el nombre alternativo esta disponible;
- evita scope;
- flexible.

Desventajas:

- se aleja de la marca principal;
- puede confundir package name vs bin name;
- `npx gridwork init` no queda garantizado.

### Opcion D - Soportar fallback documentado

Intentar primero:

```text
package name = gridwork
```

Si no esta disponible:

```text
package name = @<scope>/gridwork
bin = gridwork
```

Ventajas:

- mantiene la aspiracion original;
- no bloquea el proyecto;
- permite avanzar con scope propio si npm `gridwork` no se puede usar;
- deja docs preparadas para ambos escenarios.

Desventajas:

- la documentacion debe contemplar dos comandos posibles;
- el source oficial embebido debe ser configurable durante build;
- hay que verificar disponibilidad real durante implementacion.

## Respuesta recomendada

Usar Opcion D:

```text
preferred_package_name = gridwork
fallback_package_name = @<scope>/gridwork
bin_name = gridwork
```

La vision sigue siendo:

```bash
npx gridwork init
```

Pero si el nombre `gridwork` no esta disponible, v1 puede publicarse como:

```bash
npx @<scope>/gridwork init
```

manteniendo el bin:

```text
gridwork
```

## Verificacion requerida

Durante implementacion, antes de fijar package metadata final, se debe verificar:

- disponibilidad/control del paquete npm `gridwork`;
- disponibilidad/control del scope npm elegido;
- owner/repo oficial de GitHub;
- permisos para GitHub Actions publish;
- configuracion de npm provenance/trusted publishing;
- que package name, bin name y docs coincidan.

Esta verificacion no debe hacerse por agentes AFK sin approval si implica login, cambios de ownership o publicacion.

## Source oficial embebido

La CLI debe tener un source oficial embebido:

```text
default_factory_source = <github-owner>/<repo>
```

Pero no debe hardcodearse a ciegas en docs finales hasta definir:

- GitHub owner;
- repo name;
- tag pattern `factory-v<version>`;
- release assets;
- package name final.

## Docs de instalacion

Si el paquete unscoped existe:

```bash
npx gridwork init
```

Si se usa package scoped:

```bash
npx @<scope>/gridwork init
```

En ambos casos el siguiente paso de activacion puede seguir siendo:

```text
Lee .gridwork/agents/orchestrator/PROMPT.md y actua como el orquestador de Gridwork.
```

## Propuesta inicial

```text
npm_package_name_preferred = gridwork
npm_package_name_fallback_allowed = true
npm_package_name_fallback = @<scope>/gridwork
npm_bin_name = gridwork
npx_command_preferred = npx gridwork init
npx_command_scoped_fallback = npx @<scope>/gridwork init
npm_name_availability_must_be_verified_before_implementation = true
npm_scope_must_be_defined_if_fallback_used = true
github_official_source_must_be_defined_before_cli_release = true
package_name_docs_can_have_placeholder_until_verified = true
agents_do_not_claim_package_name_availability_without_verification = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres mantener estrictamente `npx gridwork init` aunque dependa de
obtener el nombre npm `gridwork`, o aceptas un fallback scoped
`npx @<scope>/gridwork init` si el nombre no esta disponible?
```

Mi recomendacion: mantener `gridwork` como nombre preferido, pero aceptar fallback scoped `@<scope>/gridwork` con bin `gridwork`. Asi no bloqueamos la implementacion si el nombre npm unscoped no esta disponible.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `gridwork` queda como nombre npm preferido;
- el comando ideal sigue siendo `npx gridwork init`;
- si el nombre unscoped no esta disponible, se acepta fallback scoped `@<scope>/gridwork`;
- el bin debe seguir llamandose `gridwork`;
- el fallback scoped debe documentarse como alternativa;
- la disponibilidad/control del nombre npm debe verificarse durante implementacion;
- los agentes no deben afirmar disponibilidad sin verificacion.

## Decision registrada

```text
npm_package_name_preferred = gridwork
npm_package_name_fallback_allowed = true
npm_package_name_fallback = @<scope>/gridwork
npm_bin_name = gridwork
npx_command_preferred = npx gridwork init
npx_command_scoped_fallback = npx @<scope>/gridwork init
npm_name_availability_must_be_verified_before_implementation = true
npm_scope_must_be_defined_if_fallback_used = true
github_official_source_must_be_defined_before_cli_release = true
package_name_docs_can_have_placeholder_until_verified = true
agents_do_not_claim_package_name_availability_without_verification = true
```

## Regla

```text
Gridwork prefiere package npm `gridwork`.
Si `gridwork` no esta disponible o no esta bajo control, se puede usar `@<scope>/gridwork`.
El bin sigue siendo `gridwork`.
La documentacion final no promete un package name no verificado.
La CLI no se publica hasta verificar package ownership y source oficial.
```

## Supuestos

- La marca deseada sigue siendo Gridwork.
- El comando ideal sigue siendo `npx gridwork init`.
- La disponibilidad real del nombre npm debe verificarse durante implementacion.
- El usuario puede definir un scope npm/GitHub propio mas adelante.
- La CLI y la fabrica viven en el mismo monorepo fuente.

## Riesgos

- Si el nombre npm `gridwork` no esta disponible y no hay fallback, el release de CLI se bloquea.
- Si docs prometen `npx gridwork init` sin ownership real, pueden quedar incorrectas.
- Si package name y bin name divergen sin claridad, el usuario se confunde.
- Si el source oficial embebido apunta a un repo incorrecto, `init` descargara releases equivocados.

## Artefactos a crear o actualizar

- `packages/cli/package.json`
- `packages/cli/src/init/resolve-source.ts`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/RELEASE_PROCESS.md`
- `.github/workflows/publish-cli.yml`
- `.gridwork/templates/cli-release-plan.md`
- `.gridwork/skills/gridwork-release-publisher/SKILL.md`

## Evidencia y notas

- Esta pregunta protege la UX deseada sin hacer depender todo de un nombre npm aun no verificado.
- Complementa GQ-071: publicacion npm de la CLI.
- Complementa GQ-069: source oficial embebido para descargar la fabrica.
- Complementa GQ-078: publish debe tener ownership y provenance correctos.
- Decision del usuario: aceptar `gridwork` como nombre preferido con fallback scoped `@<scope>/gridwork`.
