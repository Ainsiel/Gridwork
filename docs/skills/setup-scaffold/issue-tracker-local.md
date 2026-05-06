# Rastreador de Problemas: Markdown Local

Los problemas (issues) y los PRDs de este repositorio se gestionan como archivos Markdown dentro de la carpeta `.scratch/`.

## Convenciones

- **Un directorio por funcionalidad**: `.scratch/<feature-slug>/`
- **El PRD**: Se ubica en `.scratch/<feature-slug>/PRD.md`
- **Tareas de implementación**: Se guardan en `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numeradas desde `01`.
- **Estado de triaje**: Se registra en una línea `Estado:` cerca de la parte superior de cada archivo de issue (consulta `triage-labels.md` para conocer las cadenas de texto de cada rol).
- **Comentarios e historial**: Se añaden al final del archivo bajo el encabezado `## Comentarios`.

---

## Flujos de Habilidades (Skills)

### Cuando una habilidad indique "publicar en el rastreador de problemas":
Debes crear un nuevo archivo bajo `.scratch/<feature-slug>/` (creando el directorio si es necesario).

### Cuando una habilidad indique "obtener el ticket relevante":
Lee el archivo en la ruta referenciada. Normalmente, el usuario proporcionará la ruta o el número de issue directamente.