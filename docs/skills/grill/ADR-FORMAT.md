---
nombre: formato-adr
descripción: Estándar para la creación de Registros de Decisiones de Arquitectura (ADRs). Define cuándo crear uno, cómo numerarlos y qué estructura mínima deben seguir para ser útiles sin generar burocracia.
---

# Formato ADR (Architecture Decision Records)

Los ADR residen en `docs/adr/` y utilizan una numeración secuencial: `0001-slug.md`, `0002-slug.md`, etc.

**Nota:** Crea el directorio `docs/adr/` de forma "perezosa" (lazy), solo cuando sea necesario el primer ADR.

---

## Plantilla del ADR

**Título corto de la decisión**

*De 1 a 3 frases: cuál es el contexto, qué decidimos y por qué.*

Eso es todo. Un ADR puede ser un solo párrafo. El valor reside en registrar **que** se tomó una decisión y **por qué**, no en rellenar secciones innecesarias.

---

## Secciones Opcionales

Incluye estas secciones solo cuando aporten un valor real. La mayoría de los ADR no las necesitarán:

- **Estado (Frontmatter):** `propuesto | aceptado | obsoleto | superado por ADR-NNNN`. Útil cuando se revisan decisiones antiguas.
- **Opciones Consideradas:** Solo cuando las alternativas rechazadas merezcan ser recordadas.
- **Consecuencias:** Solo cuando haya efectos derivados no obvios que deban señalarse.

---

## Numeración

Para crear uno nuevo, escanea `docs/adr/` para encontrar el número más alto existente e increméntalo en uno.

---

## Cuándo proponer un ADR

Deben cumplirse estas TRES condiciones simultáneamente:

1. **Difícil de revertir:** El coste de cambiar de opinión más tarde es significativo.
2. **Sorprendente sin contexto:** Un futuro lector mirará el código y se preguntará "¿por qué diablos lo hicieron así?".
3. **Resultado de un compromiso (trade-off) real:** Había alternativas genuinas y elegiste una por razones específicas.

Si es fácil de revertir, no lo documentes. Si no es sorprendente, nadie se preguntará el porqué. Si no había alternativa real, solo hiciste lo obvio.

---

## Qué califica como ADR (Ejemplos)

- **Forma Arquitectónica:** "Usamos un monorepo" o "El modelo de escritura usa Event Sourcing".
- **Patrones de Integración:** "Pedidos y Facturación se comunican vía eventos, no HTTP síncrono".
- **Tecnologías con bloqueo (Lock-in):** Base de datos, bus de mensajes, proveedor de auth. No cada librería, solo las que tardarías meses en cambiar.
- **Decisiones de límites y alcance:** "Los datos del Cliente pertenecen al contexto Cliente; otros solo guardan el ID". Los "no" explícitos son tan valiosos como los "sí".
- **Desviaciones deliberadas de lo obvio:** "Usamos SQL manual en lugar de un ORM por X razón". Esto evita que el siguiente ingeniero intente "arreglar" algo que fue intencionado.
- **Restricciones no visibles en el código:** "No podemos usar AWS por requisitos de cumplimiento" o "El tiempo de respuesta debe ser <200ms por contrato con el partner".
- **Alternativas rechazadas no obvias:** Si evaluaste GraphQL y elegiste REST por razones sutiles, regístralo. Si no, alguien volverá a proponer GraphQL en seis meses.