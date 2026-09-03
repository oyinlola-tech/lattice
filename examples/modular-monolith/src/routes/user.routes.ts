import type { CommandBus, QueryBus } from "@zudoliblib/cqrs";
import { UserController } from "../controllers/user.controller.js";

export interface Route {
  readonly method: string;
  readonly path: string;
  readonly handler: (body: any, params: any) => Promise<unknown>;
}

export function createUserRoutes(
  commandBus: CommandBus,
  queryBus: QueryBus,
): readonly Route[] {
  const controller = new UserController(commandBus, queryBus);

  return [
    {
      method: "POST",
      path: "/users",
      handler: async (body: any) => controller.register(body),
    },
    {
      method: "GET",
      path: "/users/:id",
      handler: async (_body: any, params: any) =>
        controller.getProfile(params.id),
    },
    {
      method: "PATCH",
      path: "/users/:id",
      handler: async (body: any, params: any) =>
        controller.updateProfile(params.id, body),
    },
  ];
}
