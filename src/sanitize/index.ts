import type { NormalizationResult } from '../types.js';
import { runRulePipeline } from '../shared/rule-pipeline.js';
import { sanitizeRules } from './rules.js';

/* eslint-disable no-irregular-whitespace */
/**
 * Storage-level string cleanup. Applies, in order: Cyrillic→Latin homoglyph
 * folding, BOM removal, control-char→space replacement, zero-width removal,
 * trim, and space-run collapsing. Every effective rule is recorded in
 * `changes` as a `{ rule, before, after }` audit entry.
 *
 * @example
 * ```ts
 * sanitize('﻿ Offer  A ');
 * // { value: 'Offer A', changed: true, changes: [...] }
 * ```
 */
/* eslint-enable no-irregular-whitespace */
export function sanitize(input: string): NormalizationResult {
  const { value, changes } = runRulePipeline(input, sanitizeRules);
  return { value, changed: changes.length > 0, changes };
}
