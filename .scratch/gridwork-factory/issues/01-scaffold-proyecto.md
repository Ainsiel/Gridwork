### Tipo
HITL (Human In The Loop)

### Qué construir

Crear la estructura de directorios del orquestador, `pyproject.toml` con dependencias base, y el entry point CLI en `orquestador/main.py`.

**Estructura a crear:**

```
gridwork/
├── pyproject.toml
├── orquestador/
│   ├── __init__.py
│   ├── main.py              # argparse con --issue y --all-ready
│   ├── core/
│   │   └── __init__.py
│   ├── agents/
│   │   └── __init__.py
│   ├── sandbox/
│   │   └── __init__.py
│   ├── github/
│   │   └── __init__.py
│   ├── db/
│   │   └── __init__.py
│   ├── workflows/
│   │   └── __init__.py
│   └── config/
│       ├── __init__.py
│       ├── settings.py       # Carga de TOML + env vars
│       └── defaults.toml     # Valores por defecto
├── skills/
│   └── .gitkeep
├── docker/
│   └── .gitkeep
├── tests/
│   ├── __init__.py
│   └── conftest.py
└── README.md
```

**Dependencias base** (pyproject.toml):
- `pydantic` para modelos de datos
- `docker` (docker-py) para gestión de contenedores
- `toml` o `tomllib` (stdlib en 3.11+) para config
- `pytest` como dev-dependency

**settings.py**: Debe cargar configuración desde `defaults.toml` con sobrescritura por variables de entorno (prefijo `GRIDWORK_`). Valores iniciales: `db_path`, `docker_image`, `max_retries`, `github_repo`.

**main.py**: argparse con:
- `--issue INTEGER`: procesar una issue específica
- `--all-ready`: procesar todas las issues ready-for-agent
- `--db-path`: ruta alternativa a la base de datos
- Por ahora, solo imprime "Gridwork: procesando issue {numero}" y escribe un registro de prueba en SQLite

### Criterios de aceptación

- [ ] `python -m orquestador --issue 42` imprime "Gridwork: procesando issue 42"
- [ ] `python -m orquestador --all-ready` implica el mismo mensaje
- [ ] `pyproject.toml` existe con las dependencias listadas
- [ ] `settings.py` carga valores desde `defaults.toml` y permite sobrescritura por env vars
- [ ] Se puede ejecutar `pytest` desde la raíz y pasa (aunque sea 0 tests)

### Bloqueado por

Ninguno — puede comenzar inmediatamente

### Historias de usuario

1, 6
