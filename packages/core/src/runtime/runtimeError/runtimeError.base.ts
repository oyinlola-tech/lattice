import { FrameworkError } from "../../errors/frameworkError.error.js";
import type { SerializedBaseError } from "@zudojs/errors";

import type {
  RuntimeErrorOptions,
  RuntimeErrorJSON,
  RuntimeErrorMetadata,
} from "./runtimeError.type.js";

import { RuntimeErrorCode } from "./runtimeError.type.js";

/**
 * Base error for all runtime failures.
 *
 * Extends FrameworkError so runtime errors can be caught
 * uniformly with other framework errors.
 */
export class RuntimeError extends FrameworkError {
  public readonly operation?: import("./runtimeError.type.js").RuntimeOperation;
  public readonly phase?: import("./runtimeError.type.js").RuntimeErrorPhase;
  public readonly runtimeId?: string;
  public readonly runtimeName?: string;
  public readonly moduleName?: string;
  public readonly errorMetadata: RuntimeErrorMetadata;
  public readonly recoverable: boolean;

  public constructor(message: string, options: RuntimeErrorOptions = {}) {
    const details: Record<string, unknown> = {};

    if (options.operation !== undefined) {
      details.operation = options.operation;
    }

    if (options.phase !== undefined) {
      details.phase = options.phase;
    }

    if (options.runtimeId !== undefined) {
      details.runtimeId = options.runtimeId;
    }

    if (options.runtimeName !== undefined) {
      details.runtimeName = options.runtimeName;
    }

    if (options.moduleName !== undefined) {
      details.moduleName = options.moduleName;
    }

    if (options.metadata !== undefined) {
      details.metadata = options.metadata;
    }

    if (options.recoverable !== undefined) {
      details.recoverable = options.recoverable;
    }

    super(message, {
      code: options.code ?? RuntimeErrorCode.RUNTIME_FAILURE,
      details,
      cause: options.cause,
    });

    this.name = "RuntimeError";
    this.operation = options.operation;
    this.phase = options.phase;
    this.runtimeId = options.runtimeId;
    this.runtimeName = options.runtimeName;
    this.moduleName = options.moduleName;
    this.errorMetadata = Object.freeze({
      ...(options.metadata ?? {}),
    });
    this.recoverable = options.recoverable ?? false;
  }

  public getCause(): Error | undefined {
    return normalizeError(this.cause);
  }

  public override toJSON(): SerializedBaseError & {
    readonly operation?: string;
    readonly phase?: string;
    readonly runtimeId?: string;
    readonly runtimeName?: string;
    readonly moduleName?: string;
    readonly errorMetadata: RuntimeErrorMetadata;
    readonly recoverable: boolean;
  } {
    return {
      ...super.toJSON(),
      operation: this.operation,
      phase: this.phase,
      runtimeId: this.runtimeId,
      runtimeName: this.runtimeName,
      moduleName: this.moduleName,
      errorMetadata: this.errorMetadata,
      recoverable: this.recoverable,
    };
  }
}

/**
 * Normalizes an unknown value into an Error.
 */
function normalizeError(value: unknown): Error | undefined {
  if (value instanceof Error) {
    return value;
  }

  return undefined;
}
