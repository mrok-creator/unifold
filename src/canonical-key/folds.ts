const NBSP_PATTERN = /\u00A0/gu;

/**
 * Matching-only separator set, fixed by the domain spec. Everything here is
 * equated to a space; characters outside the set pass through unchanged.
 *
 * - general punctuation: . , ; : ! ? ( ) [ ] { } / \ | @ # $ % ^ & * + = ~
 * - underscore (storage never touches it; matching treats it as a separator)
 * - dashes of all kinds: - U+2010 U+2011 U+2012 U+2013 U+2014 U+2015 U+2212
 * - quotes of all kinds: " ' U+2018–U+201F « »
 */
const SEPARATOR_PUNCTUATION_PATTERN = /[.,;:!?()[\]{}/\\|@#$%^&*+=~_"'‐‑‒–—―−‘’‚‛“”„‟«»-]/gu;

/** Folds NBSP to a plain space (matching-only). */
export function foldNbspToSpace(input: string): string {
  return input.replace(NBSP_PATTERN, ' ');
}

/** Folds the spec's separator punctuation (incl. all dashes, quotes, underscore) to a space (matching-only). */
export function foldPunctuationToSpace(input: string): string {
  return input.replace(SEPARATOR_PUNCTUATION_PATTERN, ' ');
}

/** Locale-independent case fold (matching-only). */
export function foldCase(input: string): string {
  return input.toLowerCase();
}
