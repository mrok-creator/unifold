# Unicode notes

## Confusables data

- **Unicode version:** 16.0.0 (`CONFUSABLES_UNICODE_VERSION` in `src/generated/confusables.ts`).
- **Source:** https://www.unicode.org/Public/security/16.0.0/confusables.txt (UTS #39 "Unicode Security Mechanisms").
- **Mapping count:** 41 single-codepoint Cyrillic → Basic Latin letter entries.
- **Generator:** `scripts/generate-confusables.mjs`. Run via `pnpm generate:confusables`; downloads the pinned version by default, or accepts a local file path argument for offline/reproducible runs.
- **Committed output:** `src/generated/confusables.ts` — generated, do-not-edit, checked into git so the package has zero runtime dependencies and the mapping is auditable in diffs.

### Filters applied by the generator

1. **Single-codepoint only, both sides.** Multi-codepoint source or target sequences in `confusables.txt` are skipped entirely — the library only folds one-character look-alikes.
2. **Source restricted to Cyrillic.** `U+0400`–`U+04FF` (Cyrillic block) and `U+0500`–`U+052F` (Cyrillic Supplement).
3. **Target restricted to Basic Latin letters.** `A`–`Z` (`U+0041`–`U+005A`) and `a`–`z` (`U+0061`–`U+007A`) only — digits and punctuation confusable targets are excluded, since those aren't meaningful "homoglyph→Latin-letter" folds for this pipeline.
4. **Type column ignored.** `confusables.txt` tags each line `MA`/`SL`/`SA`/`ML` (whole-script vs single-script confusability); the generator does not read this column. The Cyrillic-source + Basic-Latin-letter-target combination already guarantees every kept pair is a genuine cross-script look-alike, so the type column adds no additional filtering value here.
5. **Sanity floor.** The generator throws if fewer than 20 mappings are parsed, to catch a corrupted or unexpectedly-shaped source file rather than silently committing an empty/near-empty map.

## Known edge cases covered in tests

- Astral-plane code points (outside the BMP) are iterated correctly via `for...of` string iteration (surrogate-pair aware) in `shared/script-detect.ts` and rule tables.
- Combining characters are tested as decomposed sequences (base + combining mark), not just precomposed forms, so folds don't accidentally merge or drop a combining mark.
- Zero-width characters, BOM, and control characters (U+0000–U+001F, U+007F) are covered as explicit table cases per rule, always written as `\uXXXX` escapes in source (never raw bytes — raw invisible bytes previously caused git to treat a test file as binary).
- Mixed-script detection (`shared/script-detect.ts`) currently distinguishes `latin` / `cyrillic` / `greek`; scripts outside these three ranges are not detected as a distinct script (letters outside all three ranges are simply ignored for mixed-script purposes) — this is the current scope, not a bug.
