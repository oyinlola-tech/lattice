import {
  FrameworkError,
} from "../errors/framework-error.js";

import {
  ErrorCode,
} from "../errors/error-code.js";

import type {
  ModuleId,
} from "./module.js";

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

/**
 * Error thrown when a module definition is invalid.
 */
export class InvalidModuleDefinitionError
  extends ModuleError {
  public constructor(
    message: string,
    moduleId?: ModuleId,
    cause?: unknown,
  ) {
    super(message, {
      code:
        ModuleErrorCode
          .INVALID_DEFINITION,
      moduleId,
      cause,
    });

    this.name =
      "InvalidModuleDefinitionError";
  }
}

/**
 * Error thrown when a module is not registered.
 */
export class ModuleNotFoundError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
  ) {
    super(
      `Module "${moduleId}" is not registered.`,
      {
        code:
          ModuleErrorCode
            .NOT_FOUND,
        moduleId,
      },
    );

    this.name =
      "ModuleNotFoundError";
  }
}

/**
 * Error thrown when a module is registered more than once.
 */
export class DuplicateModuleError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
  ) {
    super(
      `Module "${moduleId}" is already registered.`,
      {
        code:
          ModuleErrorCode
            .DUPLICATE,
        moduleId,
      },
    );

    this.name =
      "DuplicateModuleError";
  }
}

/**
 * Error thrown when a required module dependency is missing.
 */
export class MissingModuleDependencyError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    dependencyId: ModuleId,
  ) {
    super(
      `Module "${moduleId}" requires missing module "${dependencyId}".`,
      {
        code:
          ModuleErrorCode
            .MISSING_DEPENDENCY,
        moduleId,
        dependencyId,
      },
    );

    this.name =
      "MissingModuleDependencyError";
  }
}

/**
 * Error thrown when a circular dependency is detected.
 */
export class CircularModuleDependencyError
  extends ModuleError {
  public constructor(
    cycle:
      readonly ModuleId[],
  ) {
    const cycleText =
      cycle.join(
        " -> ",
      );

    super(
      `Circular module dependency detected: ${cycleText}`,
      {
        code:
          ModuleErrorCode
            .CIRCULAR_DEPENDENCY,
        cycle,
        moduleId:
          cycle[0],
      },
    );

    this.name =
      "CircularModuleDependencyError";
  }
}

/**
 * Error thrown when a module dependency version
 * cannot be satisfied.
 */
export class ModuleVersionMismatchError
  extends ModuleError {
  public readonly requiredVersion:
    string;

  public readonly actualVersion?:
    string;

  public constructor(
    moduleId: ModuleId,
    requiredVersion: string,
    actualVersion?: string,
  ) {
    super(
      actualVersion
        ? `Module "${moduleId}" requires version "${requiredVersion}", but version "${actualVersion}" is installed.`
        : `Module "${moduleId}" requires version "${requiredVersion}".`,
      {
        code:
          ModuleErrorCode
            .VERSION_MISMATCH,
        moduleId,
      },
    );

    this.name =
      "ModuleVersionMismatchError";

    this.requiredVersion =
      requiredVersion;

    this.actualVersion =
      actualVersion;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      requiredVersion:
        this.requiredVersion,
      actualVersion:
        this.actualVersion,
    };
  }
}

/**
 * Error thrown when module instantiation fails.
 */
export class ModuleInstantiationError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      `Failed to instantiate module "${moduleId}": ${message}`,
      {
        code:
          ModuleErrorCode
            .LOAD_FAILED,
        moduleId,
        cause,
      },
    );

    this.name =
      "ModuleInstantiationError";
  }
}

/**
 * Error thrown when a module lifecycle operation fails.
 */
export class ModuleOperationError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    phase: string,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    const code =
      getLifecycleErrorCode(
        phase,
      );

    super(
      `Module "${moduleId}" failed during ${phase}: ${message}`,
      {
        code,
        moduleId,
        phase,
        cause,
      },
    );

    this.name =
      "ModuleOperationError";
  }
}

/**
 * Error thrown when a module has an invalid runtime instance.
 */
export class InvalidModuleInstanceError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    message?: string,
  ) {
    super(
      message ??
        `Module "${moduleId}" produced an invalid runtime instance.`,
      {
        code:
          ModuleErrorCode
            .INVALID_INSTANCE,
        moduleId,
      },
    );

    this.name =
      "InvalidModuleInstanceError";
  }
}

/**
 * Error thrown when a module operation violates its current state.
 */
export class InvalidModuleStateError
  extends ModuleError {
  public readonly currentState:
    string;

  public readonly expectedStates:
    readonly string[];

  public constructor(
    moduleId: ModuleId,
    currentState: string,
    expectedStates:
      readonly string[],
  ) {
    super(
      `Module "${moduleId}" is in state "${currentState}" but must be in one of: ${expectedStates.join(", ")}.`,
      {
        code:
          ModuleErrorCode
            .INVALID_STATE,
        moduleId,
        metadata: {
          currentState,
          expectedStates,
        },
      },
    );

    this.name =
      "InvalidModuleStateError";

    this.currentState =
      currentState;

    this.expectedStates =
      Object.freeze([
        ...expectedStates,
      ]);
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      currentState:
        this.currentState,
      expectedStates:
        this.expectedStates,
    };
  }
}

/**
 * Error thrown when an operation cannot be performed
 * because another lifecycle operation is currently running.
 */
export class ModuleOperationInProgressError
  extends ModuleError {
  public constructor(
    operation: string,
  ) {
    super(
      `A module lifecycle operation is already in progress: "${operation}".`,
      {
        code:
          ModuleErrorCode
            .OPERATION_IN_PROGRESS,
        metadata: {
          operation,
        },
      },
    );

    this.name =
      "ModuleOperationInProgressError";
  }
}

/**
 * Checks whether an unknown value is a ModuleError.
 */
export function isModuleError(
  error: unknown,
): error is ModuleError {
  return (
    error instanceof ModuleError
  );
}

/**
 * Checks whether an unknown value represents
 * a particular module error code.
 */
export function hasModuleErrorCode(
  error: unknown,
  code: ModuleErrorCode,
): boolean {
  return (
    isModuleError(error) &&
    error.code === code
  );
}

/**
 * Converts an arbitrary error into a ModuleError.
 *
 * Existing ModuleErrors are returned unchanged.
 */
export function toModuleError(
  error: unknown,
  options: {
    readonly moduleId?:
      ModuleId;

    readonly code?:
      ModuleErrorCode;

    readonly phase?:
      string;
  } = {},
): ModuleError {
  if (
    error instanceof ModuleError
  ) {
    return error;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  return new ModuleError(
    message,
    {
      moduleId:
        options.moduleId,

      code:
        options.code ??
        ModuleErrorCode.UNKNOWN,

      phase:
        options.phase,

      cause:
        error,
    },
  );
}

/**
 * Maps lifecycle phases to stable error codes.
 */
function getLifecycleErrorCode(
  phase: string,
): ModuleErrorCode {
  switch (phase) {
    case "initialize":
    case "initializing":
      return ModuleErrorCode
        .INITIALIZATION_FAILED;

    case "start":
    case "starting":
      return ModuleErrorCode
        .START_FAILED;

    case "stop":
    case "stopping":
      return ModuleErrorCode
        .STOP_FAILED;

    case "destroy":
    case "destroying":
      return ModuleErrorCode
        .DESTROY_FAILED;

    default:
      return ModuleErrorCode
        .UNKNOWN;
  }
}
