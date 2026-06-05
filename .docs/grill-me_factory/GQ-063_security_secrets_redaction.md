# GQ-063 - Secretos, datos sensibles y redaccion

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-020, GQ-022, GQ-038, GQ-046, GQ-057, GQ-061 y GQ-062
- Pregunta origen: GQ-063
- Fecha de apertura: 2026-06-03
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/`, `.gridwork/policies/path-scopes.md`, `.gridwork/policies/logging-policy.md`, `.factory/runs/<run-id>/`, GitHub CLI

## Pregunta

Como debe manejar Gridwork secretos, archivos sensibles, variables de entorno, tokens y redaccion en logs para que la trazabilidad sea util sin filtrar informacion privada?

## Por que importa

Gridwork va a leer codigo, ejecutar comandos permitidos, usar GitHub CLI y registrar evidencia local. Eso puede exponer datos sensibles si no hay reglas claras.

Riesgos tipicos:

- guardar tokens en `.factory/`;
- imprimir variables de entorno completas;
- registrar headers `Authorization`;
- leer `.env` como si fuera documentacion;
- copiar secretos a issues o comentarios de PR;
- guardar outputs completos de comandos con datos privados;
- pedir a un agente que revise credenciales reales.

## Respuesta recomendada

Usar una politica estricta de secretos:

```text
no leer valores secretos
no guardar secretos
redactar outputs sospechosos
permitir archivos example/template
pedir versiones sanitizadas al usuario
```

La fabrica debe poder operar con configuracion sensible sin conocer los valores sensibles.

## Clasificacion de datos

Usar cuatro categorias:

```text
public
internal
sensitive
secret
```

### `public`

Puede aparecer en docs, issues y logs.

Ejemplos:

- nombres de dominios publicos;
- descripcion de features;
- labels de GitHub;
- rutas de archivos no sensibles.

### `internal`

Puede quedar en `.factory/`, pero no necesariamente en GitHub.

Ejemplos:

- decisiones de routing;
- nombres de ramas;
- resumen de diagnostico;
- paths de archivos internos.

### `sensitive`

Requiere cuidado y redaccion parcial.

Ejemplos:

- correos personales;
- URLs internas;
- IDs de clientes;
- nombres de usuarios reales;
- payloads de error con datos de negocio.

### `secret`

No debe leerse, imprimirse ni guardarse.

Ejemplos:

- tokens;
- passwords;
- private keys;
- access keys;
- refresh tokens;
- cookies de sesion;
- connection strings con credenciales;
- valores de `.env`;
- headers `Authorization`.

## Archivos sensibles

Por defecto, los agentes no deben leer valores en:

```text
.env
.env.*
*.pem
*.key
*.p12
*.pfx
id_rsa
id_ed25519
credentials.json
secrets.json
service-account*.json
```

Excepciones permitidas:

```text
.env.example
.env.template
.env.sample
example.env
README.md
docs de configuracion sin secretos reales
```

Si hace falta entender configuracion real, el agente debe pedir al usuario una version sanitizada.

Variables de entorno sensibles:

```text
GITHUB_TOKEN
GH_TOKEN
```

## GitHub CLI y secrets

Reglas recomendadas:

- no ejecutar `gh secret set` en v1;
- no intentar leer valores de secrets;
- no publicar secretos en issues, PR comments o releases;
- no incluir valores de env vars en `gh` commands;
- no escribir `GITHUB_TOKEN` ni `GH_TOKEN` en reportes, lockfile o logs;
- si se necesita conocer nombres de secrets, pedir approval o pedir al usuario una lista sanitizada;
- `github-actions-cicd` puede documentar que un workflow espera secrets, pero no crearlos.

Ejemplo permitido:

```text
El pipeline requiere un secret llamado `DATABASE_URL`.
El valor no debe registrarse en Gridwork.
```

## Redaccion de outputs

Todo agente que registre salida de comandos debe aplicar redaccion preventiva.

Patrones a redactar:

```text
Authorization: Bearer <token>
password=<value>
token=<value>
api_key=<value>
secret=<value>
DATABASE_URL=<connection-string>
-----BEGIN PRIVATE KEY-----
```

Formato recomendado:

```text
[REDACTED:secret]
[REDACTED:token]
[REDACTED:authorization-header]
[REDACTED:private-key]
[REDACTED:connection-string]
```

El log debe indicar:

```text
output_redacted = true
redaction_reason = secret_pattern_detected
```

## Registros en `.factory/`

Permitido:

- resumen de acciones;
- nombres de archivos;
- comandos sin valores sensibles;
- conteos;
- estado de tests;
- referencias a issues/PRs;
- evidencia sanitizada.

No permitido:

- valores completos de variables de entorno;
- tokens;
- secretos;
- cookies;
- dumps de configuracion privada;
- logs extensos sin filtro;
- datos personales innecesarios.

## Politica para agentes

Todos los agentes deben seguir estas reglas:

- si ven un secreto, no lo repiten;
- si un comando imprime secreto, redaccion antes de registrar;
- si necesitan credenciales, piden accion humana;
- si el usuario pega un secreto en el chat, lo tratan como secreto y no lo escriben a archivos;
- si no pueden avanzar sin un valor real, bloquean y piden configuracion manual;
- no convierten secretos en issues ni work orders.

## Politica para templates

Los templates deben usar placeholders:

```text
<REQUIRED_SECRET_NAME>
<SET_IN_GITHUB_SECRETS>
<DO_NOT_COMMIT_REAL_VALUE>
```

No deben incluir valores reales.

## Propuesta inicial

```text
secret_handling_model = deny_secret_values_by_default
agents_can_read_secret_values = false
agents_can_read_env_example_files = true
agents_can_read_env_real_files = false
agents_can_log_secret_values = false
agents_can_store_secret_values_in_factory = false
agents_can_publish_secret_values_to_github = false
github_actions_cicd_can_create_secrets = false
github_actions_cicd_can_reference_secret_names = true
github_secret_name_discovery_requires_approval = true
redaction_required_for_tool_outputs = true
token_env_values_redacted = true
logs_store_full_command_output_by_default = false
sanitized_user_input_preferred = true
security_policy_path = .gridwork/policies/security-policy.md
```

## Pregunta para decidir

La duda clave:

```text
Quieres que los agentes puedan leer archivos reales como `.env` con aprobacion,
o que en v1 nunca lean valores secretos y solo usen archivos example/template
o informacion sanitizada?
```

Mi recomendacion: en v1, nunca leer valores secretos. Usar `.env.example`, `.env.template` o informacion sanitizada. Si hace falta configurar algo real, el agente debe pedirte que lo hagas manualmente o que entregues un resumen sin valores.

## Respuesta del usuario

El usuario acepta la recomendacion:

- En v1, los agentes nunca deben leer valores secretos reales.
- Los agentes pueden usar `.env.example`, `.env.template`, `.env.sample` o informacion sanitizada.
- Si hace falta configurar un valor real, el agente debe pedir accion manual al usuario.
- Los secretos no se guardan en `.factory/`.
- Los secretos no se publican en issues, PR comments, workflows ni logs.
- `github-actions-cicd` puede referenciar nombres de secrets, pero no crear ni conocer valores.

## Decision registrada

```text
secret_handling_model = deny_secret_values_by_default
agents_can_read_secret_values = false
agents_can_read_env_example_files = true
agents_can_read_env_real_files = false
agents_can_log_secret_values = false
agents_can_store_secret_values_in_factory = false
agents_can_publish_secret_values_to_github = false
github_actions_cicd_can_create_secrets = false
github_actions_cicd_can_reference_secret_names = true
github_secret_name_discovery_requires_approval = true
redaction_required_for_tool_outputs = true
token_env_values_redacted = true
logs_store_full_command_output_by_default = false
sanitized_user_input_preferred = true
security_policy_path = .gridwork/policies/security-policy.md
```

## Regla

```text
Los agentes conocen contratos, no secretos.
Los agentes pueden leer examples/templates, no valores reales.
Los logs resumen y redactan.
Tokens de entorno se usan solo en memoria y nunca se escriben.
GitHub Actions puede referenciar nombres de secrets.
Los valores reales se configuran manualmente fuera de Gridwork.
```

## Supuestos

- `.factory/` es runtime local, pero aun asi no debe contener secretos.
- Los agentes no necesitan conocer valores reales para disenar workflows, issues o arquitectura.
- GitHub Actions puede referenciar nombres de secrets sin conocer valores.
- El usuario puede ejecutar acciones sensibles manualmente cuando haga falta.

## Riesgos

- No leer `.env` real puede hacer mas lento diagnosticar problemas de configuracion.
- Leer `.env` real con approval puede terminar filtrando valores en logs o chat.
- Redactar por patrones no detecta todos los secretos posibles.
- Guardar secretos en `.factory/` seria riesgoso aunque la carpeta este en `.gitignore`.

## Artefactos a crear o actualizar

- `.gridwork/policies/security-policy.md`
- `.gridwork/policies/logging-policy.md`
- `.gridwork/policies/path-scopes.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/templates/github-actions-plan.md`
- `.gridwork/templates/github-actions-workflow.yml`
- `.gridwork/templates/validation-report.md`
- `.gridwork/schemas/tool-call.schema.json`
- `.gridwork/schemas/event.schema.json`

## Evidencia y notas

- Esta pregunta profundiza la regla ya aceptada de no guardar datos sensibles en logs.
- La recomendacion prioriza seguridad y simplicidad: el agente puede entender nombres y contratos, no valores secretos.
- Decision del usuario: aceptar que v1 nunca lea valores secretos reales.
- Revision posterior GQ-083: `init` puede usar `GITHUB_TOKEN`/`GH_TOKEN` opcionalmente, pero solo en memoria; reportes y lockfile registran auth mode, no valores.
