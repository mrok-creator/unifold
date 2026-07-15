# Documentation rules (self-updating docs)

Documentation is created and maintained by Claude Code, in two layers. Updating the relevant layer is part of the Definition of Done and is checked during `verify`.

## Layer 1 — internal docs for Claude Code (`.claude/docs/`)

- `module-map.md` — current map of modules: purpose, public entry points, dependencies between modules.
- `decisions.md` — append-only architectural decision log (decision + reason, short).
- `unicode-notes.md` — domain notes: Unicode version of `confusables.txt`, source, covered ranges, known edge cases.

Rule: any change to module structure, the public API, or the data pipeline updates the matching file in `.claude/docs/` **in the same change**.

## Layer 2 — public docs for npm

- **TSDoc on every public export.** Public API docs are generated from these.
- **`@microsoft/api-extractor`** produces `etc/<pkg>.api.md` — the public API snapshot. CI (`pnpm api:check`) fails if the API changed without regenerating the report, so a contract change without a doc update is physically impossible.
- **README** — description, install, per-module examples, normalization-rule table. Changing the public API updates the README examples in the same PR.
- **CHANGELOG** — via changesets; add a changeset for every consumer-facing change.
- **typedoc** — full API reference (optional, may be deferred to M6).
