import type { JobContext } from "./jobContext.type.js";

/**
 * Handler for a scheduled job.
 */
export type JobHandler<T = unknown> = (context: JobContext<T>) => Promise<void> | void;
