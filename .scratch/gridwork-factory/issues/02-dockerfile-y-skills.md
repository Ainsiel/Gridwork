### Tipo
AFK (Away From Keyboard)

### Qué construir

Crear la imagen Docker base que usará el sandbox del agente, y las skills de referencia que se inyectarán en el prompt del agente.

**docker/Dockerfile.agent:**
- Base: `python:3.12-slim`
- Instalar: `pytest`, `pytest-cov`, `git`, `gh` CLI, `pip`
- Crear usuario no-root para ejecución
- Directorio de trabajo: `/workspace`
- Entry point por defecto: bash

**skills/tdd.md:** Copiar la skill TDD completa (RED→GREEN→REFACTOR, tracer bullets, checklist por ciclo).

**skills/python-standards.md:** Documentar buenas prácticas del stack:
- Estructura de proyectos Python
- Convenciones de naming (PEP 8)
- Uso de pytest (fixtures, parametrize, tmp_path)
- Type hints con Pydantic
- Logging con `structlog` o `logging` estándar
- Manejo de errores con resultados tipados

### Criterios de aceptación

- [ ] `docker build -f docker/Dockerfile.agent -t gridwork-agent .` construye sin errores
- [ ] El contenedor resultante tiene `pytest --version` funcional
- [ ] `skills/tdd.md` contiene la skill completa y legible
- [ ] `skills/python-standards.md` contiene las guías del stack

### Bloqueado por

- `01-scaffold-proyecto.md`

### Historias de usuario

2
