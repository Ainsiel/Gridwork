### Tipo
AFK (Away From Keyboard)

### Qué construir

Pipeline TDD completo: el workflow central que toma un issue, lo implementa con TDD en un sandbox, valida, reintenta si falla, y mergea.

**workflows/tdd_pipeline.py:**

```python
async def ejecutar_tdd_pipeline(issue_number: int) -> PipelineRun:
```

**Secuencia:**

1. **Preparar**: leer issue de GitHub, crear branch en el repo local, registrar pipeline_run en DB como `running`
2. **Instruir**: construir input.json (issue + skill tdd + contexto repo + branch), copiarlo al sandbox
3. **Ejecutar**: lanzar sandbox Docker, ejecutar el agente con `exec_command()` vía SandboxAgent
4. **Validar**: ejecutar `pytest --cov --json-report` dentro del sandbox
   - Si pytest exit code = 0 → aceptar
   - Si pytest exit code != 0 → extraer feedback (tests fallidos y mensajes) → reintentar
5. **Reintentar**: copiar feedback al sandbox, relanzar agente con instrucción de corregir. Máximo N reintentos (configurable, default 2). Registrar cada intento como pipeline_step.
6. **Mergear**: hacer `git fetch` desde el host + merge de la rama del agente. Registrar commits en pipeline_run.
7. **Cerrar**: actualizar pipeline_run a `success` o `failed`. Si success: cerrar issue en GitHub y opcionalmente crear PR.

**Por ahora**, el pipeline se ejecuta de forma secuencial (una issue a la vez). La paralelización vendrá después con `--all-ready`.

### Criterios de aceptación

- [ ] `ejecutar_tdd_pipeline(issue)` procesa una issue real de principio a fin (con agente simulado)
- [ ] Si pytest falla, el pipeline reintenta hasta N veces
- [ ] Después del máximo de reintentos, el pipeline_run queda como `failed`
- [ ] En éxito: los commits están en el repo host y la DB se actualizó
- [ ] Cada paso se registra en `pipeline_steps` con timestamps
- [ ] Tests con repositorio temporal y agente simulado pasan

### Bloqueado por

- `03-capa-base-datos-sqlite.md`
- `04-cliente-github.md`
- `06-sistema-de-agentes.md`

### Historias de usuario

3, 4, 5, 7, 8
