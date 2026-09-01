import type { CommandBus, QueryBus } from "@lattice/cqrs";
import { ArticleController } from "../controllers/article.controller.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any, query: any) => Promise<unknown>;
}

export function createArticleRoutes(commandBus: CommandBus, queryBus: QueryBus): readonly Route[] {
  const controller = new ArticleController(commandBus, queryBus);

  return [
    {
      method: "POST",
      path: "/articles",
      handler: async (body: any) => controller.create(body),
    },
    {
      method: "GET",
      path: "/articles",
      handler: async (_body: any, _params: any, query: any) => controller.list(query),
    },
    {
      method: "GET",
      path: "/articles/search",
      handler: async (_body: any, _params: any, query: any) => controller.search(query.q),
    },
    {
      method: "GET",
      path: "/articles/:id",
      handler: async (_body: any, params: any) => controller.get(params.id),
    },
    {
      method: "PATCH",
      path: "/articles/:id",
      handler: async (body: any, params: any) => controller.update(params.id, body.userId, body),
    },
    {
      method: "POST",
      path: "/articles/:id/publish",
      handler: async (body: any, params: any) => controller.publish(params.id, body.userId),
    },
    {
      method: "DELETE",
      path: "/articles/:id",
      handler: async (body: any, params: any) => controller.delete(params.id, body.userId),
    },
  ];
}
