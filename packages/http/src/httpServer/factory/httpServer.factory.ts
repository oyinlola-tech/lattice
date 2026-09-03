/**
 * Zudo HTTP server factory and utilities.
 *
 * @module httpServer/factory
 */

import { HttpServerLifecycleError } from "@zudolib/errors";

import { HttpServer } from "../core/httpServer.core.js";
import type {
  HttpServerState,
  HttpServerAddress,
} from "../types/httpServer.type.js";

export function createHttpServer(options: {
  readonly name?: string;
  readonly adapter: unknown;
  readonly handler?: unknown;
  readonly errorHandler?: unknown;
  readonly gracefulShutdownTimeout?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}): HttpServer {
  return new HttpServer(options as never);
}

export async function startServer(server: HttpServer): Promise<HttpServer> {
  return server.start();
}

export async function stopServer(server: HttpServer): Promise<HttpServer> {
  return server.stop();
}

export async function restartServer(server: HttpServer): Promise<HttpServer> {
  return server.restart();
}

export function isHttpServer(value: unknown): value is HttpServer {
  return value instanceof HttpServer;
}

export function getServerState(server: HttpServer): HttpServerState {
  return server.state;
}

export function getServerAddress(
  server: HttpServer,
): HttpServerAddress | undefined {
  return server.address;
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  message: string,
): Promise<T> {
  if (timeout === 0) {
    return promise;
  }

  return new Promise<T>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;

      reject(
        new HttpServerLifecycleError(message, {
          code: "HTTP_SERVER_TIMEOUT",
        }),
      );
    }, timeout);

    promise.then(
      (value) => {
        if (settled) {
          return;
        }

        settled = true;

        clearTimeout(timer);

        resolve(value);
      },
      (error) => {
        if (settled) {
          return;
        }

        settled = true;

        clearTimeout(timer);

        reject(error);
      },
    );
  });
}

export function validateShutdownTimeout(timeout: number): number {
  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new RangeError(
      "HTTP server shutdown timeout must be a non-negative finite number.",
    );
  }

  return timeout;
}
