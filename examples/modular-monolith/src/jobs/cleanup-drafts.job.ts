import type { Logger } from "@zudolib/logger";

export interface CleanupDraftsJobConfig {
  readonly logger: Logger;
}

export async function cleanupDraftsJob(
  config: CleanupDraftsJobConfig,
): Promise<void> {
  const { logger } = config;
  logger.info("[Job] Cleaning up old draft articles...");
  // In a real application, this would query the database
  // for draft articles older than a certain date and archive them.
  logger.info("[Job] Cleanup complete");
}
