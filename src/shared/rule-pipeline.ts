import type { NormalizationChange, RuleId } from '../types.js';

/** Uniform shape of a normalization rule unit: a pure string transform with an id. */
export interface RuleUnit<TId extends RuleId = RuleId> {
  readonly id: TId;
  readonly apply: (input: string) => string;
}

/** Result of running an ordered rule pipeline. */
export interface RulePipelineResult {
  readonly value: string;
  readonly changes: readonly NormalizationChange[];
}

/**
 * Applies `rules` to `input` in order. Each rule that changes the value adds a
 * `{ rule, before, after }` audit entry; no-op rules add nothing.
 */
export function runRulePipeline<TId extends RuleId>(
  input: string,
  rules: readonly RuleUnit<TId>[],
): RulePipelineResult {
  let value = input;
  const changes: NormalizationChange[] = [];
  for (const rule of rules) {
    const next = rule.apply(value);
    if (next !== value) {
      changes.push({ rule: rule.id, before: value, after: next });
      value = next;
    }
  }
  return { value, changes };
}
