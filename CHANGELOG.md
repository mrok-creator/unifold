# @mrok-creator/unifold

## 0.2.0

### Minor Changes

- 7810fe2: `canonicalKey` now folds ALL separator punctuation to a space (matching-only; stored values are untouched): general punctuation (`. , ; : ! ? ( ) [ ] { } / \\ | @ # $ % ^ & * + = ~`), underscore, every dash variant and every quote variant. Quotes are treated as separators instead of being normalized and kept, so stylistic variants of one name now converge to a single key (`“Acme”–Co Ltd` ≡ `Acme.Co Ltd` ≡ `Acme Co Ltd` → `acme co ltd`).

  **Action required:** canonical keys computed with earlier versions differ for values containing quotes or general punctuation — recompute stored/generated canonical-key columns after upgrading.

## 0.1.0

### Minor Changes

- 2aaae06: Initial public API: `sanitize`, `canonicalKey`, `normalizeUrl`, `suspiciousDomain` plus the full public type surface (`NormalizationResult`, `NormalizationChange`, `SanitizeRuleId`, `UrlRuleId`, `RuleId`, `SuspiciousDomainResult`, `SuspiciousReason`).
