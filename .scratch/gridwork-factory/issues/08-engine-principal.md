### Tipo
AFK (Away From Keyboard)

### Qué construir

Engine principal que conecta todos los módulos, más el modo `--all-ready` y captura de costos.

**core/engine.py:**

```python
class GridworkEngine:
    def __init__(self, db_path, github_repo, ...):
        # Inicializa conexión DB, cliente GitHub, sandbox manager
    
    async def process_issue(self, issue_number: int) -> PipelineRun:
        # Orquesta el flujo completo para una issue
        # 1. Lee issue de GitHub
        # 2. Crea pipeline_run en DB
        # 3. Ejecuta tdd_pipeline
        # 4. Registra resultado
    
    async def process_all_ready(self, max_concurrent: int = 1) -> list[PipelineRun]:
        # 1. Lista issues con label ready-for-agent
        # 2. Ejecuta process_issue para cada una (secuencial por ahora)
        # 3. Devuelve lista de resultados
```

**main.py — conexión final:**
- Integra argparse con GridworkEngine
- `--issue N`: `engine.process_issue(N)`
- `--all-ready`: `engine.process_all_ready()`
- `--db-path`: ruta SQLite personalizada
- Logging estructurado a consola con timestamps

**Captura de costos:**
- Por ahora, el pipeline registra costo = 0 (placeholder)
- El campo `costo_ejecucion` existe en pipeline_runs, listo para cuando se conecte a APIs de pago
- El engine puede estimar costo basado en tiempo de ejecución y proveedor

**Trazabilidad:**
- Cada cambio de estado en pipeline_run se registra
- pipeline_steps captura cada fase con output (log) y timestamps
- Al final, el engine imprime un resumen:
  ```
  Gridwork: issue #42 completado
    Estado: success
    Commits: abc123, def456
    Tests: 15/15 pasados (92% cobertura)
    Costo: $0.00
    Duración: 3m 42s
  ```

### Criterios de aceptación

- [ ] `python -m orquestador --issue 42` ejecuta el pipeline completo desde el CLI
- [ ] `python -m orquestador --all-ready` lista issues ready y las procesa secuencialmente
- [ ] El engine registra pipeline_steps para cada fase
- [ ] El resumen final se imprime con todos los campos requeridos
- [ ] Tests de integración del engine con componentes mockeados pasan

### Bloqueado por

- `07-pipeline-tdd.md`

### Historias de usuario

1, 6, 10
