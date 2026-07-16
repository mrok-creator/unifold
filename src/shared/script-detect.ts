/** Letter scripts this library distinguishes for mixed-script detection. */
export type DetectedScript = 'latin' | 'cyrillic' | 'greek';

interface ScriptRange {
  readonly script: DetectedScript;
  readonly ranges: readonly (readonly [number, number])[];
}

const SCRIPT_RANGES: readonly ScriptRange[] = [
  {
    script: 'latin',
    // The Latin-1 block is split in two to exclude × (U+00D7) and ÷ (U+00F7),
    // which are math symbols, not letters — do not merge these ranges.
    ranges: [
      [0x0041, 0x005a],
      [0x0061, 0x007a],
      [0x00c0, 0x00d6],
      [0x00d8, 0x00f6],
      [0x00f8, 0x024f],
    ],
  },
  {
    script: 'cyrillic',
    ranges: [
      [0x0400, 0x04ff],
      [0x0500, 0x052f],
    ],
  },
  {
    script: 'greek',
    ranges: [
      [0x0370, 0x03ff],
      [0x1f00, 0x1fff],
    ],
  },
];

function scriptOf(codePoint: number): DetectedScript | undefined {
  for (const { script, ranges } of SCRIPT_RANGES) {
    for (const [low, high] of ranges) {
      if (codePoint >= low && codePoint <= high) return script;
    }
  }
  return undefined;
}

/**
 * Returns the distinct letter scripts (latin/cyrillic/greek) present in the
 * input, in a fixed deterministic order. Non-letters are ignored.
 */
export function detectScripts(input: string): readonly DetectedScript[] {
  const found = new Set<DetectedScript>();
  for (const char of input) {
    // `for...of` never yields an empty string, so codePointAt(0) is always
    // defined — the fallback only satisfies the type checker.
    /* v8 ignore next */
    const codePoint = char.codePointAt(0) ?? 0;
    const script = scriptOf(codePoint);
    if (script !== undefined) found.add(script);
  }
  return SCRIPT_RANGES.map(({ script }) => script).filter((script) => found.has(script));
}
