# GQ-035 - Comandos de test permitidos para `implementer-agent`

- Estado: accepted
- Fuente: decision GQ-034 sobre evidencia TDD y necesidad de capturar red/green
- Pregunta origen: GQ-035
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/tool-allowlist.md`, `.gridwork/stack-packs/nextjs-springboot-postgresql/`

## Pregunta

Que comandos de test puede ejecutar el `implementer-agent` durante `tdd-implementation` para producir evidencia red/green sin abrir una shell libre?

## Por que importa

El implementer-agent necesita ejecutar tests para demostrar TDD. Pero si puede ejecutar cualquier comando, se rompe la gobernanza de permisos.

Como v1 trae un stack pack predefinido de Next.js + Spring Boot + PostgreSQL, conviene instalar una allowlist inicial de comandos de test por stack, editable manualmente despues de `init`.

## Respuesta recomendada

Definir una allowlist versionada:

```text
.gridwork/policies/tool-allowlist.md
.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
```

Ejemplos de comandos permitidos, sujetos a validacion del repo:

```text
npm test
npm run test
npm run test:unit
npm run test:e2e
npm run lint
./mvnw test
mvn test
./gradlew test
gradle test
docker compose ps
docker compose up -d postgres
docker compose down
```

## Reglas recomendadas

- El agente solo puede ejecutar comandos permitidos por allowlist.
- Comandos que modifican dependencias requieren gate.
- Comandos de deploy estan prohibidos en v1.
- Comandos destructivos estan prohibidos o requieren gate fuerte.
- Si no existe comando de test claro, el agente registra bloqueo o `needs_more_evidence`.
- La salida de test se guarda en `.factory/runs/<run-id>/artifacts/tdd/test-results.md`.

## Propuesta inicial

```text
test_command_allowlist_required = true
test_command_allowlist_path = .gridwork/policies/tool-allowlist.md
stack_test_commands_path = .gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
implementer_can_run_allowlisted_tests = true
implementer_can_run_arbitrary_shell = false
dependency_install_requires_gate = true
deploy_commands_forbidden_v1 = true
test_output_saved_to_factory = true
```

## Pregunta para decidir

La duda clave:

```text
Quieres que `init` instale una allowlist de comandos de test bastante conservadora,
o una allowlist mas amplia para evitar bloqueos en proyectos reales?
```

Mi recomendacion: conservadora al inicio, ampliable manualmente por proyecto.

## Respuesta del usuario

El usuario acepta la recomendacion:

- `init` debe instalar una allowlist conservadora de comandos de test.
- La allowlist puede ampliarse manualmente por proyecto.
- El `implementer-agent` no puede usar shell libre para producir evidencia TDD.

## Decision registrada

```text
test_command_allowlist_required = true
test_command_allowlist_profile_v1 = conservative
test_command_allowlist_path = .gridwork/policies/tool-allowlist.md
stack_test_commands_path = .gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json
implementer_can_run_allowlisted_tests = true
implementer_can_run_arbitrary_shell = false
dependency_install_requires_gate = true
deploy_commands_forbidden_v1 = true
test_output_saved_to_factory = true
allowlist_can_be_extended_manually_per_project = true
unknown_test_command_requires_gate_or_manual_allowlist_update = true
```

## Regla

```text
El implementer ejecuta solo comandos permitidos.
Si el comando de test necesario no esta en allowlist, no improvisa.
Debe registrar bloqueo, pedir ampliacion de allowlist o marcar `needs_more_evidence`.
```

## Supuestos

- El stack pack v1 es Next.js + Spring Boot + PostgreSQL.
- No se genera codigo de stack, solo policies/templates/skills.
- El implementer-agent trabaja con path scopes y work order.
- Ejecutar tests es necesario para TDD.

## Riesgos

- Una allowlist demasiado estrecha puede bloquear implementaciones reales.
- Una allowlist demasiado amplia puede abrir comandos peligrosos.
- Si los comandos dependen del proyecto, puede ser necesario ajuste manual.

## Artefactos a crear o actualizar

- `.gridwork/policies/tool-allowlist.md`
- `.gridwork/stack-packs/nextjs-springboot-postgresql/policies/test-commands.json`
- `.gridwork/workflows/tdd-implementation/WORKFLOW.md`
- `.gridwork/agents/implementer-agent/AGENT.md`
- `.factory/runs/<run-id>/artifacts/tdd/test-results.md`

## Evidencia y notas

- Esta pregunta conecta TDD con permisos concretos de herramientas.
- Decision del usuario: allowlist conservadora, ampliable manualmente.
