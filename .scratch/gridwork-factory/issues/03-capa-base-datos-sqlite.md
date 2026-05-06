### Tipo
AFK (Away From Keyboard)

### Qué construir

Implementar la capa de persistencia SQLite con los modelos de datos y operaciones CRUD.

**db/database.py:**
- Conexión SQLite con `sqlite3` (stdlib)
- Soporte para `:memory:` en tests
- Función `init_db()` que crea tablas si no existen (migración inicial)
- Función `get_connection()` que devuelve una conexión (reutilizable)
- Context manager para transacciones

**db/models.py:**
- `PipelineRun`: dataclass/Pydantic model con todos los campos del esquema (id, issue_number, branch, status, sandbox_id, commits, tests_passed, tests_failed, coverage, costo_ejecucion, agent_provider, error_message, timestamps)
- `PipelineStep`: dataclass/Pydantic model (id, run_id, step_name, step_number, status, output, timestamps)
- Serialización/deserialización JSON para el campo `commits`

**db/repository.py:**
- `create_run()` → inserta y devuelve PipelineRun
- `get_run(id)` → consulta por ID
- `get_run_by_issue(issue_number)` → consulta por issue
- `update_run_status(id, status, ...)` → actualiza estado y campos opcionales
- `add_step(run_id, step_name, ...)` → inserta un pipeline_step
- `get_steps(run_id)` → lista de pasos de una ejecución
- `list_runs(limit=10)` → últimas ejecuciones

### Criterios de aceptación

- [ ] `init_db()` crea ambas tablas con el esquema correcto
- [ ] Se puede insertar un PipelineRun y recuperarlo por ID
- [ ] Se puede insertar PipelineSteps asociados a un Run
- [ ] `:memory:` funciona para tests sin archivo físico
- [ ] Tests unitarios pasan con cobertura > 80%

### Bloqueado por

- `01-scaffold-proyecto.md`

### Historias de usuario

6
