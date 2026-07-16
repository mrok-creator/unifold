import {
  collapseSpaces,
  foldHomoglyphs,
  replaceControlWithSpace,
  stripBom,
  stripZeroWidth,
  trimEdges,
} from '../shared/folds.js';
import { foldCase, foldNbspToSpace, foldQuotes, foldSeparatorsToSpace } from './folds.js';

/** Ordered folds: storage-level cleanup first, then matching-only folds, then final cleanup. */
const KEY_FOLDS: readonly ((input: string) => string)[] = [
  foldHomoglyphs,
  stripBom,
  replaceControlWithSpace,
  stripZeroWidth,
  foldNbspToSpace,
  foldSeparatorsToSpace,
  foldQuotes,
  foldCase,
  trimEdges,
  collapseSpaces,
];

/**
 * Builds an ephemeral, matching-only canonical key: all storage-level sanitize
 * folds plus case folding, dash/underscore/quote unification and NBSP folding.
 * Never intended for storage — persist the sanitized value and compare on this key.
 *
 * @example
 * ```ts
 * canonicalKey('Offer-A') === canonicalKey('offer_a'); // true
 * ```
 */
export function canonicalKey(input: string): string {
  return KEY_FOLDS.reduce((value, fold) => fold(value), input);
}
