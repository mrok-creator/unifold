# Code-quality rules

Generic development discipline — TDD (RED-GREEN-REFACTOR), YAGNI, DRY, simplicity, systematic debugging, code review — is owned by the **Superpowers** plugin and is not restated here. This file lists only the constraints specific to *this* codebase.

## Structure (SOLID, functional reading)

- **Single responsibility** — one module = one normalization concern; one function = one transformation. A function that both mutates the stored value and decides matching policy is two functions.
- **Open/closed** — add a concern by adding a rule unit and registering it in the module's order, not by editing unrelated rules.
- **Liskov / substitution** — every rule unit shares one shape so the pipeline treats them uniformly; a new rule is a drop-in.
- **Interface segregation** — public types stay narrow and per-purpose (`SanitizeRuleId` vs `UrlRuleId`); no god-type.
- **Dependency inversion** — domain modules depend on `shared`/`types` abstractions, never on each other or on raw data files; generated data is reached through a typed accessor.

## Pattern shape (GoF → functions, no classes)

- **Strategy** → each normalization rule is a pure function; the module selects and orders them.
- **Pipeline / chain of responsibility** → `sanitize` and `normalizeUrl` are ordered compositions of rule functions; order is fixed by the spec.
- **Factory / builder** → key construction (`canonicalKey`) composes folds; no `new`, just composition.
- Do **not** introduce classes, inheritance, or singletons to force a GoF shape. The functional equivalent wins (see `architecture.md`).

## Non-negotiables (this codebase)

- **Immutability & purity** — never mutate inputs; return new values; no shared mutable state.
- **Determinism** — no time, randomness, locale, or I/O inside normalization functions.
- **Explicitness** — no implicit `any`, no non-null assertions in domain code, no silent `catch`. A function's name must match what it does.
- **Typed errors** — malformed/expected-bad input returns a typed result, never throws. Reserve throwing for programmer errors.
