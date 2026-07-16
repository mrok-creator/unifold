import { CONFUSABLES_UNICODE_VERSION, CYRILLIC_TO_LATIN } from '../generated/confusables.js';

export { CONFUSABLES_UNICODE_VERSION };

/**
 * Returns the Basic Latin letter that the given single character is confusable
 * with, or `undefined` when the character has no mapping in the generated
 * Cyrillic→Latin subset.
 */
export function latinLookalike(char: string): string | undefined {
  return CYRILLIC_TO_LATIN[char];
}
