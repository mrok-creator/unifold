---
name: add-normalization-module
description: Scaffold a new domain normalization module or a new rule inside an existing one, end-to-end, following the repo's architecture, code-quality, typing, testing and docs rules. Use when adding or extending sanitize, canonical-key, url or suspicious-domain behavior, or introducing a brand-new domain module.
---

# Add a normalization module / rule

Follow the repo rules (auto-loaded: `architecture.md`, `code-quality.md`, `typing.md`, `testing.md`, `docs.md`). Do not restate them — apply them.

## Procedure

1. **Types first.** Add or narrow the public types in `src/types.ts` (new `RuleId` members as a literal union, result shape). Re-export from `src/index.ts`. No anonymous inline types.
2. **Rule units.** Implement each new concern as a pure rule unit with the module's uniform shape (reports its `change`). Pure, deterministic, no input mutation.
3. **Compose.** Register the unit in the module's fixed order (storage-track vs matching-track — never the wrong track). Shared logic goes to `shared`, never cross-imported between domain modules.
4. **Tests.** Table-driven, one `describe` per rule, mandatory Unicode edge cases, assert both `value` and `changes[]`. Keep domain coverage ≥ 95%.
5. **Wire.** Re-export the public function from `src/index.ts`.
6. **Docs (same change).** Update `.claude/docs/module-map.md`; append the decision to `.claude/docs/decisions.md`; if the data pipeline/Unicode scope changed, update `unicode-notes.md`. Add TSDoc on every public export; update `README` examples.
7. **Contract + changeset.** `pnpm api:update` and commit `etc/*.api.md`; add a changeset for the consumer-facing change.
8. **Gate.** `pnpm verify` green before done.
