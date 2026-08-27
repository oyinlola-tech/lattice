import type {
  Configuration,
} from "../core/configuration.js";

import type {
  ConfigurationLoadResult,
} from "../loader/configurationLoader.loader.js";

import type {
  ConfigurationValidationReport,
} from "../schema/configurationValidation.validator.js";

import type {
  ConfigurationManagerState,
} from "../configurationManager.manager.js";

/**
 * Base contract for all configuration events.
 */
export interface ConfigurationEvent {
  /**
   * Unique event name.
   */
  readonly type: string;

  /**
   * Time at which the event occurred.
   */
  readonly timestamp: Date;

  /**
   * Configuration manager state associated with the event.
   */
  readonly state: ConfigurationManagerState;
}

/**
 * Emitted before configuration initialization begins.
 */
export interface ConfigurationInitializingEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.initializing";
}

/**
 * Emitted after configuration sources have been loaded.
 */
export interface ConfigurationLoadedEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.loaded";

  /**
   * Result produced by the configuration loader.
   */
  readonly result: ConfigurationLoadResult;

  /**
   * Loaded configuration.
   */
  readonly configuration: Configuration;
}

/**
 * Emitted after configuration validation succeeds.
 */
export interface ConfigurationValidatedEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.validated";

  /**
   * Validation report.
   */
  readonly validation: ConfigurationValidationReport;

  /**
   * Validated configuration.
   */
  readonly configuration: Configuration;
}

/**
 * Emitted when configuration initialization completes
 * successfully.
 */
export interface ConfigurationReadyEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.ready";

  /**
   * Active configuration.
   */
  readonly configuration: Configuration;

  /**
   * Validation report.
   */
  readonly validation: ConfigurationValidationReport;
}

/**
 * Emitted when configuration initialization or reload fails.
 */
export interface ConfigurationFailedEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.failed";

  /**
   * Error that caused the failure.
   */
  readonly error: unknown;

  /**
   * Configuration that was active before the failure,
   * when available.
   */
  readonly previousConfiguration?:
    Configuration;
}

/**
 * Emitted before a configuration reload begins.
 */
export interface ConfigurationReloadingEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.reloading";

  /**
   * Configuration currently in use.
   */
  readonly previousConfiguration:
    Configuration;
}

/**
 * Emitted after a configuration reload succeeds.
 */
export interface ConfigurationReloadedEvent
  extends ConfigurationEvent
{
  readonly type:
    "configuration.reloaded";

  /**
   * Previous configuration.
   */
  readonly previousConfiguration:
    Configuration;

  /**
   * New active configuration.
   */
  readonly configuration:
    Configuration;

  /**
   * Load result for the new configuration.
   */
  readonly load:
    ConfigurationLoadResult;

  /**
   * Validation result for the new configuration.
   */
  readonly validation:
    ConfigurationValidationReport;
}

/**
 * Union of all configuration lifecycle events.
 */
export type ConfigurationLifecycleEvent =
  | ConfigurationInitializingEvent
  | ConfigurationLoadedEvent
  | ConfigurationValidatedEvent
  | ConfigurationReadyEvent
  | ConfigurationFailedEvent
  | ConfigurationReloadingEvent
  | ConfigurationReloadedEvent;

/**
 * Configuration event type names.
 */
export const ConfigurationEventType = Object.freeze({
  INITIALIZING:
    "configuration.initializing",

  LOADED:
    "configuration.loaded",

  VALIDATED:
    "configuration.validated",

  READY:
    "configuration.ready",

  FAILED:
    "configuration.failed",

  RELOADING:
    "configuration.reloading",

  RELOADED:
    "configuration.reloaded",
} as const);

/**
 * Type representing a valid configuration event name.
 */
export type ConfigurationEventTypeValue =
  typeof ConfigurationEventType[
    keyof typeof ConfigurationEventType
  ];

/**
 * Configuration event listener.
 */
export type ConfigurationEventListener<
  T extends ConfigurationLifecycleEvent =
    ConfigurationLifecycleEvent,
> = (
  event: T,
) =>
  | void
  | Promise<void>;

/**
 * Creates the base metadata shared by configuration events.
 */
export function createConfigurationEventBase(
  type: string,
  state: ConfigurationManagerState,
): ConfigurationEvent {
  return {
    type,
    timestamp: new Date(),
    state,
  };
}

/**
 * Creates a configuration initializing event.
 */
export function createConfigurationInitializingEvent(
  state: ConfigurationManagerState,
): ConfigurationInitializingEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.INITIALIZING,
      state,
    ),
    type:
      ConfigurationEventType.INITIALIZING,
  };
}

/**
 * Creates a configuration loaded event.
 */
export function createConfigurationLoadedEvent(
  state: ConfigurationManagerState,
  result: ConfigurationLoadResult,
): ConfigurationLoadedEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.LOADED,
      state,
    ),
    type:
      ConfigurationEventType.LOADED,
    result,
    configuration:
      result.configuration,
  };
}

/**
 * Creates a configuration validated event.
 */
export function createConfigurationValidatedEvent(
  state: ConfigurationManagerState,
  configuration: Configuration,
  validation: ConfigurationValidationReport,
): ConfigurationValidatedEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.VALIDATED,
      state,
    ),
    type:
      ConfigurationEventType.VALIDATED,
    configuration,
    validation,
  };
}

/**
 * Creates a configuration ready event.
 */
export function createConfigurationReadyEvent(
  state: ConfigurationManagerState,
  configuration: Configuration,
  validation: ConfigurationValidationReport,
): ConfigurationReadyEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.READY,
      state,
    ),
    type:
      ConfigurationEventType.READY,
    configuration,
    validation,
  };
}

/**
 * Creates a configuration failed event.
 */
export function createConfigurationFailedEvent(
  state: ConfigurationManagerState,
  error: unknown,
  previousConfiguration?: Configuration,
): ConfigurationFailedEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.FAILED,
      state,
    ),
    type:
      ConfigurationEventType.FAILED,
    error,
    previousConfiguration,
  };
}

/**
 * Creates a configuration reloading event.
 */
export function createConfigurationReloadingEvent(
  state: ConfigurationManagerState,
  previousConfiguration: Configuration,
): ConfigurationReloadingEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.RELOADING,
      state,
    ),
    type:
      ConfigurationEventType.RELOADING,
    previousConfiguration,
  };
}

/**
 * Creates a configuration reloaded event.
 */
export function createConfigurationReloadedEvent(
  state: ConfigurationManagerState,
  previousConfiguration: Configuration,
  configuration: Configuration,
  load: ConfigurationLoadResult,
  validation: ConfigurationValidationReport,
): ConfigurationReloadedEvent {
  return {
    ...createConfigurationEventBase(
      ConfigurationEventType.RELOADED,
      state,
    ),
    type:
      ConfigurationEventType.RELOADED,
    previousConfiguration,
    configuration,
    load,
    validation,
  };
}