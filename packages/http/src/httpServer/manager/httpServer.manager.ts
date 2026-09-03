/**
 * Zudo HTTP server manager.
 *
 * @module httpServer/manager
 */

import { HttpServerLifecycleError } from "@zudo/errors";

import { HttpServer } from "../core/httpServer.core.js";

export class HttpServerManager {
  private readonly servers = new Map<string, HttpServer>();

  register(server: HttpServer): this {
    if (this.servers.has(server.name)) {
      throw new HttpServerLifecycleError(
        `HTTP server "${server.name}" is already registered.`,
        {
          code: "HTTP_SERVER_ALREADY_REGISTERED",
        },
      );
    }

    this.servers.set(server.name, server);

    return this;
  }

  replace(server: HttpServer): this {
    this.servers.set(server.name, server);

    return this;
  }

  unregister(name: string): boolean {
    return this.servers.delete(name);
  }

  get(name: string): HttpServer | undefined {
    return this.servers.get(name);
  }

  require(name: string): HttpServer {
    const server = this.get(name);

    if (!server) {
      throw new HttpServerLifecycleError(
        `HTTP server "${name}" is not registered.`,
        {
          code: "HTTP_SERVER_NOT_FOUND",
        },
      );
    }

    return server;
  }

  list(): readonly HttpServer[] {
    return Object.freeze([...this.servers.values()]);
  }

  async startAll(): Promise<void> {
    for (const server of this.servers.values()) {
      await server.start();
    }
  }

  async stopAll(): Promise<void> {
    const servers = [...this.servers.values()].reverse();

    for (const server of servers) {
      await server.stop();
    }
  }

  async restartAll(): Promise<void> {
    await this.stopAll();
    await this.startAll();
  }
}
