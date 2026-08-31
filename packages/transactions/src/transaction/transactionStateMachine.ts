/**
 * Transaction state machine — valid transitions and helpers.
 */

import type { TransactionState } from "../transactionTypes/transactionState.js";
import { TransactionStateError } from "../transactionErrors/transactionError.types.js";

/** Valid state transitions. */
const VALID_TRANSITIONS: Record<TransactionState, TransactionState[]> = {
  pending: ["active", "failed"],
  active: ["committing", "rolling_back", "failed"],
  committing: ["committed", "failed", "rolling_back"],
  committed: [],
  rolling_back: ["rolled_back", "failed"],
  rolled_back: [],
  failed: [],
};

/**
 * Creates a state transition function for a transaction.
 */
export function createTransitionFunction(
  getState: () => TransactionState,
  setState: (state: TransactionState) => void,
): (to: TransactionState) => void {
  return (to: TransactionState): void => {
    const current = getState();
    if (!VALID_TRANSITIONS[current]?.includes(to)) {
      throw new TransactionStateError(current, `transition to ${to}`);
    }
    setState(to);
  };
}
