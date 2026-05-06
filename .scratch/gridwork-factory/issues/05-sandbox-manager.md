### Tipo
AFK (Away From Keyboard)

### Qué construir

Gestión del ciclo de vida de contenedores Docker para los sandboxes de los agentes.

**sandbox/manager.py:**
- `create_sandbox(image, repo_host_path, repo_container_path, cache_volumes)` → crea contenedor, devuelve sandbox_id
  - Bind-mount del repositorio host en `/workspace/repo`
  - Montar volúmenes de caché para pip
  - Configurar working directory
  - Asignar nombre único (ej: `gridwork-issue-42-<hash>`)
- `exec_command(sandbox_id, command, cwd, timeout)` → ejecuta comando, devuelve stdout, stderr, exit_code
  - Timeout configurable (default 30 min)
  - Stream de output en tiempo real (opcional)
- `stop_sandbox(sandbox_id)` → detiene el contenedor
- `remove_sandbox(sandbox_id)` → elimina el contenedor
- `copy_file_to_sandbox(sandbox_id, host_path, container_path)` → copia archivo al contenedor
- `sandbox_exists(sandbox_id)` → verifica si el contenedor sigue vivo

**sandbox/image.py:**
- `ensure_image(image_name)` → verifica si la imagen existe, la construye si no con `docker build`
- `build_image(dockerfile_path, image_name)` → construye la imagen

**sandbox/cache.py:**
- `ensure_cache_volume(name)` → crea volumen Docker si no existe
- `cache_volume_name()` → devuelve el nombre del volumen de caché (ej: `gridwork-pip-cache`)
- `get_cache_mounts()` → devuelve lista de mounts para Docker

**Pruebas:**
- Probar con imagen `python:3.12-alpine` para velocidad
- Crear contenedor, ejecutar comando simple (`echo "hello"`), verificar output, destruir
- Test: timeout debe fallar si el comando excede el límite

### Criterios de aceptación

- [ ] `create_sandbox()` crea un contenedor Docker ejecutable
- [ ] `exec_command()` ejecuta un comando y devuelve stdout/stderr/exit_code correctamente
- [ ] Timeout en exec_command mata el proceso después del límite
- [ ] `stop_sandbox()` + `remove_sandbox()` limpian completamente
- [ ] `ensure_image()` construye la imagen si no existe
- [ ] Tests de integración con Docker pasan en CI

### Bloqueado por

- `02-dockerfile-y-skills.md`

### Historias de usuario

2, 4, 9
