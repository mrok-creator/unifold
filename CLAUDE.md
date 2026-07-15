# CLAUDE.md

Zero-dependency Unicode normalization library. This file holds only what is **not** derivable from the code. Architecture, typing, testing and documentation rules live in `.claude/rules/` and are loaded automatically — do not restate them here.

## Purpose

A lightweight, tree-shakeable, fully typed npm package that normalizes strings and URLs for a data-intake / deduplication pipeline.

**Planning & domain context** (gitignored, in `.dev/`):

- `.dev/requirements.md` — domain requirements spec
- `.dev/GOALS.md`, `.dev/IMPLEMENTATION-PLAN.md` — planning artifacts
- `.dev/early-decisions.md`, `.dev/unicode-notes.md` — brainstorm inputs

See `.claude/rules/context.md` for the context model.

## Workflow

The development methodology — brainstorming, spec, planning, git worktrees, RED-GREEN-REFACTOR TDD, subagent-driven execution, and code review — is provided by the **Superpowers** plugin and triggers automatically. The rules in `.claude/rules/` cover only this codebase's domain constraints; they never restate workflow. When starting, point the agent at `docs/requirements.md` and `.dev/IMPLEMENTATION-PLAN.md` so it seeds from the existing spec instead of brainstorming from scratch.

## Modules (one-liner each)

- `sanitize` — storage-level string cleanup, returns `{ value, changes }`. Order: homoglyph → BOM → control → zero-width → trim → collapse-spaces.
- `canonical-key` — matching-only key builder, returns `string`. sanitize folds + case fold + punctuation/underscore/NBSP.
- `url` — RFC 3986 safe URL normalization, returns `{ value, changes }`. Never touches query/fragment/www.
- `suspicious-domain` — flags mixed-script hosts, returns a flag. Never auto-fixes.
- `shared` — cross-cutting helpers (invisible-char stripping, script detection). The only module domain modules may import from.

## Commands

- `pnpm verify` — full local gate: lint → typecheck → test → build → check:exports. Must be green before a task is done.
- `pnpm coverage` — tests with the 95% domain threshold (active from M2 onward).
- `pnpm api:update` — regenerate `etc/*.api.md` after any public API change, then commit it.
- `pnpm api:check` — fails if the committed API report is stale (runs in CI).
- `pnpm changeset` — add a changeset for any consumer-facing change.

## Definition of Done

A change is done only when: `pnpm verify` is green; if the public API changed, `pnpm api:update` was run and the report committed; a changeset was added for consumer-facing changes; and the relevant `.claude/docs/` file(s) and README were updated in the same change (see `.claude/rules/docs.md`).

## First run (bootstrap)

On a clean clone: `pnpm install`, then `pnpm api:update` once to generate the initial `etc/*.api.md` report and commit it. After that `pnpm verify` and `pnpm api:check` are green on the empty domain.
