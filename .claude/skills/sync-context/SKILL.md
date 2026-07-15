---
name: sync-context
description: Keep project context in sync after a change — refresh .claude/docs (module-map, decisions, unicode-notes), regenerate the API report, update README, and record per-task context under .dev/. Use at the end of any task that changed module structure, the public API, an architectural decision, or the data pipeline.
---

# Sync context

Run this as the closing step of a task so the knowledge base and contract never drift. See `.claude/rules/context.md`.

## Checklist

1. **`.claude/docs/module-map.md`** — create/update to reflect any new/renamed module, entry point, or inter-module dependency.
2. **`.claude/docs/decisions.md`** — create/append (never rewrite) any architectural decision made, with a one-line reason.
3. **`.claude/docs/unicode-notes.md`** — create/update if the confusables scope, Unicode version, or covered ranges changed.
4. **API report** — `pnpm api:update`, commit `etc/*.api.md`; update `README` examples if the public API changed.
5. **Changeset** — `pnpm changeset` for any consumer-facing change.
6. **Per-task file** — update `.dev/tasks/<id>-<slug>.md` with final decisions and any follow-ups.
7. **Verify** — `pnpm verify` green.

**Note:** `.claude/docs/` is created during implementation by this skill. Before implementation, the directory is empty.
