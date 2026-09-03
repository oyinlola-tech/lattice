import type { CommandBus, QueryBus } from "@zudolib/cqrs";
import { ReactionController } from "../controllers/reaction.controller.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any) => Promise<unknown>;
}

export function createReactionRoutes(
  commandBus: CommandBus,
  queryBus: QueryBus,
): readonly Route[] {
  const controller = new ReactionController(commandBus, queryBus);

  return [
    {
      method: "POST",
      path: "/reactions",
      handler: async (body: any) => controller.add(body),
    },
    {
      method: "DELETE",
      path: "/articles/:articleId/reactions/:userId",
      handler: async (_body: any, params: any) =>
        controller.remove(params.articleId, params.userId),
    },
    {
      method: "GET",
      path: "/articles/:articleId/reactions",
      handler: async (_body: any, params: any) =>
        controller.get(params.articleId),
    },
  ];
}
