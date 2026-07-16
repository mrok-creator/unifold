import { describe, expect, it } from 'vitest';
import { canonicalKey } from './index.js';

describe('canonicalKey: case fold', () => {
  it.each([
    { name: 'mixed case', input: 'Offer A', expected: 'offer a' },
    { name: 'all caps', input: 'OFFER A', expected: 'offer a' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: dash/underscore fold', () => {
  it.each([
    { name: 'hyphen-minus', input: 'Offer-A', expected: 'offer a' },
    { name: 'underscore', input: 'Offer_A', expected: 'offer a' },
    { name: 'en dash', input: 'Offer–A', expected: 'offer a' },
    { name: 'em dash', input: 'Offer—A', expected: 'offer a' },
    { name: 'minus sign', input: 'Offer−A', expected: 'offer a' },
    { name: 'double underscore collapses', input: 'Offer__A', expected: 'offer a' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: quote fold', () => {
  it.each([
    { name: 'curly single quotes', input: '‘Offer’', expected: "'offer'" },
    { name: 'curly double quotes', input: '“Offer”', expected: '"offer"' },
    { name: 'low-9 double quote', input: '„Offer”', expected: '"offer"' },
    { name: 'guillemets', input: '«Offer»', expected: '"offer"' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: nbsp fold', () => {
  it('folds NBSP to space and collapses', () => {
    expect(canonicalKey('Offer\u00A0\u00A0A')).toBe('offer a');
  });
});

describe('canonicalKey: includes storage folds', () => {
  it.each([
    { name: 'homoglyphs folded', input: 'Рrіme', expected: 'prime' },
    {
      name: 'BOM + control + zero-width + trim + collapse',
      input: '\uFEFF\u0000 Offer\u200B',
      expected: 'offer',
    },
    {
      name: 'spec equivalence: Offer-A ≈ Offer_A ≈ Offer A ≈ offer a',
      input: 'OFFER-A',
      expected: 'offer a',
    },
    { name: 'empty', input: '', expected: '' },
    { name: 'whitespace-only', input: ' \t ', expected: '' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });

  it('is idempotent', () => {
    const once = canonicalKey('“Offer—A”');
    expect(canonicalKey(once)).toBe(once);
  });
});
