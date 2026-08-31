/**
 * Worker application configuration.
 */

export interface WorkerConfig {
  readonly nodeEnv: string;
  readonly concurrency: number;
  readonly jobTimeoutMs: number;
}

export function loadConfig(): WorkerConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
    jobTimeoutMs: Number(process.env.JOB_TIMEOUT_MS ?? 30_000),
  };
}
