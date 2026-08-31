/**
 * Feature flag error classes.
 *
 * @module featureFlagErrors
 */

export { FeatureFlagError } from "./featureFlagError.base.js";
export type { FeatureFlagErrorOptions } from "./featureFlagError.base.js";

export {
  FeatureFlagNotFoundError,
  FeatureFlagProviderError,
  FeatureFlagEvaluationError,
  FeatureFlagRuleError,
  FeatureFlagDependencyError,
  FeatureFlagConfigurationError,
  FeatureFlagTypeError,
} from "./featureFlagError.types.js";
