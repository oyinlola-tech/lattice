import type { QueueName } from "../jobTypes/jobTypes.type.js";
import type { QueueOptions, Queue } from "../queue/queue.type.js";

import { InMemoryQueue } from "./inMemoryQueue.core.js";

/**
 * Creates an InMemoryQueue.
 */
export function createInMemoryQueue<TData>(
  name: QueueName,
  options?: QueueOptions,
): Queue<TData> {
  return new InMemoryQueue<TData>(name, options);
}
