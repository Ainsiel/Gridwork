# Next.js + Spring Boot + PostgreSQL Stack Pack

## Purpose

Provide guidance for agents working in projects that use:

```text
frontend = Next.js
backend = Spring Boot
database = PostgreSQL
local_environment = Docker Compose recommended, not generated
architecture_style = DDD + vertical slices
```

## Rules

- This stack pack does not generate product code.
- This stack pack does not create frontend, backend, database or Docker files.
- Path hints are hints, not permissions.
- Stack skills are guidance only and do not elevate permissions.
- The orchestrator must detect or ask for real project paths before AFK work.

## Vertical Slice Preference

When feasible, issues should include UI, API/application behavior, domain behavior, persistence changes and tests in one independently verifiable slice.

