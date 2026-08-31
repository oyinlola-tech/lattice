/**
 * Priority type and enums for events, tasks, and queues.
 *
 * @module priority/priority
 */

/** Type-safe priority level string. */
export type Priority = "critical" | "high" | "normal" | "low" | "background";

/**
 * All supported priority levels as an object map.
 */
export const Priorities = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  NORMAL: "normal",
  LOW: "low",
  BACKGROUND: "background",
} as const);

/** Numeric priority weights for sorting (higher = more urgent). */
export const PriorityWeight = Object.freeze({
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
  background: 10,
} as const);

/**
 * Compare two priorities by weight.
 *
 * @param a - First priority
 * @param b - Second priority
 * @returns Negative if a is more urgent, positive if b is more urgent, 0 if equal
 */
export function comparePriority(a: Priority, b: Priority): number {
  return PriorityWeight[b] - PriorityWeight[a];
}
