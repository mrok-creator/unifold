import type { SanitizeRuleId } from '../types.js';
import type { RuleUnit } from '../shared/rule-pipeline.js';
import {
  collapseSpaces,
  foldHomoglyphs,
  replaceControlWithSpace,
  stripBom,
  stripZeroWidth,
  trimEdges,
} from '../shared/folds.js';

/** Storage-level rules in spec order: homoglyphs first, cleanup after. */
export const sanitizeRules: readonly RuleUnit<SanitizeRuleId>[] = [
  { id: 'homoglyph', apply: foldHomoglyphs },
  { id: 'bom', apply: stripBom },
  { id: 'control', apply: replaceControlWithSpace },
  { id: 'zero-width', apply: stripZeroWidth },
  { id: 'trim', apply: trimEdges },
  { id: 'collapse-spaces', apply: collapseSpaces },
];
