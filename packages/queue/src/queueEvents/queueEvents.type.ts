import type { Timestamp } from "@zudo/constants";

import type { Job } from "../job/job.type.js";

/**
 * Base event for queue operations.
 */
export interface QueueEvent {
  /** Event type. */
  readonly type: string;
  /** When the event occurred. */
  readonly timestamp: Timestamp;
  /** Queue name. */
  readonly queueName: string;
}

/**
 * Job created event.
 */
export interface JobCreatedEvent extends QueueEvent {
  readonly type: "job:created";
  readonly job: Job;
}

/**
 * Job started event.
 */
export interface JobStartedEvent extends QueueEvent {
  readonly type: "job:started";
  readonly job: Job;
}

/**
 * Job progress event.
 */
export interface JobProgressEvent extends QueueEvent {
  readonly type: "job:progress";
  readonly job: Job;
  readonly progress: number;
}

/**
 * Job completed event.
 */
export interface JobCompletedEvent extends QueueEvent {
  readonly type: "job:completed";
  readonly job: Job;
  readonly result: unknown;
}

/**
 * Job failed event.
 */
export interface JobFailedEvent extends QueueEvent {
  readonly type: "job:failed";
  readonly job: Job;
  readonly error: Error;
}

/**
 * Job retrying event.
 */
export interface JobRetryingEvent extends QueueEvent {
  readonly type: "job:retrying";
  readonly job: Job;
  readonly attempt: number;
}

/**
 * Job cancelled event.
 */
export interface JobCancelledEvent extends QueueEvent {
  readonly type: "job:cancelled";
  readonly job: Job;
}

/**
 * Worker started event.
 */
export interface WorkerStartedEvent extends QueueEvent {
  readonly type: "worker:started";
  readonly workerId: string;
}

/**
 * Worker stopped event.
 */
export interface WorkerStoppedEvent extends QueueEvent {
  readonly type: "worker:stopped";
  readonly workerId: string;
}

/**
 * Worker error event.
 */
export interface WorkerErrorEvent extends QueueEvent {
  readonly type: "worker:error";
  readonly workerId: string;
  readonly error: Error;
}

/**
 * Union of all queue events.
 */
export type QueueEventType =
  | JobCreatedEvent
  | JobStartedEvent
  | JobProgressEvent
  | JobCompletedEvent
  | JobFailedEvent
  | JobRetryingEvent
  | JobCancelledEvent
  | WorkerStartedEvent
  | WorkerStoppedEvent
  | WorkerErrorEvent;

/**
 * Event handler function type.
 */
export type QueueEventHandler<T extends QueueEvent = QueueEvent> = (
  event: T,
) => void | Promise<void>;
