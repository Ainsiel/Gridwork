# Gridwork

Gridwork is a personal software factory designed around an installable `.gridwork/` factory, local `.factory/` runtime artifacts, declarative agents, skills, workflows, policies, and a TypeScript CLI.

## Current Status

```text
phase = phase-0
status = source_repo_scaffold
github_publish = false
```

This repository is being built from the grill-me decisions in `.docs/grill-me_factory/`.

## Repository Layout

```text
packages/
  cli/
factory/
  .gridwork/
docs/
.docs/
  grill-me_factory/
```

## Commands

```bash
npm run build
npm test
npm run pack:cli:dry-run
```

## Scope

Phase 0 creates the source monorepo, CLI package scaffold, and CI base. It does not implement `gridwork init`, publish npm packages, publish GitHub issues, or generate product code.
