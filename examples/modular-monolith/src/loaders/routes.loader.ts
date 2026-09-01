import type { Logger } from "@oyinlola141/lattice-logger";
import type { Route } from "../routes/index.js";

export interface RouteLoaderConfig {
  readonly routes: readonly Route[];
  readonly logger: Logger;
}

export function loadRoutes(config: RouteLoaderConfig): void {
  const { routes, logger } = config;

  logger.info("Registered routes:");
  for (const route of routes) {
    logger.info(`  ${route.method.padEnd(7)} ${route.path}`);
  }
}
