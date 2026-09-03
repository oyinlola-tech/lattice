/**
 * Report processor.
 *
 * Handles the "generate-report" job type.
 * Demonstrates retry behavior with simulated failures.
 */

import type { Job } from "@zudo/queue";
import type { JobContext } from "@zudo/queue";
import type { GenerateReportJobData } from "../jobs/jobs.types.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ReportProcessor {
  public readonly name = "generate-report";

  private attemptCount = 0;

  public async process(
    job: Job<GenerateReportJobData>,
    _context: JobContext<GenerateReportJobData>,
  ): Promise<void> {
    const { userId, reportType, dateRange } = job.data;
    this.attemptCount++;

    console.log(
      `[ReportProcessor] Generating ${reportType} report for user ${userId}`,
    );
    console.log(`  Date range: ${dateRange.start} to ${dateRange.end}`);
    console.log(`  Attempt: ${job.attempt}/${job.maxAttempts}`);

    // Simulate processing time
    await sleep(200);

    // Simulate occasional failure for retry demonstration
    if (this.attemptCount % 3 === 0) {
      console.log(
        `[ReportProcessor] Simulated failure on attempt ${this.attemptCount}`,
      );
      throw new Error("External service temporarily unavailable");
    }

    console.log(
      `[ReportProcessor] Report generated successfully for user ${userId}`,
    );
  }
}
