# GQ-078 - Confianza, checksums y firmas de releases

- Estado: accepted
- Fuente: decisiones GQ-063, GQ-068, GQ-071, GQ-073 y GQ-077
- Pregunta origen: GQ-078
- Fecha de apertura: 2026-06-04
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: GitHub Releases, `bundle-manifest.json`, `SHA256SUMS.txt`, `publish-cli.yml`, `publish-factory.yml`, npm provenance, `gridwork-release-publisher`

## Pregunta

Que nivel de seguridad de supply chain debe tener v1 para releases de la fabrica y publicacion npm de la CLI?

## Por que importa

GQ-068 definio:

```text
bundle zip + bundle-manifest.json + SHA256SUMS.txt
```

Eso verifica integridad:

```text
el archivo descargado coincide con el hash esperado
```

Pero no siempre prueba autenticidad fuerte:

```text
este release fue publicado por el maintainer correcto
```

Para una fabrica que se instala con:

```bash
npx gridwork init
```

conviene decidir si v1 usara solo checksums, si agregara provenance de npm/GitHub, o si tambien exigira firmas criptograficas externas.

## Opciones

### Opcion A - Checksums solamente

Publicar:

```text
gridwork-factory-v<version>.zip
bundle-manifest.json
SHA256SUMS.txt
```

Ventajas:

- simple;
- facil de implementar;
- sin herramientas extra;
- suficiente para detectar corrupcion o descargas incompletas;
- encaja con v1 minimalista.

Desventajas:

- si alguien compromete el release, puede cambiar zip y checksums juntos;
- no hay autenticidad criptografica independiente;
- menor defensa ante supply chain attacks.

### Opcion B - Checksums + provenance de plataformas

Usar checksums y aprovechar capacidades de GitHub/npm:

```text
npm provenance para CLI
GitHub Actions artifacts/release metadata para fabrica
tags protegidos o reglas de branch/tag
release notes con source commit
```

Ventajas:

- mejora trazabilidad sin herramientas raras;
- no complica demasiado v1;
- encaja con GitHub Actions y npm publish;
- reduce dependencia de secretos locales;
- mantiene releases auditables.

Desventajas:

- depende de GitHub/npm;
- no es lo mismo que una firma independiente del bundle;
- requiere configurar bien permisos y protected tags.

### Opcion C - Firmas criptograficas obligatorias

Publicar tambien:

```text
SHA256SUMS.sig
bundle-manifest.sig
```

o usar Sigstore/cosign/gpg.

Ventajas:

- autenticidad mas fuerte;
- mejor postura de seguridad;
- util si Gridwork se distribuye publicamente a muchos usuarios.

Desventajas:

- mas herramientas;
- mas configuracion;
- mas llaves o identidad que administrar;
- puede ser demasiado complejo para v1 personal;
- contradice la preferencia de no agregar dependencias externas innecesarias.

## Respuesta recomendada

Usar Opcion B en v1:

```text
checksums obligatorios + provenance/metadata de plataformas + tags protegidos
```

No exigir firmas criptograficas externas en v1.

Esto mantiene el sistema razonablemente seguro sin convertir Gridwork en un proyecto de supply chain complejo antes de tiempo.

## Reglas para fabrica

Cada release `factory-v<version>` debe tener:

- `gridwork-factory-v<version>.zip`;
- `bundle-manifest.json`;
- `SHA256SUMS.txt`;
- `gridwork-release-notes.md`;
- `source_commit` en manifest;
- `source_tag` en manifest;
- hash del zip;
- hash del manifest;
- release creado desde tag `factory-v<version>`;
- CI o release plan que valide bundle antes de publicar.

Recomendacion de governance:

- proteger tags `factory-v*`, si el repo lo permite;
- no sobrescribir releases publicados;
- no reutilizar tags;
- si hay error, publicar version nueva;
- registrar release plan en `.factory/` local o como artifact de CI.

## Reglas para CLI npm

Para `cli-v<version>`:

- publicar npm desde GitHub Actions;
- usar `npm publish --provenance` si esta disponible;
- no publicar desde maquina local por defecto;
- tag `cli-v<version>` debe coincidir con `packages/cli/package.json`;
- `npm pack --dry-run` debe pasar antes;
- no usar postinstall scripts;
- package no incluye `.factory/`, `.docs/` ni `factory/.gridwork/`.

## Verificacion de `init`

`init` v1 debe verificar:

- hash del zip contra `bundle-manifest.json`;
- hash del zip contra `SHA256SUMS.txt`;
- tag `factory-v<version>`;
- `source_commit`;
- `required_cli_version`;
- schema y contract versions;
- paths seguros.

`init` v1 no debe exigir:

- GPG;
- Sigstore;
- cosign;
- firma externa.
- GitHub CLI autenticado;
- token para repos publicos.

## Reportes

`gridwork-release-publisher` debe registrar en release plan:

- si checksums fueron generados;
- si source tag/source commit coinciden;
- si npm provenance fue usado para CLI;
- si tags protegidos estan configurados, cuando se pueda detectar;
- si firmas externas fueron omitidas por politica v1.

## Propuesta inicial

```text
supply_chain_v1_model = checksums_plus_platform_provenance
factory_release_requires_sha256sums = true
factory_release_requires_bundle_manifest = true
factory_release_requires_source_commit = true
factory_release_requires_source_tag = true
factory_release_external_signatures_required_v1 = false
factory_release_tag_reuse_allowed = false
factory_release_overwrite_allowed = false
factory_tags_protected_recommended = true
cli_publish_uses_github_actions = true
cli_publish_npm_provenance_recommended = true
cli_publish_local_manual_default = false
init_requires_external_signature_v1 = false
init_requires_github_cli_auth_v1 = false
init_verifies_checksums = true
init_verifies_manifest_metadata = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que v1 exija firmas criptograficas externas para los releases,
o que use checksums obligatorios mas provenance/metadata de GitHub y npm?
```

Mi recomendacion: checksums obligatorios + provenance/metadata de GitHub/npm en v1. Dejar firmas externas como mejora futura si Gridwork pasa de fabrica personal a distribucion publica mas amplia.

## Respuesta del usuario

El usuario acepta la recomendacion:

- v1 debe usar checksums obligatorios;
- v1 debe aprovechar provenance/metadata de GitHub y npm;
- la CLI npm debe publicarse desde GitHub Actions;
- npm provenance debe usarse si esta disponible;
- los releases de fabrica deben registrar source tag y source commit;
- tags `factory-v*` y `cli-v*` deben tratarse como no reutilizables;
- v1 no exige firmas criptograficas externas;
- firmas externas quedan como mejora futura si Gridwork deja de ser una fabrica personal.

## Decision registrada

```text
supply_chain_v1_model = checksums_plus_platform_provenance
factory_release_requires_sha256sums = true
factory_release_requires_bundle_manifest = true
factory_release_requires_source_commit = true
factory_release_requires_source_tag = true
factory_release_external_signatures_required_v1 = false
factory_release_tag_reuse_allowed = false
factory_release_overwrite_allowed = false
factory_tags_protected_recommended = true
cli_publish_uses_github_actions = true
cli_publish_npm_provenance_recommended = true
cli_publish_local_manual_default = false
init_requires_external_signature_v1 = false
init_requires_github_cli_auth_v1 = false
init_verifies_checksums = true
init_verifies_manifest_metadata = true
```

## Regla

```text
V1 verifica integridad con checksums.
V1 mejora trazabilidad con GitHub/npm provenance y metadata.
V1 no exige GPG, Sigstore, cosign ni firmas externas.
V1 no exige `gh` ni token para releases publicos.
Tags y releases publicados no se reutilizan ni sobrescriben.
Si hay error de release, se publica una nueva version.
```

## Supuestos

- Gridwork v1 es principalmente una fabrica personal.
- GitHub Releases y npm son las plataformas iniciales.
- El usuario prefiere no agregar herramientas externas innecesarias.
- La CLI ya verifica hashes y metadata antes de instalar.
- El riesgo principal de v1 es instalacion accidental o release mal construido, no un modelo adversarial extremo.

## Riesgos

- Checksums en el mismo release no protegen si el release completo fue comprometido.
- Provenance depende de configuracion correcta de GitHub/npm.
- Tags no protegidos pueden ser reescritos si no se gobiernan.
- Firmas externas agregan seguridad, pero tambien complejidad operativa.

## Artefactos a crear o actualizar

- `.gridwork/skills/gridwork-release-publisher/SKILL.md`
- `.gridwork/templates/gridwork-release-plan.md`
- `.gridwork/templates/cli-release-plan.md`
- `.github/workflows/publish-cli.yml`
- `.github/workflows/publish-factory.yml`
- `docs/RELEASE_PROCESS.md`
- `docs/CLI_INIT_BEHAVIOR.md`

## Evidencia y notas

- Esta pregunta diferencia integridad, autenticidad y trazabilidad.
- Complementa GQ-068: checksums siguen siendo obligatorios.
- Complementa GQ-071: npm publish debe aprovechar provenance cuando sea razonable.
- Complementa GQ-077: el lockfile registra source, tag, hashes y source commit.
- Decision del usuario: aceptar checksums obligatorios + provenance/metadata de plataformas, sin firmas externas en v1.
- Revision posterior GQ-083: `init` puede descargar releases publicos sin `gh` ni token; auth opcional no reemplaza la verificacion de checksums.
