---
nombre: a-issues
descripción: Divide un plan, especificación o PRD en "issues" (tareas) independientes en el rastreador de problemas del proyecto, utilizando rebanadas verticales (tracer bullets). Úsalo cuando el usuario quiera convertir un plan en tareas de implementación.
---

# Habilidad: A Issues (to-issues)

Divide un plan en tareas (issues) que puedan ser tomadas de forma independiente utilizando rebanadas verticales (*tracer bullets*).

El vocabulario del rastreador de problemas y las etiquetas de triaje ya deberían haber sido configurados. Si no es así, ejecuta `/setup-scaffold`.

## Proceso

### 1. Reunir contexto
Trabaja a partir de lo que ya esté en el contexto de la conversación. Si el usuario proporciona una referencia de tarea (número de issue, URL o ruta), búscala en el rastreador y lee su cuerpo completo y comentarios.

### 2. Explorar la base de código (opcional)
Si no lo has hecho, explora el código para entender su estado actual. Los títulos y descripciones de las tareas deben usar el glosario de dominio del proyecto y respetar los ADR existentes.

### 3. Diseñar rebanadas verticales
Divide el plan en tareas de tipo **rebanada vertical**. Cada tarea es una capa delgada que atraviesa TODOS los niveles de integración de extremo a extremo, NO una capa horizontal (como "solo base de datos").

Las rebanadas pueden ser:
- **HITL (Human In The Loop)**: Requieren interacción humana (ej. decisión arquitectónica o revisión de diseño).
- **AFK (Away From Keyboard)**: Pueden ser implementadas y fusionadas sin intervención humana. Prefiere AFK sobre HITL siempre que sea posible.

**Reglas de las rebanadas verticales:**
- Cada rebanada entrega un camino estrecho pero COMPLETO por cada capa (esquema, API, UI, pruebas).
- Una rebanada completada es demostrable o verificable por sí misma.
- Prefiere muchas rebanadas delgadas a pocas rebanadas gruesas.

### 4. Consultar al usuario
Presenta el desglose propuesto como una lista numerada. Para cada rebanada, muestra:
- **Título**: Nombre descriptivo corto.
- **Tipo**: HITL / AFK.
- **Bloqueado por**: Qué otras tareas deben completarse primero.
- **Historias de usuario**: Cuáles cubre (si el material de origen las tiene).

Pregunta al usuario si la granularidad es correcta, si las dependencias son acertadas y si las etiquetas HITL/AFK están bien asignadas. Itera hasta que el usuario apruebe.

### 5. Publicar en el rastreador de problemas
Para cada rebanada aprobada, publica una nueva tarea. Usa la etiqueta de triaje adecuada (generalmente `ready-for-agent`). Publica en orden de dependencia (primero los bloqueadores) para poder referenciar los IDs reales.

---

## Plantilla de Issue (ISSUE-TEMPLATE)

### Padre
Referencia a la tarea padre (si el origen fue un issue existente; de lo contrario, omitir).

### Qué construir
Descripción concisa de esta rebanada vertical. Describe el comportamiento de extremo a extremo, no la implementación capa por capa.

**Nota**: Evita rutas de archivos o fragmentos de código, a menos que provengan de un prototipo y definan una decisión técnica precisa (máquina de estados, esquema, etc.).

### Criterios de aceptación
- [ ] Criterio 1
- [ ] Criterio 2

### Bloqueado por
- Referencia al ticket bloqueador (si existe).
- "Ninguno - puede comenzar inmediatamente" si no hay bloqueos.

---

**Importante**: NO cierres ni modifiques ninguna tarea padre.