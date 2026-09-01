/**
 * Lattice HTTP server abstraction.
 *
 * Provides the runtime-independent server lifecycle used by the HTTP package.
 * Concrete runtimes such as Node.js and Fetch-based environments can plug into
 * this abstraction through HttpAdapter implementations.
 */

import {
  HttpAdapterError,
  isHttpAdapter,
  startAdapter,
  stopAdapter,
} from "../httpAdapter/http.adapter.js";

import type {
  HttpAdapter,
  HttpAdapterOptions,
  HttpHandler,
  HttpErrorHandler,
} from "../httpAdapter/http.adapter.js";

import {
  HttpServerLifecycleError as HttpServerError,
  InvalidHttpServerStateError,
  HttpServerStartError,
  HttpServerStopError,
} from "@oyinlola141/lattice-errors";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type HttpServerState =
  | "created"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";

export interface HttpServerAddress {
  readonly protocol?:
    | string;

  readonly host?:
    | string;

  readonly port?:
    | number;

  readonly path?:
    | string;
}

export interface HttpServerOptions
  extends HttpAdapterOptions {
  readonly adapter:
    | HttpAdapter;

  readonly handler?:
    | HttpHandler;

  readonly errorHandler?:
    | HttpErrorHandler;

  readonly gracefulShutdownTimeout?:
    | number;

  readonly metadata?:
    | Readonly<
        Record<string, unknown>
      >;
}

export interface HttpServerEvents {
  readonly onStarting?:
    | ((
        server: HttpServer,
      ) => void);

  readonly onStarted?:
    | ((
        server: HttpServer,
      ) => void);

  readonly onStopping?:
    | ((
        server: HttpServer,
      ) => void);

  readonly onStopped?:
    | ((
        server: HttpServer,
      ) => void);

  readonly onError?:
    | ((
        error: unknown,
        server: HttpServer,
      ) => void);

  readonly onRequest?:
    | ((
        server: HttpServer,
      ) => void);

  readonly onResponse?:
    | ((
        server: HttpServer,
      ) => void);
}

export interface HttpServerSnapshot {
  readonly name:
    | string;

  readonly state:
    | HttpServerState;

  readonly adapter:
    | string;

  readonly address:
    | HttpServerAddress
    | undefined;

  readonly startedAt:
    | Date
    | undefined;

  readonly stoppedAt:
    | Date
    | undefined;

  readonly uptime:
    | number;

  readonly requests:
    | number;

  readonly metadata:
    | Readonly<
        Record<string, unknown>
      >;
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export {
  HttpServerError,
  InvalidHttpServerStateError,
  HttpServerStartError,
  HttpServerStopError,
};

/* -------------------------------------------------------------------------- */
/* Server                                                                     */
/* -------------------------------------------------------------------------- */

export class HttpServer {
  readonly name:
    | string;

  readonly adapter:
    | HttpAdapter;

  readonly metadata:
    | Readonly<
        Record<string, unknown>
      >;

  readonly gracefulShutdownTimeout:
    | number;

  private stateValue:
    | HttpServerState =
    "created";

  private addressValue:
    | HttpServerAddress
    | undefined;

  private startedAtValue:
    | Date
    | undefined;

  private stoppedAtValue:
    | Date
    | undefined;

  private requestCount =
    0;

  private readonly events:
    | HttpServerEvents;

  private readonly configuredHandler:
    | HttpHandler
    | undefined;

  private readonly configuredErrorHandler:
    | HttpErrorHandler
    | undefined;

  private startPromise:
    | Promise<void>
    | undefined;

  private stopPromise:
    | Promise<void>
    | undefined;

  constructor(
    options:
      | HttpServerOptions,
  ) {
    if (
      !isHttpAdapter(
        options.adapter,
      )
    ) {
      throw new TypeError(
        "HttpServer requires a valid HTTP adapter.",
      );
    }

    this.name =
      options.name ??
      "lattice-http";

    this.adapter =
      options.adapter;

    this.metadata =
      Object.freeze({
        ...(options.metadata ??
          {}),
      });

    this.gracefulShutdownTimeout =
      validateShutdownTimeout(
        options.gracefulShutdownTimeout ??
          30_000,
      );

    this.events = {};

    this.configuredHandler =
      options.handler;

    this.configuredErrorHandler =
      options.errorHandler;

    if (
      options.handler
    ) {
      this.adapterHandler(
        options.handler,
      );
    }

    if (
      options.errorHandler
    ) {
      this.adapterErrorHandler(
        options.errorHandler,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  get state():
    | HttpServerState {
    return this.stateValue;
  }

  get isRunning(): boolean {
    return (
      this.stateValue ===
      "running"
    );
  }

  get isStarting(): boolean {
    return (
      this.stateValue ===
      "starting"
    );
  }

  get isStopping(): boolean {
    return (
      this.stateValue ===
      "stopping"
    );
  }

  get isStopped(): boolean {
    return (
      this.stateValue ===
        "stopped" ||
      this.stateValue ===
        "created"
    );
  }

  get address():
    | HttpServerAddress
    | undefined {
    return this.addressValue;
  }

  get startedAt():
    | Date
    | undefined {
    return this.startedAtValue;
  }

  get stoppedAt():
    | Date
    | undefined {
    return this.stoppedAtValue;
  }

  get requests():
    | number {
    return this.requestCount;
  }

  get uptime():
    | number {
    if (
      !this.startedAtValue
    ) {
      return 0;
    }

    const end =
      this.stoppedAtValue ??
      new Date();

    return Math.max(
      0,
      end.getTime() -
        this.startedAtValue.getTime(),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Lifecycle                                                                 */
  /* ------------------------------------------------------------------------ */

  async start(): Promise<this> {
    if (
      this.stateValue ===
      "running"
    ) {
      return this;
    }

    if (
      this.stateValue ===
      "starting"
    ) {
      await this.startPromise;

      return this;
    }

    if (
      this.stateValue ===
      "stopping"
    ) {
      throw new InvalidHttpServerStateError(
        this.stateValue,
        "start",
      );
    }

    this.stateValue =
      "starting";

    this.events.onStarting?.(
      this,
    );

    this.startPromise =
      this.performStart();

    try {
      await this.startPromise;

      this.stateValue =
        "running";

      this.startedAtValue =
        new Date();

      this.stoppedAtValue =
        undefined;

      this.refreshAddress();

      this.events.onStarted?.(
        this,
      );

      return this;
    } catch (
      error
    ) {
      this.stateValue =
        "failed";

      const wrapped =
        error instanceof
        HttpServerStartError
          ? error
          : new HttpServerStartError(
              "Failed to start the HTTP server.",
              error,
            );

      this.events.onError?.(
        wrapped,
        this,
      );

      throw wrapped;
    } finally {
      this.startPromise =
        undefined;
    }
  }

  async stop(
    options:
      | {
          readonly force?:
            | boolean;
          readonly timeout?:
            | number;
        } = {},
  ): Promise<this> {
    if (
      this.stateValue ===
        "created" ||
      this.stateValue ===
        "stopped"
    ) {
      return this;
    }

    if (
      this.stateValue ===
      "stopping"
    ) {
      await this.stopPromise;

      return this;
    }

    if (
      this.stateValue ===
      "starting"
    ) {
      throw new InvalidHttpServerStateError(
        this.stateValue,
        "stop",
      );
    }

    this.stateValue =
      "stopping";

    this.events.onStopping?.(
      this,
    );

    const timeout =
      validateShutdownTimeout(
        options.timeout ??
          this.gracefulShutdownTimeout,
      );

    this.stopPromise =
      this.performStop(
        options.force ??
          false,
        timeout,
      );

    try {
      await this.stopPromise;

      this.stateValue =
        "stopped";

      this.stoppedAtValue =
        new Date();

      this.events.onStopped?.(
        this,
      );

      return this;
    } catch (
      error
    ) {
      this.stateValue =
        "failed";

      const wrapped =
        error instanceof
        HttpServerStopError
          ? error
          : new HttpServerStopError(
              "Failed to stop the HTTP server.",
              error,
            );

      this.events.onError?.(
        wrapped,
        this,
      );

      throw wrapped;
    } finally {
      this.stopPromise =
        undefined;
    }
  }

  async restart(): Promise<this> {
    if (
      this.stateValue ===
        "running" ||
      this.stateValue ===
        "failed"
    ) {
      await this.stop({
        force:
          this.stateValue ===
          "failed",
      });
    }

    return this.start();
  }

  async close(): Promise<this> {
    return this.stop();
  }

  /* ------------------------------------------------------------------------ */
  /* Handler Configuration                                                     */
  /* ------------------------------------------------------------------------ */

  setHandler(
    handler:
      | HttpHandler,
  ): this {
    this.adapterHandler(
      handler,
    );

    return this;
  }

  setErrorHandler(
    handler:
      | HttpErrorHandler,
  ): this {
    this.adapterErrorHandler(
      handler,
    );

    return this;
  }

  private adapterHandler(
    handler:
      | HttpHandler,
  ): void {
    const adapter =
      this.adapter as
        HttpAdapter & {
          handler?:
            | HttpHandler;
        };

    if (
      "handler" in
      adapter
    ) {
      adapter.handler =
        handler;

      return;
    }

    /*
     * BaseHttpAdapter exposes its handler through construction. For adapters
     * that do not expose a mutable handler property, wrapping is done through
     * the server dispatch layer when supported.
     */
  }

  private adapterErrorHandler(
    handler:
      | HttpErrorHandler,
  ): void {
    const adapter =
      this.adapter as
        HttpAdapter & {
          errorHandler?:
            | HttpErrorHandler;
        };

    if (
      "errorHandler" in
      adapter
    ) {
      adapter.errorHandler =
        handler;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Request Tracking                                                          */
  /* ------------------------------------------------------------------------ */

  recordRequest(): void {
    this.requestCount +=
      1;

    this.events.onRequest?.(
      this,
    );
  }

  recordResponse(): void {
    this.events.onResponse?.(
      this,
    );
  }

  resetRequestCount(): void {
    this.requestCount =
      0;
  }

  /* ------------------------------------------------------------------------ */
  /* Events                                                                    */
  /* ------------------------------------------------------------------------ */

  on(
    event:
      | keyof HttpServerEvents,
    listener:
      | NonNullable<
          HttpServerEvents[
            keyof HttpServerEvents
          ]
        >,
  ): () => void {
    const events =
      this.events as Record<
        string,
        unknown
      >;

    const previous =
      events[event];

    if (
      previous
    ) {
      throw new HttpServerError(
        `A listener for "${String(event)}" is already registered.`,
        {
          code:
            "HTTP_SERVER_EVENT_LISTENER_EXISTS",
        },
      );
    }

    events[event] =
      listener;

    return () => {
      if (
        events[event] ===
        listener
      ) {
        events[event] =
          undefined;
      }
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Snapshot                                                                  */
  /* ------------------------------------------------------------------------ */

  snapshot(): HttpServerSnapshot {
    return {
      name:
        this.name,

      state:
        this.stateValue,

      adapter:
        this.adapter.name,

      address:
        this.addressValue,

      startedAt:
        this.startedAtValue,

      stoppedAt:
        this.stoppedAtValue,

      uptime:
        this.uptime,

      requests:
        this.requestCount,

      metadata:
        this.metadata,
    };
  }

  toJSON(): HttpServerSnapshot {
    return this.snapshot();
  }

  /* ------------------------------------------------------------------------ */
  /* Internals                                                                 */
  /* ------------------------------------------------------------------------ */

  private async performStart(): Promise<void> {
    await startAdapter(
      this.adapter,
    );
  }

  private async performStop(
    force:
      | boolean,
    timeout:
      | number,
  ): Promise<void> {
    if (
      force
    ) {
      await stopAdapter(
        this.adapter,
      );

      return;
    }

    await withTimeout(
      stopAdapter(
        this.adapter,
      ),
      timeout,
      "HTTP server shutdown timed out.",
    );
  }

  private refreshAddress(): void {
    const adapter =
      this.adapter as
        HttpAdapter & {
          address?:
            | HttpServerAddress;
        };

    if (
      adapter.address
    ) {
      this.addressValue =
        adapter.address;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createHttpServer(
  options:
    | HttpServerOptions,
): HttpServer {
  return new HttpServer(
    options,
  );
}

/* -------------------------------------------------------------------------- */
/* Server Manager                                                             */
/* -------------------------------------------------------------------------- */

export class HttpServerManager {
  private readonly servers =
    new Map<
      string,
      HttpServer
    >();

  register(
    server:
      | HttpServer,
  ): this {
    if (
      this.servers.has(
        server.name,
      )
    ) {
      throw new HttpServerError(
        `HTTP server "${server.name}" is already registered.`,
        {
          code:
            "HTTP_SERVER_ALREADY_REGISTERED",
        },
      );
    }

    this.servers.set(
      server.name,
      server,
    );

    return this;
  }

  replace(
    server:
      | HttpServer,
  ): this {
    this.servers.set(
      server.name,
      server,
    );

    return this;
  }

  unregister(
    name:
      | string,
  ): boolean {
    return this.servers.delete(
      name,
    );
  }

  get(
    name:
      | string,
  ):
    | HttpServer
    | undefined {
    return this.servers.get(
      name,
    );
  }

  require(
    name:
      | string,
  ): HttpServer {
    const server =
      this.get(
        name,
      );

    if (
      !server
    ) {
      throw new HttpServerError(
        `HTTP server "${name}" is not registered.`,
        {
          code:
            "HTTP_SERVER_NOT_FOUND",
        },
      );
    }

    return server;
  }

  list():
    | readonly HttpServer[] {
    return Object.freeze(
      [
        ...this.servers.values(),
      ],
    );
  }

  async startAll(): Promise<void> {
    for (
      const server of this.servers.values()
    ) {
      await server.start();
    }
  }

  async stopAll(): Promise<void> {
    const servers =
      [
        ...this.servers.values(),
      ].reverse();

    for (
      const server of servers
    ) {
      await server.stop();
    }
  }

  async restartAll(): Promise<void> {
    await this.stopAll();
    await this.startAll();
  }
}

/* -------------------------------------------------------------------------- */
/* Utility Functions                                                          */
/* -------------------------------------------------------------------------- */

export async function startServer(
  server:
    | HttpServer,
): Promise<HttpServer> {
  return server.start();
}

export async function stopServer(
  server:
    | HttpServer,
): Promise<HttpServer> {
  return server.stop();
}

export async function restartServer(
  server:
    | HttpServer,
): Promise<HttpServer> {
  return server.restart();
}

export function isHttpServer(
  value: unknown,
): value is HttpServer {
  return (
    value instanceof
    HttpServer
  );
}

export function getServerState(
  server:
    | HttpServer,
): HttpServerState {
  return server.state;
}

export function getServerAddress(
  server:
    | HttpServer,
):
  | HttpServerAddress
  | undefined {
  return server.address;
}

/* -------------------------------------------------------------------------- */
/* Timeout Helper                                                             */
/* -------------------------------------------------------------------------- */

export function withTimeout<T>(
  promise:
    | Promise<T>,
  timeout:
    | number,
  message:
    | string,
): Promise<T> {
  if (
    timeout ===
    0
  ) {
    return promise;
  }

  return new Promise<T>(
    (
      resolve,
      reject,
    ) => {
      let settled =
        false;

      const timer =
        setTimeout(
          () => {
            if (
              settled
            ) {
              return;
            }

            settled =
              true;

            reject(
              new HttpServerError(
                message,
                {
                  code:
                    "HTTP_SERVER_TIMEOUT",
                },
              ),
            );
          },
          timeout,
        );

      promise.then(
        (
          value,
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled =
            true;

          clearTimeout(
            timer,
          );

          resolve(
            value,
          );
        },
        (
          error,
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled =
            true;

          clearTimeout(
            timer,
          );

          reject(
            error,
          );
        },
      );
    },
  );
}

function validateShutdownTimeout(
  timeout:
    | number,
): number {
  if (
    !Number.isFinite(
      timeout,
    ) ||
    timeout < 0
  ) {
    throw new RangeError(
      "HTTP server shutdown timeout must be a non-negative finite number.",
    );
  }

  return timeout;
}