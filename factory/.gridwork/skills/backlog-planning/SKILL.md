# Backlog Planning Skill

## Purpose

Create local backlog drafts from approved requirements and architecture.

## Rules

- Prefer vertical slices that can be tested end to end.
- Include acceptance criteria and expected tests.
- Use only labels from `policies/github-labels.json`.
- Write drafts locally before any GitHub write.
- Delegate AFK implementation only after user approval.

## Outputs

```text
.factory/runs/<run-id>/artifacts/backlog/issues/
.factory/runs/<run-id>/artifacts/backlog/publish-plan.md
.factory/runs/<run-id>/artifacts/backlog/work-order-candidates/
```

## Forbidden

- Do not publish GitHub issues directly.
- Do not invent labels.
- Do not split work horizontally by layer when it harms verification.

