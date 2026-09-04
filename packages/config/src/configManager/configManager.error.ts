/**
 * @zudojs/config/configManager/configManager.error
 *
 * ConfigurationManager error types re-exported from @zudojs/errors.
 */

import {
  ConfigurationError,
  createConfigurationError,
  isConfigurationError,
  missingConfigurationError,
  invalidConfigurationError,
} from "@zudojs/errors";

/**
 * Error thrown when complete configuration validation fails.
 *
 * Re-exported as a configuration-specific variant of
 * the base ConfigurationError from @zudojs/errors.
 */
export class ConfigManagerValidationError extends ConfigurationError {
  readonly issues: readonly unknown[];

  constructor(issues: readonly unknown[]) {
    super(
      `Configuration validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}.`,
      {
        configKey: "configuration",
        component: "ConfigurationManager",
      },
    );

    this.issues = Object.freeze([...issues]);
  }
}

export {
  ConfigurationError,
  createConfigurationError,
  isConfigurationError,
  missingConfigurationError,
  invalidConfigurationError,
};
