/**
 * Base error type for all Lattice framework errors.
 *
 * FrameworkError provides structured information that can be used by:
 *
 * HTTP error handlers
 * Logging
 * Observability
 * CLI output
 * RPC transports
 * Message processing
 * Application error boundaries
 */
export class FrameworkError extends Error {
  /**
   * Machine-readable error code.
   */
  public readonly code: string;

  /**
   * Optional structured details associated with the error.
   */
  public readonly details?: unknown;

  /**
   * HTTP status associated with the error when applicable.
   *
   * This does not mean every FrameworkError is an HTTP error.
   * It simply allows HTTP adapters to translate framework errors
   * when a status is explicitly provided.
   */
  public readonly status?: number;

  /**
   * Creates a framework error.
   */
  public constructor(
    message: string,
    options: FrameworkErrorOptions = {},
  ) {
    super(message);

    this.name = "FrameworkError";
    this.code = options.code ?? "FRAMEWORK_ERROR";
    this.details = options.details;
    this.status = options.status;

    if (options.cause !== undefined) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Converts the error into a structured representation.
   *
   * Useful for logging, HTTP responses, RPC responses, and
   * observability systems.
   */
  public toJSON(): FrameworkErrorJSON {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      ...(this.status !== undefined && {
        status: this.status,
      }),
      ...(this.details !== undefined && {
        details: this.details,
      }),
    };
  }
}

/**
 * Options accepted by FrameworkError.
 */
export interface FrameworkErrorOptions {
  readonly code?: string;
  readonly details?: unknown;
  readonly status?: number;
  readonly cause?: unknown;
}

/**
 * Serializable representation of a FrameworkError.
 */
export interface FrameworkErrorJSON {
  readonly name: string;
  readonly message: string;
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;
}