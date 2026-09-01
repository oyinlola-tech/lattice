import type { JobOptions } from "./jobOptions.type.js";

/**
 * Default job options.
 */
export const DEFAULT_JOB_OPTIONS: Readonly<
  Pick<JobOptions, "attempts" | "timeout">
> = Object.freeze({
  attempts: 1,
  timeout: 30_000,
});

/**
 * Merges user-provided job options with defaults.
 */
export function mergeJobOptions(
  options?: JobOptions,
): Required<Pick<JobOptions, "attempts" | "timeout">> &
  Pick<
    JobOptions,
    | "backoff"
    | "delay"
    | "priority"
    | "deduplicationKey"
    | "scheduledAt"
    | "metadata"
  > {
  return {
    attempts: options?.attempts ?? DEFAULT_JOB_OPTIONS.attempts ?? 1,
    timeout: options?.timeout ?? DEFAULT_JOB_OPTIONS.timeout ?? 30_000,
    backoff: options?.backoff,
    delay: options?.delay,
    priority: options?.priority,
    deduplicationKey: options?.deduplicationKey,
    scheduledAt: options?.scheduledAt,
    metadata: options?.metadata,
  };
}
