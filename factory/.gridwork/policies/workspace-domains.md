# Workspace Domains Policy

## Domains

```text
gridwork_factory = .gridwork/**
factory_runtime = .factory/**
docs_sdd = docs/sdd/**
docs_architecture = docs/architecture/**
docs_adr = docs/adr/**
docs_backlog = docs/backlog/**
github_workflows = .github/workflows/**
product_code = project-specific paths confirmed by user or detected by stack pack hints
secrets = .env, .env.*, **/*secret*, **/*token*
```

## Access Classes

```text
read = inspect only
write = create or edit
delete = remove files
remote_write = external side effect
```

## Rules

- `.factory/` is runtime local and should remain ignored by Git.
- `.gridwork/` is versioned factory definition.
- Product paths must be detected or confirmed before AFK work.
- Stack pack path hints are not permissions.
- Delete operations require a human gate.
- Secret-bearing files are blocked unless the user provides sanitized examples.

