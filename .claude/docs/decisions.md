# Decisions

Append-only architectural decision log. Each entry: decision + short reason.

## Seed decisions (pre-implementation brainstorm)

1. Homoglyph map is generated at build time (`scripts/generate-confusables.mjs` → `src/generated/confusables.ts`), not pulled from a runtime package — keeps `dependencies` empty and the mapping auditable/committed.
2. Result shape is `{ value, changed, changes }` for storage-level transforms (`sanitize`, `normalizeUrl`), and a plain `string` for `canonicalKey` — the two tracks (persisted vs ephemeral matching) must not be confusable at the type level.
3. All public types are explicit, reusable named exports from `src/types.ts` — consumers can import and reuse every result/rule-id type, no anonymous inline shapes.
4. `suspiciousDomain` only flags, never fixes — auto-rewriting a host risks breaking a legitimate domain; safety-critical checks fail closed.
5. Homoglyph folding runs first in the `sanitize` pipeline — Cyrillic look-alikes must be normalized to Latin before any other cleanup rule (BOM/control/zero-width/trim/collapse) can reason about the string correctly.
6. Workflow (brainstorming, spec, planning, TDD loop, subagent execution, code review) is delegated entirely to the Superpowers plugin — this repo's own rules cover only domain constraints, never process.

## Locked domain decisions (this plan)

7. Control characters (U+0000–U+001F, U+007F) are replaced with a space in `sanitize` (spec example "Offer\x00A → Offer A"); the later trim/collapse-spaces rules clean up. BOM and zero-width chars are removed outright.
8. `sanitize`'s trim uses native `String.prototype.trim()` — edge whitespace incl. NBSP is safe cleanup; interior NBSP is untouched at storage level (matching-only concern).
9. `collapse-spaces` collapses runs of U+0020 only (post control→space replacement); NBSP runs are never collapsed at storage level.
10. Percent-encoding uppercasing and `//` collapsing apply to the URL path component only — query and fragment stay byte-for-byte (they may carry functional payload).
11. Schemeless URLs (`example.com:80/x`, `Example.COM/Path`) are supported by heuristic: the first segment is treated as an authority when it contains a dot or a numeric port; schemeless default-port stripping removes both :80 and :443. Opaque-scheme URLs (`mailto:`) get scheme lowercasing only.
12. `www.`-prefix and trailing slash are never touched (TBD in the domain spec — deliberately out of v0.1).
13. Confusables scope: single-codepoint sources in Cyrillic blocks U+0400–U+04FF/U+0500–U+052F, single-codepoint targets in Basic Latin letters A–Z/a–z only (digit look-alikes excluded); one-way Cyrillic→Latin; Unicode version pinned 16.0.0.
14. Matching-only folds (canonical key): NBSP→space; dashes U+2010–U+2015, U+2212, `-`, `_` → space; curly/angle quotes → straight `'`/`"`; locale-independent `toLowerCase()`.
15. `suspiciousDomain` treats its input as a host string as-given (no URL parsing) and flags when ≥2 distinct letter scripts (latin/cyrillic/greek) are present.

## Decisions made during implementation

16. Invisible/control characters in source code (tests and rule tables) are always written as `\uXXXX` escapes, never raw bytes — keeps files reviewable as text; raw bytes previously made git treat test files as binary.
17. The `url` pipeline uses a module-private `urlTrim` (edge ASCII whitespace + NBSP only) instead of native `String.prototype.trim()` — native `trim()` silently eats a leading U+FEFF, which must instead be caught and audited by the `invisible` rule (which strips BOM + control + zero-width everywhere in the URL, not just the edges).
18. Percent-encoding uppercasing matches mixed-case triplets via `/%[0-9a-fA-F]{2}/g` and applies to the path component only — query/fragment percent-encoding is left untouched by design.
19. The confusables generator ignores `confusables.txt`'s type column (`MA`/`SL`/…) entirely — the single-codepoint + Cyrillic-source (U+0400–U+04FF, U+0500–U+052F) + Basic-Latin-letter-target (A–Z, a–z) filters already guarantee only cross-script look-alike pairs are kept, so the type column adds no further discrimination this library needs.
