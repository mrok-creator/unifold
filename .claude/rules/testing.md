# Testing rules

> The RED-GREEN-REFACTOR loop itself is enforced by the Superpowers `test-driven-development` skill. This file defines *what and how* to test in this domain.


- **Table-driven tests.** Each rule is a table of `{ name, input, expected }` cases; iterate with `it.each`.
- **One `describe` per normalization rule.** Group cases by rule so a failure points at a single rule.
- **Mandatory Unicode edge cases:** surrogate pairs, combining characters, zero-width characters, BOM, control characters, mixed-script strings, empty and whitespace-only input.
- **Audit assertions.** For `sanitize`/`normalizeUrl`, assert both `value` and the `changes[]` entries (rule id + before/after), not just the final string.
- **URL high-risk cases** get explicit coverage: `//` collapse must not touch `://` or protocol-relative `//host`; percent-encoding case; default-port stripping; scheme/host lowercasing while leaving path/query/fragment intact.
- **Coverage.** Domain modules must stay at or above 95% (`pnpm coverage`). Generated data (`src/generated/`) and build scripts are excluded.
