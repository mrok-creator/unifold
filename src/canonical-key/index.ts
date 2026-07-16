import {
  collapseSpaces,
  foldHomoglyphs,
  replaceControlWithSpace,
  stripBom,
  stripZeroWidth,
  trimEdges,
} from '../shared/folds.js';
import { foldCase, foldNbspToSpace, foldPunctuationToSpace } from './folds.js';

/** Ordered folds: storage-level cleanup first, then matching-only folds, then final cleanup. */
const KEY_FOLDS: readonly ((input: string) => string)[] = [
  foldHomoglyphs,
  stripBom,
  replaceControlWithSpace,
  stripZeroWidth,
  foldNbspToSpace,
  foldPunctuationToSpace,
  foldCase,
  trimEdges,
  collapseSpaces,
];

/**
 * Builds an ephemeral, matching-only canonical key: all storage-level sanitize
 * folds plus case folding and separator unification — general punctuation,
 * dashes of all kinds, quotes of all kinds, underscore and NBSP are equated
 * to a single space, so stylistic variants of the same name converge to one key.
 * Never intended for storage — persist the sanitized value and compare on this key.
 *
 * @example
 * ```ts
 * canonicalKey('“Acme”–Co\u00A0Ltd') === canonicalKey('Acme.Co Ltd'); // true → 'acme co ltd'
 * ```
 */
export function canonicalKey(input: string): string {
  return KEY_FOLDS.reduce((value, fold) => fold(value), input);
}
