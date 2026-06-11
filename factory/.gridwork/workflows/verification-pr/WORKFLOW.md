# Verification PR Workflow

## Purpose

Review implementation or PR evidence before the user decides whether to push, open PR, merge or return work to the implementer.

## When To Use

Use this workflow after `tdd-implementation`, or when the user asks for review of a PR or implementation.

## When Not To Use

Do not use this workflow to fix code directly, publish issues, merge, deploy or replace CI.

## Participating Agents

```text
primary_agent = verifier-agent
supporting_agents = orchestrator,implementer-agent
mode = assisted
```

## Allowed Skills

```text
github-cli
github-issue-discovery
diagnose-bug
tdd
integration-test-design
integration-testing
git-branch-management
conditional stack-pack skills
handoff
```

## Phases

1. Read work order, acceptance criteria and implementation summary.
2. Use `tdd` in assessment mode to review red, green and refactor evidence.
3. Inspect changed files and path scopes.
4. Run allowlisted checks when allowed.
5. Produce a local verifier report.
6. Prepare a short GitHub comment draft only if requested.
7. Decide `pass`, `changes_requested` or `needs_more_evidence`.
8. After `pass`, optionally prepare a gated Git action plan without executing remote actions.

Use relevant stack skills in review mode. A performance improvement cannot pass without comparable before/after evidence; infrastructure changes cannot pass without configuration and lifecycle validation.

## Human Gates

Stop before `gh pr comment`, merge, deploy, branch push or code modification.

Creating a local commit, pushing a branch and creating a PR require separate approvals. Merge remains manual.

## Artifacts

```text
.factory/runs/<run-id>/artifacts/verification/verifier-report.md
.factory/runs/<run-id>/artifacts/verification/github-pr-comment.md
.factory/runs/<run-id>/artifacts/git/git-action-plan.md
```

## Completion Criteria

The workflow can close when the user has a clear verification decision and any feedback to `implementer-agent` is documented.
