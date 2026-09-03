import { CommandBus, createCommandBus } from "@zudolib/cqrs";
import { QueryBus, createQueryBus } from "@zudolib/cqrs";
import { createEventBus } from "@zudolib/events";
import { LoggerLevel } from "@zudolib/logger";
import { createAppLogger } from "./loggers/logger.js";
import { createAppConfig } from "./config/index.js";
import { initDatabase } from "./databases/database.js";
import {
  SqliteUserRepository,
  SqliteArticleRepository,
  SqliteCommentRepository,
  SqliteReactionRepository,
  SqliteTopicRepository,
  SqliteTopicFollowerRepository,
  SqliteNotificationRepository,
} from "./repositories/index.js";
import { loadModules } from "./loaders/modules.loader.js";
import { loadEvents } from "./loaders/events.loader.js";
import { loadRoutes } from "./loaders/routes.loader.js";
import { createAllRoutes } from "./routes/index.js";

export interface App {
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}

export async function createApp(): Promise<App> {
  const appConfig = createAppConfig();
  const logger = createAppLogger(
    appConfig.env === "production" ? LoggerLevel.INFO : LoggerLevel.DEBUG,
  );

  logger.info("=".repeat(60));
  logger.info(`  ${appConfig.name} v${appConfig.version}`);
  logger.info(`  Environment: ${appConfig.env}`);
  logger.info("=".repeat(60));

  const db = initDatabase({
    filename: process.env["DATABASE_FILENAME"] ?? "./data/community.db",
    verbose: appConfig.env === "development",
  });
  logger.info("Database initialized");

  const commandBus = createCommandBus();
  const queryBus = createQueryBus();
  const events = createEventBus();
  logger.info("CQRS buses and event bus created");

  const users = new SqliteUserRepository();
  const articles = new SqliteArticleRepository();
  const comments = new SqliteCommentRepository();
  const reactions = new SqliteReactionRepository();
  const topics = new SqliteTopicRepository();
  const followers = new SqliteTopicFollowerRepository();
  const notifications = new SqliteNotificationRepository();
  logger.info("Repositories initialized");

  loadEvents({ events, logger });

  loadModules({
    users,
    articles,
    comments,
    reactions,
    topics,
    followers,
    notifications,
    commandBus,
    queryBus,
    events,
    logger,
  });

  const routes = createAllRoutes(commandBus, queryBus);
  loadRoutes({ routes, logger });

  return {
    commandBus,
    queryBus,
    start: async () => {
      logger.info("=".repeat(60));
      logger.info("  Application ready");
      logger.info("=".repeat(60));
    },
    stop: async () => {
      logger.info("Shutting down...");
      const { closeDatabase } = await import("./databases/database.js");
      closeDatabase();
      logger.info("Database closed");
    },
  };
}
