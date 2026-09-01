/**
 * Transaction manager — coordinates begin, commit, rollback, and context.
 *
 * @module manager
 */

export {
  createTransactionManager,
  type TransactionManagerOptions,
} from "./manager.core.js";
