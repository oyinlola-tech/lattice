import type { Timestamp } from "@zudoliblib/constants";

import type { JobResult, JobProgress } from "./jobResult.type.js";

/**
 * Creates a successful job result.
 */
export function createJobResult<T>(data: T, durationMs: number): JobResult<T> {
  return {
    success: true,
    data,
    durationMs,
    timestamp: new Date().toISOString() as Timestamp,
  };
}

/**
 * Creates a failed job result.
 */
export function createJobErrorResult(
  error: string,
  durationMs: number,
): JobResult {
  return {
    success: false,
    error,
    durationMs,
    timestamp: new Date().toISOString() as Timestamp,
  };
}

/**
 * Creates a job progress update.
 */
export function createJobProgress(
  percent: number,
  options: {
    step?: string;
    totalSteps?: number;
    currentStep?: number;
    message?: string;
  } = {},
): JobProgress {
  return {
    percent: Math.max(0, Math.min(100, percent)),
    step: options.step,
    totalSteps: options.totalSteps,
    currentStep: options.currentStep,
    message: options.message,
    timestamp: new Date().toISOString() as Timestamp,
  };
}
