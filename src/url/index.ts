import type { NormalizationResult } from '../types.js';
import { runRulePipeline } from '../shared/rule-pipeline.js';
import { urlRules } from './rules.js';

/**
 * Normalizes a URL applying only RFC 3986-guaranteed-equivalent transforms:
 * trim + invisible-char removal, scheme/host lowercasing, default-port
 * stripping, percent-encoding hex uppercasing (path only) and duplicate-slash
 * collapsing (path only). Query, fragment and the `www.` prefix are never
 * touched. Malformed input is returned as-is (with the safe text cleanups),
 * never thrown on.
 *
 * @example
 * ```ts
 * normalizeUrl('HTTP://Example.COM:80//a?utm=x');
 * // { value: 'http://example.com/a?utm=x', changed: true, changes: [...] }
 * ```
 */
export function normalizeUrl(input: string): NormalizationResult {
  const { value, changes } = runRulePipeline(input, urlRules);
  return { value, changed: changes.length > 0, changes };
}
