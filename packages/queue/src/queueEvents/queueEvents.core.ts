import type { Timestamp } from "@zudojs/constants";

import type { QueueEvent } from "./queueEvents.type.js";

/**
 * Creates a queue event.
 */
export function createQueueEvent<T extends QueueEvent>(
  type: T["type"],
  queueName: string,
  data: Omit<T, "type" | "timestamp" | "queueName">,
): T {
  return {
    type,
    queueName,
    timestamp: new Date().toISOString() as Timestamp,
    ...data,
  } as T;
}
