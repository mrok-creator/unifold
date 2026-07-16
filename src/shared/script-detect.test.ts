import { describe, expect, it } from 'vitest';
import { detectScripts } from './script-detect.js';

describe('detectScripts', () => {
  it.each([
    { name: 'pure latin', input: 'paypal.com', expected: ['latin'] },
    { name: 'latin with extended latin', input: 'münchen.de', expected: ['latin'] },
    { name: 'pure cyrillic', input: 'приклад', expected: ['cyrillic'] },
    { name: 'mixed latin+cyrillic', input: 'pаypal.com', expected: ['latin', 'cyrillic'] },
    { name: 'greek', input: 'αβγ', expected: ['greek'] },
    { name: 'digits/punct only — no scripts', input: '123-456.789', expected: [] },
    { name: 'empty', input: '', expected: [] },
    { name: 'whitespace-only', input: ' \t ', expected: [] },
    { name: 'astral-plane chars are ignored', input: '\u{1F600}\u{1D400}', expected: [] },
    { name: 'astral chars mixed with letters', input: '\u{1F600}abc', expected: ['latin'] },
    { name: 'math symbols × ÷ are not latin', input: '×÷', expected: [] },
    {
      name: 'order is fixed regardless of appearance',
      input: 'аp',
      expected: ['latin', 'cyrillic'],
    },
  ])('$name', ({ input, expected }) => {
    expect(detectScripts(input)).toEqual(expected);
  });
});
