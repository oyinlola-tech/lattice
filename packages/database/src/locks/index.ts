/**
 * @zudojs/database — Locks
 *
 * Advisory and row-level database locking.
 */

export {
  DatabaseLockManager,
  createLockManager,
  acquireAdvisoryLock,
  lockRow,
  buildLockClause,
  normalizeAdvisoryKey,
  type DatabaseLockMode,
  type DatabaseLockOptions,
  type DatabaseLockResult,
} from "./locks.core.js";
