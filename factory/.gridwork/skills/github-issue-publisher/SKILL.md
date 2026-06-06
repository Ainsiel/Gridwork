# GitHub Issue Publisher Skill

## Purpose

Create GitHub issues from approved local drafts.

## Rules

- Use small batches.
- Require one approval gate per publish plan.
- Use labels only from `github-labels.json`.
- Require a passing label audit before publishing.
- Prepare exact `gh issue create` commands before running them.
- Record local publish report.

## Forbidden

- Do not create issues from unreviewed drafts.
- Do not invent labels.
- Do not create missing labels implicitly; use `github-label-manager` with a separate approval.
- Do not delegate AFK work automatically after publishing.
