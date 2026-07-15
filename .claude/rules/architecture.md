# Architecture rules

- **Module boundaries.** Domain modules: `sanitize`, `canonical-key`, `url`, `suspicious-domain`. Cross-cutting helpers live in `shared`. Each module owns one responsibility.
- **No cross-imports between domain modules.** A domain module may import only from `shared` and `types`. If two domain modules need the same logic, it belongs in `shared`.
- **Pure functions only.** No classes with mutable state, no singletons, no module-level mutable variables. Every public function is a pure `(input) => output`.
- **Zero runtime dependencies.** `dependencies` in `package.json` stays empty. Everything is `devDependencies`. The homoglyph map is generated at build time into `src/generated/` and committed — not pulled from a runtime package.
- **Tree-shakeable.** Named exports only, no side effects at import time (`sideEffects: false`).
- **Rule application levels are fixed by the spec** (`.dev/requirements.md`): storage-level rules mutate the value; matching-only rules affect the canonical key only; URL normalization touches only RFC 3986-guaranteed-equivalent parts.

## Architectural concepts

- **Rule pipeline.** Each normalization concern is a small pure rule unit; a module composes an ordered list of them. Adding a concern = adding a unit + registering it in the order, never editing unrelated units.
- **Uniform rule shape.** Every rule unit reports what it changed so the module can assemble `changes[]` for audit. Rule units do not build the result object themselves — the module orchestrates.
- **Two-track application.** Storage-track rules produce the persisted value (`sanitize`, `normalizeUrl`); matching-track folds produce the ephemeral `canonicalKey` and never persist. A rule declares its track and is never applied on the wrong one.
- **Data is not code.** The confusables map is generated, typed, committed data under `src/generated/`, imported through a typed accessor in `shared`. Domain modules never read raw data files.
- **Determinism.** Same input → same output, always. No time, randomness, locale, or I/O in normalization functions.
- **Fail-closed on safety, fail-open on cleanup.** `suspiciousDomain` only flags (never rewrites); `sanitize`/`normalizeUrl` apply only RFC/spec-guaranteed-safe transforms.
