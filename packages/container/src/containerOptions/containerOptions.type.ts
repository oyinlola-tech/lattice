/**
 * Configuration options for the Lattice dependency injection
 * container.
 *
 * This file only defines and normalizes container options.
 * Container creation and runtime behavior belong to container.ts.
 */

import type {
  ContainerLifecycleOptions,
} from "../containerLifecycle/containerLifecycle.core.js";

import type {
  ContainerRegistryOptions,
} from "../containerRegistry/containerRegistry.type.js";

import type {
  ResolutionOptions,
} from "../containerResolution/containerResolution.type.js";

/**
 * Logging levels supported by the container.
 *
 * Logging itself is intentionally handled by the core
 * logging package.
 */
export enum ContainerLogLevel {
  /**
   * No container-specific logging.
   */
  NONE = "none",

  /**
   * Errors only.
   */
  ERROR = "error",

  /**
   * Errors and warnings.
   */
  WARN = "warn",

  /**
   * General container operations.
   */
  INFO = "info",

  /**
   * Detailed resolution information.
   */
  DEBUG = "debug",

  /**
   * Maximum diagnostic detail.
   */
  TRACE = "trace",
}

/**
 * Default container logging level.
 */
export const DEFAULT_CONTAINER_LOG_LEVEL:
  ContainerLogLevel =
  ContainerLogLevel.WARN;

/**
 * Options controlling dependency resolution.
 */
export interface ContainerResolutionOptions
  extends ResolutionOptions {
  /**
   * Whether unregistered classes can automatically be
   * registered as transient dependencies.
   *
   * Defaults to true.
   */
  readonly autoRegisterClasses?:
    boolean;

  /**
   * Whether circular dependency detection is enabled.
   *
   * Defaults to true.
   */
  readonly detectCircularDependencies?:
    boolean;

  /**
   * Maximum number of dependencies allowed in a single
   * resolution chain.
   *
   * Protects against unexpectedly deep dependency graphs.
   */
  readonly maxResolutionDepth?:
    number;
}

/**
 * Complete container configuration.
 */
export interface ContainerOptions {
  /**
   * Optional name for the container.
   *
   * Useful when an application has multiple containers.
   */
  readonly name?:
    string;

  /**
   * Registry configuration.
   */
  readonly registry?:
    ContainerRegistryOptions;

  /**
   * Lifecycle configuration.
   */
  readonly lifecycle?:
    ContainerLifecycleOptions;

  /**
   * Resolution configuration.
   */
  readonly resolution?:
    ContainerResolutionOptions;

  /**
   * Container-specific logging level.
   */
  readonly logLevel?:
    ContainerLogLevel;

  /**
   * Whether the container should automatically dispose
   * tracked resources when destroyed.
   *
   * Defaults to true.
   */
  readonly autoDispose?:
    boolean;

  /**
   * Whether child scopes may be created.
   *
   * Defaults to true.
   */
  readonly allowScopes?:
    boolean;

  /**
   * Whether registration changes should be frozen after
   * the container starts.
   *
   * Useful for production environments.
   *
   * Defaults to false.
   */
  readonly freezeRegistrations?:
    boolean;

  /**
   * Optional metadata attached to the container.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Normalized container options.
 */
export interface ResolvedContainerOptions {
  readonly name:
    string;

  readonly registry:
    ContainerRegistryOptions;

  readonly lifecycle:
    ContainerLifecycleOptions;

  readonly resolution:
    ContainerResolutionOptions;

  readonly logLevel:
    ContainerLogLevel;

  readonly autoDispose:
    boolean;

  readonly allowScopes:
    boolean;

  readonly freezeRegistrations:
    boolean;

  readonly metadata:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Default container name.
 */
export const DEFAULT_CONTAINER_NAME =
  "lattice-container";

/**
 * Default automatic disposal behavior.
 */
export const DEFAULT_AUTO_DISPOSE =
  true;

/**
 * Default scope behavior.
 */
export const DEFAULT_ALLOW_SCOPES =
  true;

/**
 * Default registration mutability.
 */
export const DEFAULT_FREEZE_REGISTRATIONS =
  false;

/**
 * Default resolution configuration.
 */
export const DEFAULT_RESOLUTION_OPTIONS:
  Required<
    Pick<
      ContainerResolutionOptions,
      | "autoRegisterClasses"
      | "detectCircularDependencies"
      | "maxResolutionDepth"
    >
  > = {
    autoRegisterClasses:
      true,

    detectCircularDependencies:
      true,

    maxResolutionDepth:
      100,
  };

/**
 * Resolves user-provided container options into a complete
 * immutable configuration object.
 */
export function resolveContainerOptions(
  options:
    ContainerOptions = {},
):
  ResolvedContainerOptions {
  const resolution:
    ContainerResolutionOptions = {
    ...options.resolution,

    autoRegisterClasses:
      options.resolution
        ?.autoRegisterClasses ??
      DEFAULT_RESOLUTION_OPTIONS
        .autoRegisterClasses,

    detectCircularDependencies:
      options.resolution
        ?.detectCircularDependencies ??
      DEFAULT_RESOLUTION_OPTIONS
        .detectCircularDependencies,

    maxResolutionDepth:
      options.resolution
        ?.maxResolutionDepth ??
      DEFAULT_RESOLUTION_OPTIONS
        .maxResolutionDepth,
  };

  validateResolutionOptions(
    resolution,
  );

  const metadata =
    options.metadata
      ? Object.freeze({
          ...options.metadata,
        })
      : Object.freeze(
          {},
        );

  return Object.freeze({
    name:
      options.name ??
      DEFAULT_CONTAINER_NAME,

    registry:
      Object.freeze({
        ...(options.registry ?? {}),
      }),

    lifecycle:
      Object.freeze({
        ...(options.lifecycle ?? {}),
      }),

    resolution:
      Object.freeze({
        ...resolution,
      }),

    logLevel:
      options.logLevel ??
      DEFAULT_CONTAINER_LOG_LEVEL,

    autoDispose:
      options.autoDispose ??
      DEFAULT_AUTO_DISPOSE,

    allowScopes:
      options.allowScopes ??
      DEFAULT_ALLOW_SCOPES,

    freezeRegistrations:
      options.freezeRegistrations ??
      DEFAULT_FREEZE_REGISTRATIONS,

    metadata,
  });
}

/**
 * Validates resolution-related configuration.
 */
export function validateResolutionOptions(
  options:
    ContainerResolutionOptions,
):
  void {
  if (
    options.maxResolutionDepth !==
      undefined &&
    (
      !Number.isInteger(
        options.maxResolutionDepth,
      ) ||
      options.maxResolutionDepth <=
        0
    )
  ) {
    throw new RangeError(
      "Container maxResolutionDepth must be a positive integer.",
    );
  }
}

/**
 * Determines whether a logging level is valid.
 */
export function isContainerLogLevel(
  value:
    unknown,
):
  value is ContainerLogLevel {
  return (
    value ===
      ContainerLogLevel.NONE ||
    value ===
      ContainerLogLevel.ERROR ||
    value ===
      ContainerLogLevel.WARN ||
    value ===
      ContainerLogLevel.INFO ||
    value ===
      ContainerLogLevel.DEBUG ||
    value ===
      ContainerLogLevel.TRACE
  );
}

/**
 * Determines whether a container is configured to allow
 * child scopes.
 */
export function allowsContainerScopes(
  options:
    ResolvedContainerOptions,
):
  boolean {
  return options.allowScopes;
}

/**
 * Determines whether automatic resource disposal is enabled.
 */
export function shouldAutoDisposeContainer(
  options:
    ResolvedContainerOptions,
):
  boolean {
  return options.autoDispose;
}

/**
 * Determines whether registrations can still be changed.
 */
export function canModifyRegistrations(
  options:
    ResolvedContainerOptions,
):
  boolean {
  return !options.freezeRegistrations;
}