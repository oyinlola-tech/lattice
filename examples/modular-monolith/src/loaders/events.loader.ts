import type { Logger } from "@zudo/logger";
import type { EventBus } from "@zudo/events";
import {
  ArticleCreatedEvent,
  ArticlePublishedEvent,
  CommentCreatedEvent,
  TopicFollowedEvent,
  ReactionAddedEvent,
} from "../events/index.js";

export interface EventLoaderConfig {
  readonly events: EventBus;
  readonly logger: Logger;
}

export function loadEvents(config: EventLoaderConfig): void {
  const { events, logger } = config;

  logger.info("Registering event definitions...");

  events.register(ArticleCreatedEvent);
  events.register(ArticlePublishedEvent);
  events.register(CommentCreatedEvent);
  events.register(TopicFollowedEvent);
  events.register(ReactionAddedEvent);

  logger.info("  - article.created");
  logger.info("  - article.published");
  logger.info("  - comment.created");
  logger.info("  - topic.followed");
  logger.info("  - reaction.added");

  events.start();

  logger.info("Event bus started");
}
