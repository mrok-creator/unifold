const NBSP_PATTERN = /\u00A0/gu;
const DASH_PATTERN = /[-_\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/gu;
const SINGLE_QUOTE_PATTERN = /[\u2018\u2019\u201A\u201B]/gu;
const DOUBLE_QUOTE_PATTERN = /[\u201C\u201D\u201E\u201F\u00AB\u00BB]/gu;

/** Folds NBSP to a plain space (matching-only). */
export function foldNbspToSpace(input: string): string {
  return input.replace(NBSP_PATTERN, ' ');
}

/** Folds dash variants, hyphen-minus and underscore separators to a space (matching-only). */
export function foldSeparatorsToSpace(input: string): string {
  return input.replace(DASH_PATTERN, ' ');
}

/** Folds typographic quote variants to straight quotes (matching-only). */
export function foldQuotes(input: string): string {
  return input.replace(SINGLE_QUOTE_PATTERN, "'").replace(DOUBLE_QUOTE_PATTERN, '"');
}

/** Locale-independent case fold (matching-only). */
export function foldCase(input: string): string {
  return input.toLowerCase();
}
