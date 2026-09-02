import { logger } from "@lattice/logger";
import { createContainer } from "@lattice/container";

export async function createApp() {
  const log = logger.child({ service: "app" });
  const container = createContainer();

  log.info("test-app v0.1.0 starting...");

  return {
    container,
    listen: async () => {
      log.info("Server started");
    },
    stop: async () => {
      log.info("Shutting down...");
    },
  };
}
