import { describe, expect, it } from 'vitest';
import { sanitize } from './index.js';

interface RuleCase {
  readonly name: string;
  readonly input: string;
  readonly expected: string;
  readonly changes: readonly { rule: string; before: string; after: string }[];
}

function expectRuleResult({ input, expected, changes }: RuleCase): void {
  const result = sanitize(input);
  expect(result.value).toBe(expected);
  expect(result.changed).toBe(changes.length > 0);
  expect(result.changes).toEqual(changes);
}

describe('sanitize: homoglyph', () => {
  it.each<RuleCase>([
    {
      name: 'folds cyrillic look-alikes and records the audit entry',
      input: 'Рrіme',
      expected: 'Prime',
      changes: [{ rule: 'homoglyph', before: 'Рrіme', after: 'Prime' }],
    },
    {
      name: 'unmapped cyrillic passes through unchanged',
      input: 'Ж',
      expected: 'Ж',
      changes: [],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: bom', () => {
  it.each<RuleCase>([
    {
      name: 'strips a leading BOM',
      input: '\uFEFFOffer A',
      expected: 'Offer A',
      changes: [{ rule: 'bom', before: '\uFEFFOffer A', after: 'Offer A' }],
    },
    {
      name: 'strips an interior BOM',
      input: 'Offer\uFEFFA',
      expected: 'OfferA',
      changes: [{ rule: 'bom', before: 'Offer\uFEFFA', after: 'OfferA' }],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: control', () => {
  it.each<RuleCase>([
    {
      name: 'replaces NUL with a space',
      input: 'Offer\u0000A',
      expected: 'Offer A',
      changes: [{ rule: 'control', before: 'Offer\u0000A', after: 'Offer A' }],
    },
    {
      name: 'replaces a mid-range control (BEL) with a space',
      input: 'Offer\u0007A',
      expected: 'Offer A',
      changes: [{ rule: 'control', before: 'Offer\u0007A', after: 'Offer A' }],
    },
    {
      name: 'replaces DEL with a space',
      input: 'Offer\u007FA',
      expected: 'Offer A',
      changes: [{ rule: 'control', before: 'Offer\u007FA', after: 'Offer A' }],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: zero-width', () => {
  it.each<RuleCase>([
    {
      name: 'removes a zero-width space outright',
      input: 'Offer\u200BA',
      expected: 'OfferA',
      changes: [{ rule: 'zero-width', before: 'Offer\u200BA', after: 'OfferA' }],
    },
    {
      name: 'removes ZWNJ, ZWJ and word joiner',
      input: 'a\u200Cb\u200Dc\u2060d',
      expected: 'abcd',
      changes: [{ rule: 'zero-width', before: 'a\u200Cb\u200Dc\u2060d', after: 'abcd' }],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: trim', () => {
  it.each<RuleCase>([
    {
      name: 'trims leading whitespace only',
      input: ' Offer A',
      expected: 'Offer A',
      changes: [{ rule: 'trim', before: ' Offer A', after: 'Offer A' }],
    },
    {
      name: 'trims trailing whitespace only',
      input: 'Offer A ',
      expected: 'Offer A',
      changes: [{ rule: 'trim', before: 'Offer A ', after: 'Offer A' }],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: collapse-spaces', () => {
  it.each<RuleCase>([
    {
      name: 'collapses a double space',
      input: 'Offer  A',
      expected: 'Offer A',
      changes: [{ rule: 'collapse-spaces', before: 'Offer  A', after: 'Offer A' }],
    },
    {
      name: 'collapses a run of three or more spaces',
      input: 'Offer    A',
      expected: 'Offer A',
      changes: [{ rule: 'collapse-spaces', before: 'Offer    A', after: 'Offer A' }],
    },
  ])('$name', expectRuleResult);
});

describe('sanitize: pipeline order and edge cases', () => {
  it('applies homoglyph → bom → control → zero-width → trim → collapse-spaces', () => {
    const input = '\uFEFF Рrіme\u0000\u200B  Offer ';
    const result = sanitize(input);
    expect(result.value).toBe('Prime Offer');
    expect(result.changes.map((c) => c.rule)).toEqual([
      'homoglyph',
      'bom',
      'control',
      'zero-width',
      'trim',
      'collapse-spaces',
    ]);
    expect(result.changes.at(-1)?.after).toBe(result.value);
  });

  it.each([
    { name: 'empty string', input: '', expected: '' },
    { name: 'whitespace-only', input: '  \t ', expected: '' },
    { name: 'clean value untouched', input: 'Offer A', expected: 'Offer A' },
    { name: 'surrogate pair survives', input: '\u{1F600} x', expected: '\u{1F600} x' },
    { name: 'decomposed combining mark survives', input: 'Cafe\u0301', expected: 'Cafe\u0301' },
    { name: 'interior NBSP kept at storage level', input: 'a\u00A0b', expected: 'a\u00A0b' },
    { name: 'underscores kept (TBD in spec)', input: 'Offer_A__', expected: 'Offer_A__' },
  ])('$name', ({ input, expected }) => {
    const result = sanitize(input);
    expect(result.value).toBe(expected);
    expect(result.changed).toBe(result.changes.length > 0);
  });

  it('does not mutate and is deterministic', () => {
    const input = ' a  b ';
    expect(sanitize(input)).toEqual(sanitize(input));
    expect(input).toBe(' a  b ');
  });
});
