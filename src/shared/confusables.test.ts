import { describe, expect, it } from 'vitest';
import { CONFUSABLES_UNICODE_VERSION, latinLookalike } from './confusables.js';

describe('latinLookalike', () => {
  it.each([
    { name: 'cyrillic small a', input: 'а', expected: 'a' },
    { name: 'cyrillic small e', input: 'е', expected: 'e' },
    { name: 'cyrillic small o', input: 'о', expected: 'o' },
    { name: 'cyrillic small er (р)', input: 'р', expected: 'p' },
    { name: 'cyrillic small es (с)', input: 'с', expected: 'c' },
    { name: 'cyrillic capital A', input: 'А', expected: 'A' },
    { name: 'cyrillic capital ER (Р)', input: 'Р', expected: 'P' },
    { name: 'cyrillic byelorussian-ukrainian i (і)', input: 'і', expected: 'i' },
  ])('maps $name to "$expected"', ({ input, expected }) => {
    expect(latinLookalike(input)).toBe(expected);
  });

  it.each([
    { name: 'latin a passes through', input: 'a' },
    { name: 'cyrillic be (б) has no basic-latin-letter prototype', input: 'б' },
    { name: 'digit', input: '1' },
    { name: 'empty string', input: '' },
  ])('$name → undefined', ({ input }) => {
    expect(latinLookalike(input)).toBeUndefined();
  });
});

describe('CONFUSABLES_UNICODE_VERSION', () => {
  it('is a pinned semver-like version', () => {
    expect(CONFUSABLES_UNICODE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
