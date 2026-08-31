/**
 * Feature flag evaluation engine.
 *
 * @module evaluator
 */

export { resolvePath, matchAttribute } from "./evaluatorAttribute.js";
export { evaluateRule } from "./evaluatorRule.core.js";
export type { RuleEvaluationResult } from "./evaluatorRule.core.js";
export { evaluateFlag } from "./evaluator.core.js";
