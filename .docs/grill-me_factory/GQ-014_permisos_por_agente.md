# GQ-014 - Permisos por agente

- Estado: accepted
- Fuente: agentes aceptados en GQ-013
- Pregunta origen: GQ-014
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/policies/permissions.md`

## Pregunta

Que permisos debe tener cada agente base de Gridwork v1?

## Por que importa

Los agentes podran usar skills, workflows y herramientas como `gh`. Si los permisos quedan vagos, cualquier agente podria terminar haciendo acciones peligrosas: modificar codigo fuera de alcance, crear issues, comentar PRs, correr comandos no permitidos o intentar deploy.

## Respuesta recomendada

Usar permisos minimos por rol.

| Permiso | orchestrator | intake | architect | planner | implementer | verifier |
|---|---:|---:|---:|---:|---:|---:|
| Leer repo | si | si | si | si | si | si |
| Escribir `.factory/` logs/runs | si | via orchestrator | via orchestrator | via orchestrator | via orchestrator | via orchestrator |
| Escribir docs de intake/SDD | si | si | no | no | no | no |
| Escribir docs arquitectura/ADR | si | no | si | no | no | no |
| Escribir backlog/issues draft | si | no | no | si | no | no |
| Publicar issues con `gh` | gate | no | no | dry-run/gate | no | no |
| Escribir codigo | no | no | no | no | si | no |
| Modificar dependencias | gate | no | no | no | gate | no |
| Ejecutar tests | si | no | no | no | si | si |
| Revisar PR/codigo | si | no | no | no | no | si |
| Comentar PR con `gh` | gate | no | no | no | no | dry-run/gate |
| Merge/push/deploy | no/gate fuerte | no | no | no | no | no |
| Leer secretos | no | no | no | no | no | no |

## Reglas recomendadas

- Ningun agente lee secretos en v1.
- Ningun agente hace deploy en v1.
- `implementer-agent` puede escribir codigo, pero solo dentro de una issue/work order.
- `verifier-agent` revisa y reporta; no corrige codigo por defecto.
- `planner-agent` puede preparar issues; publicar con `gh` requiere dry-run y aprobacion.
- `orchestrator` puede coordinar y registrar, pero no implementa codigo directamente.

## Respuesta del usuario

El usuario acepta la matriz de permisos minimos y agrega un requisito importante:

- Cada agente debe tener permitido interactuar solo con ciertas carpetas o dominios del workspace.
- Se necesita una nomenclatura para definir que carpetas puede crear, modificar, leer o eliminar cada agente.
- Los permisos no deben ser solo capacidades abstractas como `writeFiles`; tambien deben estar acotados por rutas.

## Decision registrada

Decision aceptada:

```text
agent_permissions_model = capability_permissions_plus_workspace_scopes
agent_secret_access_v1 = false
agent_deploy_access_v1 = false
skills_cannot_escalate_permissions = true
stack_packs_cannot_escalate_permissions = true
```

Regla:

```text
Un agente necesita permiso de capacidad y permiso de ruta.
Si falta cualquiera de los dos, la accion queda bloqueada.
```

## Supuestos

- El orquestador valida permisos antes de ejecutar cada step.
- Las skills no elevan permisos.
- Los stack packs no elevan permisos.
- `gh` siempre pasa por policy.

## Riesgos

- Si el implementer puede modificar dependencias libremente, puede romper el stack.
- Si el verifier puede modificar codigo, se mezcla revision con implementacion.
- Si planner puede publicar issues sin gate, puede crear ruido en GitHub.
- Si orchestrator puede hacer todo, se convierte en agente privilegiado peligroso.

## Preguntas abiertas

- `planner-agent` puede publicar issues o solo drafts?
- `verifier-agent` puede comentar PRs con aprobacion?
- `implementer-agent` puede crear ramas?
- Quien puede ejecutar `docker compose up`?
- Debe existir permiso separado para modificar `.gridwork/`?
- Como se llamaran estos dominios de carpetas: `workspace domains`, `resource scopes`, `path scopes` u otra nomenclatura?
- Que carpetas son read-only, writeable, append-only o blocked para cada agente?

## Artefactos a crear o actualizar

- `.gridwork/policies/permissions.md`
- `.gridwork/policies/github-cli-policy.md`
- `.gridwork/schemas/agent.schema.json`
- `.gridwork/schemas/workflow.schema.json`
- `docs/AGENT_PERMISSIONS.md`

## Evidencia y notas

- Derivado de la separacion de agentes aceptada en GQ-013.
- Compatible con el modelo de skills de GQ-007 y adapters de GQ-006.
- Se abre GQ-015 para definir la nomenclatura y matriz de dominios/rutas por agente.
