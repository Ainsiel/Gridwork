---
nombre: setup-scaffold
descripción: Configura un bloque de `## Habilidades del agente` en AGENTS.md/CLAUDE.md y en `docs/agents/` para que las habilidades de ingeniería conozcan el rastreador de problemas del repo, el vocabulario de etiquetas de triaje y la estructura de documentos de dominio. Ejecutar antes de usar `to-issues`, `to-prd`, `triage`, etc.
disable-model-invocation: true
---

# Configuración de Habilidades (Setup Scaffold)

Prepara la configuración por repositorio que las habilidades de ingeniería asumen por defecto:

- **Rastreador de problemas (Issue tracker)**: Dónde viven los issues (GitHub por defecto; también soporta markdown local).
- **Etiquetas de triaje**: Los nombres utilizados para los cinco roles canónicos de triaje.
- **Documentación de dominio**: Dónde viven `CONTEXT.md` y los ADRs, y las reglas para leerlos.

Esta es una skill guiada por prompts, no un script determinista. Explora, presenta lo que encuentres, confirma con el usuario y luego escribe.

## Proceso

### 1. Explorar
Observa el repositorio actual para entender su estado inicial. No asumas; lee lo que existe:
- `git remote -v` y `.git/config`: ¿Es un repo de GitHub o GitLab?
- `AGENTS.md` y `CLAUDE.md` en la raíz: ¿Existe alguno? ¿Tienen ya una sección de `## Habilidades del agente`?
- `CONTEXT.md` y `CONTEXT-MAP.md` en la raíz.
- Directorios `docs/adr/` o `src/*/docs/adr/`.
- `docs/agents/`: ¿Ya existe salida previa de esta skill?

### 2. Presentar hallazgos y preguntar
Resume lo que está presente y lo que falta. Luego, guía al usuario a través de tres decisiones **una por una**. No lances las tres a la vez.

**Sección A — Rastreador de problemas (Issue tracker)**
> *Explicación: Aquí es donde viven las tareas. Las habilidades como `to-issues` o `to-prd` necesitan saber si deben llamar a `gh issue create`, escribir un archivo markdown en `.scratch/` o seguir otro flujo.*

Opciones a ofrecer:
- **GitHub**: Los issues viven en GitHub Issues (usa la CLI `gh`).
- **GitLab**: Los issues viven en GitLab Issues (usa la CLI `glab`).
- **Markdown Local**: Los issues viven como archivos en `.scratch/<funcionalidad>/` (ideal para proyectos en solitario).
- **Otro (Jira, Linear, etc.)**: Pide al usuario que describa el flujo en un párrafo.

**Sección B — Vocabulario de etiquetas de triaje**
> *Explicación: La habilidad `triage` mueve los issues por estados (necesita evaluación, esperando respuesta, listo para agente, etc.). Si tu repo ya usa etiquetas como `bug:triage` en lugar de `needs-triage`, mapealas aquí para evitar duplicados.*

Los cinco roles canónicos:
- `needs-triage`: El mantenedor debe evaluar.
- `needs-info`: Esperando respuesta del reportero.
- `ready-for-agent`: Totalmente especificado, listo para que un agente lo resuelva sin contexto humano.
- `ready-for-human`: Necesita implementación por un humano.
- `wontfix`: No se realizará ninguna acción.

**Sección C — Documentación de dominio**
> *Explicación: Las habilidades de arquitectura leen `CONTEXT.md` y `docs/adr/`. Necesitan saber si hay un contexto global o múltiples contextos (ej. un monorepo).*

Confirma el diseño:
- **Contexto único**: Un `CONTEXT.md` + `docs/adr/` en la raíz.
- **Multi-contexto**: Un `CONTEXT-MAP.md` en la raíz que apunta a archivos por contexto.

### 3. Confirmar y editar
Muestra al usuario un borrador de:
- El bloque `## Habilidades del agente` para el archivo `CLAUDE.md` o `AGENTS.md`.
- El contenido de los archivos en `docs/agents/` (`issue-tracker.md`, `triage-labels.md`, `domain.md`).

### 4. Escribir
**Reglas de selección de archivo:**
- Si existe `CLAUDE.md`, edítalo.
- Si no, si existe `AGENTS.md`, edítalo.
- Si ninguno existe, pregunta al usuario cuál crear. No elijas por él.

**Formato del bloque:**
```markdown
## Habilidades del agente

### Rastreador de problemas
[resumen de una línea]. Ver `docs/agents/issue-tracker.md`.

### Etiquetas de triaje
[resumen del vocabulario]. Ver `docs/agents/triage-labels.md`.

### Documentación de dominio
[resumen: "contexto único" o "multi-contexto"]. Ver `docs/agents/domain.md`.
```
### 5. Finalizar
Informa al usuario que la configuración se ha completado y qué habilidades de ingeniería leerán ahora estos archivos. Indica que pueden editarlos directamente en el futuro.