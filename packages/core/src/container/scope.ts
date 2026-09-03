/**
 * Defines the lifetime of a dependency registered
 * with the Zudo dependency injection container.
 */
export type Scope =
  /**
   * One instance for the lifetime of the application container.
   */
  | "singleton"

  /**
   * One instance for the lifetime of an execution context.
   *
   * Examples:
   * HTTP request
   * Background job
   * Message consumption
   * RPC request
   */
  | "scoped"

  /**
   * A new instance every time the dependency is resolved.
   */
  | "transient";
