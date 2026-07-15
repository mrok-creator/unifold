/**
 * Public entry point. Re-exports the type surface and (once implemented) the
 * domain functions. Keep this file export-only — no logic here.
 *
 * @packageDocumentation
 */

export type {
  RuleId,
  SanitizeRuleId,
  UrlRuleId,
  NormalizationChange,
  NormalizationResult,
  SuspiciousReason,
  SuspiciousDomainResult,
} from './types.js';

// Domain modules (implemented in M2–M5) are re-exported here:
export { sanitize } from './sanitize/index.js';
export { canonicalKey } from './canonical-key/index.js';
export { normalizeUrl } from './url/index.js';
export { suspiciousDomain } from './suspicious-domain/index.js';
