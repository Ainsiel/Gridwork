# GQ-009 - Instalacion y creacion de skills y stack packs

- Estado: accepted
- Fuente: decisiones aceptadas en GQ-007 y correccion de stack predefinido en GQ-008
- Pregunta origen: GQ-009
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/` y `.gridwork/stack-packs/`

## Pregunta

Debe Gridwork permitir instalar o crear skills y stack packs dinamicamente en v1?

## Por que importa

El usuario decidio que en el MVP no quiere crear skills o stacks dinamicamente. Prefiere un stack predefinido y cambios manuales despues de instalar Gridwork.

Esta decision reduce superficie de riesgo y evita construir un sistema de marketplace/instalacion antes de validar la fabrica.

## Respuesta recomendada

No implementar instalacion o creacion dinamica de skills/stack packs en v1.

Gridwork debe venir con skills base y un stack pack predefinido. Si el usuario quiere cambiar skills o stack despues de `gridwork init`, lo hace manualmente editando archivos versionados en `.gridwork/`.

## Flujo recomendado para v1

```bash
npx gridwork init
```

Secuencia:

```text
create .gridwork/
-> install bundled base skills
-> install bundled default-fullstack stack pack
-> write factory.json
-> write policies/schemas/workflows/templates
-> update .gitignore
-> log event
```

## Cambios manuales posteriores

Si el usuario quiere modificar el stack o skills:

- edita `.gridwork/skills/`;
- edita `.gridwork/stack-packs/default-fullstack/`;
- edita `.gridwork/workflows/`;
- edita `.gridwork/policies/`;
- deja trazabilidad manual en docs o decisiones si el cambio es importante.

## Estados recomendados

```text
active
disabled
deprecated
modified-manually
```

## Regla de seguridad

En v1 no existe activacion dinamica de una skill o stack pack externo.

Si el usuario modifica manualmente una skill o stack pack, el orquestador debe validar schemas y policies antes de ejecutar workflows.

## Respuesta del usuario

Revision actual del usuario:

- No se crearan skills o stacks dinamicamente en v1.
- Gridwork vendra con stack y skills predefinidas.
- Stack inicial: Next.js frontend, Spring Boot backend, PostgreSQL y Docker Compose.
- Si el usuario quiere cambiarlo, lo hara manualmente despues de instalar Gridwork.

## Decision registrada

Decision aceptada revisada:

```text
dynamic_skill_installation = false
dynamic_skill_creation = false
dynamic_stack_pack_installation = false
dynamic_stack_pack_creation = false
bundled_base_skills = true
bundled_default_stack_pack = true
manual_extension_after_init = true
manual_changes_require_schema_policy_validation = true
```

Regla:

```text
Gridwork v1 instala lo predefinido.
El usuario puede modificar manualmente.
El orquestador valida antes de ejecutar.
```

## Supuestos

- Las skills base viven versionadas en `.gridwork/skills/`.
- El stack pack predefinido vive versionado en `.gridwork/stack-packs/default-fullstack/`.
- `factory.json` registra que el stack pack predefinido esta activo.
- No hay registry ni marketplace en v1.

## Riesgos

- La modificacion manual puede romper schemas si no hay validacion.
- Al no tener instalacion dinamica, agregar nuevos stacks sera mas lento.
- El stack predefinido puede ser demasiado opinado para algunos proyectos.
- Si no se documentan cambios manuales, se pierde trazabilidad de por que el stack cambio.

## Preguntas abiertas

- Que skills base vienen instaladas con `gridwork init`?
- Que contiene exactamente el stack pack `default-fullstack`?
- Como valida Gridwork cambios manuales en `.gridwork/`?
- Debe existir un comando `gridwork validate`?
- Cuando se retomara la idea de instalacion dinamica, si alguna vez se retoma?

## Artefactos a crear o actualizar

- `.gridwork/policies/manual-extension-policy.md`
- `.gridwork/schemas/skill.schema.json`
- `.gridwork/schemas/stack-pack.schema.json`
- `.gridwork/stack-packs/default-fullstack/`
- `docs/SKILL_INSTALLATION_MODEL.md`
- `docs/STACK_EXTENSION_MODEL.md`

## Evidencia y notas

- Esta revision difiere de la recomendacion inicial: no hay `skill create`, `skill add`, `stack create` ni `stack add` en v1.
- La extensibilidad queda como modificacion manual y futura evolucion.
- El mock adapter sigue siendo util para validar workflows y contracts predefinidos.
