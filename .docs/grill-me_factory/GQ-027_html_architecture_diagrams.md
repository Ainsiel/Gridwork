# GQ-027 - Diagramas HTML de arquitectura

- Estado: accepted
- Fuente: decision GQ-026 sobre graficos HTML para arquitectura
- Pregunta origen: GQ-027
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/skills/html-architecture-diagrams/`, `docs/architecture/diagrams/`

## Pregunta

Como deben funcionar los diagramas HTML de arquitectura en Gridwork v1?

## Por que importa

El usuario quiere que los diseños graficos se representen en HTML para tener mejor visualizacion que un bloque Markdown o texto plano.

Pero Gridwork tambien quiere evitar dependencias externas fuertes. Entonces hay que decidir si los HTML seran autocontenidos, si pueden usar librerias CDN, si deben generarse desde datos JSON, y que nivel de interactividad se permite.

## Respuesta recomendada

Usar HTML autocontenido y versionado, con CSS y JavaScript embebido cuando haga falta.

Recomendacion:

```text
diagram_format = html
diagram_path = docs/architecture/diagrams/
diagram_dependencies = self_contained
diagram_generation_skill = html-architecture-diagrams
diagram_source_data_optional = json
diagram_external_cdn_v1 = false
```

## Estructura recomendada

```text
docs/architecture/diagrams/
  context-map.html
  bounded-contexts.html
  domain-model.html
  system-flow.html
  data-flow.html
```

Opcionalmente:

```text
docs/architecture/diagrams/data/
  context-map.json
  domain-model.json
```

## Regla

```text
El documento Markdown explica.
El HTML visualiza.
El JSON opcional estructura datos.
El ADR justifica decisiones.
```

## Limites recomendados

Los diagramas HTML pueden tener:

- layout visual;
- colores por dominio/contexto;
- leyendas;
- zoom simple;
- filtros simples;
- tooltips;
- enlaces a documentos Markdown o ADRs.

No deben requerir:

- build step;
- framework frontend;
- npm install;
- CDN externo;
- servidor local obligatorio.

## Pregunta para decidir

La decision clave:

```text
Quieres que los diagramas HTML sean siempre autocontenidos sin dependencias externas,
o aceptas que usen librerias por CDN para tener visualizaciones mas avanzadas?
```

Mi recomendacion para v1: autocontenidos, sin CDN.

## Respuesta del usuario

El usuario acepta la recomendacion:

- Los diagramas HTML de arquitectura deben ser autocontenidos.
- No deben depender de CDN.
- No deben requerir `npm install`.
- No deben requerir build step.
- Deben poder abrirse como archivos locales.

## Decision registrada

```text
diagram_format = html
diagram_path = docs/architecture/diagrams/
diagram_dependencies = self_contained
diagram_generation_skill = html-architecture-diagrams
diagram_source_data_optional = json
diagram_external_cdn_v1 = false
diagram_requires_build_step = false
diagram_requires_npm_install = false
diagram_can_open_as_local_file = true
```

## Supuestos

- Los diagramas son documentacion versionada.
- No son codigo productivo de la app.
- Deben abrirse como archivo HTML local.
- La skill `html-architecture-diagrams` ayuda a crear visualizaciones, pero no decide arquitectura.

## Riesgos

- HTML demasiado complejo puede volverse dificil de mantener.
- Sin librerias externas, algunos layouts seran mas simples.
- Con CDN, se pierde portabilidad offline.
- Si los diagramas no enlazan a documentos/ADRs, pueden quedar bonitos pero poco trazables.

## Artefactos a crear o actualizar

- `.gridwork/skills/html-architecture-diagrams/SKILL.md`
- `.gridwork/skills/html-architecture-diagrams/skill.json`
- `.gridwork/templates/architecture-diagram.html`
- `docs/architecture/diagrams/`

## Evidencia y notas

- Esta pregunta especializa la decision de GQ-026.
- Mantiene la arquitectura como documentacion versionada, no como codigo ejecutable de producto.
- Decision del usuario: HTML autocontenido sin dependencias externas.
