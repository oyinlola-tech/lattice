import type { CommandBus, QueryBus } from "@zudojs/cqrs";
import { createUserRoutes } from "./user.routes.js";
import { createArticleRoutes } from "./article.routes.js";
import { createCommentRoutes } from "./comment.routes.js";
import { createReactionRoutes } from "./reaction.routes.js";
import { createTopicRoutes } from "./topic.routes.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any, query?: any) => Promise<unknown>;
}

export function createAllRoutes(
  commandBus: CommandBus,
  queryBus: QueryBus,
): readonly Route[] {
  return [
    ...createUserRoutes(commandBus, queryBus),
    ...createArticleRoutes(commandBus, queryBus),
    ...createCommentRoutes(commandBus, queryBus),
    ...createReactionRoutes(commandBus, queryBus),
    ...createTopicRoutes(commandBus, queryBus),
  ];
}
