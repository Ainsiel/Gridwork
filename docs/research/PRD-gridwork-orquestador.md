---
title: "PRD: Gridwork — Orquestador de Fábrica de Software"
status: draft
date: 2026-05-06
---

# PRD: Gridwork — Orquestador de Fábrica de Software

## Definición del Problema

Actualmente el flujo grill-with-docs → PRD → issues se hace manualmente en el chat, y la implementación de esos issues no está automatizada. No existe un orquestador que tome issues de GitHub, las asigne a agentes con entornos aislados, ejecute ciclos TDD, valide resultados, y registre trazabilidad. Cada issue requiere intervención humana para codificarla, probarla y mergearla.

## Solución

Gridwork es un orquestador autónomo que:

1. Toma issues de GitHub (creadas desde el chat)
2. Crea un sandbox Docker por issue
3. Inyecta una instrucción JSON con el issue, contexto del proyecto, y skills (TDD)
4. Ejecuta un agente dentro del sandbox que implementa usando TDD (RED→GREEN→REFACTOR)
5. Valida que `pytest` pase antes de aceptar
6. Reintenta si falla con feedback
7. Mergea los commits al repositorio host
8. Registra toda la ejecución en SQLite con trazabilidad y costos

## Historias de Usuario

1. Como operador de la fábrica, quiero ejecutar `python -m orquestador --issue 42` para que el orquestador implemente esa issue automáticamente.
2. Como operador, quiero que el orquestador cree un sandbox Docker aislado por issue para que la implementación no afecte mi entorno local.
3. Como operador, quiero que el agente reciba una skill TDD en su instrucción para que implemente con red-green-refactor por tracer bullets.
4. Como operador, quiero que el orquestador ejecute `pytest` después de la implementación para validar que los tests pasen.
5. Como operador, quiero que si los tests fallan, el orquestador reintente con el feedback del error para que el agente pueda corregir.
6. Como operador, quiero que el orquestador registre cada ejecución en SQLite (commits, tests, costo, duración) para tener trazabilidad completa.
7. Como operador, quiero que los commits hechos por el agente dentro del sandbox se mergeen automáticamente a mi repositorio local.
8. Como operador, quiero que el sandbox se preserve en caso de error para poder depurar, y se destruya automáticamente en éxito.
9. Como operador, quiero que el sandbox tenga un volumen de caché para pip/npm para evitar instalar dependencias desde cero en cada ejecución.
10. Como operador, quiero poder ejecutar el orquestador en modo `--all-ready` para que procese todos los issues con label `ready-for-agent`.

## Decisiones de Implementación

### Stack tecnológico

- Python 3.12+ con asyncio puro (sin Temporal/Prefect)
- SQLite para persistencia
- Docker SDK (`docker-py`) para gestión de contenedores
- gh CLI para interacción con GitHub
- Pydantic para modelos y validación de JSON de entrada/salida

### Módulos a construir

| Módulo | Responsabilidad |
|--------|---------------|
| `orquestador/main.py` | Entry point CLI (argparse) |
| `orquestador/core/engine.py` | Loop principal: leer issue, crear sandbox, ejecutar agente, validar, mergear |
| `orquestador/core/state.py` | Modelos SQLite (dataclasses + Pydantic) |
| `orquestador/core/pipeline.py` | Definición de pipelines reutilizables |
| `orquestador/agents/base.py` | Abstract Base Class para agentes |
| `orquestador/agents/sandbox_agent.py` | Agente que ejecuta comandos dentro del sandbox Docker |
| `orquestador/agents/llm_direct.py` | Agente que llama a API de LLM directo (uso futuro para refinamiento) |
| `orquestador/sandbox/manager.py` | Crear/destruir contenedores, bind-mount del repo |
| `orquestador/sandbox/image.py` | Construir imagen Docker base del agente |
| `orquestador/sandbox/cache.py` | Volúmenes de caché para pip/npm |
| `orquestador/github/client.py` | Wrapper alrededor de gh CLI |
| `orquestador/github/issues.py` | Leer issues, crear PRs |
| `orquestador/db/database.py` | Conexión SQLite y migraciones |
| `orquestador/db/models.py` | Modelos de datos |
| `orquestador/db/repository.py` | CRUD operations |
| `orquestador/config/settings.py` | Carga de configuración |
| `orquestador/workflows/tdd_pipeline.py` | Pipeline TDD: instruir agente → validar → reintentar |

### Contrato agente-orquestador

- **Input**: archivo JSON montado en `/workspace/input.json` con issue, contexto, instrucciones, skill TDD
- **Output**: archivo JSON escrito por el agente en `/workspace/output.json` con commits, resultado de tests, cobertura, resumen

### Ciclo de vida del sandbox

- Imagen Docker con Python 3.12, pytest, y herramientas base
- Bind-mount del repositorio en `/workspace/repo`
- Volumen de caché persistente para `.cache/pip`
- Sandbox nuevo por intento
- Destroy automático en éxito; preserve en fallo
- Al terminar: `git fetch` desde el host + merge de la rama

### Esquema SQLite

```sql
CREATE TABLE pipeline_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_number INTEGER NOT NULL,
    branch TEXT NOT NULL,
    status TEXT NOT NULL,                    -- pending | running | success | failed | retrying
    sandbox_id TEXT,
    input_prompt_path TEXT,
    output_result_path TEXT,
    commits JSON,
    tests_passed INTEGER DEFAULT 0,
    tests_failed INTEGER DEFAULT 0,
    coverage REAL,
    costo_ejecucion REAL,                   -- Costo en USD de la ejecución
    agent_provider TEXT,
    error_message TEXT,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pipeline_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES pipeline_runs(id),
    step_name TEXT NOT NULL,                 -- plan | red | green | refactor | validate
    step_number INTEGER NOT NULL,
    status TEXT NOT NULL,                    -- running | success | failed | skipped
    output TEXT,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);
```

### Operación

- Modo principal: `python -m orquestador --issue 42`
- Modo batch: `python -m orquestador --all-ready`

## Decisiones de Pruebas

- Los tests del orquestador deben usar SQLite en memoria (`:memory:`) para evitar depender de archivos
- Los tests del sandbox deben usar imágenes Docker ligeras (busybox o python:3.12-alpine) para ser rápidos
- Probar el pipeline TDD con un repositorio de prueba temporal
- No mockear Docker en los tests de integración del sandbox manager
- Probar cada agente provider con un contrato de entrada/salida conocido

## Fuera de Alcance

- Interfaz web/UI para el orquestador (solo CLI)
- Integración con otros issue trackers que no sean GitHub (GitLab, Jira)
- Modo daemon con polling automático (se hará en fase 2)
- Agente de refinamiento vía LLM directo (se hará cuando el pipeline de implementación esté sólido)
- Soporte para otros lenguajes que no sean Python (el orquestador es agnóstico, pero la imagen base es Python)
- Sistema de colas o prioridades (los issues se procesan secuencialmente por ahora)

## Notas Adicionales

- Las skills (tdd.md, python-standards.md) viven en el directorio `skills/` y se inyectan como texto en el input JSON del agente
- El orquestador NO sabe de TDD, solo exige que `pytest` pase antes de aceptar
