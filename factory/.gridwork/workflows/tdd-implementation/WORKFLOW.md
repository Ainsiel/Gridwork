# TDD Implementation Workflow

## Purpose

Implement an approved work order with TDD and leave evidence for verification.

## When To Use

Use this workflow only when an issue or approved work order is ready for AFK delegation.

## When Not To Use

Do not use this workflow for ambiguous requests, architecture design, PR review, issue publishing or deployment.

## Participating Agents

```text
primary_agent = implementer-agent
supporting_agents = orchestrator
mode = afk
```

## Allowed Skills

```text
github-issue-discovery
diagnose-bug
handoff
```

## Preconditions

- A work order exists and is approved.
- Acceptance criteria are clear.
- Path scopes are known.
- Test commands are allowlisted.
- Branch policy is clear.

## Phases

1. Read the work order and confirm scope.
2. Define the red phase before editing product code.
3. Add or update behavior tests through public interfaces when feasible.
4. Run the narrow allowlisted test and record the failing result.
5. Implement the smallest green change.
6. Run allowlisted tests and record the passing result.
7. Refactor without changing behavior.
8. Run final verification commands from the allowlist.
9. Write TDD evidence and handoff to verifier when needed.

## TDD Rule

```text
no_clear_red_phase = block
missing_red_or_green_evidence = needs_more_evidence
```

For fullstack vertical slices, prefer a tracer bullet that crosses the visible user path, API/application boundary, domain behavior and persistence boundary when reasonable.

## Human Gates

Stop before dependency changes, scope changes, unknown commands, destructive operations, branch push, PR creation, deploy or secret access.

## Artifacts

```text
.factory/runs/<run-id>/artifacts/tdd/tdd-evidence.md
.factory/runs/<run-id>/artifacts/tdd/command-summary.md
.factory/runs/<run-id>/handoffs/implementer-to-verifier.md
```

## Completion Criteria

The workflow can close when implementation, evidence and final checks are ready for `verification-pr`.

