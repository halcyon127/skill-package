---
name: aeolus-open
description: Use for reading Aeolus(风神) platform assets via `aeolus-open`, limited to search, pull, and command troubleshooting for read-only resource discovery and download flows.
allowed-tools: Bash(aeolus-open *)
---

# Aeolus(风神) Open CLI Skill

Use this skill for external Aeolus(风神) resource discovery and local bundle download work. Keep exact command syntax in `references/commands.md`; use this file to decide whether to search or pull, and how to interpret CLI output.

**Install the Aeolus(风神) Open CLI first**:

```bash
npm install --global <absolute-path-to-skills>/aeolus-open/aeolus-cli.tgz
```

## Local Model

- Local Aeolus(风神) resources are scoped by app: `app/<appId>/dashboard|chart|dataset/...`.
- When running from workspace root, CLI resolves saved resources by searching `app/*`.
- When running inside `app/<appId>`, CLI only uses that app workspace.

## Recommended Workflow

Use this flow for most external read-only tasks:

1. `search` when resource IDs are not known yet.
2. `pull` to refresh local JSON from remote state.
3. Inspect the generated local files.

```bash
aeolus-open search "weekly overview"
aeolus-open pull dashboard/12345
```

## Command Selection

- `aeolus-open search ...`
  - Use to locate dashboards, charts, or datasets by keyword before pull.
- `aeolus-open pull ...`
  - Use when remote state is the source of truth and local JSON must be refreshed.

## Output Contract

- `search` prints a `SEARCHED` summary plus one block per result.
- `pull` prints `FETCHED` plus one or more `RESOURCE` / `LOCAL_URI` / `REMOTE_URI` blocks.

Parse output when the next step depends on generated local file paths or the discovered resource IDs.

## Guardrails

- Run commands in the intended workspace.
- Prefer `search` before `pull` when IDs are unknown.
- `pull` expects exactly one target.
- For saved-resource workflows, do not handcraft local paths; let the CLI write them.
- Treat this skill as read-only. It does not cover `new`, `sync`, or `query`.

## References

Read [references/commands.md](references/commands.md) when you need exact syntax, options, output shapes, or examples.

Read [references/overview.md](references/overview.md) when you need the minimal dashboard/sheet/chart/dataset concept model behind the downloaded JSON.

## Maintenance Rules

- CLI help is the source of truth for supported commands, targets, and options.
- `references/commands.md` should mirror CLI help and current behavior; do not invent unsupported commands there.
- `SKILL.md` should stay focused on routing, output interpretation, workspace assumptions, and guardrails.
