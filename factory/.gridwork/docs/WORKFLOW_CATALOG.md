# Workflow Catalog

| Workflow | Mode | Primary Agent |
|---|---|---|
| intake-existing-code | interactive | intake-agent |
| ideation-from-zero | interactive | intake-agent |
| architecture-ddd | interactive | software-architect |
| backlog-management | interactive | backlog-manager-agent |
| tdd-implementation | afk | implementer-agent |
| verification-pr | hybrid | verifier-agent |

There is no agent workflow named `cicd-release` in v1. CI/CD is handled as GitHub Actions YAML with the `github-actions-cicd` skill.

`tdd-implementation` uses the reusable `tdd` skill. Git actions after implementation or verification use `git-branch-management` and remain behind separate approval gates.

`backlog-management` consolidates local drafts and governed GitHub issue reads, answers backlog questions and prepares an approved task handoff to `tdd-implementation`.

`architecture-ddd` starts with an adaptive grill-me. DDD strategic design is central; Clean Architecture, patterns, APIs, data models, stack guidance and C4/ERD/UML HTML diagrams are optional capabilities selected only when needed.
