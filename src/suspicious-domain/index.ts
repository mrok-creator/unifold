import type { SuspiciousDomainResult } from '../types.js';
import { detectScripts } from '../shared/script-detect.js';

/**
 * Flags a host whose letters mix scripts (e.g. Cyrillic look-alikes inside a
 * Latin domain — `pаypal.com` vs `paypal.com`). Detection only: the host is
 * never rewritten, because auto-fixing could break a legitimate domain.
 *
 * @param host - The host/domain to inspect, as-is (no URL parsing is applied).
 *
 * @remarks
 * Pass the decoded Unicode host: punycode (`xn--`) labels are NOT decoded, so
 * an encoded look-alike domain will not be flagged. Opt-in punycode decoding
 * is planned for a future release.
 *
 * @example
 * ```ts
 * suspiciousDomain('pаypal.com');
 * // { host: 'pаypal.com', suspicious: true, reason: 'mixed-script', scripts: ['latin', 'cyrillic'] }
 * ```
 */
export function suspiciousDomain(host: string): SuspiciousDomainResult {
  const scripts = detectScripts(host);
  if (scripts.length > 1) {
    return { host, suspicious: true, reason: 'mixed-script', scripts };
  }
  return { host, suspicious: false, scripts };
}
