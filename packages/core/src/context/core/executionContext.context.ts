/**
 * Represents the execution context of a single operation
 * within a Zudojs application.
 *
 * An execution can represent:
 *
 * HTTP request
 * RPC request
 * Message consumption
 * Background job
 * Scheduled task
 * CLI command
 * Internal application operation
 */
export interface ExecutionContext {
  /**
   * Unique identifier for this execution.
   */
  readonly executionId: string;

  /**
   * Identifier used to correlate related operations.
   */
  readonly correlationId?: string;

  /**
   * Distributed tracing identifier.
   */
  readonly traceId?: string;

  /**
   * Current tracing span identifier.
   */
  readonly spanId?: string;

  /**
   * Identifier of the authenticated principal.
   *
   * The principal can represent a user, service account,
   * API client, or another authenticated identity.
   */
  readonly principalId?: string;

  /**
   * Authentication scheme used for the execution.
   *
   * Examples:
   *
   * bearer
   * api-key
   * session
   * service
   */
  readonly authenticationScheme?: string;

  /**
   * Name of the application or service handling the execution.
   */
  readonly service?: string;

  /**
   * Name of the module or bounded context handling the execution.
   */
  readonly module?: string;

  /**
   * Name of the operation being executed.
   */
  readonly operation?: string;

  /**
   * Origin transport of the execution.
   *
   * Examples:
   *
   * http
   * rpc
   * messaging
   * websocket
   * worker
   * cli
   */
  readonly transport?: string;

  /**
   * Start time of the execution.
   */
  readonly startedAt: Date;

  /**
   * Arbitrary execution scoped metadata.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Input used to create an ExecutionContext.
 *
 * The execution ID and start time can be generated automatically.
 */
export interface CreateExecutionContextInput extends Partial<
  Omit<ExecutionContext, "executionId" | "startedAt" | "metadata">
> {
  /**
   * Optional execution identifier.
   *
   * When omitted, the framework generates one.
   */
  readonly executionId?: string;

  /**
   * Optional execution start time.
   *
   * When omitted, the current time is used.
   */
  readonly startedAt?: Date;

  /**
   * Optional execution metadata.
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Creates a new execution context.
 */
export function createExecutionContext(
  input: CreateExecutionContextInput = {},
): ExecutionContext {
  return Object.freeze({
    executionId: input.executionId ?? createExecutionId(),

    correlationId: input.correlationId,

    traceId: input.traceId,

    spanId: input.spanId,

    principalId: input.principalId,

    authenticationScheme: input.authenticationScheme,

    service: input.service,

    module: input.module,

    operation: input.operation,

    transport: input.transport,

    startedAt: input.startedAt ?? new Date(),

    metadata: Object.freeze({
      ...(input.metadata ?? {}),
    }),
  });
}

/**
 * Creates a new execution context from an existing context.
 *
 * Existing values are preserved unless explicitly overridden.
 * Metadata is merged rather than replaced.
 */
export function deriveExecutionContext(
  context: ExecutionContext,
  overrides: Partial<
    Omit<ExecutionContext, "executionId" | "startedAt" | "metadata">
  > & {
    readonly executionId?: string;
    readonly startedAt?: Date;
    readonly metadata?: Record<string, unknown>;
  } = {},
): ExecutionContext {
  return createExecutionContext({
    executionId: overrides.executionId ?? context.executionId,

    correlationId: overrides.correlationId ?? context.correlationId,

    traceId: overrides.traceId ?? context.traceId,

    spanId: overrides.spanId ?? context.spanId,

    principalId: overrides.principalId ?? context.principalId,

    authenticationScheme:
      overrides.authenticationScheme ?? context.authenticationScheme,

    service: overrides.service ?? context.service,

    module: overrides.module ?? context.module,

    operation: overrides.operation ?? context.operation,

    transport: overrides.transport ?? context.transport,

    startedAt: overrides.startedAt ?? context.startedAt,

    metadata: {
      ...context.metadata,
      ...(overrides.metadata ?? {}),
    },
  });
}

/**
 * Adds metadata to an execution context without mutating
 * the existing context.
 */
export function withExecutionMetadata(
  context: ExecutionContext,
  metadata: Record<string, unknown>,
): ExecutionContext {
  return deriveExecutionContext(context, {
    metadata,
  });
}

/**
 * Returns the duration of an execution in milliseconds.
 */
export function getExecutionDuration(
  context: ExecutionContext,
  endTime: Date = new Date(),
): number {
  return endTime.getTime() - context.startedAt.getTime();
}

/**
 * Creates a framework execution identifier.
 *
 * Uses crypto.randomUUID when available.
 */
function createExecutionId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  /**
   * Fallback for environments where Web Crypto is unavailable.
   */
  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join("-");
}
