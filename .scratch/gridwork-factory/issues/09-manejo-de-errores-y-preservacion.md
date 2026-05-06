### Tipo
AFK (Away From Keyboard)

### Qué construir

Manejo robusto de errores con preservación de sandbox para depuración.

**Comportamiento en fallo:**
- Si el agente falla (exit code != 0): preservar contenedor, registrar error en DB
- Si pytest falla después del máximo de reintentos: preservar contenedor, registrar tests fallidos en DB
- Si el sandbox no se puede crear: error inmediato, no reintentar, registrar como `failed`

**Preservación para debug:**
- Cuando un pipeline falla, el sandbox NO se destruye
- El orquestador imprime:
  ```
  Gridwork: issue #42 falló
    Sandbox preservado: gridwork-issue-42-a1b2c3
    Para inspeccionar: docker exec -it gridwork-issue-42-a1b2c3 bash
    Para limpiar manual: docker stop gridwork-issue-42-a1b2c3 && docker rm gridwork-issue-42-a1b2c3
  ```
- En éxito, el sandbox se destruye automáticamente

**Reintentos:**
- Máximo de reintentos configurable en `settings.py` (default: 2)
- Cada reintento se registra como un pipeline_step con step_name="retry-N"
- El feedback del error se pasa al agente: "Los siguientes tests fallaron: test_x, test_y. Mensajes: ..."
- Contador de reintentos se almacena en pipeline_run.error_message

**Tests:**
- Probar que el sandbox NO se destruye en fallo
- Probar que el sandbox SÍ se destruye en éxito
- Probar que los reintentos usan el feedback correcto
- Probar que al alcanzar el máximo de reintentos, el estado es `failed`

### Criterios de aceptación

- [ ] Sandbox preservado cuando el agente falla
- [ ] Sandbox destruido cuando el pipeline completa con éxito
- [ ] Máximo de reintentos configurable respetado
- [ ] Feedback de error se incluye en el reintento al agente
- [ ] Cada reintento queda registrado en pipeline_steps
- [ ] Mensaje de depuración claro se imprime al usuario

### Bloqueado por

- `07-pipeline-tdd.md`

### Historias de usuario

5, 8
