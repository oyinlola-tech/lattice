/**
 * @zudo/core/configuration/schema
 *
 * Configuration schemas and validation.
 */

export {
  createConfigurationSchema,
  ConfigurationSchemaRegistry,
  createConfigurationSchemaRegistry,
} from "./configurationSchema.schema.js";

export type {
  ConfigurationValidationResult,
  ConfigurationValidationIssue,
  ConfigurationValidationContext,
  ConfigurationValidator,
  ConfigurationSchema,
  ConfigurationSchemaOptions,
} from "./configurationSchema.schema.js";

export {
  validateConfiguration,
  validateConfigurationOrThrow,
  validateSchema,
} from "./configurationValidation.validator.js";

export type {
  ConfigurationValidationReport,
  ConfigurationValidationOptions,
} from "./configurationValidation.validator.js";
