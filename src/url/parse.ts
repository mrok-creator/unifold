/**
 * Lossless RFC 3986-style splitter. Unlike WHATWG `new URL()`, it never
 * percent-decodes, never punycodes, never adds slashes — the invariant is
 * `serializeUrl(parseUrl(s)) === s` for every input, so untouched components
 * stay byte-for-byte identical.
 */

/** Split of a URL string into its raw components. */
export interface UrlParts {
  readonly scheme: string | null;
  readonly separator: '' | ':' | '//' | '://';
  readonly authority: string | null;
  readonly path: string;
  /** Includes the leading `?`, or empty. */
  readonly query: string;
  /** Includes the leading `#`, or empty. */
  readonly fragment: string;
}

/** Split of an authority into userinfo/host/port keeping all delimiters. */
export interface AuthorityParts {
  /** Includes the trailing `@`, or empty. */
  readonly userinfo: string;
  readonly host: string;
  /** Includes the leading `:`, or empty. */
  readonly port: string;
}

const SCHEME_PATTERN = /^([A-Za-z][A-Za-z0-9+.-]*):/;

function takeUntilPathQueryOrFragment(input: string): string {
  const end = input.search(/[/?#]/);
  return end === -1 ? input : input.slice(0, end);
}

function splitTail(rest: string): { path: string; query: string; fragment: string } {
  const hashIndex = rest.indexOf('#');
  const fragment = hashIndex === -1 ? '' : rest.slice(hashIndex);
  const beforeFragment = hashIndex === -1 ? rest : rest.slice(0, hashIndex);
  const questionIndex = beforeFragment.indexOf('?');
  const query = questionIndex === -1 ? '' : beforeFragment.slice(questionIndex);
  const path = questionIndex === -1 ? beforeFragment : beforeFragment.slice(0, questionIndex);
  return { path, query, fragment };
}

/** Splits a URL string losslessly; never throws on malformed input. */
export function parseUrl(input: string): UrlParts {
  const schemeMatch = SCHEME_PATTERN.exec(input);
  const schemeName = schemeMatch?.[1] ?? '';
  const afterScheme = schemeMatch ? input.slice(schemeMatch[0].length) : '';

  if (schemeMatch && afterScheme.startsWith('//')) {
    const rest = afterScheme.slice(2);
    const authority = takeUntilPathQueryOrFragment(rest);
    return {
      scheme: schemeName,
      separator: '://',
      authority,
      ...splitTail(rest.slice(authority.length)),
    };
  }

  // `example.com:80/x` / `localhost:8080` — a dot in the "scheme" or digits
  // right after the colon mean it is really host:port, not a scheme.
  const schemeIsHostPort =
    schemeMatch !== null && (schemeName.includes('.') || /^\d/.test(afterScheme));

  if (schemeMatch && !schemeIsHostPort) {
    return { scheme: schemeName, separator: ':', authority: null, ...splitTail(afterScheme) };
  }

  if (input.startsWith('//')) {
    const rest = input.slice(2);
    const authority = takeUntilPathQueryOrFragment(rest);
    return { scheme: null, separator: '//', authority, ...splitTail(rest.slice(authority.length)) };
  }

  const first = takeUntilPathQueryOrFragment(input);
  if (first !== '' && (first.includes('.') || schemeIsHostPort)) {
    return {
      scheme: null,
      separator: '',
      authority: first,
      ...splitTail(input.slice(first.length)),
    };
  }

  return { scheme: null, separator: '', authority: null, ...splitTail(input) };
}

/** Reassembles parts; exact inverse of {@link parseUrl}. */
export function serializeUrl(parts: UrlParts): string {
  return (
    (parts.scheme ?? '') +
    parts.separator +
    (parts.authority ?? '') +
    parts.path +
    parts.query +
    parts.fragment
  );
}

/** Splits an authority into userinfo/host/port; `userinfo + host + port` equals the input. */
export function splitAuthority(authority: string): AuthorityParts {
  const atIndex = authority.lastIndexOf('@');
  const userinfo = atIndex === -1 ? '' : authority.slice(0, atIndex + 1);
  const hostPort = authority.slice(atIndex + 1);
  const closeBracketIndex = hostPort.lastIndexOf(']');
  const colonIndex = hostPort.lastIndexOf(':');
  if (colonIndex > closeBracketIndex && /^:\d*$/.test(hostPort.slice(colonIndex))) {
    return { userinfo, host: hostPort.slice(0, colonIndex), port: hostPort.slice(colonIndex) };
  }
  return { userinfo, host: hostPort, port: '' };
}
