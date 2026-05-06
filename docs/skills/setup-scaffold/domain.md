# Documentos de Dominio (Domain Docs)

Este documento describe cómo las habilidades de ingeniería deben consumir la documentación de dominio de este repositorio al explorar el código.

## Instrucciones de Lectura Previa

Antes de explorar, lee los siguientes archivos en orden:

1. **CONTEXT.md** en la raíz del repositorio.
2. **CONTEXT-MAP.md** en la raíz (si existe). Este archivo apunta a un CONTEXT.md por cada contexto. Lee los que sean relevantes para tu tarea.
3. **docs/adr/**: Lee los ADRs que afecten el área en la que vas a trabajar. En repositorios multicontexto, revisa también las carpetas de ADR específicas dentro de src.

**Nota:** Si estos archivos no existen, procede en silencio. No sugieras crearlos. La habilidad /grill-with-docs los generará cuando sea necesario.

---

## Estructura de Archivos

### Caso 1: Repositorio de Contexto Único
Es el diseño estándar para la mayoría de los proyectos:
- /CONTEXT.md
- /docs/adr/ (contiene archivos .md numerados)
- /src/

### Caso 2: Repositorio Multicontexto
Se identifica por tener un CONTEXT-MAP.md en la raíz:
- /CONTEXT-MAP.md
- /docs/adr/ (decisiones globales)
- /src/nombre-contexto/CONTEXT.md
- /src/nombre-contexto/docs/adr/ (decisiones locales)

---

## Reglas de Uso del Lenguaje

### Vocabulario del Glosario
Al nombrar conceptos de dominio (en títulos de tareas, propuestas de código o pruebas), utiliza siempre los términos definidos en CONTEXT.md. Evita los sinónimos que el glosario prohíbe explícitamente.

Si necesitas un concepto que no existe en el glosario, tómalo como una señal de que hay un vacío documental que debe resolverse mediante la habilidad /grill-with-docs.

### Conflictos con ADRs
Si tu propuesta contradice un ADR existente, menciónalo explícitamente. No ignores la decisión previa. Ejemplo:
"Esta propuesta contradice el ADR-0005 (uso de librerías síncronas), pero se sugiere cambiarlo porque..."

---