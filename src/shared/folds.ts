import { latinLookalike } from './confusables.js';

const BOM_PATTERN = /\uFEFF/gu;
/* eslint-disable-next-line no-control-regex */
const CONTROL_PATTERN = /[\u0000-\u001F\u007F]/gu;
/* eslint-disable-next-line no-misleading-character-class */
const ZERO_WIDTH_PATTERN = /[\u200B\u200C\u200D\u2060]/gu;
const SPACE_RUN_PATTERN = / {2,}/gu;

/** Replaces each Cyrillic char that has a Basic Latin look-alike with that Latin char. */
export function foldHomoglyphs(input: string): string {
  let output = '';
  for (const char of input) {
    output += latinLookalike(char) ?? char;
  }
  return output;
}

/** Removes all BOM (U+FEFF) characters. */
export function stripBom(input: string): string {
  return input.replace(BOM_PATTERN, '');
}

/** Replaces control characters (U+0000–U+001F, U+007F) with a space. */
export function replaceControlWithSpace(input: string): string {
  return input.replace(CONTROL_PATTERN, ' ');
}

/** Removes control characters (U+0000–U+001F, U+007F) outright. */
export function stripControl(input: string): string {
  return input.replace(CONTROL_PATTERN, '');
}

/** Removes zero-width characters (U+200B, U+200C, U+200D, U+2060). */
export function stripZeroWidth(input: string): string {
  return input.replace(ZERO_WIDTH_PATTERN, '');
}

/** Trims leading/trailing whitespace. */
export function trimEdges(input: string): string {
  return input.trim();
}

/** Collapses runs of two or more ASCII spaces into one. */
export function collapseSpaces(input: string): string {
  return input.replace(SPACE_RUN_PATTERN, ' ');
}
