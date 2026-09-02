/**
 * Lattice HTTP server types.
 *
 * @module httpServer/types
 */

import {
  HttpServerLifecycleError as HttpServerError,
  InvalidHttpServerStateError,
  HttpServerStartError,
  HttpServerStopError,
} from "@oyinlola141/lattice-errors";

import type {
  HttpAdapter,
  HttpAdapterOptions,
  HttpHandler,
  HttpErrorHandler,
} from "../../httpAdapter/http.adapter.js";

export type HttpServerState =
  "created" | "starting" | "running" | "stopping" | "stopped" | "failed";

export interface HttpServerAddress {
  readonly protocol?: string;

  readonly host?: string;

  readonly port?: number;

  readonly path?: string;
}

export interface HttpServerOptions extends HttpAdapterOptions {
  readonly adapter: HttpAdapter;

  readonly handler?: HttpHandler;

  readonly errorHandler?: HttpErrorHandler;

  readonly gracefulShutdownTimeout?: number;

  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface HttpServerEvents {
  readonly onStarting?: (server: unknown) => void;

  readonly onStarted?: (server: unknown) => void;

  readonly onStopping?: (server: unknown) => void;

  readonly onStopped?: (server: unknown) => void;

  readonly onError?: (error: unknown, server: unknown) => void;

  readonly onRequest?: (server: unknown) => void;

  readonly onResponse?: (server: unknown) => void;
}

export interface HttpServerSnapshot {
  readonly name: string;

  readonly state: HttpServerState;

  readonly adapter: string;

  readonly address: HttpServerAddress | undefined;

  readonly startedAt: Date | undefined;

  readonly stoppedAt: Date | undefined;

  readonly uptime: number;

  readonly requests: number;

  readonly metadata: Readonly<Record<string, unknown>>;
}

export {
  HttpServerError,
  InvalidHttpServerStateError,
  HttpServerStartError,
  HttpServerStopError,
};
