/**
 * Users HTTP handler.
 *
 * Handles incoming HTTP requests for the /users route.
 * Delegates business logic to UsersService.
 */

import type { User, CreateUserInput } from "./users.types.js";
import type { UsersService } from "./users.service.js";
import { CreateUserSchema } from "./users.schema.js";
import { validate } from "@zudojs/validation";

type HttpRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string>;
  id: string;
};

export class UsersController {
  private readonly service: UsersService;

  public constructor(service: UsersService) {
    this.service = service;
  }

  public async handleRequest(
    request: HttpRequest,
  ): Promise<{ status: number; body: unknown }> {
    const method = request.method;
    const path = request.url;

    if (method === "GET" && path === "/users") {
      return this.findAll();
    }

    if (method === "GET" && path.startsWith("/users/")) {
      const id = path.split("/users/")[1];
      return this.findOne(id);
    }

    if (method === "POST" && path === "/users") {
      return this.create(request);
    }

    if (method === "DELETE" && path.startsWith("/users/")) {
      const id = path.split("/users/")[1];
      return this.remove(id);
    }

    return { status: 404, body: { error: "Not found" } };
  }

  private findAll(): { status: number; body: readonly User[] } {
    const users = this.service.findAll();
    return { status: 200, body: users };
  }

  private findOne(id: string | undefined): { status: number; body: unknown } {
    if (!id) {
      return { status: 400, body: { error: "Missing user id" } };
    }

    const user = this.service.findById(id);

    if (!user) {
      return { status: 404, body: { error: "User not found" } };
    }

    return { status: 200, body: user };
  }

  private create(request: HttpRequest): { status: number; body: unknown } {
    const body = request.body as CreateUserInput | undefined;

    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Request body is required" } };
    }

    const result = validate(CreateUserSchema, body);

    if (!result.success) {
      return {
        status: 400,
        body: { error: "Validation failed", issues: result.issues },
      };
    }

    const user = this.service.create(result.data);
    return { status: 201, body: user };
  }

  private remove(id: string | undefined): { status: number; body: unknown } {
    if (!id) {
      return { status: 400, body: { error: "Missing user id" } };
    }

    const deleted = this.service.delete(id);

    if (!deleted) {
      return { status: 404, body: { error: "User not found" } };
    }

    return { status: 204, body: undefined };
  }
}
