/**
 * Email processor.
 *
 * Handles the "send-email" job type.
 * In a real application, this would integrate with an email service.
 */

import type { Job } from "@zudoliblib/queue";
import type { JobContext } from "@zudoliblib/queue";
import type { SendEmailJobData } from "../jobs/jobs.types.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class EmailProcessor {
  public readonly name = "send-email";

  public async process(
    job: Job<SendEmailJobData>,
    _context: JobContext<SendEmailJobData>,
  ): Promise<void> {
    const { to, subject, body, from } = job.data;

    console.log(`[EmailProcessor] Sending email to ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  From: ${from ?? "noreply@example.com"}`);

    // Simulate email sending delay
    await sleep(100);

    console.log(`[EmailProcessor] Email sent successfully to ${to}`);
  }
}
