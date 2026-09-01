import type { Queue } from "@oyinlola141/lattice-queue";
import type { CommandBus } from "@oyinlola141/lattice-cqrs";
import { createInMemoryQueue, createQueueName } from "@oyinlola141/lattice-queue";
import { createProcessNotificationProcessor } from "../jobs/index.js";
import type { ProcessNotificationJobData } from "../jobs/index.js";
import { NOTIFICATION_QUEUE_NAME, NOTIFICATION_JOB_NAME } from "../constants/index.js";

export interface QueueLoaderDeps {
  readonly commandBus: CommandBus;
  readonly concurrency?: number;
}

export interface QueueLoaderResult {
  readonly queue: Queue<ProcessNotificationJobData>;
}

export function loadQueue(deps: QueueLoaderDeps): QueueLoaderResult {
  const queue = createInMemoryQueue<ProcessNotificationJobData>(
    createQueueName(NOTIFICATION_QUEUE_NAME),
    { concurrency: deps.concurrency ?? 5 },
  );

  const processor = createProcessNotificationProcessor(deps.commandBus);
  queue.process(createQueueName(NOTIFICATION_JOB_NAME), processor as any);

  return { queue };
}
