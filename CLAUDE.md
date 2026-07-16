# CLAUDE.md

Zero-dependency Unicode normalization library. This file holds only what is **not** derivable from the code. Architecture, typing, testing and documentation rules live in `.claude/rules/` and are loaded automatically — do not restate them here.

## Purpose

A lightweight, tree-shakeable, fully typed npm package that normalizes strings and URLs for a data-intake / deduplication pipeline. v0.1 (`sanitize`, `canonicalKey`, `normalizeUrl`, `suspiciousDomain`) is implemented and merged; current facts live in `.claude/docs/` (module-map, decisions, unicode-notes).

## Workflow

The development methodology — brainstorming, spec, planning, git worktrees, RED-GREEN-REFACTOR TDD, subagent-driven execution, and code review — is provided by the **Superpowers** plugin and triggers automatically. The rules in `.claude/rules/` cover only this codebase's domain constraints; they never restate workflow.

**Every piece of work starts with `superpowers:brainstorming` whenever context is insufficient** — there is no pre-written spec to seed from. Scoping inputs:

- `.dev/BACKLOG.md` (gitignored) — deferred domain TBDs, review findings, release checklist. The single source of "what's not done".
- `.claude/docs/decisions.md` — why the code is the way it is; never re-litigate a decision without new evidence.

Plans produced by `superpowers:writing-plans` go to `.dev/plans/` (gitignored). Items that end up out of scope go to `.dev/BACKLOG.md`, not into code comments or TODOs.

## Modules (one-liner each)

- `sanitize` — storage-level string cleanup, returns `{ value, changed, changes }`. Order: homoglyph → BOM → control → zero-width → trim → collapse-spaces.
- `canonical-key` — matching-only key builder, returns `string`. sanitize folds + case fold + punctuation/underscore/NBSP.
- `url` — RFC 3986-safe URL normalization, returns `{ value, changed, changes }`. Never touches query/fragment/www; opaque-scheme bodies get scheme lowercasing only.
- `suspicious-domain` — flags mixed-script hosts (host as-given, punycode not decoded), returns a flag. Never auto-fixes.
- `shared` — cross-cutting helpers (folds, rule pipeline, script detection, confusables accessor). The only module domain modules may import from.

## Commands

- `pnpm verify` — full local gate: lint → typecheck → test → build → check:exports. Must be green before a task is done.
- `pnpm coverage` — tests with the 95% domain threshold.
- `pnpm generate:confusables` — regenerate `src/generated/confusables.ts` from Unicode confusables.txt (pinned version in the file header); commit the result.
- `pnpm api:update` — regenerate `etc/*.api.md` after any public API change, then commit it.
- `pnpm api:check` — fails if the committed API report is stale (runs in CI).
- `pnpm changeset` — add a changeset for any consumer-facing change.

## Definition of Done

A change is done only when: `pnpm verify` is green; if the public API changed, `pnpm api:update` was run and the report committed; a changeset was added for consumer-facing changes; and the relevant `.claude/docs/` file(s) and README were updated in the same change (see `.claude/rules/docs.md`).

## Source-code convention (non-derivable)

Invisible/control characters in source and tests are always `\uXXXX` escapes, never raw bytes (raw bytes make git treat files as binary; it recurred three times during v0.1). Before committing: `git diff --stat --cached` must show line counts, never "Bin". Printable Cyrillic/typographic characters stay literal. See decisions.md #16.

## First run (bootstrap)

On a clean clone: `pnpm install`, then `pnpm verify` — green. The API report and generated confusables data are committed; nothing needs regenerating.

## Pre-release (manual, owner-only)

Package name: `unifold` (npm). The release checklist lives in `.dev/BACKLOG.md`.
