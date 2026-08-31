import type { QueueName } from "../jobTypes/jobTypes.type.js";

import type { Queue, QueueOptions } from "../queue/queue.type.js";

import type { QueueManager } from "./queueManager.type.js";

import { createQueue } from "../queue/queue.core.js";

/**
 * Creates a new QueueManager.
 */
export function createQueueManager(): QueueManager {
  const queues = new Map<QueueName, Queue>();

  return {
    getQueue<TData>(
      name: QueueName,
      options?: QueueOptions,
    ): Queue<TData> {
      let queue = queues.get(name) as Queue<TData> | undefined;

      if (!queue) {
        queue = createQueue<TData>(name, options);
        queues.set(name, queue as Queue);
      }

      return queue;
    },

    getExistingQueue<TData>(
      name: QueueName,
    ): Queue<TData> | undefined {
      return queues.get(name) as Queue<TData> | undefined;
    },

    hasQueue(name: QueueName): boolean {
      return queues.has(name);
    },

    getQueueNames(): QueueName[] {
      return Array.from(queues.keys());
    },

    async closeAll(): Promise<void> {
      const closePromises = Array.from(queues.values()).map((queue) =>
        queue.close(),
      );
      await Promise.all(closePromises);
      queues.clear();
    },
  };
}
