---
id: GW-MVP-041
title: Completar policies, permisos, path scopes y labels full-v1
phase: phase-6
status: ready
readiness: ready
implementation_status: completed
factory_profile: full-v1
issue_shape: enabling-slice
suggested_agent: implementer-agent
suggested_workflow: tdd-implementation
suggested_mode: assisted
labels:
  - gridwork
  - type:feature
  - slice:enabling
  - phase:6
  - area:policies
  - area:github
  - area:factory
  - status:needs-refinement
  - mode:assisted
  - workflow:tdd-implementation
  - agent:implementer
source_decisions:
  - GQ-012
  - GQ-014
  - GQ-015
  - GQ-022
  - GQ-031
  - GQ-035
  - GQ-046
  - GQ-063
  - GQ-105
acceptance_status: ready
github_issue: null
---

# GW-MVP-041 - Completar policies, permisos, path scopes y labels full-v1

## Objetivo

Completar el gobierno local de Gridwork full-v1: permisos, path scopes, GitHub CLI, labels, comandos permitidos, secrets y precedencia de policies.

## Contexto

Los agentes deben trabajar con reglas estrictas. Gridwork debe ser util sin depender de un dashboard complejo; por eso las reglas viven como archivos versionables dentro de `.gridwork/`.

## Alcance incluido

- Crear o ampliar policies de permisos por agente.
- Crear path scopes por dominios de trabajo.
- Crear policy de GitHub CLI con allowlist y niveles de riesgo.
- Crear `github-labels.json` con labels predefinidas.
- Crear policies de comandos de test y calidad.
- Crear policy de secretos y redaccion.
- Crear policy de human gates.
- Crear policy de precedencia y conflictos.
- Declarar que skills no elevan permisos.

## Fuera de alcance

- Crear labels reales en GitHub.
- Ejecutar `gh` con side effects sin aprobacion.
- Leer valores secretos reales.
- Agregar dashboard de seguridad.

## Criterios de aceptacion

- Las labels de backlog existen en el catalogo local.
- Los agentes no pueden inventar labels.
- GitHub CLI tiene allowlist por comando y riesgo.
- Writes externos requieren approval gate.
- La regla `deny by default` queda documentada.
- La regla mas restrictiva gana ante conflictos.
- Los path scopes separan lectura, escritura, eliminacion y zonas prohibidas.

## Pruebas esperadas

- Validacion JSON de `github-labels.json`.
- Validacion JSON de policies de comandos.
- Test documental de no inventar labels.
- Test de policy: skills no elevan permisos.
- Test de policy: side effects de `gh` requieren approval.

## Archivos probables

- `factory/.gridwork/policies/agent-permissions.md`
- `factory/.gridwork/policies/workspace-domains.md`
- `factory/.gridwork/policies/github-cli-policy.md`
- `factory/.gridwork/policies/github-labels.json`
- `factory/.gridwork/policies/human-gates.md`
- `factory/.gridwork/policies/policy-precedence.md`
- `factory/.gridwork/policies/security-secrets-redaction.md`

## Riesgos

- Crear policies contradictorias.
- Bloquear demasiado a agentes utiles.
- Permitir side effects remotos sin gate claro.

## Trazabilidad

- GQ-014 y GQ-015 definen permisos y path scopes.
- GQ-031 define labels predefinidas.
- GQ-046 define precedencia y conflictos.
