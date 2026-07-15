# @scope/uninorm

> Placeholder scope/name — replace `@scope/uninorm` before the first release.

Zero-dependency Unicode normalization for a data-intake / deduplication pipeline:

- **`sanitize`** — storage-level cleanup: homoglyph folding (Cyrillic→Latin) → BOM → control → zero-width → trim → collapse spaces. Returns `{ value, changes }` for audit.
- **`canonicalKey`** — matching-only key: sanitize folds + case fold + punctuation/underscore/NBSP folding. Returns a `string`.
- **`normalizeUrl`** — RFC 3986 safe normalization only (scheme/host case, default port, percent-encoding case, redundant slashes). Leaves query/fragment/www untouched. Returns `{ value, changes }`.
- **`suspiciousDomain`** — flags mixed-script hosts (IDN homoglyph risk). Does not auto-fix.

## Status

Scaffold stage. Domain modules land per `.dev/IMPLEMENTATION-PLAN.md` (M1–M6). This README is maintained by Claude Code and updated whenever the public API changes (part of Definition of Done).

## Install

```sh
pnpm add @scope/uninorm
```

## Usage

Examples are added per module as they are implemented (M2–M6).
