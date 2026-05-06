### Tipo
AFK (Away From Keyboard)

### Qué construir

Wrapper alrededor de `gh` CLI para interactuar con GitHub Issues y Pull Requests.

**github/client.py:**
- Ejecutar comandos `gh` vía `subprocess.run` o `asyncio.create_subprocess_exec`
- Manejo de errores: comando no encontrado, exit code no cero, parseo de JSON
- Función genérica `run_gh(args, json_output=True)` → dict | str

**github/issues.py:**
- `get_issue(number)` → lee issue con `gh issue view <num> --comments --json title,body,labels`
- `list_ready_issues()` → lista issues con label `ready-for-agent` usando `gh issue list --label ready-for-agent --json number,title`
- `create_pr(title, body, branch, base)` → crea PR con `gh pr create`
- `close_issue(number, comment)` → cierra issue con `gh issue close`
- `add_label(number, label)` → añade label con `gh issue edit --add-label`

**Pruebas:**
- Usar `subprocess` con respuestas simuladas (mock de subprocess o fixture que genera salida `gh` falsa)
- Probar parseo de JSON en distintos formatos

### Criterios de aceptación

- [ ] `get_issue(42)` devuelve título, cuerpo y labels de la issue
- [ ] `list_ready_issues()` devuelve lista de issues con label ready-for-agent
- [ ] Los errores de `gh` no encontrado se manejan con mensaje claro
- [ ] Tests unitarios con mock de subprocess pasan

### Bloqueado por

- `01-scaffold-proyecto.md`

### Historias de usuario

1
