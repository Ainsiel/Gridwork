# Tool Allowlist Policy

## Rule

Agents may execute only commands explicitly allowed by the active work order, workflow and confirmed stack guidance.

## Before Execution

- Match the exact command intent to an allowlisted entry.
- Prefer the narrowest relevant test or quality command.
- Record the command purpose before execution.
- Stop when the command is unknown, destructive, requires secrets or expands scope.

## Forbidden

- Free-form shell exploration by AFK agents.
- Installing dependencies without approval.
- Deploy, secret-management or destructive commands.
- Treating a stack hint as an executable permission.
