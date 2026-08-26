/**
 * Core configuration container.
 */
export {
  Configuration,
  createConfiguration,
} from "./configuration.js";

export type {
  ConfigurationOptions,
  ConfigurationValue,
  ConfigurationSource,
  ConfigurationEntry,
} from "./configuration.js";

/**
 * Strongly typed configuration keys.
 */
export {
  createConfigurationKey,
} from "./configuration-key.js";

export type {
  ConfigurationKey,
} from "./configuration-key.js";

/**
 * Configuration source abstractions.
 */
export {
  BaseConfigurationSource,
  createConfigurationSource,
  sortConfigurationSources,
} from "./configuration-source.js";

export type {
  ConfigurationSource,
  ConfigurationSourceType,
  ConfigurationSourceEntry,
  ConfigurationSourceOptions,
} from "./configuration-source.js";

/**
 * Configuration loading pipeline.
 */
export {
  ConfigurationLoader,
  ConfigurationLoadError,
  createConfigurationLoader,
} from "./configuration-loader.js";

export type {
  ConfigurationLoaderOptions,
  ConfigurationLoadResult,
} from "./configuration-loader.js";

/**
 * Configuration provider.
 */
export {
  DefaultConfigurationProvider,
  createConfigurationProvider,
} from "./configuration-provider.js";

export type {
  ConfigurationProvider,
  ConfigurationProviderOptions,
} from "./configuration-provider.js";

/**
 * Configuration registry.
 */
export {
  ConfigurationRegistry,
  createConfigurationRegistry,
} from "./configuration-registry.js";

export type {
  ConfigurationSection,
  ConfigurationSectionOptions,
} from "./configuration-registry.js";

/**
 * Configuration schemas and schema registry.
 */
export {
  createConfigurationSchema,
  ConfigurationSchemaRegistry,
  createConfigurationSchemaRegistry,
} from "./configuration-schema.js";

export type {
  ConfigurationValidationResult,
  ConfigurationValidationIssue,
  ConfigurationValidationContext,
  ConfigurationValidator,
  ConfigurationSchema,
  ConfigurationSchemaOptions,
} from "./configuration-schema.js";

/**
 * Configuration validation engine.
 */
export {
  validateConfiguration,
  validateConfigurationOrThrow,
  validateSchema,
} from "./configuration-validation.js";

export type {
  ConfigurationValidationReport,
  ConfigurationValidationOptions,
} from "./configuration-validation.js";

/**
 * Configuration errors.
 */
export {
  ConfigurationError,
  ConfigurationSourceError,
  ConfigurationMissingError,
  ConfigurationTypeError,
  ConfigurationSchemaError,
  ConfigurationConflictError,
} from "./configuration-error.js";

export type {
  ConfigurationErrorIssue,
} from "./configuration-error.js";

/**
 * Configuration redaction and secret protection.
 */
export {
  ConfigurationRedactor,
  createConfigurationRedactor,
  redactConfiguration,
  DEFAULT_SENSITIVE_PATTERNS,
  DEFAULT_REDACTION_VALUE,
} from "./configuration-redactor.js";

export type {
  ConfigurationRedactorOptions,
  ConfigurationSensitivity,
  RedactedConfiguration,
} from "./configuration-redactor.js";

/**
 * Configuration manager.
 */
export {
  ConfigurationManager,
  ConfigurationManagerState,
  createConfigurationManager,
} from "./configuration-manager.js";

export type {
  ConfigurationManagerOptions,
  ConfigurationManagerResult,
} from "./configuration-manager.js";

/**
 * Configuration lifecycle events.
 */
export {
  ConfigurationEventType,
  createConfigurationEventBase,
  createConfigurationInitializingEvent,
  createConfigurationLoadedEvent,
  createConfigurationValidatedEvent,
  createConfigurationReadyEvent,
  createConfigurationFailedEvent,
  createConfigurationReloadingEvent,
  createConfigurationReloadedEvent,
} from "./configuration-events.js";

export type {
  ConfigurationEvent,
  ConfigurationInitializingEvent,
  ConfigurationLoadedEvent,
  ConfigurationValidatedEvent,
  ConfigurationReadyEvent,
  ConfigurationFailedEvent,
  ConfigurationReloadingEvent,
  ConfigurationReloadedEvent,
  ConfigurationLifecycleEvent,
  ConfigurationEventTypeValue,
  ConfigurationEventListener,
} from "./configuration-events.js";