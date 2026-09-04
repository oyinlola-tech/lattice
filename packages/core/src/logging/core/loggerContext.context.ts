/**
 * Standard context fields that Zudojs can attach to log entries.
 *
 * These fields provide consistent metadata across HTTP requests,
 * background jobs, workers, RPC calls, and microservices.
 */
export interface LoggerContext {
  /**
   * Name of the application or service producing the log.
   */
  readonly service?: string;

  /**
   * Version of the application or service.
   */
  readonly version?: string;

  /**
   * Unique identifier for the current execution.
   */
  readonly executionId?: string;

  /**
   * Correlation identifier used to connect related operations.
   */
  readonly correlationId?: string;

  /**
   * Distributed tracing identifier.
   */
  readonly traceId?: string;

  /**
   * Span identifier within a distributed trace.
   */
  readonly spanId?: string;

  /**
   * Authenticated principal identifier, when available.
   */
  readonly principalId?: string;

  /**
   * Name of the current module or bounded context.
   */
  readonly module?: string;

  /**
   * Name of the current operation.
   */
  readonly operation?: string;

  /**
   * Transport through which the execution originated.
   */
  readonly transport?: string;

  /**
   * Deployment environment.
   */
  readonly environment?: string;

  /**
   * Additional application-specific metadata.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Creates a new logger context by merging existing context
 * with additional values.
 */
export function createLoggerContext(
  base: LoggerContext = {},
  additional: LoggerContext = {},
): LoggerContext {
  return {
    ...base,
    ...additional,
    ...(base.metadata || additional.metadata
      ? {
          metadata: {
            ...(base.metadata ?? {}),
            ...(additional.metadata ?? {}),
          },
        }
      : {}),
  };
}
