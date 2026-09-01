/**
 * @oyinlola141/lattice-observability — Counter
 *
 * Monotonically increasing counter for tracking event counts.
 */

import type { Counter } from "../../types.js";

/**
 * In-memory counter. Increments monotonically.
 * Designed to be safe and cheap — no async, no locks.
 */
export class DefaultCounter implements Counter {
  readonly name: string;
  readonly labels?: Record<string, string>;
  private value = 0;

  constructor(name: string, labels?: Record<string, string>) {
    this.name = name;
    this.labels = labels;
  }

  increment(value = 1): void {
    if (value < 0) return;
    this.value += value;
  }

  getValue(): number {
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}

/** Creates a counter. */
export function createCounter(
  name: string,
  labels?: Record<string, string>,
): DefaultCounter {
  return new DefaultCounter(name, labels);
}
