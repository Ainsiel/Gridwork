# Next.js + Spring Boot + PostgreSQL Stack Pack

## Purpose

Provide guidance for agents working in projects that use:

```text
frontend = Next.js
backend = Spring Boot
database = PostgreSQL
local_environment = Docker Compose recommended
architecture_style = DDD + vertical slices
```

## Rules

- `gridwork init` installs skill definitions only and does not generate product code.
- During an approved implementation work order, stack skills may create or modify confirmed scoped product files.
- Path hints are hints, not permissions.
- Stack skills do not elevate permissions.
- The orchestrator must detect or ask for real project paths before AFK work.
- Stack versions and existing project conventions must be detected before recommendations.

## Vertical Slice Preference

When feasible, issues should include UI, API/application behavior, domain behavior, persistence changes and tests in one independently verifiable slice.

## Skills

```text
Next.js = frontend guidance, UI design, performance
Spring Boot = backend guidance, performance
PostgreSQL = persistence guidance, performance
Docker = Dockerfile authoring, Compose local guidance, Compose optimization
```
