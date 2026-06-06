# Git Branch Management Skill

## Purpose

Prepare safe Git actions and execute only the specifically approved local action. Keep remote publication and merge under separate gates.

## Read-Only Discovery

Use only the active policy and summarize:

```text
git status --short --branch
git branch --show-current
git diff --stat
git diff --name-only
git log --oneline
```

Do not treat read access as permission to write.

## Procedure

1. Confirm the repository, active branch, approved scope and work order.
2. Check for unrelated user changes and preserve them.
3. Prepare `git-action-plan.md` before any write.
4. List exact files proposed for staging; never use broad staging without explicit approval.
5. Ask separately for branch creation, staging/commit, push and PR creation.
6. Execute only the approved action and record a concise result.
7. Leave merge as a manual human action in v1.

## Branch Rules

Preferred branch:

```text
feature/<issue-number>-<short-slug>
```

Without an issue:

```text
feature/<run-short-id>-<short-slug>
```

Do not push directly to `main` or `develop`. If required branch policy is unclear, stop.

## Gates

```text
create local branch = approval
stage exact files = approval
local commit = approval
push branch = separate approval
create PR = separate approval
merge = prohibited for agents in v1
```

## Forbidden

- Do not run destructive Git commands.
- Do not discard or rewrite user changes.
- Do not amend, rebase, force push or delete branches without a new explicit gate.
- Do not combine commit, push and PR approval.
- Do not create or push release tags; use `gridwork-release-publisher`.
