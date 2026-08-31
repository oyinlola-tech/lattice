/**
 * Job interface and factory functions.
 *
 * Provides the core Job type and functions for creating
 * and manipulating job instances.
 */
export { createJob, isJob, updateJobState, incrementJobAttempt } from "./job.core.js";

export type { Job, JobInput } from "./job.type.js";
