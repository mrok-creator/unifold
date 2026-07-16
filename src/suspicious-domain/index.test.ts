import { describe, expect, it } from 'vitest';
import { suspiciousDomain } from './index.js';

describe('suspiciousDomain: mixed-script detection', () => {
  it('flags a latin host with a cyrillic look-alike char', () => {
    const result = suspiciousDomain('pаypal.com');
    expect(result).toEqual({
      host: 'pаypal.com',
      suspicious: true,
      reason: 'mixed-script',
      scripts: ['latin', 'cyrillic'],
    });
  });

  it.each([
    { name: 'pure latin host', host: 'paypal.com', scripts: ['latin'] },
    { name: 'pure cyrillic host', host: 'приклад.укр', scripts: ['cyrillic'] },
    { name: 'digits-only host', host: '127.0.0.1', scripts: [] },
    { name: 'empty host', host: '', scripts: [] },
  ])('does not flag $name', ({ host, scripts }) => {
    const result = suspiciousDomain(host);
    expect(result.suspicious).toBe(false);
    expect(result.reason).toBeUndefined();
    expect(result.scripts).toEqual(scripts);
    expect(result.host).toBe(host);
  });

  it('never rewrites the host (flag only)', () => {
    const host = 'pаypal.com';
    expect(suspiciousDomain(host).host).toBe(host);
  });
});
