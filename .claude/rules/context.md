# Context & config-maintenance rules

Planning and task decomposition (brainstorming, design docs, writing-plans, subagent execution) are owned by the **Superpowers** plugin. This file covers only context hygiene and how to keep _this repo's_ configs and docs correct as it scales.

## Token / context discipline

- **Reference, don't paste.** Point to files by path; never paste large code or docs. `CLAUDE.md` and `.claude/rules/` are auto-loaded — never restate them.
- **`CLAUDE.md` stays minimal** — only what is not derivable from code. Durable facts → `.claude/docs/`.
- **Read narrowly.** Open the target module + its `shared` deps + one reference feature, not the whole tree.

## `.claude/docs/` is the living knowledge base (auto-generated)

**Important:** `.claude/docs/` is created and maintained by the `sync-context` skill during implementation. Before implementation starts (scaffold stage), this directory is empty.

Generated during implementation (part of Definition of Done):

- `module-map.md` — structure / module change
- `decisions.md` — architectural or process decision (append-only)
- `unicode-notes.md` — data-pipeline / Unicode change

**Planning inputs** live in `.dev/` (gitignored):

- `.dev/requirements.md` — domain spec
- `.dev/GOALS.md`, `.dev/IMPLEMENTATION-PLAN.md` — planning artifacts
- `.dev/early-decisions.md`, `.dev/unicode-notes.md` — brainstorm inputs

## When to add which config

- Recurring _how-to-write-code_ rule → `.claude/rules/*.md`
- Durable _fact about this codebase_ → `.claude/docs/*.md`
- Repeatable _project-specific_ procedure → a skill in `.claude/skills/`

Generic development procedures come from Superpowers — do not duplicate them as project skills or rules.

## Scaling

- When `module-map.md` or a rule file grows unwieldy, split by module rather than letting one file balloon.
- New public API → regenerate `etc/*.api.md` (`pnpm api:update`) and update `README` in the same change.
- Before adding a new rule/doc/skill, check whether an existing one should be extended instead — avoid overlapping configs.
