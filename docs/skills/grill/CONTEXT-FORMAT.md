---
nombre: formato-contexto
descripción: Define el estándar para crear y mantener archivos CONTEXT.md y CONTEXT-MAP.md, asegurando un lenguaje de dominio (Ubiquitous Language) coherente y preciso.
---

# Formato de CONTEXT.md

## Estructura del Archivo

**[Nombre del Contexto]**
*Descripción de una o dos frases sobre qué es este contexto y por qué existe.*

### Lenguaje (Glosario)

**Pedido**:
Una solicitud formal de productos o servicios.
_Evitar_: Compra, transacción.

**Factura**:
Una solicitud de pago enviada al cliente tras la entrega.
_Evitar_: Recibo, cuenta, solicitud de cobro.

**Cliente**:
Una persona u organización que realiza pedidos.
_Evitar_: Comprador, usuario, cuenta.

### Relaciones

- Un **Pedido** genera una o más **Facturas**.
- Una **Factura** pertenece exactamente a un **Cliente**.

### Diálogo de ejemplo

> **Dev:** "¿Cuando un **Cliente** realiza un **Pedido**, creamos la **Factura** inmediatamente?"
> **Experto:** "No. La **Factura** solo se genera una vez que se confirma el **Cumplimiento**."

### Ambigüedades detectadas

- "Cuenta" se usaba para referirse tanto a **Cliente** como a **Usuario**. Resolución: son conceptos distintos y deben tratarse por separado.

---

## Reglas de Oro

1. **Sé firme:** Si existen varios nombres para lo mismo, elige el mejor y lista los otros como "Evitar".
2. **Señala conflictos:** Si un término es ambiguo, documéntalo en "Ambigüedades detectadas" con su resolución.
3. **Definiciones breves:** Máximo una frase. Define qué ES, no qué hace.
4. **Muestra relaciones:** Usa negritas para los términos y expresa la cardinalidad (uno a muchos, etc.).
5. **Solo términos de dominio:** No incluyas conceptos generales de programación (timeouts, errores, etc.). Pregunta: ¿Es este concepto único de este negocio? Si no, no va aquí.
6. **Agrupa por subencabezados:** Hazlo solo si surgen grupos naturales; si no, una lista plana es suficiente.

---

## Repositorios de Contexto Único vs. Múltiple

### 1. Contexto Único (Mayoría de repos)
Se utiliza un solo archivo `CONTEXT.md` en la raíz del repositorio.

### 2. Múltiples Contextos
Se utiliza un archivo `CONTEXT-MAP.md` en la raíz que lista los contextos y sus relaciones. Ejemplo de estructura:

**Mapa de Contextos**

**Contextos:**
- [Pedidos](./src/ordering/CONTEXT.md): Recibe y rastrea pedidos de clientes.
- [Facturación](./src/billing/CONTEXT.md): Genera facturas y procesa pagos.

**Relaciones:**
- **Pedidos → Facturación**: Pedidos emite eventos `PedidoRealizado`; Facturación los consume para generar cobros.
- **Pedidos ↔ Facturación**: Comparten tipos para `IdCliente` y `Moneda`.

---

## Aplicación de la Skill

La skill infiere qué estructura aplica automáticamente:
- Si existe `CONTEXT-MAP.md`, lo lee para encontrar los contextos.
- Si solo existe un `CONTEXT.md` en la raíz, asume contexto único.
- Si no existe ninguno, crea un `CONTEXT.md` en la raíz de forma perezosa cuando se resuelva el primer término.
- Si hay múltiples contextos, infiere a cuál pertenece el tema actual o pregunta si hay duda.