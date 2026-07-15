# Decisions

Append-only architectural decision log. Each entry: decision + short reason.

## Seed decisions (pre-implementation brainstorm)

1. Homoglyph map is generated at build time (`scripts/generate-confusables.mjs` → `src/generated/confusables.ts`), not pulled from a runtime package — keeps `dependencies` empty and the mapping auditable/committed.
2. Result shape is `{ value, changed, changes }` for storage-level transforms (`sanitize`, `normalizeUrl`), and a plain `string` for `canonicalKey` — the two tracks (persisted vs ephemeral matching) must not be confusable at the type level.
3. All public types are explicit, reusable named exports from `src/types.ts` — consumers can import and reuse every result/rule-id type, no anonymous inline shapes.
4. `suspiciousDomain` only flags, never fixes — auto-rewriting a host risks breaking a legitimate domain; safety-critical checks fail closed.
5. Homoglyph folding runs first in the `sanitize` pipeline — Cyrillic look-alikes must be normalized to Latin before any other cleanup rule (BOM/control/zero-width/trim/collapse) can reason about the string correctly.
6. Workflow (brainstorming, spec, planning, TDD loop, subagent execution, code review) is delegated entirely to the Superpowers plugin — this repo's own rules cover only domain constraints, never process.

## Locked architecture decisions (this plan)

7. Domain modules are fixed at four: `sanitize`, `canonical-key`, `url`, `suspicious-domain`, each owning exactly one normalization concern; cross-cutting logic lives in `shared` only.
8. No cross-imports between domain modules — if two domain modules need the same logic, it moves to `shared`, never gets duplicated or imported sideways.
9. Pure functions only: no classes with mutable state, no singletons, no module-level mutable variables. Every public function is `(input) => output`.
10. Zero runtime dependencies (`dependencies` stays empty in `package.json`); everything needed at runtime is either hand-written or generated+committed data.
11. Tree-shakeable package: named exports only, `sideEffects: false`, no side effects at import time.
12. Rule application levels are fixed by the domain spec: storage-level rules mutate the persisted value; matching-only folds affect the canonical key only; URL normalization touches only RFC 3986-guaranteed-equivalent parts.
13. Normalization concerns are implemented as an ordered pipeline of small pure rule units sharing one shape (`RuleUnit<Id>`); adding a concern means adding a unit and registering it in the module's order, never editing unrelated units.
14. Two-track application is enforced by construction: storage-track rules (`sanitize`, `normalizeUrl`) and matching-track folds (`canonicalKey`) are separate rule lists — a rule declares its track by which module registers it and is never shared across tracks.
15. Fail-closed on safety, fail-open on cleanup: `suspiciousDomain` only flags; `sanitize`/`normalizeUrl` apply only transforms guaranteed safe by spec/RFC, and malformed input is returned as-is rather than thrown on.

## Decisions made during implementation

16. Invisible/control characters in source code (tests and rule tables) are always written as `\uXXXX` escapes, never raw bytes — keeps files reviewable as text; raw bytes previously made git treat test files as binary.
17. The `url` pipeline uses a module-private `urlTrim` (edge ASCII whitespace + NBSP only) instead of native `String.prototype.trim()` — native `trim()` silently eats a leading U+FEFF, which must instead be caught and audited by the `invisible` rule (which strips BOM + control + zero-width everywhere in the URL, not just the edges).
18. Percent-encoding uppercasing matches mixed-case triplets via `/%[0-9a-fA-F]{2}/g` and applies to the path component only — query/fragment percent-encoding is left untouched by design.
19. The confusables generator ignores `confusables.txt`'s type column (`MA`/`SL`/…) entirely — the single-codepoint + Cyrillic-source (U+0400–U+04FF, U+0500–U+052F) + Basic-Latin-letter-target (A–Z, a–z) filters already guarantee only cross-script look-alike pairs are kept, so the type column adds no further discrimination this library needs.
