---
nombre: a-prd
descripción: Convierte el contexto de la conversación actual en un PRD (Documento de Requisitos del Producto) y publícalo en el rastreador de problemas del proyecto. Úsalo cuando el usuario quiera formalizar un plan de desarrollo.
---

Esta skill toma el contexto de la conversación actual y el conocimiento de la base de código para producir un PRD. NO entrevistes al usuario; simplemente sintetiza lo que ya sabes.

El vocabulario del rastreador de problemas y las etiquetas de triaje deberían haber sido proporcionados previamente; ejecuta `/setup-scaffold` si no es así.

## Proceso

1. **Exploración**: Explora el repositorio para entender el estado actual del código si aún no lo has hecho. Usa el vocabulario del glosario de dominio del proyecto en todo el PRD y respeta cualquier ADR en el área que estés tocando.

2. **Diseño de Módulos**: Esboza los módulos principales que necesitarás construir o modificar. Busca activamente oportunidades para extraer "módulos profundos" (deep modules) que puedan probarse de forma aislada.

> **Nota**: Un módulo profundo (a diferencia de uno superficial) es aquel que encapsula mucha funcionalidad en una interfaz simple y estable que rara vez cambia.

3. **Validación**: Confirma con el usuario que estos módulos coinciden con sus expectativas. Pregunta qué módulos requieren pruebas (tests).

4. **Redacción**: Escribe el PRD usando la plantilla de abajo y publícalo en el rastreador de problemas del proyecto. Aplica la etiqueta de triaje `ready-for-agent`.

---

## Plantilla del PRD (PRD-TEMPLATE)

### Definición del Problema
El problema al que se enfrenta el usuario, desde su propia perspectiva.

### Solución
La solución al problema, desde la perspectiva del usuario.

### Historias de Usuario
Una lista numerada EXTENSA de historias de usuario siguiendo el formato:
1. Como <actor>, quiero <funcionalidad>, para que <beneficio>.

*Ejemplo: 1. Como cliente del banco móvil, quiero ver el saldo de mis cuentas para tomar mejores decisiones sobre mis gastos.*

### Decisiones de Implementación
Una lista de decisiones técnicas tomadas. Esto incluye:
- Módulos a construir o modificar.
- Interfaces de esos módulos.
- Aclaraciones técnicas del desarrollador.
- Decisiones arquitectónicas y cambios de esquema.
- Contratos de API e interacciones específicas.

**Regla**: NO incluyas rutas de archivos específicas ni fragmentos de código, a menos que un prototipo haya generado un fragmento que defina una decisión mejor que la prosa (máquina de estados, esquema, forma de un tipo). En ese caso, incluye solo la parte esencial.

### Decisiones de Pruebas
Una lista de decisiones sobre el testing:
- Descripción de qué constituye una buena prueba (probar comportamiento externo, no detalles de implementación).
- Qué módulos serán probados.
- Arte previo (ejemplos similares de pruebas en la base de código).

### Fuera de Alcance (Out of Scope)
Descripción de lo que NO se cubrirá en este PRD.

### Notas Adicionales
Cualquier otra observación relevante sobre la funcionalidad.

---