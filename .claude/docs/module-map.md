# Module map

| Module              | Public entry             | Returns                  | Depends on                                                           |
| ------------------- | ------------------------ | ------------------------ | -------------------------------------------------------------------- |
| `sanitize`          | `sanitize(input)`        | `NormalizationResult`    | `shared/folds`, `shared/rule-pipeline`                               |
| `canonical-key`     | `canonicalKey(input)`    | `string`                 | `shared/folds` + private matching-only folds (`canonical-key/folds`) |
| `url`               | `normalizeUrl(input)`    | `NormalizationResult`    | `shared/folds`, `shared/rule-pipeline`, private `url/parse`          |
| `suspicious-domain` | `suspiciousDomain(host)` | `SuspiciousDomainResult` | `shared/script-detect`                                               |
| `shared`            | (internal only)          | —                        | `generated/confusables` via `shared/confusables`                     |

- Rule order sanitize: `homoglyph` → `bom` → `control` → `zero-width` → `trim` → `collapse-spaces` (`src/sanitize/rules.ts`).
- Rule order url: `trim` → `invisible` → `scheme-lowercase` → `host-lowercase` → `default-port` → `percent-encoding-uppercase` → `collapse-slashes` (`src/url/rules.ts`). Percent-encoding and collapse-slashes act on the path component only; scheme/host rules act on the scheme/authority only. Query, fragment and `www.` are never touched.
- Fold order canonical-key: all storage-level sanitize folds (`foldHomoglyphs` → `stripBom` → `replaceControlWithSpace` → `stripZeroWidth`) → `foldNbspToSpace` → `foldSeparatorsToSpace` (dash/underscore variants → space) → `foldQuotes` → `foldCase` → `trimEdges` → `collapseSpaces` (`src/canonical-key/index.ts`).
- `src/generated/confusables.ts` is committed generated data (41 single-codepoint Cyrillic→Basic-Latin mappings, Unicode 16.0.0); regenerate with `pnpm generate:confusables`. Never read directly by domain modules — accessed only through the typed `shared/confusables` accessor.
- Public types live in `src/types.ts`, re-exported with the four functions from `src/index.ts` (`RuleId`, `SanitizeRuleId`, `UrlRuleId`, `NormalizationChange`, `NormalizationResult`, `SuspiciousReason`, `SuspiciousDomainResult`).
- `suspiciousDomain` is detection-only (mixed Latin/Cyrillic/Greek scripts) — it never rewrites the host.
