/**
 * Test cleanup manager.
 *
 * Registers and executes resource cleanup functions in reverse order.
 */

export { createCleanupManager } from "./cleanupManager.core.js";

export type {
  CleanupEntry,
  CleanupManager,
  CleanupManagerOptions,
} from "./cleanupManager.core.js";
