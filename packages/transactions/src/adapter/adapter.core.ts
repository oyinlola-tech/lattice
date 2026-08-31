/**
 * Adapter helpers and in-memory transaction adapter.
 *
 * @module adapter/adapter
 */

import type {
  TransactionAdapter,
  TransactionAdapterCapabilities,
  TransactionHandle,
} from "../transactionTypes/transactionAdapter.js";
import type { TransactionOptions } from "../transactionTypes/transaction.interface.js";

/** In-memory transaction state. */
interface InMemoryHandle {
  readonly id: string;
  active: boolean;
}

let counter = 0;

/**
 * Create an in-memory transaction adapter (useful for testing).
 */
export function createInMemoryAdapter(): TransactionAdapter {
  const handles = new Map<string, InMemoryHandle>();

  return {
    capabilities: Object.freeze({
      savepoints: false,
      nestedTransactions: false,
      isolationLevels: ["read_committed"] as const,
      readOnlyTransactions: false,
      timeouts: false,
    } satisfies TransactionAdapterCapabilities),

    async begin(): Promise<TransactionHandle> {
      const id = `mem_${++counter}`;
      const handle: InMemoryHandle = { id, active: true };
      handles.set(id, handle);
      return handle;
    },

    async commit(handle: TransactionHandle): Promise<void> {
      const h = handle as InMemoryHandle;
      h.active = false;
      handles.delete(h.id);
    },

    async rollback(handle: TransactionHandle): Promise<void> {
      const h = handle as InMemoryHandle;
      h.active = false;
      handles.delete(h.id);
    },
  };
}

/**
 * Create an adapter with custom capabilities.
 */
export function createAdapter(
  implementation: TransactionAdapter,
  capabilities: TransactionAdapterCapabilities,
): TransactionAdapter {
  return {
    ...implementation,
    capabilities: Object.freeze(capabilities),
  };
}
