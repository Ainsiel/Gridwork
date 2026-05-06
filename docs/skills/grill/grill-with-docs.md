---
nombre: grill-with-docs
descripción: Sesión de "grilling" que desafía tu plan frente al modelo de dominio, pule la terminología y actualiza la documentación (CONTEXT.md, ADRs) en tiempo real. Úsalo para estresar un plan contra el lenguaje del proyecto y las decisiones documentadas.
---

# Skill: Grill with Docs (Español)

## Instrucciones de Ejecución

Entrevístame implacablemente sobre cada aspecto de este plan hasta que alcancemos un entendimiento compartido. Recorre cada rama del árbol de diseño, resolviendo las dependencias entre decisiones una por una. Para cada pregunta, proporciona tu respuesta recomendada.

* Haz las preguntas de una en una.
* Espera mi retroalimentación antes de continuar con la siguiente.
* Si una pregunta puede responderse explorando la base de código, explora el código primero.

---

## Información de Soporte

### Conciencia del Dominio
Durante la exploración, busca documentación existente siguiendo estas estructuras:

**1. Repositorios de contexto único:**
- `/CONTEXT.md`
- `/docs/adr/0001-ejemplo.md`
- `/src/`

**2. Repositorios multicontexto:**
Si existe un `CONTEXT-MAP.md` en la raíz, el mapa indicará las rutas:
- `/docs/adr/` (Decisiones globales)
- `/src/contexto-a/CONTEXT.md`
- `/src/contexto-a/docs/adr/` (Decisiones locales)

> **Nota:** Crea archivos solo cuando sea necesario. Si no existe `CONTEXT.md`, créalo al resolver el primer término.

---

## Reglas durante la sesión

### 1. Desafío contra el glosario
Si usas un término que choca con `CONTEXT.md`, te detendré: *"Tu glosario define 'X' como A, pero aquí parece significar B. ¿Cuál es la correcta?"*

### 2. Pulir lenguaje ambiguo
Si detecto términos vagos (ej. "cuenta"), propondré uno preciso: *"¿Te refieres al 'Perfil de Usuario' o a la 'Cuenta de Facturación'? Son distintos."*

### 3. Escenarios de estrés
Inventaré situaciones límite para forzar la precisión en los límites de los conceptos discutidos.

### 4. Validación contra el código
Si tu plan contradice lo que está escrito en el código actual, lo señalaré: *"Dices que el sistema permite X, pero el código actual solo implementa Y."*

### 5. Actualización inmediata (inline)
* **CONTEXT.md:** Se actualiza en cuanto se defina un término. No se espera al final.
* **ADRs:** Solo se proponen si la decisión es:
    1. Difícil de revertir (alto costo).
    2. Poco intuitiva sin contexto histórico.
    3. Resultado de un intercambio (trade-off) entre alternativas reales.

---