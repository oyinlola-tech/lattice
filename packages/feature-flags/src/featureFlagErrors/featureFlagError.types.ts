/**
 * Specific feature flag error types.
 *
 * @module featureFlagErrors/featureFlagError.types
 */

import { ErrorCode } from "@zudo/errors";
import { FeatureFlagError } from "./featureFlagError.base.js";

/** Thrown when a requested feature flag does not exist. */
export class FeatureFlagNotFoundError extends FeatureFlagError {
  public constructor(key: string) {
    super(`Feature flag not found: "${key}".`, {
      code: ErrorCode.FEATURE_FLAG_NOT_FOUND,
      expose: true,
      metadata: { key },
    });
    this.name = "FeatureFlagNotFoundError";
  }
}

/** Thrown when a feature flag provider fails. */
export class FeatureFlagProviderError extends FeatureFlagError {
  public constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly provider?: string },
  ) {
    super(message, {
      code: ErrorCode.FEATURE_FLAG_PROVIDER,
      cause: options?.cause,
      metadata: options?.provider ? { provider: options.provider } : undefined,
    });
    this.name = "FeatureFlagProviderError";
  }
}

/** Thrown when flag evaluation encounters an error. */
export class FeatureFlagEvaluationError extends FeatureFlagError {
  public constructor(key: string, reason: string) {
    super(`Evaluation failed for flag "${key}": ${reason}.`, {
      code: ErrorCode.FEATURE_FLAG_EVALUATION,
      metadata: { key, reason },
    });
    this.name = "FeatureFlagEvaluationError";
  }
}

/** Thrown when a flag rule is invalid. */
export class FeatureFlagRuleError extends FeatureFlagError {
  public constructor(key: string, reason: string) {
    super(`Invalid rule for flag "${key}": ${reason}.`, {
      code: ErrorCode.FEATURE_FLAG_RULE,
      metadata: { key, reason },
    });
    this.name = "FeatureFlagRuleError";
  }
}

/** Thrown when flag dependencies form a cycle. */
export class FeatureFlagDependencyError extends FeatureFlagError {
  public constructor(chain: readonly string[]) {
    super(`Feature flag dependency cycle detected: ${chain.join(" → ")}.`, {
      code: ErrorCode.FEATURE_FLAG_DEPENDENCY,
      metadata: { chain },
    });
    this.name = "FeatureFlagDependencyError";
  }
}

/** Thrown when flag configuration is invalid. */
export class FeatureFlagConfigurationError extends FeatureFlagError {
  public constructor(message: string) {
    super(message, {
      code: ErrorCode.FEATURE_FLAG_CONFIGURATION,
    });
    this.name = "FeatureFlagConfigurationError";
  }
}

/** Thrown when a flag value has an unexpected type. */
export class FeatureFlagTypeError extends FeatureFlagError {
  public constructor(key: string, expected: string, actual: string) {
    super(`Flag "${key}" expected ${expected} but got ${actual}.`, {
      code: ErrorCode.FEATURE_FLAG_TYPE,
      metadata: { key, expected, actual },
    });
    this.name = "FeatureFlagTypeError";
  }
}
