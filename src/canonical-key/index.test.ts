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

describe('canonicalKey: dash fold (all kinds → separator)', () => {
  it.each([
    { name: 'hyphen-minus', input: 'Offer-A', expected: 'offer a' },
    { name: 'hyphen U+2010', input: 'Offer‐A', expected: 'offer a' },
    { name: 'non-breaking hyphen U+2011', input: 'Offer‑A', expected: 'offer a' },
    { name: 'figure dash U+2012', input: 'Offer‒A', expected: 'offer a' },
    { name: 'en dash', input: 'Offer–A', expected: 'offer a' },
    { name: 'em dash', input: 'Offer—A', expected: 'offer a' },
    { name: 'horizontal bar U+2015', input: 'Offer―A', expected: 'offer a' },
    { name: 'minus sign', input: 'Offer−A', expected: 'offer a' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: underscore fold (separator; storage never touched)', () => {
  it.each([
    { name: 'single underscore', input: 'Offer_A', expected: 'offer a' },
    { name: 'double underscore collapses', input: 'Offer__A', expected: 'offer a' },
    { name: 'trailing underscores trim away', input: 'Offer_A__', expected: 'offer a' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: quote fold (all kinds → separator)', () => {
  it.each([
    { name: 'straight double quotes', input: '"Offer" A', expected: 'offer a' },
    { name: 'apostrophe', input: "O'Brien Offer", expected: 'o brien offer' },
    { name: 'curly single quotes', input: '‘Offer’ A', expected: 'offer a' },
    { name: 'curly double quotes', input: '“Offer” A', expected: 'offer a' },
    { name: 'low-9 double quote', input: '„Offer” A', expected: 'offer a' },
    { name: 'single low-9 / high-reversed', input: '‚Offer‛ A', expected: 'offer a' },
    { name: 'guillemets', input: '«Offer» A', expected: 'offer a' },
    { name: 'quoted vs unquoted converge', input: '"Offer A"', expected: 'offer a' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: punctuation fold (separator set)', () => {
  it.each([
    { name: 'dot separator', input: 'Acme.Co', expected: 'acme co' },
    { name: 'comma', input: 'Acme,Co', expected: 'acme co' },
    { name: 'semicolon and colon', input: 'a;b:c', expected: 'a b c' },
    { name: 'exclamation and question', input: 'Wow!Really?', expected: 'wow really' },
    { name: 'round brackets', input: 'Acme (Global) Co', expected: 'acme global co' },
    { name: 'square and curly brackets', input: '[Acme] {Co}', expected: 'acme co' },
    { name: 'slashes and pipe', input: 'a/b\\c|d', expected: 'a b c d' },
    { name: 'at hash dollar percent', input: 'a@b#c$d%e', expected: 'a b c d e' },
    {
      name: 'caret amp asterisk plus equals tilde',
      input: 'a^b&c*d+e=f~g',
      expected: 'a b c d e f g',
    },
    { name: 'AT&T folds ampersand to separator', input: 'AT&T', expected: 'at t' },
    { name: 'punctuation-only input yields empty key', input: '.,;:!?', expected: '' },
    { name: 'chars outside the set pass through', input: 'a<b>c §5', expected: 'a<b>c §5' },
  ])('$name', ({ input, expected }) => {
    expect(canonicalKey(input)).toBe(expected);
  });
});

describe('canonicalKey: nbsp fold', () => {
  it('folds NBSP to space and collapses', () => {
    expect(canonicalKey('Offer\u00A0\u00A0A')).toBe('offer a');
  });
});

describe('canonicalKey: convergence (dedup key)', () => {
  it('quote/dash/punctuation/NBSP variants of the same name yield ONE key', () => {
    const variants = [
      '“Acme”–Co\u00A0Ltd', // curly quotes / en-dash / NBSP
      '"ACME"-Co Ltd', // ascii quotes / hyphen
      'Acme.Co Ltd', // dot separator
      'Acme Co Ltd', // plain
      'Acme_Co Ltd', // underscore
      '(Acme) Co, Ltd', // brackets + comma
    ];
    const keys = new Set(variants.map(canonicalKey));
    expect([...keys]).toEqual(['acme co ltd']);
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
    const once = canonicalKey('“Offer—A” (Ltd.)');
    expect(canonicalKey(once)).toBe(once);
  });
});
