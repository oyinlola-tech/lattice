import type { CommandBus, QueryBus } from "@zudolib/cqrs";
import { CommentController } from "../controllers/comment.controller.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any) => Promise<unknown>;
}

export function createCommentRoutes(
  commandBus: CommandBus,
  queryBus: QueryBus,
): readonly Route[] {
  const controller = new CommentController(commandBus, queryBus);

  return [
    {
      method: "POST",
      path: "/comments",
      handler: async (body: any) => controller.create(body),
    },
    {
      method: "GET",
      path: "/articles/:articleId/comments",
      handler: async (_body: any, params: any) =>
        controller.list(params.articleId),
    },
    {
      method: "PATCH",
      path: "/comments/:id",
      handler: async (body: any, params: any) =>
        controller.update(params.id, body.userId, body),
    },
    {
      method: "DELETE",
      path: "/comments/:id",
      handler: async (body: any, params: any) =>
        controller.delete(params.id, body.userId),
    },
  ];
}
