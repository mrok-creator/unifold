import type { UrlRuleId } from '../types.js';
import type { RuleUnit } from '../shared/rule-pipeline.js';
import { stripBom, stripControl, stripZeroWidth } from '../shared/folds.js';
import { parseUrl, serializeUrl, splitAuthority } from './parse.js';
import type { UrlParts } from './parse.js';

const DEFAULT_PORTS: Readonly<Record<string, string>> = { http: ':80', https: ':443' };
const PERCENT_TRIPLET_PATTERN = /%[0-9a-f]{2}/g;
const SLASH_RUN_PATTERN = /\/{2,}/g;

function withAuthority(
  input: string,
  transform: (authority: string, parts: UrlParts) => string,
): string {
  const parts = parseUrl(input);
  if (parts.authority === null) return input;
  const authority = transform(parts.authority, parts);
  return serializeUrl({ ...parts, authority });
}

function withPath(input: string, transform: (path: string) => string): string {
  const parts = parseUrl(input);
  return serializeUrl({ ...parts, path: transform(parts.path) });
}

// Edge trim limited to ASCII whitespace + NBSP: native trim() would eat
// U+FEFF, which the invisible rule must audit.
const LEADING_EDGE_WHITESPACE = /^[ \t\r\n\u00A0]+/;
const TRAILING_EDGE_WHITESPACE = /[ \t\r\n\u00A0]+$/;

function urlTrim(input: string): string {
  return input.replace(LEADING_EDGE_WHITESPACE, '').replace(TRAILING_EDGE_WHITESPACE, '');
}

const trimRule: RuleUnit<UrlRuleId> = { id: 'trim', apply: urlTrim };

const invisibleRule: RuleUnit<UrlRuleId> = {
  id: 'invisible',
  apply: (input) => stripZeroWidth(stripControl(stripBom(input))),
};

const schemeLowercaseRule: RuleUnit<UrlRuleId> = {
  id: 'scheme-lowercase',
  apply: (input) => {
    const parts = parseUrl(input);
    if (parts.scheme === null) return input;
    return serializeUrl({ ...parts, scheme: parts.scheme.toLowerCase() });
  },
};

const hostLowercaseRule: RuleUnit<UrlRuleId> = {
  id: 'host-lowercase',
  apply: (input) =>
    withAuthority(input, (authority) => {
      const { userinfo, host, port } = splitAuthority(authority);
      return userinfo + host.toLowerCase() + port;
    }),
};

const defaultPortRule: RuleUnit<UrlRuleId> = {
  id: 'default-port',
  apply: (input) =>
    withAuthority(input, (authority, parts) => {
      const { userinfo, host, port } = splitAuthority(authority);
      const scheme = parts.scheme?.toLowerCase() ?? null;
      const isDefault =
        scheme === null ? port === ':80' || port === ':443' : port === DEFAULT_PORTS[scheme];
      return isDefault ? userinfo + host : userinfo + host + port;
    }),
};

const percentEncodingUppercaseRule: RuleUnit<UrlRuleId> = {
  id: 'percent-encoding-uppercase',
  apply: (input) =>
    withPath(input, (path) => path.replace(PERCENT_TRIPLET_PATTERN, (m) => m.toUpperCase())),
};

const collapseSlashesRule: RuleUnit<UrlRuleId> = {
  id: 'collapse-slashes',
  apply: (input) => withPath(input, (path) => path.replace(SLASH_RUN_PATTERN, '/')),
};

/** RFC 3986-safe rules in spec order. Query, fragment and www are never touched. */
export const urlRules: readonly RuleUnit<UrlRuleId>[] = [
  trimRule,
  invisibleRule,
  schemeLowercaseRule,
  hostLowercaseRule,
  defaultPortRule,
  percentEncodingUppercaseRule,
  collapseSlashesRule,
];
