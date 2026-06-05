# GQ-083 - Acceso de `init` a GitHub Releases, autenticacion y rate limits

- Estado: accepted
- Fuente: decisiones GQ-012, GQ-063, GQ-064, GQ-069, GQ-074, GQ-078 y GQ-080
- Pregunta origen: GQ-083
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `npx gridwork init`, GitHub Releases, GitHub API, descarga de assets, `.gridwork-lock.json`, reportes `.factory/init/`

## Pregunta

Como debe acceder `npx gridwork init` a GitHub Releases para descargar la fabrica?

La duda concreta:

```text
Debe `init` requerir GitHub CLI, tokens o login, o debe funcionar sin credenciales cuando el repo oficial es publico?
```

## Por que importa

El flujo deseado es:

```bash
npx gridwork init
```

Eso debe sentirse simple. Pero la fabrica se descarga desde GitHub Releases, y eso abre casos reales:

- repo oficial publico;
- fork publico;
- repo privado;
- rate limit de GitHub API;
- usuario sin `gh` instalado;
- token disponible en entorno;
- errores de red;
- reportes que no deben filtrar secretos.

Si `init` exige `gh auth login`, el onboarding se vuelve mas pesado. Si no permite token nunca, los repos privados o rate limits quedan sin salida. Si guarda tokens en reportes, rompe GQ-063.

## Opciones

### Opcion A - Solo acceso publico sin token

`init` descarga assets publicos desde GitHub Releases usando APIs HTTPS nativas de Node.

Ventajas:

- UX mas simple;
- no requiere `gh`;
- no requiere login;
- no maneja secretos;
- encaja bien con `npx gridwork init`.

Desventajas:

- no soporta repos privados;
- puede fallar por rate limits;
- menos flexible para forks privados;
- si el release oficial no es publico, `init` queda roto.

### Opcion B - Requerir GitHub CLI autenticado

`init` usa:

```bash
gh release download
```

Ventajas:

- aprovecha auth ya configurada;
- funciona bien con repos privados;
- maneja GitHub API desde `gh`;
- menos codigo de descarga propio.

Desventajas:

- contradice la idea de CLI npm autonoma;
- agrega dependencia externa operacional;
- el usuario debe instalar/configurar `gh`;
- peor experiencia para instalar una fabrica publica.

### Opcion C - Publico por defecto + token opcional

Default:

```bash
npx gridwork init
```

usa HTTPS/GitHub API sin credenciales.

Si el usuario necesita repo privado o mas rate limit, puede usar token via entorno:

```text
GITHUB_TOKEN
GH_TOKEN
```

Reglas:

- `init` no requiere `gh`;
- token es opcional;
- token se usa solo en memoria;
- token nunca se escribe en lockfile;
- token nunca se escribe en reportes;
- reportes redactan headers/URLs sensibles;
- repo oficial recomendado para v1 debe ser publico.

Ventajas:

- mantiene UX simple;
- soporta casos privados o rate limits;
- evita dependencia obligatoria en `gh`;
- conserva seguridad de secretos;
- permite forks privados con `--source owner/repo --factory-version`.

Desventajas:

- CLI debe implementar descarga y headers;
- hay que redactar cuidadosamente reportes;
- hay que documentar errores de auth/rate limit;
- tokens en env pueden confundirse con source override, aunque no lo son.

## Respuesta recomendada

Usar Opcion C:

```text
init_github_access_model_v1 = public_default_optional_token
```

Gridwork v1 debe asumir que el source oficial es publico. `npx gridwork init` no debe requerir `gh`, login ni token para instalar desde el repo oficial.

Para repos privados, forks privados o rate limits, permitir token opcional:

```text
GITHUB_TOKEN
GH_TOKEN
```

Ese token no cambia el source oficial. Solo autoriza requests hacia GitHub.

## Reglas de acceso

Default:

```text
auth_mode = unauthenticated
source = DEFAULT_FACTORY_SOURCE
```

Con token:

```text
auth_mode = token_env
source = DEFAULT_FACTORY_SOURCE o --source owner/repo
```

No permitir en v1:

```text
--token <value>
guardar token en config global
guardar token en `.gridwork-lock.json`
guardar token en `.factory/init/`
usar `gh` como requisito de init
```

## Repos publicos y privados

Repo oficial recomendado:

```text
public = true
```

Porque el uso esperado es:

```bash
npx gridwork init
```

Repos privados:

```bash
GITHUB_TOKEN=<token> npx gridwork init --source owner/private-repo --factory-version 1.0.0
```

Esto queda permitido para casos avanzados, siempre con version exacta y verificaciones normales de bundle.

## Rate limits

Si GitHub responde rate limit, `init` debe:

- no instalar;
- no modificar `.gridwork/`;
- no actualizar `.gridwork-lock.json`;
- escribir reporte local;
- explicar si encontro rate limit;
- sugerir reintentar con token;
- sugerir version explicita si la resolucion de latest fallo.

## Redaccion de secretos

Reportes pueden registrar:

```text
auth_mode = token_env
token_source = GITHUB_TOKEN
```

No pueden registrar:

```text
token value
Authorization header
URLs con credenciales
headers completos
```

Si se escribe un error HTTP, debe sanitizarse.

## Lockfile

`.gridwork-lock.json` puede registrar:

```json
{
  "factory": {
    "sourceType": "github-release",
    "source": "owner/repo",
    "version": "1.0.0"
  },
  "resolution": {
    "authMode": "unauthenticated"
  }
}
```

Pero no debe registrar:

```text
GITHUB_TOKEN
GH_TOKEN
Authorization
```

## Propuesta inicial

```text
init_github_access_model_v1 = public_default_optional_token
init_requires_github_cli = false
init_requires_github_login = false
init_official_source_should_be_public_v1 = true
init_uses_node_https_or_fetch = true
init_optional_token_env_github_token = true
init_optional_token_env_gh_token = true
init_token_flag_v1 = false
init_private_source_allowed_with_token = true
init_private_source_requires_factory_version = true
init_token_stored_in_lockfile = false
init_token_stored_in_reports = false
init_reports_auth_mode_without_secret = true
init_redacts_authorization_headers = true
init_rate_limit_writes_report = true
init_rate_limit_does_not_modify_gridwork = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `npx gridwork init` funcione sin `gh` ni token cuando el repo es publico,
pero permita `GITHUB_TOKEN`/`GH_TOKEN` opcional para repos privados o rate limits?
```

Mi recomendacion: publico por defecto + token opcional. No requerir `gh` para `init`; `gh` sigue siendo herramienta de skills/agentes, no requisito del bootstrapper.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `npx gridwork init` debe funcionar sin `gh`, login ni token cuando el repo es publico;
- el source oficial de v1 debe ser publico;
- `init` debe usar HTTP/fetch nativo de Node para consultar y descargar GitHub Releases;
- `GITHUB_TOKEN` y `GH_TOKEN` pueden usarse opcionalmente para repos privados o rate limits;
- no existe flag `--token` en v1;
- los tokens se usan solo en memoria;
- tokens, headers `Authorization` y valores sensibles no se guardan en lockfile ni reportes;
- errores de rate limit deben escribir reporte y no modificar `.gridwork/` ni `.gridwork-lock.json`;
- `gh` queda como herramienta gobernada de skills/agentes, no como requisito del bootstrapper.

## Decision registrada

```text
init_github_access_model_v1 = public_default_optional_token
init_requires_github_cli = false
init_requires_github_login = false
init_official_source_should_be_public_v1 = true
init_uses_node_https_or_fetch = true
init_optional_token_env_github_token = true
init_optional_token_env_gh_token = true
init_token_flag_v1 = false
init_private_source_allowed_with_token = true
init_private_source_requires_factory_version = true
init_token_stored_in_lockfile = false
init_token_stored_in_reports = false
init_reports_auth_mode_without_secret = true
init_redacts_authorization_headers = true
init_rate_limit_writes_report = true
init_rate_limit_does_not_modify_gridwork = true
```

## Regla

```text
`init` no requiere `gh`.
`init` no requiere login ni token para repos publicos.
`GITHUB_TOKEN`/`GH_TOKEN` son opcionales para repos privados o rate limits.
Tokens se usan solo en memoria.
No hay `--token` en v1.
Reportes registran auth mode, no valores secretos.
Rate limit o auth failure no aplica archivos ni actualiza lockfile.
```

## Supuestos

- El repo oficial de Gridwork sera publico o se hara publico para publicar releases de fabrica.
- GitHub Releases sera el source remoto inicial.
- Node moderno trae APIs suficientes para HTTP/fetch.
- El usuario quiere evitar dependencias externas obligatorias para `init`.
- GQ-063 prohibe guardar secretos reales en reportes o lockfile.

## Riesgos

- Si el source oficial queda privado, la UX simple de `npx gridwork init` falla.
- Rate limits pueden bloquear instalaciones sin token.
- Manejar tokens en entorno exige redaccion estricta.
- Requerir `gh` haria mas pesado el onboarding.

## Artefactos a crear o actualizar

- `packages/cli/src/init/github-client.ts`
- `packages/cli/src/init/download-bundle.ts`
- `packages/cli/src/init/source-resolution-report.ts`
- `packages/cli/src/init/redact.ts`
- `packages/cli/tests/github-client.test.ts`
- `.gridwork/templates/source-resolution-report.md`
- `.gridwork/templates/init-report.md`
- `docs/CLI_INIT_BEHAVIOR.md`
- `docs/SECURITY.md`

## Evidencia y notas

- Esta pregunta separa el uso de `gh` por agentes del uso de `init` como bootstrapper npm.
- Complementa GQ-012: `gh` existe para workflows/skills, no necesariamente para instalar Gridwork.
- Complementa GQ-063: tokens nunca se guardan en reportes ni lockfile.
- Complementa GQ-069: `--source owner/repo --factory-version` sigue siendo el override avanzado.
- Decision del usuario: aceptar acceso publico por defecto con token opcional por entorno y sin dependencia de `gh` para `init`.
