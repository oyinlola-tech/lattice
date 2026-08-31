import type { QueueName } from "../jobTypes/jobTypes.type.js";

import type { Queue, QueueOptions } from "../queue/queue.type.js";

/**
 * Manages multiple queues.
 */
export interface QueueManager {
  /** Get or create a queue by name. */
  getQueue<TData>(
    name: QueueName,
    options?: QueueOptions,
  ): Queue<TData>;
  /** Get an existing queue by name. */
  getExistingQueue<TData>(
    name: QueueName,
  ): Queue<TData> | undefined;
  /** Check if a queue exists. */
  hasQueue(name: QueueName): boolean;
  /** Get all queue names. */
  getQueueNames(): QueueName[];
  /** Close all queues. */
  closeAll(): Promise<void>;
}
