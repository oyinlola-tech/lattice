import type { Disposable } from "./disposable.js";

/**
 * Describes an adapter that connects Lattice to an
 * external technology or runtime.
 *
 * Examples:
 *
 * Fastify
 * Prisma
 * Redis
 * PostgreSQL
 * Kafka
 * NATS
 * S3
 */
export interface Adapter<TOptions = unknown> extends Disposable {
  /**
   * Unique adapter name.
   */
  readonly name: string;

  /**
   * Adapter configuration.
   */
  readonly options?: TOptions;

  /**
   * Initializes the adapter.
   *
   * This should prepare the external resource but should not
   * necessarily start active processing.
   */
  initialize(): Promise<void> | void;

  /**
   * Starts the adapter.
   *
   * For example, an HTTP adapter may start listening on a port,
   * while a message adapter may begin consuming messages.
   */
  start(): Promise<void> | void;

  /**
   * Stops the adapter gracefully.
   */
  stop(): Promise<void> | void;
}
