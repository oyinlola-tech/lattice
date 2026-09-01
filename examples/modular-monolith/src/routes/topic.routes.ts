import type { CommandBus, QueryBus } from "@oyinlola141/lattice-cqrs";
import { TopicController } from "../controllers/topic.controller.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any) => Promise<unknown>;
}

export function createTopicRoutes(
  commandBus: CommandBus,
  queryBus: QueryBus,
): readonly Route[] {
  const controller = new TopicController(commandBus, queryBus);

  return [
    {
      method: "POST",
      path: "/topics",
      handler: async (body: any) => controller.create(body),
    },
    {
      method: "GET",
      path: "/topics",
      handler: async () => controller.list(),
    },
    {
      method: "GET",
      path: "/topics/:id",
      handler: async (_body: any, params: any) => controller.get(params.id),
    },
    {
      method: "POST",
      path: "/topics/:id/follow",
      handler: async (body: any, params: any) =>
        controller.follow({ userId: body.userId, topicId: params.id }),
    },
  ];
}
