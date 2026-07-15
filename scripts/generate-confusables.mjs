#!/usr/bin/env node
/**
 * Generates src/generated/confusables.ts from Unicode confusables.txt (UTS #39).
 *
 * Scope: single-codepoint Cyrillic sources (U+0400–U+04FF, U+0500–U+052F) whose
 * confusable prototype is a single Basic Latin letter (A–Z, a–z). Multi-codepoint
 * sequences and non-letter targets (digits, punctuation) are intentionally excluded.
 *
 * Usage:
 *   node scripts/generate-confusables.mjs          # download pinned version
 *   node scripts/generate-confusables.mjs <file>   # parse a local confusables.txt
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const UNICODE_VERSION = '16.0.0';
const SOURCE_URL = `https://www.unicode.org/Public/security/${UNICODE_VERSION}/confusables.txt`;
const OUT_PATH = resolve('src/generated/confusables.ts');

const isCyrillic = (cp) => (cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f);
const isBasicLatinLetter = (cp) => (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);

function parseConfusables(text) {
  /** @type {Map<number, number>} */
  const pairs = new Map();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;
    const fields = line.split(';').map((f) => f.trim());
    if (fields.length < 2) continue;
    const sourceCps = fields[0].split(/\s+/).map((h) => Number.parseInt(h, 16));
    const targetCps = fields[1].split(/\s+/).map((h) => Number.parseInt(h, 16));
    if (sourceCps.length !== 1 || targetCps.length !== 1) continue;
    const [source] = sourceCps;
    const [target] = targetCps;
    if (!isCyrillic(source) || !isBasicLatinLetter(target)) continue;
    pairs.set(source, target);
  }
  return pairs;
}

function renderModule(pairs) {
  const entries = [...pairs.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(
      ([source, target]) =>
        `  '\\u${source.toString(16).padStart(4, '0')}': '${String.fromCodePoint(target)}',`,
    )
    .join('\n');
  return `/**
 * GENERATED FILE — DO NOT EDIT. Regenerate with \`pnpm generate:confusables\`.
 *
 * Single-codepoint Cyrillic → Basic Latin letter confusable prototypes.
 * Source: ${SOURCE_URL}
 * Unicode version: ${UNICODE_VERSION}
 */
export const CONFUSABLES_UNICODE_VERSION = '${UNICODE_VERSION}';

export const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
${entries}
};
`;
}

const localPath = process.argv[2];
const text = localPath
  ? await readFile(localPath, 'utf8')
  : await (async () => {
      const response = await fetch(SOURCE_URL);
      if (!response.ok) throw new Error(`Failed to download ${SOURCE_URL}: ${response.status}`);
      return response.text();
    })();

const pairs = parseConfusables(text);
if (pairs.size < 20)
  throw new Error(`Suspiciously few mappings (${pairs.size}) — check the source file.`);
await mkdir(dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, renderModule(pairs), 'utf8');
console.log(`Wrote ${pairs.size} mappings (Unicode ${UNICODE_VERSION}) to ${OUT_PATH}`);
