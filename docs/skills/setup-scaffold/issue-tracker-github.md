# Rastreador de Problemas: GitHub

Los problemas (issues) y los PRDs para este repositorio se gestionan como issues de GitHub. Se debe utilizar la CLI de GitHub (`gh`) para todas las operaciones.

## Convenciones de Comandos

- **Crear un issue**:
  `gh issue create --title "..." --body "..."`
  (Nota: Utiliza un heredoc para cuerpos de mensaje con múltiples líneas).

- **Leer un issue**:
  `gh issue view <número> --comments`
  (Se recomienda filtrar comentarios con `jq` y obtener también las etiquetas).

- **Listar issues**:
  `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
  (Utiliza los filtros de `--label` y `--state` según sea necesario).

- **Comentar en un issue**:
  `gh issue comment <número> --body "..."`

- **Añadir o eliminar etiquetas**:
  `gh issue edit <número> --add-label "..."` o `--remove-label "..."`

- **Cerrar un issue**:
  `gh issue close <número> --comment "..."`

> **Nota técnica**: El repositorio se infiere automáticamente mediante `git remote -v`. La herramienta `gh` gestiona esto de forma nativa al ejecutarse dentro de un clon del repositorio.

---

## Flujos de Habilidades (Skills)

### Cuando una habilidad indique "publicar en el rastreador de problemas":
Debes crear un issue de GitHub siguiendo las convenciones anteriores.

### Cuando una habilidad indique "obtener el ticket relevante":
Debes ejecutar el comando: `gh issue view <número> --comments`.