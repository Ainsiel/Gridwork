# Agent Permissions Policy

## Rule

```text
default = deny
skills_raise_permissions = false
most_restrictive_rule_wins = true
```

## Agent Profiles

### orchestrator-full-v1

Can read `.gridwork/`, policies, manifests and non-sensitive project context. Can write `.factory/` runtime artifacts. Cannot implement product code.

### intake-hitl

Can read non-sensitive project context and write local drafts. Cannot implement code or publish issues.

### architect-hitl

Can write architecture drafts and approved architecture docs. Can use stack skills for design guidance after technology detection. Cannot implement product code.

### planner-assisted

Can create local issue drafts and publish plans. GitHub writes require approval.

### implementer-afk-tdd

Can modify scoped product, test and infrastructure files only when an approved work order exists. May use confirmed stack skills. Must follow TDD and command allowlists.

### verifier-assisted-readonly

Can inspect code and evidence, use stack skills in review mode, run allowlisted checks and write reports. Cannot modify code in v1.

## Remote Actions

GitHub writes, branch push, PR creation, merge, release creation and deploy require explicit approval. Merge and deploy remain manual by default in v1.
