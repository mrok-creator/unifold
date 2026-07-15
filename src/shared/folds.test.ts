import { describe, expect, it } from 'vitest';
import {
  collapseSpaces,
  foldHomoglyphs,
  replaceControlWithSpace,
  stripBom,
  stripControl,
  stripZeroWidth,
  trimEdges,
} from './folds.js';

describe('foldHomoglyphs', () => {
  it.each([
    { name: 'cyrillic Р and а in latin word', input: 'Раypal', expected: 'Paypal' },
    { name: 'pure latin unchanged', input: 'Paypal', expected: 'Paypal' },
    { name: 'unmapped cyrillic passes through', input: 'Ж', expected: 'Ж' },
    { name: 'surrogate pair preserved', input: '\u{1F600}а', expected: '\u{1F600}a' },
    { name: 'combining mark untouched', input: 'e\u0301', expected: 'e\u0301' },
    { name: 'empty', input: '', expected: '' },
  ])('$name', ({ input, expected }) => {
    expect(foldHomoglyphs(input)).toBe(expected);
  });
});

describe('stripBom', () => {
  it.each([
    { name: 'leading BOM', input: '\uFEFFOffer A', expected: 'Offer A' },
    { name: 'interior BOM', input: 'Offer\uFEFF A', expected: 'Offer A' },
    { name: 'no BOM', input: 'Offer A', expected: 'Offer A' },
  ])('$name', ({ input, expected }) => {
    expect(stripBom(input)).toBe(expected);
  });
});

describe('replaceControlWithSpace / stripControl', () => {
  it.each([
    { name: 'NUL', input: 'Offer\u0000A', expected: 'Offer A' },
    { name: 'tab and newline', input: 'Offer\tA\n', expected: 'Offer A ' },
    { name: 'DEL', input: 'Offer\u007FA', expected: 'Offer A' },
  ])('replaces $name with space', ({ input, expected }) => {
    expect(replaceControlWithSpace(input)).toBe(expected);
  });

  it('stripControl removes them outright', () => {
    expect(stripControl('a\u0000b')).toBe('ab');
  });
});

describe('stripZeroWidth', () => {
  it.each([
    { name: 'ZWSP', input: 'Offer\u200BA', expected: 'OfferA' },
    { name: 'ZWNJ+ZWJ+WJ', input: 'a\u200C\u200D\u2060b', expected: 'ab' },
    { name: 'none', input: 'ab', expected: 'ab' },
  ])('$name', ({ input, expected }) => {
    expect(stripZeroWidth(input)).toBe(expected);
  });
});

describe('trimEdges', () => {
  it.each([
    { name: 'spaces both sides', input: '  Offer A ', expected: 'Offer A' },
    { name: 'whitespace-only', input: ' \t ', expected: '' },
    { name: 'empty', input: '', expected: '' },
  ])('$name', ({ input, expected }) => {
    expect(trimEdges(input)).toBe(expected);
  });
});

describe('collapseSpaces', () => {
  it.each([
    { name: 'double space', input: 'Offer  A', expected: 'Offer A' },
    { name: 'many runs', input: 'a   b  c', expected: 'a b c' },
    {
      name: 'NBSP is not collapsed (matching-only concern)',
      input: 'a\u00A0\u00A0b',
      expected: 'a\u00A0\u00A0b',
    },
  ])('$name', ({ input, expected }) => {
    expect(collapseSpaces(input)).toBe(expected);
  });
});
