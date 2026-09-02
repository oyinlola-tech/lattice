import { logger } from "@oyinlola141/lattice-logger";
import { createContainer } from "@oyinlola141/lattice-container";

export async function createApp() {
  const log = logger.child({ service: "app" });
  const container = createContainer();

  log.info("add-test v0.1.0 starting...");

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
