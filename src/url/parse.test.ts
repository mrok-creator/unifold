import { describe, expect, it } from 'vitest';
import { parseUrl, serializeUrl, splitAuthority } from './parse.js';

describe('parseUrl', () => {
  it.each([
    {
      name: 'full https URL',
      input: 'https://user@Example.COM:8443/a/b?q=1#frag',
      expected: {
        scheme: 'https',
        separator: '://',
        authority: 'user@Example.COM:8443',
        path: '/a/b',
        query: '?q=1',
        fragment: '#frag',
      },
    },
    {
      name: 'protocol-relative',
      input: '//cdn.example.com/x',
      expected: {
        scheme: null,
        separator: '//',
        authority: 'cdn.example.com',
        path: '/x',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'schemeless host with port (spec example)',
      input: 'example.com:80/x',
      expected: {
        scheme: null,
        separator: '',
        authority: 'example.com:80',
        path: '/x',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'schemeless host only',
      input: 'Example.COM',
      expected: {
        scheme: null,
        separator: '',
        authority: 'Example.COM',
        path: '',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'localhost with port is authority, not scheme',
      input: 'localhost:8080/x',
      expected: {
        scheme: null,
        separator: '',
        authority: 'localhost:8080',
        path: '/x',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'opaque scheme (mailto)',
      input: 'MAILTO:John@example.com',
      expected: {
        scheme: 'MAILTO',
        separator: ':',
        authority: null,
        path: 'John@example.com',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'relative path without dots stays path',
      input: 'just/a/path',
      expected: {
        scheme: null,
        separator: '',
        authority: null,
        path: 'just/a/path',
        query: '',
        fragment: '',
      },
    },
    {
      name: 'query and fragment split, fragment may contain ?',
      input: 'https://a.com/p?x=1#f?g',
      expected: {
        scheme: 'https',
        separator: '://',
        authority: 'a.com',
        path: '/p',
        query: '?x=1',
        fragment: '#f?g',
      },
    },
    {
      name: 'empty string',
      input: '',
      expected: { scheme: null, separator: '', authority: null, path: '', query: '', fragment: '' },
    },
  ])('$name', ({ input, expected }) => {
    expect(parseUrl(input)).toEqual(expected);
  });

  it.each([
    'https://user@Example.COM:8443/a//b?q=//1#frag',
    '//cdn.example.com//x',
    'example.com:80//x',
    'MAILTO:John@example.com',
    'just/a/path',
    'https://a.com/p?x=1#f?g',
    '?only-query',
    '#only-fragment',
    '',
    'weird stuff ​ here',
    'https://пример.укр/шлях?q=значення#фраґмент',
    'https://a.com/\u{1F600}/é?x=﻿',
  ])('round-trips %j', (input) => {
    expect(serializeUrl(parseUrl(input))).toBe(input);
  });
});

describe('splitAuthority', () => {
  it.each([
    {
      name: 'host only',
      input: 'example.com',
      expected: { userinfo: '', host: 'example.com', port: '' },
    },
    {
      name: 'host+port',
      input: 'example.com:80',
      expected: { userinfo: '', host: 'example.com', port: ':80' },
    },
    {
      name: 'userinfo@host:port',
      input: 'u:p@h.com:8080',
      expected: { userinfo: 'u:p@', host: 'h.com', port: ':8080' },
    },
    {
      name: 'IPv6 with port',
      input: '[::1]:443',
      expected: { userinfo: '', host: '[::1]', port: ':443' },
    },
    {
      name: 'IPv6 without port',
      input: '[2001:db8::1]',
      expected: { userinfo: '', host: '[2001:db8::1]', port: '' },
    },
  ])('$name', ({ input, expected }) => {
    expect(splitAuthority(input)).toEqual(expected);
    const { userinfo, host, port } = splitAuthority(input);
    expect(userinfo + host + port).toBe(input);
  });
});
