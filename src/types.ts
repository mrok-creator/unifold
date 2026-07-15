/**
 * Public type surface for the library. Every public type is a named export and
 * is re-exported from the package root so consumers can reuse them for typing.
 *
 * @packageDocumentation
 */

/** Rule identifiers applied by {@link NormalizationResult}-producing `sanitize`. */
export type SanitizeRuleId =
  | 'homoglyph'
  | 'bom'
  | 'control'
  | 'zero-width'
  | 'trim'
  | 'collapse-spaces';

/** Rule identifiers applied by URL normalization. */
export type UrlRuleId =
  | 'trim'
  | 'invisible'
  | 'scheme-lowercase'
  | 'host-lowercase'
  | 'default-port'
  | 'percent-encoding-uppercase'
  | 'collapse-slashes';

/** Union of all rule identifiers, narrowed per module. */
export type RuleId = SanitizeRuleId | UrlRuleId;

/** A single "before → after" normalization event, for audit trails. */
export interface NormalizationChange {
  readonly rule: RuleId;
  readonly before: string;
  readonly after: string;
  readonly index?: number;
}

/** Result of a storage-level normalization (`sanitize`, `normalizeUrl`). */
export interface NormalizationResult {
  readonly value: string;
  /** `true` when at least one change was applied (`changes.length > 0`). */
  readonly changed: boolean;
  readonly changes: readonly NormalizationChange[];
}

/** Reason a host was flagged as suspicious. */
export type SuspiciousReason = 'mixed-script';

/** Result of a suspicious-domain check. Flag only — never auto-fixed. */
export interface SuspiciousDomainResult {
  readonly host: string;
  readonly suspicious: boolean;
  readonly reason?: SuspiciousReason;
  readonly scripts?: readonly string[];
}
