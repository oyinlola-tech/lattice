/**
 * @lattice/adapters/adapter
 *
 * Core adapter contract — the base interface all adapters implement.
 */

import type { AdapterCapabilities } from "../capabilities/capabilities.type.js";
import type { AdapterMetadata } from "../metadata/metadata.type.js";

/**
 * Base adapter interface.
 *
 * Every adapter in the Lattice ecosystem must implement this contract.
 * Platform-specific adapters extend this with transport-specific methods.
 */
export interface Adapter {
  /** Unique adapter name. */
  readonly name: string;

  /** Adapter version. */
  readonly version?: string;

  /** Declared capabilities of this adapter. */
  readonly capabilities: AdapterCapabilities;

  /** Adapter metadata. */
  readonly metadata?: AdapterMetadata;

  /**
   * Initializes the adapter.
   *
   * Prepares external resources without starting active processing.
   */
  initialize?(): Promise<void> | void;

  /**
   * Starts the adapter.
   *
   * Begins active processing — listening for requests, consuming messages, etc.
   */
  start?(): Promise<void> | void;

  /**
   * Stops the adapter gracefully.
   *
   * Ceases active processing but does not release resources.
   */
  stop?(): Promise<void> | void;

  /**
   * Disposes the adapter.
   *
   * Releases all resources — connections, file handles, timers, etc.
   */
  dispose?(): Promise<void> | void;
}
