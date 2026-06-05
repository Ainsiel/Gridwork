# Architecture DDD Workflow

## Purpose

Design the system from an approved SDD using Domain Driven Design and produce architecture outputs ready for backlog planning.

## When To Use

Use this workflow after the SDD is ready and the user wants architecture, APIs, database guidance, ADRs and vertical slice planning.

## When Not To Use

Do not use this workflow to implement code, publish issues without approval or run CI/CD.

## Participating Agents

```text
primary_agent = software-architect
supporting_agents = orchestrator,planner-agent
```

## Allowed Skills

```text
html-architecture-diagrams
backlog-planning
github-actions-cicd
handoff
```

## Phases

1. Read the approved SDD and identify uncertain architectural drivers.
2. Run DDD grill-me: domains, bounded contexts, aggregates and ubiquitous language.
3. Run technical mapping: API boundaries, persistence, integration, security and operations.
4. Produce ADRs for important decisions.
5. Produce HTML diagrams when visual representation helps.
6. Use `backlog-planning` to prepare vertical-slice issue drafts after approval.

## Human Gates

Stop before writing CI files, publishing GitHub issues, deciding uncertain architecture or changing product code.

## Artifacts

Draft outputs live in `.factory/runs/<run-id>/artifacts/architecture/`.

Approved architecture may be written to:

```text
docs/architecture/
docs/adr/
```

HTML diagrams must be self-contained local files without CDN or build step.

## Completion Criteria

The workflow can close when architecture outputs are approved or when backlog drafts are ready for review.

