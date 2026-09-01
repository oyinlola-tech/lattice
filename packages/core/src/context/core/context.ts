import type { ApplicationContext } from "../../application/applicationContext.context.js";

/**
 * Represents the source through which an execution was initiated.
 */
export type ContextType =
  "http" | "rpc" | "message" | "job" | "cli" | "worker" | "unknown";

/**
 * Metadata describing a single execution.
 */
export interface ExecutionMetadata {
  readonly id: string;
  readonly type: ContextType;
  readonly createdAt: Date;
}

/**
 * Represents one unit of execution inside a Lattice application.
 *
 * An execution context can represent an HTTP request, background job,
 * queue message, RPC call, CLI command, or another execution source.
 *
 * Context combines:
 * - A reference to the application (via ApplicationContext)
 * - Execution-specific metadata (id, type, timestamp)
 * - Mutable values for the execution lifetime
 *
 * This is useful when you need to track execution-specific state
 * alongside application-wide capabilities.
 */
export class Context {
  private readonly application: ApplicationContext;
  private readonly metadata: ExecutionMetadata;

  private readonly values = new Map<string | symbol, unknown>();

  public constructor(
    application: ApplicationContext,
    metadata: ExecutionMetadata,
  ) {
    this.application = application;
    this.metadata = metadata;
  }

  /**
   * Returns the application context associated with this execution.
   */
  public getApplication(): ApplicationContext {
    return this.application;
  }

  /**
   * Returns execution metadata.
   */
  public getMetadata(): ExecutionMetadata {
    return this.metadata;
  }

  /**
   * Returns the unique execution ID.
   */
  public getId(): string {
    return this.metadata.id;
  }

  /**
   * Returns the execution type.
   */
  public getType(): ContextType {
    return this.metadata.type;
  }

  /**
   * Stores a value for the lifetime of this execution context.
   */
  public set<T>(key: string | symbol, value: T): void {
    this.values.set(key, value);
  }

  /**
   * Retrieves a value from the execution context.
   */
  public get<T>(key: string | symbol): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  /**
   * Checks whether a value exists in the execution context.
   */
  public has(key: string | symbol): boolean {
    return this.values.has(key);
  }

  /**
   * Removes a value from the execution context.
   */
  public delete(key: string | symbol): boolean {
    return this.values.delete(key);
  }

  /**
   * Clears all values associated with this execution.
   */
  public clear(): void {
    this.values.clear();
  }
}

/**
 * Options for creating a Context.
 */
export interface CreateContextOptions {
  /**
   * Application context.
   */
  readonly application: ApplicationContext;

  /**
   * Execution type.
   */
  readonly type: ContextType;

  /**
   * Optional execution ID. Generated if not provided.
   */
  readonly id?: string;

  /**
   * Optional creation timestamp. Current time used if not provided.
   */
  readonly createdAt?: Date;
}

/**
 * Creates a new execution Context.
 */
export function createContext(options: CreateContextOptions): Context {
  const metadata: ExecutionMetadata = {
    id: options.id ?? createExecutionId(),
    type: options.type,
    createdAt: options.createdAt ?? new Date(),
  };

  return new Context(options.application, metadata);
}

/**
 * Creates a unique execution identifier.
 */
function createExecutionId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join("-");
}
