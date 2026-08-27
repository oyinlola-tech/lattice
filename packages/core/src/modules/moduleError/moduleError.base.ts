import {
  FrameworkError,
} from "../../errors/frameworkError.error.js";

import {
  ErrorCode,
} from "../../errors/errorCode.code.js";

import type {
  ModuleId,
} from "../module.js";

/**
 * Error codes produced by the module subsystem.
 *
 * Each code maps to a canonical ErrorCode constant.
 * Uses `as const` instead of enum because ErrorCode values are strings.
 */
export const ModuleErrorCode = {
  UNKNOWN: ErrorCode.UNKNOWN_ERROR,

  INVALID_DEFINITION:
    ErrorCode.MODULE_INVALID_DEFINITION,

  INVALID_ID :
    ErrorCode.INVALID_ARGUMENT,

  DUPLICATE :
    ErrorCode.MODULE_DUPLICATE,

  NOT_FOUND :
    ErrorCode.MODULE_NOT_FOUND,

  ALREADY_REGISTERED :
    ErrorCode.MODULE_ALREADY_REGISTERED,

  NOT_REGISTERED :
    ErrorCode.MODULE_NOT_FOUND,

  INVALID_DEPENDENCY :
    ErrorCode.MODULE_INVALID_DEPENDENCY,

  MISSING_DEPENDENCY :
    ErrorCode.MODULE_MISSING_DEPENDENCY,

  CIRCULAR_DEPENDENCY :
    ErrorCode.MODULE_CIRCULAR_DEPENDENCY,

  VERSION_MISMATCH :
    ErrorCode.MODULE_VERSION_MISMATCH,

  LOAD_FAILED :
    ErrorCode.MODULE_LOAD_FAILED,

  INITIALIZATION_FAILED :
    ErrorCode.MODULE_INITIALIZATION_FAILED,

  START_FAILED :
    ErrorCode.MODULE_START_FAILED,

  STOP_FAILED :
    ErrorCode.MODULE_STOP_FAILED,

  DESTROY_FAILED :
    ErrorCode.MODULE_DESTROY_FAILED,

  INVALID_INSTANCE :
    ErrorCode.MODULE_INVALID_INSTANCE,

  INVALID_STATE :
    ErrorCode.MODULE_INVALID_STATE,

  OPERATION_IN_PROGRESS :
    ErrorCode.MODULE_OPERATION_IN_PROGRESS,

  OPERATION_NOT_ALLOWED :
    ErrorCode.MODULE_OPERATION_NOT_ALLOWED,
} as const;

/**
 * Union type of all module error code values.
 */
export type ModuleErrorCode =
  (typeof ModuleErrorCode)[keyof typeof ModuleErrorCode];

/**
 * Additional information attached to a module error.
 */
export interface ModuleErrorDetails {
  /**
   * Module that caused the error.
   */
  readonly moduleId?:
    ModuleId;

  /**
   * Related dependency.
   */
  readonly dependencyId?:
    ModuleId;

  /**
   * Lifecycle phase associated with the error.
   */
  readonly phase?:
    string;

  /**
   * Dependency cycle, when applicable.
   */
  readonly cycle?:
    readonly ModuleId[];

  /**
   * Additional structured information.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Base error for all module subsystem failures.
 *
 * Extends FrameworkError so module errors can be caught
 * uniformly with other framework errors.
 */
export class ModuleError
  extends FrameworkError {
  /**
   * Module associated with this error.
   */
  public readonly moduleId?:
    ModuleId;

  /**
   * Related dependency.
   */
  public readonly dependencyId?:
    ModuleId;

  /**
   * Lifecycle phase.
   */
  public readonly phase?:
    string;

  /**
   * Dependency cycle.
   */
  public readonly cycle?:
    readonly ModuleId[];

  /**
   * Structured metadata.
   */
  public readonly errorMetadata?:
    Readonly<
      Record<string, unknown>
    >;

  public constructor(
    message: string,
    options: {
      readonly code?:
        ModuleErrorCode;

      readonly moduleId?:
        ModuleId;

      readonly dependencyId?:
        ModuleId;

      readonly phase?:
        string;

      readonly cycle?:
        readonly ModuleId[];

      readonly metadata?:
        Readonly<
          Record<string, unknown>
        >;

      readonly cause?:
        unknown;
    } = {},
  ) {
    const details: Record<
      string,
      unknown
    > = {};

    if (
      options.moduleId !== undefined
    ) {
      details.moduleId =
        options.moduleId;
    }

    if (
      options.dependencyId !==
        undefined
    ) {
      details.dependencyId =
        options.dependencyId;
    }

    if (
      options.phase !== undefined
    ) {
      details.phase =
        options.phase;
    }

    if (
      options.cycle !== undefined
    ) {
      details.cycle =
        options.cycle;
    }

    if (
      options.metadata !== undefined
    ) {
      details.metadata =
        options.metadata;
    }

    super(message, {
      code:
        options.code ??
        ModuleErrorCode.UNKNOWN,
      details,
      cause: options.cause,
    });

    this.name =
      "ModuleError";

    this.moduleId =
      options.moduleId;

    this.dependencyId =
      options.dependencyId;

    this.phase =
      options.phase;

    this.cycle = options.cycle
      ? Object.freeze([
          ...options.cycle,
        ])
      : undefined;

    this.errorMetadata =
      options.metadata
        ? Object.freeze({
            ...options.metadata,
          })
        : undefined;
  }

  /**
   * Converts the error to a structured representation.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),

      moduleId:
        this.moduleId,

      dependencyId:
        this.dependencyId,

      phase:
        this.phase,

      cycle:
        this.cycle,

      errorMetadata:
        this.errorMetadata,
    };
  }
}
