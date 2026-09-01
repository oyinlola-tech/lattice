/**
 * Dead letter handling for failed jobs.
 *
 * Provides storage and management for jobs that have
 * exceeded their retry attempts.
 */
export {
  createInMemoryDeadLetterStore,
  moveToDeadLetter,
} from "./deadLetter.core.js";

export type { DeadLetterJob, DeadLetterStore } from "./deadLetter.type.js";
