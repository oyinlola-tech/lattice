/**
 * Defines a resource that can be gracefully disposed of.
 *
 * Disposable resources may include:
 *
 * Database connections
 * Cache clients
 * Message brokers
 * Queue workers
 * HTTP clients
 * File handles
 * External service connections
 */
export interface Disposable {
  /**
   * Releases resources owned by the implementation.
   *
   * Implementations should make this operation idempotent,
   * meaning calling dispose() more than once should be safe.
   */
  dispose(): Promise<void> | void;
}