# Git Policy

## Read Actions

Repository inspection may use non-destructive commands allowed by the active agent and workflow:

```text
git status --short --branch
git branch --show-current
git diff --stat
git diff --name-only
git log --oneline
```

## Write Gates

- Creating a local branch requires approval.
- Staging must name exact files and requires approval.
- A local commit requires approval.
- Push and PR creation require separate approvals.
- Merge is a manual human action in v1.

## Protection

- Preserve unrelated user changes.
- Never reset, checkout away, clean, force push, amend or rewrite history without a new explicit gate.
- Never push directly to `main` or `develop`.
- Release tags are governed only by `gridwork-release-publisher`.
