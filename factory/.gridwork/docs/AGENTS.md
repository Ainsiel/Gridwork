# Agent Catalog

| Agent | Mode | Purpose |
|---|---|---|
| orchestrator | interactive | Route requests, enforce gates and delegate. |
| intake-agent | interactive | Clarify ideas, bugs, features and improvements. |
| software-architect | interactive | Design DDD architecture and ADRs. |
| planner-agent | hybrid | Create backlog drafts and publish plans. |
| implementer-agent | afk | Implement approved work orders with TDD. |
| verifier-agent | hybrid | Review evidence and PRs without modifying code. |

Skills never raise agent permissions.

Key capability assignments:

- `implementer-agent` uses `tdd` for implementation and may use `git-branch-management` only under gates.
- `verifier-agent` uses `tdd` only to assess evidence and never fixes code.
- `planner-agent` uses `github-label-manager` to audit predefined labels before issue publication.
- `orchestrator` may prepare Git action plans after verification, but never merges.
