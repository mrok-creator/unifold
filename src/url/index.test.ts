import { describe, expect, it } from 'vitest';
import { normalizeUrl } from './index.js';

describe('normalizeUrl: trim', () => {
  it('trims surrounding whitespace and records the change', () => {
    const result = normalizeUrl(' https://example.com/A \n');
    expect(result.value).toBe('https://example.com/A');
    expect(result.changes[0]).toEqual({
      rule: 'trim',
      before: ' https://example.com/A \n',
      after: 'https://example.com/A',
    });
  });
});

describe('normalizeUrl: invisible', () => {
  it('strips BOM/control/zero-width outright', () => {
    const result = normalizeUrl('\uFEFFhttps://exam\u200Bple.com/a');
    expect(result.value).toBe('https://example.com/a');
    expect(result.changes.map((c) => c.rule)).toEqual(['invisible']);
  });

  it('strips an interior control char with a single invisible change', () => {
    const result = normalizeUrl('https://exa\u0000mple.com/x');
    expect(result.value).toBe('https://example.com/x');
    expect(result.changes).toEqual([
      {
        rule: 'invisible',
        before: 'https://exa\u0000mple.com/x',
        after: 'https://example.com/x',
      },
    ]);
  });
});

describe('normalizeUrl: scheme-lowercase', () => {
  it.each([
    { name: 'HTTP scheme', input: 'HTTP://example.com', expected: 'http://example.com' },
    { name: 'Https scheme', input: 'Https://example.com', expected: 'https://example.com' },
    {
      name: 'opaque scheme lowercased, rest untouched',
      input: 'MAILTO:John@Example.com',
      expected: 'mailto:John@Example.com',
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });
});

describe('normalizeUrl: host-lowercase', () => {
  it.each([
    {
      name: 'host lowered, path case kept',
      input: 'https://Example.COM/CaseSensitive/Path',
      expected: 'https://example.com/CaseSensitive/Path',
    },
    { name: 'schemeless host lowered', input: 'Example.COM/Path', expected: 'example.com/Path' },
    {
      name: 'userinfo untouched',
      input: 'https://UserName@Example.com/',
      expected: 'https://UserName@example.com/',
    },
    {
      // Documents current behavior: full Unicode lowercasing, not ASCII-only —
      // Turkish İ (U+0130) folds to i + combining dot above (U+0069 U+0307).
      name: 'exotic unicode host is fully lowercased',
      input: 'https://\u0130.com/x',
      expected: 'https://i\u0307.com/x',
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });
});

describe('normalizeUrl: default-port', () => {
  it.each([
    {
      name: 'http :80 stripped',
      input: 'http://example.com:80/x',
      expected: 'http://example.com/x',
    },
    {
      name: 'https :443 stripped',
      input: 'https://example.com:443/x',
      expected: 'https://example.com/x',
    },
    {
      name: 'schemeless :80 stripped (spec example)',
      input: 'example.com:80/x',
      expected: 'example.com/x',
    },
    {
      name: 'non-default port kept',
      input: 'https://example.com:8443/x',
      expected: 'https://example.com:8443/x',
    },
    {
      name: 'http :443 kept (not its default)',
      input: 'http://example.com:443/x',
      expected: 'http://example.com:443/x',
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });
});

describe('normalizeUrl: percent-encoding-uppercase', () => {
  it.each([
    { name: 'path %2f → %2F', input: 'https://a.com/x%2fy', expected: 'https://a.com/x%2Fy' },
    { name: 'query untouched', input: 'https://a.com/p?u=%2f', expected: 'https://a.com/p?u=%2f' },
    { name: 'fragment untouched', input: 'https://a.com/p#%2f', expected: 'https://a.com/p#%2f' },
    {
      name: 'already uppercase unchanged',
      input: 'https://a.com/x%2Fy',
      expected: 'https://a.com/x%2Fy',
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });

  it.each([
    { name: 'mixed-case %aF → %AF', input: 'https://a.com/x%aFy', expected: 'https://a.com/x%AFy' },
    { name: 'mixed-case %Af → %AF', input: 'https://a.com/x%Afy', expected: 'https://a.com/x%AFy' },
  ])('$name', ({ input, expected }) => {
    const result = normalizeUrl(input);
    expect(result.value).toBe(expected);
    expect(result.changes).toEqual([
      { rule: 'percent-encoding-uppercase', before: input, after: expected },
    ]);
  });

  it('opaque scheme body %2f untouched', () => {
    const result = normalizeUrl('urn:example:a%2fb');
    expect(result.value).toBe('urn:example:a%2fb');
    expect(result.changed).toBe(false);
    expect(result.changes).toEqual([]);
  });
});

describe('normalizeUrl: collapse-slashes', () => {
  it.each([
    {
      name: 'path // collapsed',
      input: 'https://example.com//path//x',
      expected: 'https://example.com/path/x',
    },
    {
      name: ':// never touched',
      input: 'https://example.com/path',
      expected: 'https://example.com/path',
    },
    {
      name: 'protocol-relative // host kept',
      input: '//cdn.example.com//assets',
      expected: '//cdn.example.com/assets',
    },
    {
      name: 'schemeless path collapsed (spec example)',
      input: 'example.com//path//x',
      expected: 'example.com/path/x',
    },
    {
      name: 'query // untouched',
      input: 'https://a.com/p?next=https://b.com//x',
      expected: 'https://a.com/p?next=https://b.com//x',
    },
    {
      name: 'fragment // untouched',
      input: 'https://a.com/p#//section',
      expected: 'https://a.com/p#//section',
    },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });

  it.each([
    { name: 'opaque scheme body // untouched', input: 'mailto:a//b', expected: 'mailto:a//b' },
    {
      name: 'data URI body untouched',
      input: 'data:text/plain,a//b',
      expected: 'data:text/plain,a//b',
    },
  ])('$name', ({ input, expected }) => {
    const result = normalizeUrl(input);
    expect(result.value).toBe(expected);
    expect(result.changed).toBe(false);
    expect(result.changes).toEqual([]);
  });
});

describe('normalizeUrl: never touches www / trailing slash / query / fragment', () => {
  it.each([
    { name: 'www kept', input: 'https://www.example.com/x', expected: 'https://www.example.com/x' },
    {
      name: 'no trailing slash added',
      input: 'https://example.com',
      expected: 'https://example.com',
    },
    {
      name: 'trailing slash kept',
      input: 'https://example.com/',
      expected: 'https://example.com/',
    },
    {
      name: 'utm query kept byte-for-byte',
      input: 'https://a.com/p?utm_source=fb&sub=1#section2',
      expected: 'https://a.com/p?utm_source=fb&sub=1#section2',
    },
  ])('$name', ({ input, expected }) => {
    const result = normalizeUrl(input);
    expect(result.value).toBe(expected);
    expect(result.changed).toBe(false);
    expect(result.changes).toEqual([]);
  });
});

describe('normalizeUrl: combined + malformed', () => {
  it('applies the full ordered pipeline with audit entries', () => {
    const result = normalizeUrl(' HTTP://Example.COM:80//a%2fb?UTM=x#Frag ');
    expect(result.value).toBe('http://example.com/a%2Fb?UTM=x#Frag');
    expect(result.changes.map((c) => c.rule)).toEqual([
      'trim',
      'scheme-lowercase',
      'host-lowercase',
      'default-port',
      'percent-encoding-uppercase',
      'collapse-slashes',
    ]);
    expect(result.changed).toBe(true);
  });

  it.each([
    { name: 'empty string', input: '', expected: '' },
    {
      name: 'garbage returns typed result, never throws',
      input: ':::not a url:::',
      expected: ':::not a url:::',
    },
    { name: 'relative path untouched', input: 'just/a/path', expected: 'just/a/path' },
  ])('$name', ({ input, expected }) => {
    expect(normalizeUrl(input).value).toBe(expected);
  });
});
