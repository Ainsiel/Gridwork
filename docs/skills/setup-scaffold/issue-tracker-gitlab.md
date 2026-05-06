# Rastreador de Problemas: GitLab

Los problemas (issues) y los PRDs para este repositorio se gestionan como issues de GitLab. Se debe utilizar la CLI de GitLab (`glab`) para todas las operaciones.

## Convenciones de Comandos

- **Crear un issue**:
  `glab issue create --title "..." --description "..."`
  (Nota: Usa un heredoc para descripciones de varias líneas o `--description -` para abrir el editor).

- **Leer un issue**:
  `glab issue view <número> --comments`
  (Usa `-F json` si necesitas una salida procesable por máquina).

- **Listar issues**:
  `glab issue list --state opened -F json`
  (Nota: GitLab usa `opened` en lugar de `open`. Aplica filtros de `--label` según sea necesario).

- **Comentar en un issue**:
  `glab issue note <número> --message "..."`
  (Nota: GitLab denomina a los comentarios como "notas").

- **Gestionar etiquetas**:
  `glab issue update <número> --label "..."` para añadir o `--unlabel "..."` para eliminar. Se pueden separar varias etiquetas por comas.

- **Cerrar un issue**:
  `glab issue close <número>`
  (Importante: `glab` no acepta un comentario de cierre directo. Publica primero la explicación con `glab issue note` y luego cierra el issue).

- **Merge Requests (MR)**:
  GitLab llama a los PRs "merge requests". El uso es idéntico a los comandos de issues: `glab mr create`, `glab mr view`, `glab mr note`, etc.

> **Nota técnica**: El repositorio se infiere automáticamente mediante `git remote -v` cuando se ejecuta dentro de un clon local.

---

## Flujos de Habilidades (Skills)

### Cuando una habilidad indique "publicar en el rastreador de problemas":
Debes crear un issue de GitLab siguiendo las convenciones anteriores.

### Cuando una habilidad indique "obtener el ticket relevante":
Debes ejecutar el comando: `glab issue view <número> --comments`.