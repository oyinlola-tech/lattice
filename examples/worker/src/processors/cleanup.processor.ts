/**
 * Cleanup processor.
 *
 * Handles the "cleanup" job type.
 * Demonstrates scheduled cleanup tasks.
 */

import type { Job } from "@oyinlola141/lattice-queue";
import type { JobContext } from "@oyinlola141/lattice-queue";
import type { CleanupJobData } from "../jobs/jobs.types.js";

export class CleanupProcessor {
  public readonly name = "cleanup";

  public async process(
    job: Job<CleanupJobData>,
    _context: JobContext<CleanupJobData>,
  ): Promise<void> {
    const { olderThanDays, dryRun } = job.data;

    console.log(
      `[CleanupProcessor] Cleaning up data older than ${olderThanDays} days`,
    );
    console.log(`  Dry run: ${dryRun ?? false}`);

    // Simulate cleanup work
    await sleep(150);

    const recordsCleaned = Math.floor(Math.random() * 100);

    if (dryRun) {
      console.log(
        `[CleanupProcessor] Dry run: would have cleaned ${recordsCleaned} records`,
      );
    } else {
      console.log(`[CleanupProcessor] Cleaned ${recordsCleaned} records`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
