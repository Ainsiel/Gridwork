# GQ-118 - Verificar publish manual y configurar trusted publishing

- Estado: pending
- Fuente: GQ-117
- Pregunta origen: GQ-118
- Fecha de apertura: 2026-06-05
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `gridwork@0.1.0` en npm, trusted publisher, flujo futuro `cli-v*`

## Pregunta

Despues de que el humano ejecute el primer publish manual de `gridwork@0.1.0`, quieres verificar el paquete publicado, probar `npx`, y configurar trusted publishing para futuras releases?

La duda concreta:

```text
Quieres que, una vez confirmes que hiciste el publish manual,
verifiquemos npm, probemos instalacion real via npx
y dejemos trusted publishing listo para tags futuros?
```

## Por que importa

El primer publish manual reclama el nombre `gridwork`, pero no completa el modelo de release de largo plazo. Despues del publish hay que validar:

- `gridwork@0.1.0` existe en npm;
- `latest` apunta a `0.1.0`;
- `npx gridwork@0.1.0 init --factory-version 0.1.0` instala la fabrica real;
- trusted publishing queda configurado para `Ainsiel/Gridwork` + `publish-cli.yml`;
- futuros tags `cli-v*` podran publicar via GitHub Actions.

## Opciones

### Opcion A - Verificar npm y configurar trusted publishing

Ejecutar verificaciones de lectura y smoke test, y guiar la configuracion de trusted publishing:

- `npm view gridwork@0.1.0 version`;
- `npm view gridwork dist-tags --json`;
- smoke test con `npx gridwork@0.1.0 init --factory-version 0.1.0`;
- configurar trusted publisher en npmjs.com;
- opcionalmente verificar settings desde npm UI;
- no crear `cli-v0.1.0` todavia.

Ventajas:

- confirma que el primer publish funciona de verdad;
- evita avanzar a tags automatizados sin trusted publisher;
- deja preparada la estrategia futura.

Desventajas:

- requiere que el humano haya completado el publish manual y la configuracion npm.

### Opcion B - Crear `cli-v0.1.0` despues del publish manual

Crear y pushear el tag CLI una vez que `gridwork@0.1.0` existe.

Ventajas:

- prueba el workflow real.

Desventajas:

- `0.1.0` ya estaria publicado, asi que el workflow fallaria por version existente;
- no es util para esta misma version.

### Opcion C - Pausar

No verificar todavia.

Ventajas:

- evita nuevos pasos.

Desventajas:

- no queda confirmado que `npx gridwork` funciona.

## Respuesta recomendada

Usar Opcion A:

```text
next_step = verify_manual_publish_then_configure_trusted_publisher
create_cli_tag_now = false
push_cli_tag_now = false
npm_publish_by_agent = false
```

Mi recomendacion es que, despues del publish manual, verifiquemos `gridwork@0.1.0`, probemos `npx` en un directorio temporal y configuremos trusted publishing para releases futuras. Para `0.1.0`, no conviene pushear `cli-v0.1.0` despues del publish manual porque la version ya existira.

## Pregunta para decidir

La duda clave:

```text
Cuando completes el publish manual, quieres que verifiquemos npm/npx y trusted publishing?
```

Mi recomendacion: verificar publish manual y configurar trusted publishing antes de cualquier tag CLI futuro.

## Decision registrada

Pendiente.
