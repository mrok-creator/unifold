import { describe, expect, it } from 'vitest';
import type { RuleUnit } from './rule-pipeline.js';
import { runRulePipeline } from './rule-pipeline.js';

const upper: RuleUnit = { id: 'trim', apply: (s) => s.toUpperCase() };
const stripX: RuleUnit = { id: 'control', apply: (s) => s.replaceAll('X', '') };

describe('runRulePipeline', () => {
  it('applies rules in order and records one change per effective rule', () => {
    const result = runRulePipeline('axb', [upper, stripX]);
    expect(result.value).toBe('AB');
    expect(result.changes).toEqual([
      { rule: 'trim', before: 'axb', after: 'AXB' },
      { rule: 'control', before: 'AXB', after: 'AB' },
    ]);
  });

  it('records no change for rules that do not modify the value', () => {
    const result = runRulePipeline('ab', [stripX]);
    expect(result.value).toBe('ab');
    expect(result.changes).toEqual([]);
  });

  it('returns the input untouched for an empty rule list', () => {
    expect(runRulePipeline('ab', [])).toEqual({ value: 'ab', changes: [] });
  });
});
