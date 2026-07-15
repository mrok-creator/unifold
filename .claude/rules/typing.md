# Typing rules

- **Single public type surface.** All public types are named exports declared in `src/types.ts` and re-exported from the package root (`src/index.ts`). Consumers must be able to import and reuse every public type after install.
- **No anonymous inline types in public signatures.** Function parameters and return types reference named types, never inline object literals.
- **Rule identifiers are string-literal unions, not enums** (`SanitizeRuleId`, `UrlRuleId`, and the union `RuleId`). Narrow per module.
- **`readonly` everywhere in result structures.** Result objects and their arrays are `readonly`.
- **Strict compiler settings are non-negotiable.** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules` stay on. Do not weaken `tsconfig.json` to make code compile — fix the code.
- **`NormalizationResult` shape is fixed**: `{ value, changed, changes }`, where `changed === changes.length > 0`. `sanitize` and `normalizeUrl` return it; `canonicalKey` returns a plain `string`; `suspiciousDomain` returns `SuspiciousDomainResult`.
