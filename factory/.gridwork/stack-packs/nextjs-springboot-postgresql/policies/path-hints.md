# Path Hints

These are candidates, not rules.

```text
frontend = apps/web, frontend, web, client
backend = apps/api, backend, api, server
db = db, infra/db, migrations
compose = docker-compose.yml, compose.yml, infra/docker-compose.yml
```

The orchestrator must detect or ask before using a path as scope.

