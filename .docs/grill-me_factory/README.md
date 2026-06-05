# Grill-me Factory

Este directorio guarda las respuestas del grill-me para disenar la fabrica de software agentica.

Cada pregunta tiene un archivo Markdown propio con ID estable:

```text
GQ-001_alcance_de_la_fabrica.md
GQ-002_catalogo_inicial_de_productos.md
GQ-003_definicion_de_exito.md
...
```

## Regla de trabajo

1. El arquitecto hace una pregunta a la vez.
2. La respuesta del usuario se registra en el archivo `GQ-###`.
3. Cada archivo debe guardar recomendacion, respuesta final, decision, supuestos, riesgos y artefactos afectados.
4. Si una pregunta queda abierta, el estado debe ser `pending` o `needs_follow_up`.
5. Si una decision queda aceptada, el estado debe ser `accepted`.

## Estados permitidos

- `pending`: pregunta creada, falta respuesta del usuario.
- `answered`: el usuario respondio, falta convertir a decision.
- `accepted`: decision registrada.
- `needs_follow_up`: falta aclaracion.
- `blocked`: la pregunta bloquea una decision posterior.
- `superseded`: reemplazada por una decision posterior.

## Fuente

La guia principal del grill-me esta en:

```text
grill-me_software_factory.md
```
