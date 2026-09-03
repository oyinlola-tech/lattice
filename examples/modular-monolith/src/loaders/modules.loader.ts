import type { Logger } from "@zudolib/logger";
import type { EventBus } from "@zudolib/events";
import type { CommandBus, QueryBus } from "@zudolib/cqrs";
import type {
  UserRepository,
  ArticleRepository,
  CommentRepository,
  ReactionRepository,
  TopicRepository,
  TopicFollowerRepository,
  NotificationRepository,
} from "../repositories/index.js";
import {
  registerIdentityModule,
  registerArticlesModule,
  registerCommentsModule,
  registerReactionsModule,
  registerTopicsModule,
  registerNotificationsModule,
} from "../modules/index.js";

export interface ModuleLoaderConfig {
  readonly users: UserRepository;
  readonly articles: ArticleRepository;
  readonly comments: CommentRepository;
  readonly reactions: ReactionRepository;
  readonly topics: TopicRepository;
  readonly followers: TopicFollowerRepository;
  readonly notifications: NotificationRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
  readonly logger: Logger;
}

export function loadModules(config: ModuleLoaderConfig): void {
  const { logger } = config;

  logger.info("Registering modules...");

  registerIdentityModule({
    users: config.users,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
  });
  logger.info("  - identity module registered");

  registerArticlesModule({
    articles: config.articles,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
    events: config.events,
  });
  logger.info("  - articles module registered");

  registerCommentsModule({
    comments: config.comments,
    articles: config.articles,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
    events: config.events,
  });
  logger.info("  - comments module registered");

  registerReactionsModule({
    reactions: config.reactions,
    articles: config.articles,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
    events: config.events,
  });
  logger.info("  - reactions module registered");

  registerTopicsModule({
    topics: config.topics,
    followers: config.followers,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
    events: config.events,
  });
  logger.info("  - topics module registered");

  registerNotificationsModule({
    notifications: config.notifications,
    articles: config.articles,
    users: config.users,
    commandBus: config.commandBus,
    queryBus: config.queryBus,
    events: config.events,
  });
  logger.info("  - notifications module registered");

  logger.info(
    `All modules registered (${config.commandBus.size()} command handlers)`,
  );
}
