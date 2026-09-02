import type { Job } from "../job/job.type.js";
import { updateJobState } from "../job/job.core.js";
import { JobState as JobStateEnum } from "../jobTypes/jobTypes.type.js";

/**
 * Schedule a job for future execution.
 */
export function scheduleJob<TData>(
  job: Job<TData>,
  scheduledTimers: Map<string, ReturnType<typeof setTimeout>>,
  jobs: Map<string, Job<TData>>,
): void {
  if (!job.scheduledAt) {
    return;
  }

  const scheduledTime = new Date(job.scheduledAt).getTime();
  const now = Date.now();
  const delay = Math.max(0, scheduledTime - now);

  const timer = setTimeout(() => {
    scheduledTimers.delete(job.id);
    const currentJob = jobs.get(job.id);
    if (currentJob && currentJob.state === JobStateEnum.SCHEDULED) {
      const waitingJob = updateJobState(currentJob, JobStateEnum.WAITING);
      jobs.set(job.id, waitingJob);
    }
  }, delay);

  scheduledTimers.set(job.id, timer);
}

/**
 * Promote scheduled jobs that are ready to run.
 */
export function scheduleDelayedJobs<TData>(
  jobs: Map<string, Job<TData>>,
): void {
  const now = Date.now();
  for (const job of jobs.values()) {
    if (job.state === JobStateEnum.SCHEDULED && job.scheduledAt) {
      const scheduledTime = new Date(job.scheduledAt).getTime();
      if (scheduledTime <= now) {
        const waitingJob = updateJobState(job, JobStateEnum.WAITING);
        jobs.set(job.id, waitingJob);
      }
    }
  }
}
