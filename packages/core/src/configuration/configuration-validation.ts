import type {
  Configuration,
} from "./configuration.js";

import {
  ConfigurationSchemaRegistry,
} from "./configuration-schema.js";

import type {
  ConfigurationSchema,
  ConfigurationValidationIssue,
  ConfigurationValidationResult,
} from "./configuration-schema.js";

import {
  FrameworkError,
} from "../errors/framework-error.js";

import {
  ErrorCode,
} from "../errors/error-code.js";

/**
 * Result returned after validating configuration.
 */
export interface ConfigurationValidationReport {
  /**
   * Whether every registered schema passed validation.
   */
  readonly valid: boolean;

  /**
   * The configuration that was validated.
   */
  readonly configuration: Configuration;

  /**
   * All validation issues discovered.
   */
  readonly issues: readonly ConfigurationValidationIssue[];

  /**
   * Number of schemas that were evaluated.
   */
  readonly schemaCount: number;

  /**
   * Number of schemas that passed validation.
   */
  readonly validSchemaCount: number;

  /**
   * Number of schemas that failed validation.
   */
  readonly invalidSchemaCount: number;
}

/**
 * Options controlling configuration validation.
 */
export interface ConfigurationValidationOptions {
  /**
   * Whether validation should stop after the first
   * failed schema.
   *
   * Defaults to false.
   *
   * Keeping this false gives developers a complete list
   * of configuration problems during startup.
   */
  readonly failFast?: boolean;
}

/**
 * Error thrown when configuration validation fails.
 */
export class ConfigurationValidationError
  extends FrameworkError
{
  /**
   * All configuration validation issues.
   */
  public readonly issues: readonly ConfigurationValidationIssue[];

  /**
   * Number of schemas evaluated.
   */
  public readonly schemaCount: number;

  /**
   * Number of invalid schemas.
   */
  public readonly invalidSchemaCount: number;

  public constructor(
    issues: readonly ConfigurationValidationIssue[],
    schemaCount: number,
    invalidSchemaCount: number,
  ) {
    super(
      createValidationErrorMessage(
        issues,
      ),
      {
        code: ErrorCode.CONFIGURATION_VALIDATION_FAILED,
        details: {
          issues,
          schemaCount,
          invalidSchemaCount,
        },
      },
    );

    this.name =
      "ConfigurationValidationError";

    this.issues = [
      ...issues,
    ];

    this.schemaCount =
      schemaCount;

    this.invalidSchemaCount =
      invalidSchemaCount;
  }
}

/**
 * Validates a configuration against a schema registry.
 */
export async function validateConfiguration(
  configuration: Configuration,
  registry: ConfigurationSchemaRegistry,
  options: ConfigurationValidationOptions = {},
): Promise<ConfigurationValidationReport> {
  const schemas =
    registry.getAll();

  const issues: ConfigurationValidationIssue[] =
    [];

  let validSchemaCount = 0;

  let invalidSchemaCount = 0;

  for (const schema of schemas) {
    const result =
      await validateSchema(
        configuration,
        schema,
      );

    if (result.success) {
      validSchemaCount += 1;
      continue;
    }

    invalidSchemaCount += 1;

    issues.push(
      ...result.errors,
    );

    if (
      options.failFast === true
    ) {
      break;
    }
  }

  return {
    valid:
      issues.length === 0,

    configuration,

    issues,

    schemaCount:
      schemas.length,

    validSchemaCount,

    invalidSchemaCount,
  };
}

/**
 * Validates configuration and throws when validation fails.
 *
 * This is the method application bootstrap code should normally
 * use when configuration is mandatory for startup.
 */
export async function validateConfigurationOrThrow(
  configuration: Configuration,
  registry: ConfigurationSchemaRegistry,
  options: ConfigurationValidationOptions = {},
): Promise<Configuration> {
  const report =
    await validateConfiguration(
      configuration,
      registry,
      options,
    );

  if (!report.valid) {
    throw new ConfigurationValidationError(
      report.issues,
      report.schemaCount,
      report.invalidSchemaCount,
    );
  }

  return configuration;
}

/**
 * Validates one configuration schema.
 */
export async function validateSchema<T>(
  configuration: Configuration,
  schema: ConfigurationSchema<T>,
): Promise<ConfigurationValidationResult<T>> {
  try {
    return await schema.validate(
      configuration,
    );
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          path: schema.path,
          message:
            error instanceof Error
              ? error.message
              : String(error),
          code:
            "CONFIGURATION_VALIDATOR_ERROR",
        },
      ],
    };
  }
}

/**
 * Formats configuration validation issues into
 * a readable framework error message.
 */
function createValidationErrorMessage(
  issues: readonly ConfigurationValidationIssue[],
): string {
  if (issues.length === 0) {
    return "Configuration validation failed.";
  }

  const formatted =
    issues
      .map(
        (issue) =>
          `${issue.path}: ${issue.message}`,
      )
      .join("; ");

  return `Configuration validation failed: ${formatted}`;
}