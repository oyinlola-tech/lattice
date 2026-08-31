import type { JobId, QueueName } from "../jobTypes/jobTypes.type.js";

import type { Job } from "../job/job.type.js";

import type { JobOptions } from "../jobOptions/jobOptions.type.js";

import type { Processor, ProcessorRegistry } from "../processor/processor.type.js";

import type { Queue, QueueOptions, QueueStats } from "./queue.type.js";

import { QueueClosedError, QueueDisposedError } from "@lattice/errors";

import { createInMemoryQueue } from "../inMemoryQueue/inMemoryQueue.core.js";

/**
 * Creates a new queue.
 *
 * @deprecated Use `createInMemoryQueue` instead for the full in-memory implementation.
 */
export function createQueue<TData>(
  name: QueueName,
  options?: QueueOptions,
): Queue<TData> {
  return createInMemoryQueue<TData>(name, options);
}

/**
 * Checks if a value is a valid Queue.
 */
export function isQueue(value: unknown): value is Queue {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "add" in value &&
    "process" in value &&
    "getJob" in value &&
    "getNextJob" in value
  );
}
