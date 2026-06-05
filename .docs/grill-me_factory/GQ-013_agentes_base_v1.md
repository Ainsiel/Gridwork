# GQ-013 - Agentes base de v1

- Estado: accepted
- Fuente: modelo de agente aceptado en GQ-005 y workflows aceptados en GQ-011
- Pregunta origen: GQ-013
- Fecha de apertura: 2026-06-02
- Owner de decision: usuario + arquitecto de software
- Artefacto afectado: `.gridwork/agents/`

## Pregunta

Que agentes base debe traer Gridwork v1 y que responsabilidad exacta tiene cada uno?

## Por que importa

Los workflows y skills ya estan tomando forma, pero la fabrica necesita un roster de agentes con responsabilidades cerradas. Si hay demasiados agentes, el sistema se vuelve pesado. Si hay muy pocos, el orquestador termina haciendo todo o un agente queda con responsabilidades mezcladas.

## Respuesta recomendada

Usar pocos agentes base:

| Agente | Rol | Modo tipico |
|---|---|---|
| `orchestrator` | Coordina workflows, valida permisos, registra estado, gates y trazabilidad. | todos |
| `intake-agent` | Hace grill-me de requerimientos sobre ideas nuevas o codigo existente. | hitl |
| `software-architect` | Hace grill-me de arquitectura DDD, APIs, base de datos, ADRs y diseno del sistema. | hitl |
| `planner-agent` | Convierte SDD/arquitectura en backlog, issues y vertical slices usando skills. | assisted |
| `implementer-agent` | Implementa issues AFK con TDD dentro de permisos. | afk |
| `verifier-agent` | Revisa PR/codigo, evidencia, tests, scope y cumplimiento de issue. | assisted |

Skills como `sdd-requirements`, `backlog-planning`, `diagnose-bug`, `handoff` y `github-actions-cicd` pueden ser usadas por estos agentes segun workflow y permisos.

## Respuesta del usuario

El usuario acepta el roster inicial de agentes:

- `orchestrator`
- `intake-agent`
- `software-architect`
- `planner-agent`
- `implementer-agent`
- `verifier-agent`

## Decision registrada

Decision aceptada:

```text
agents_v1 = orchestrator,intake-agent,software-architect,planner-agent,implementer-agent,verifier-agent
```

Regla:

```text
Los agentes son roles declarativos.
Los adapters ejecutan esos roles.
Los permisos se definen por agente, workflow y skill.
Cada agente vive como carpeta con manifest, contrato y prompt de activacion opcional.
```

## Supuestos

- `orchestrator` no implementa codigo.
- `implementer-agent` no crea issues ni hace merge.
- `verifier-agent` no corrige codigo directamente en v1, salvo que se decida lo contrario.
- `software-architect` produce diseno y ADRs, no implementacion.

## Riesgos

- Si `planner-agent` publica issues sin revision, puede crear trabajo mal segmentado.
- Si `verifier-agent` puede modificar codigo, se mezcla revision con implementacion.
- Si `orchestrator` tiene demasiada logica de dominio, se vuelve dificil de testear.

## Preguntas abiertas

- El `planner-agent` puede publicar issues con `gh` o solo preparar drafts?
- El `verifier-agent` puede comentar PRs con `gh pr comment`?
- El `software-architect` tambien crea ADRs o usa una skill dedicada?
- Necesitamos un agente separado de seguridad/ops en v1 o basta con skills/policies?
- El `intake-agent` sirve para idea desde cero y codigo existente, o se separa en dos agentes?

## Artefactos a crear o actualizar

- `.gridwork/agents/orchestrator/agent.json`
- `.gridwork/agents/orchestrator/AGENT.md`
- `.gridwork/agents/orchestrator/PROMPT.md`
- `.gridwork/agents/intake-agent/agent.json`
- `.gridwork/agents/intake-agent/AGENT.md`
- `.gridwork/agents/software-architect/agent.json`
- `.gridwork/agents/software-architect/AGENT.md`
- `.gridwork/agents/planner-agent/agent.json`
- `.gridwork/agents/planner-agent/AGENT.md`
- `.gridwork/agents/implementer-agent/agent.json`
- `.gridwork/agents/implementer-agent/AGENT.md`
- `.gridwork/agents/verifier-agent/agent.json`
- `.gridwork/agents/verifier-agent/AGENT.md`
- `docs/AGENTS.md`

## Evidencia y notas

- Se inspira en la fabrica destilada, pero ajustado al flujo personal de Gridwork.
- Mantiene la separacion entre roles, skills y adapters.
