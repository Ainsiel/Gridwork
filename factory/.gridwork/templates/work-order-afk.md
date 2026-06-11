---
work_order_id: <YYYYMMDD-HHMM-slug>
run_id: <run-id>
workflow: tdd-implementation
agent: implementer-agent
status: draft
source_issue: <github-url-or-local-draft>
approved_by_user: false
---

# AFK Work Order

## Goal

<goal>

## Scope

<allowed files and behavior>

## Path Scopes

- <confirmed path>

## Acceptance Criteria

- [ ] <criterion>

## Allowed Commands

- `<confirmed command>`

## TDD Plan

### Red

<first failing test>

### Green

<minimal implementation>

### Refactor

<cleanup constraints>

## Gates

- dependency_change
- scope_change
- unknown_command
- github_write
- secret_value_needed

## Definition Of Done

- [ ] Acceptance criteria are satisfied.
- [ ] RED and GREEN evidence is recorded.
- [ ] Allowlisted final checks pass.
- [ ] Implementation summary and verifier handoff are ready.
