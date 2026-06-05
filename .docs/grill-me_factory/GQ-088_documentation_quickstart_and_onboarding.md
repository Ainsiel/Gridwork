# GQ-088 - Documentacion, quickstart y onboarding inicial

- Estado: accepted
- Fuente: decisiones GQ-002, GQ-018, GQ-019, GQ-028, GQ-061, GQ-064, GQ-074, GQ-085, GQ-086 y GQ-087
- Pregunta origen: GQ-088
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: documentacion del repositorio fuente, documentacion instalada en `.gridwork/`, salida de consola de `npx gridwork init`, prompts del orquestador

## Pregunta

Que documentacion debe existir para que una persona pueda usar Gridwork despues de ejecutar:

```bash
npx gridwork init
```

La duda concreta:

```text
Debe `init` crear documentacion en la raiz del proyecto destino,
o la documentacion instalada de Gridwork debe vivir dentro de `.gridwork/`?
```

## Por que importa

Gridwork v1 no tendra `gridwork run`. La activacion ocurre por chat usando:

```text
.gridwork/agents/orchestrator/PROMPT.md
```

Eso significa que, despues de instalar, el usuario necesita saber:

- que archivo leer primero;
- que prompt pasar al agente;
- que hizo `init`;
- que no hizo `init`;
- donde estan agentes, workflows, skills y policies;
- donde se guardan reportes locales;
- como re-ejecutar `init` sin miedo;
- como diferenciar docs de Gridwork de docs del producto.

Si `init` crea demasiados docs en la raiz, puede contaminar el repo del proyecto. Si crea muy pocos, el usuario no sabra como empezar.

## Opciones

### Opcion A - Documentacion en la raiz del proyecto destino

`init` crea archivos como:

```text
README-gridwork.md
GRIDWORK_QUICKSTART.md
GRIDWORK_USAGE.md
```

Ventajas:

- muy visible;
- facil de encontrar;
- no obliga a entrar a `.gridwork/`.

Desventajas:

- contamina la raiz del proyecto;
- puede chocar con convenciones del repo;
- mezcla documentacion de la fabrica con documentacion del producto;
- aumenta riesgo de conflictos en re-run.

### Opcion B - Documentacion solo dentro de `.gridwork/`

`init` crea:

```text
.gridwork/README.md
.gridwork/QUICKSTART.md
.gridwork/agents/orchestrator/PROMPT.md
```

La consola apunta a esos archivos.

Ventajas:

- mantiene Gridwork autocontenido;
- no toca docs del producto;
- reduce conflictos;
- encaja con `init` no intrusivo;
- deja claro que la fabrica vive en `.gridwork/`.

Desventajas:

- menos visible si el usuario no mira `.gridwork/`;
- la salida de consola debe ser muy clara;
- puede requerir un quickstart breve y bien escrito.

### Opcion C - Modelo hibrido con root pointer minimo

`init` crea docs dentro de `.gridwork/` y un archivo minimo en raiz:

```text
GRIDWORK.md
```

Ese archivo solo apunta al quickstart y al prompt del orquestador.

Ventajas:

- mantiene visibilidad;
- reduce duplicacion;
- facilita onboarding.

Desventajas:

- igual toca la raiz del proyecto;
- crea otra superficie de conflicto;
- puede ser innecesario si la consola ya indica el proximo paso.

## Respuesta recomendada

Usar Opcion B para v1:

```text
docs_model = source_docs_plus_installed_factory_docs
```

Separar dos mundos:

```text
repo fuente de Gridwork -> docs para mantener y publicar Gridwork
repo destino instalado -> docs de uso dentro de `.gridwork/`
```

`init` no debe crear documentacion en la raiz del proyecto destino en v1.

## Documentacion del repositorio fuente

El repositorio donde se desarrolla Gridwork puede tener:

```text
README.md
docs/
  OPERATING_MODEL.md
  CLI_INIT_BEHAVIOR.md
  FACTORY_INVENTORY.md
  IMPLEMENTATION_ROADMAP.md
  MVP_ACCEPTANCE.md
  RELEASE_PROCESS.md
  SOURCE_REPOSITORY_LAYOUT.md
```

Estos docs son para mantener Gridwork, no para el producto donde se instala.

## Documentacion instalada por `init`

El bundle instalado debe incluir:

```text
.gridwork/
  README.md
  QUICKSTART.md
  factory.json
  agents/
    orchestrator/
      PROMPT.md
      AGENT.md
      agent.json
```

En `minimal-mvp`, los docs instalados minimos son:

```text
.gridwork/README.md
.gridwork/QUICKSTART.md
.gridwork/agents/orchestrator/PROMPT.md
```

En `full-v1`, se pueden agregar indices internos:

```text
.gridwork/workflows/README.md
.gridwork/skills/README.md
.gridwork/agents/README.md
.gridwork/policies/README.md
```

## Contenido esperado de `.gridwork/README.md`

Debe explicar de forma breve:

- que es Gridwork en este repo;
- que `init` instalo la fabrica, no codigo productivo;
- donde esta el prompt del orquestador;
- donde viven agentes, workflows, skills y policies;
- donde se crean reportes locales;
- como re-ejecutar `npx gridwork init`;
- que archivos son versionados y cuales quedan ignorados.

## Contenido esperado de `.gridwork/QUICKSTART.md`

Debe ser accionable:

```text
1. Abre `.gridwork/agents/orchestrator/PROMPT.md`.
2. Copia ese prompt en tu agente por chat.
3. Dile al orquestador que solicitud quieres trabajar.
4. El orquestador leera factory.json, policies, agents y workflows.
5. Si una accion requiere aprobacion, el agente se detendra.
```

No debe contener contratos largos ni duplicar `AGENT.md`, `WORKFLOW.md` o `SKILL.md`.

## Salida de consola recomendada

Al terminar `init`, la consola debe decir algo corto:

```text
Gridwork installed.
Factory: .gridwork/
Runtime reports: .factory/init/<init-run-id>/
Next step: open .gridwork/agents/orchestrator/PROMPT.md
Quickstart: .gridwork/QUICKSTART.md
```

## Propuesta inicial

```text
docs_model = source_docs_plus_installed_factory_docs
init_writes_project_root_docs_v1 = false
installed_docs_path = .gridwork/
installed_readme_path = .gridwork/README.md
installed_quickstart_path = .gridwork/QUICKSTART.md
installed_primary_prompt_path = .gridwork/agents/orchestrator/PROMPT.md
source_repo_docs_path = docs/
init_console_points_to_orchestrator_prompt = true
init_console_points_to_quickstart = true
minimal_mvp_requires_installed_readme = true
minimal_mvp_requires_installed_quickstart = true
full_v1_can_include_internal_indexes = true
installed_docs_do_not_duplicate_contracts = true
installed_docs_no_product_code = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `init` cree docs visibles en la raiz del proyecto destino,
o que la documentacion instalada de Gridwork viva dentro de `.gridwork/`
y la consola apunte al prompt del orquestador mas quickstart?
```

Mi recomendacion: mantener todo dentro de `.gridwork/` en v1. La fabrica queda autocontenida, no contamina el repo del producto, y la consola puede dejar muy claro cual es el siguiente paso.

## Respuesta del usuario

El usuario acepta la recomendacion:

- la documentacion instalada de Gridwork debe vivir dentro de `.gridwork/`;
- `init` no debe crear documentacion en la raiz del proyecto destino en v1;
- `init` debe instalar `.gridwork/README.md`;
- `init` debe instalar `.gridwork/QUICKSTART.md`;
- la consola debe apuntar al prompt del orquestador y al quickstart;
- los docs instalados no deben duplicar contratos de agentes, workflows o skills;
- los docs del repositorio fuente de Gridwork viven separados en `docs/`.

## Decision registrada

```text
docs_model = source_docs_plus_installed_factory_docs
init_writes_project_root_docs_v1 = false
installed_docs_path = .gridwork/
installed_readme_path = .gridwork/README.md
installed_quickstart_path = .gridwork/QUICKSTART.md
installed_primary_prompt_path = .gridwork/agents/orchestrator/PROMPT.md
source_repo_docs_path = docs/
init_console_points_to_orchestrator_prompt = true
init_console_points_to_quickstart = true
minimal_mvp_requires_installed_readme = true
minimal_mvp_requires_installed_quickstart = true
full_v1_can_include_internal_indexes = true
installed_docs_do_not_duplicate_contracts = true
installed_docs_no_product_code = true
```

## Regla

```text
La documentacion de uso instalada por `init` vive dentro de `.gridwork/`.
`init` no crea docs en la raiz del proyecto destino en v1.
`.gridwork/README.md` explica que se instalo y donde esta la fabrica.
`.gridwork/QUICKSTART.md` explica como activar al orquestador por chat.
La consola apunta al prompt del orquestador y al quickstart.
Los docs instalados no duplican contratos de `AGENT.md`, `WORKFLOW.md` ni `SKILL.md`.
```

## Supuestos

- El usuario ejecuta `npx gridwork init` dentro de un repo existente o nuevo.
- El repo destino puede tener su propio README y sus propios docs.
- Gridwork no debe modificar documentacion del producto.
- El prompt principal del orquestador sigue siendo el punto de activacion.

## Riesgos

- Si `.gridwork/QUICKSTART.md` es demasiado largo, el usuario no lo usara.
- Si la consola no apunta al prompt, el usuario no sabra como activar la fabrica.
- Si `init` escribe docs en raiz, puede generar conflictos innecesarios.
- Si los docs duplican contratos, se desincronizaran con agentes, workflows y skills.

## Artefactos a crear o actualizar

- `factory/.gridwork/README.md`
- `factory/.gridwork/QUICKSTART.md`
- `factory/.gridwork/agents/orchestrator/PROMPT.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/FACTORY_INVENTORY.md`
- `docs/OPERATING_MODEL.md`
- `packages/cli/src/init/console-summary.ts`

## Evidencia y notas

- Esta pregunta conecta la instalacion con el primer uso real por chat.
- Complementa GQ-018 y GQ-019: activacion por prompt Markdown, sin mezclar contratos.
- Complementa GQ-061: el prompt del orquestador es el loader operativo.
- Complementa GQ-087: el inventario `minimal-mvp` debe incluir onboarding minimo.
- Decision del usuario: aceptar docs instalados dentro de `.gridwork/` y sin docs en la raiz del proyecto destino.
