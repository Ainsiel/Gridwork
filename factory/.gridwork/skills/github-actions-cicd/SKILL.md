# GitHub Actions CI/CD Skill

## Purpose

Help draft GitHub Actions pipelines.

## Default Mode

```text
mode = draft-only
deploy = disabled
```

## Rules

- Draft YAML locally first.
- Write `.github/workflows/` only with approval.
- Do not trigger workflows.
- Do not configure deployment unless the user explicitly requests it.
- Do not read or write secrets.

