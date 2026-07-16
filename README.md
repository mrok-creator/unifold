# @scope/uninorm

> **Pre-release placeholder name.** `@scope/uninorm` is a scaffold name — replace it with the real npm scope/package name before publishing.

Zero-dependency, fully typed Unicode normalization for a data-intake / deduplication pipeline: sanitize strings for storage, build ephemeral matching keys, safely normalize URLs, and flag mixed-script ("homoglyph") domains.

- No runtime dependencies.
- Tree-shakeable (named exports only, `sideEffects: false`).
- Deterministic: no time, randomness, locale, or I/O in any normalization function.
- Every storage-level transform reports an audit trail (`changes[]`) of exactly what it changed.

## Install

```sh
pnpm add @scope/uninorm
# or
npm install @scope/uninorm
```

## Modules

### `sanitize` — storage-level cleanup

Applies, in order: Cyrillic→Latin homoglyph folding, BOM removal, control-character→space replacement, zero-width-character removal, trim, and space-run collapsing. Returns the cleaned value plus an audit trail — this is the value you persist.

```ts
import { sanitize } from '@scope/uninorm';

sanitize('﻿ Offer  A ');
// { value: 'Offer A', changed: true, changes: [...] }
```

### `canonicalKey` — matching-only key

Everything `sanitize` does, plus case folding, dash/underscore/typographic-quote unification, and NBSP folding. Returns a plain `string` — never persist this, it's for comparison only.

```ts
import { canonicalKey } from '@scope/uninorm';

canonicalKey('Offer-A') === canonicalKey('offer_a'); // true
```

### `normalizeUrl` — RFC 3986-safe URL normalization

Applies only transforms that are RFC 3986-safe or explicitly spec-mandated (duplicate-slash collapse in paths): trim + invisible-character removal, scheme/host lowercasing, default-port stripping, percent-encoding hex uppercasing (path only), and duplicate-slash collapsing (path only). Malformed input is returned as-is (with the safe text cleanups applied) — this function never throws.

```ts
import { normalizeUrl } from '@scope/uninorm';

normalizeUrl('HTTP://Example.COM:80//a?utm=x');
// { value: 'http://example.com/a?utm=x', changed: true, changes: [...] }
```

### `suspiciousDomain` — mixed-script flag (detect only)

Flags a host whose letters mix scripts (e.g. Cyrillic look-alikes inside a Latin domain — `pаypal.com` vs `paypal.com`). Detection only: the host is never rewritten, because auto-fixing risks breaking a legitimate domain.

```ts
import { suspiciousDomain } from '@scope/uninorm';

suspiciousDomain('pаypal.com');
// { host: 'pаypal.com', suspicious: true, reason: 'mixed-script', scripts: ['latin', 'cyrillic'] }
```

## Rule tables

### `sanitize` rule order (storage-level)

| Order | Rule id           | What it does                                                                                              |
| ----- | ----------------- | --------------------------------------------------------------------------------------------------------- |
| 1     | `homoglyph`       | Folds single-codepoint Cyrillic look-alikes to their Basic Latin letter (generated data, Unicode 16.0.0). |
| 2     | `bom`             | Removes a byte-order-mark (U+FEFF) anywhere in the string.                                                |
| 3     | `control`         | Replaces control characters (U+0000–U+001F, U+007F) with a space.                                         |
| 4     | `zero-width`      | Removes zero-width characters (e.g. ZWSP, ZWJ, ZWNJ).                                                     |
| 5     | `trim`            | Trims leading/trailing whitespace.                                                                        |
| 6     | `collapse-spaces` | Collapses runs of ASCII spaces (U+0020) to a single space; NBSP is never collapsed.                       |

`canonicalKey` runs all six of the above, then adds case folding, dash/underscore-to-space folding, and typographic-quote-to-straight-quote folding, in that order, before a final trim + collapse.

### `normalizeUrl` rule order

| Order | Rule id                      | What it does                                                                              |
| ----- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| 1     | `trim`                       | Trims edge ASCII whitespace and NBSP (not native `trim()` — see "What it never touches"). |
| 2     | `invisible`                  | Strips BOM, control characters and zero-width characters anywhere in the URL.             |
| 3     | `scheme-lowercase`           | Lowercases the scheme (`HTTP://` → `http://`).                                            |
| 4     | `host-lowercase`             | Lowercases the host.                                                                      |
| 5     | `default-port`               | Strips an explicit default port (`:80` for `http`, `:443` for `https`).                   |
| 6     | `percent-encoding-uppercase` | Uppercases percent-encoding hex triplets in the path (`%2f` → `%2F`).                     |
| 7     | `collapse-slashes`           | Collapses runs of `/` in the path to one, without touching the `://` after the scheme.    |

## What it never touches

- **Query and fragment** — never rewritten by `normalizeUrl` (no percent-encoding case changes, no slash collapsing, no trimming inside them).
- **The `www.` prefix** — not stripped or added; `www.example.com` and `example.com` normalize independently.
- **Trailing slash** — `/a` and `/a/` are left exactly as given; no trailing-slash policy is imposed.
- **Interior NBSP and underscores at the storage level** — `sanitize` does not fold NBSP or dash/underscore variants; that folding is matching-only and happens in `canonicalKey`, never in the persisted value.

## Type reuse

All public types are named exports re-exported from the package root, so consumers can type their own code against them instead of redeclaring shapes:

```ts
import type { NormalizationResult, SuspiciousDomainResult } from '@scope/uninorm';

function persist(result: NormalizationResult): void {
  // result.value / result.changed / result.changes are fully typed
}
```

Full type surface: `NormalizationResult`, `NormalizationChange`, `SanitizeRuleId`, `UrlRuleId`, `RuleId`, `SuspiciousDomainResult`, `SuspiciousReason`.

## Status

0.1.0 release candidate — all four modules (`sanitize`, `canonicalKey`, `normalizeUrl`, `suspiciousDomain`) are implemented, tested (100% statement/function/line coverage, ≥95% branch), and reviewed. See `.claude/docs/` for the module map, architectural decision log, and Unicode data notes.
