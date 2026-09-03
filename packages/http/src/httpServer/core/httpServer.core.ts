/**
 * Zudolib HTTP server core.
 *
 * @module httpServer/core
 */

import {
  isHttpAdapter,
  startAdapter,
  stopAdapter,
} from "../../httpAdapter/http.adapter.js";

import type {
  HttpAdapter,
  HttpAdapterOptions,
  HttpHandler,
  HttpErrorHandler,
} from "../../httpAdapter/http.adapter.js";

import type {
  HttpServerState,
  HttpServerAddress,
  HttpServerOptions,
  HttpServerEvents,
  HttpServerSnapshot,
} from "../types/httpServer.type.js";

import {
  HttpServerLifecycleError,
  InvalidHttpServerStateError,
  HttpServerStartError,
  HttpServerStopError,
} from "@zudoliblib/errors";

import {
  withTimeout,
  validateShutdownTimeout,
} from "../factory/httpServer.factory.js";

export class HttpServer {
  readonly name: string;

  readonly adapter: HttpAdapter;

  readonly metadata: Readonly<Record<string, unknown>>;

  readonly gracefulShutdownTimeout: number;

  private stateValue: HttpServerState = "created";

  private addressValue: HttpServerAddress | undefined;

  private startedAtValue: Date | undefined;

  private stoppedAtValue: Date | undefined;

  private requestCount = 0;

  private readonly events: HttpServerEvents;

  private readonly configuredHandler: HttpHandler | undefined;

  private readonly configuredErrorHandler: HttpErrorHandler | undefined;

  private startPromise: Promise<void> | undefined;

  private stopPromise: Promise<void> | undefined;

  constructor(options: HttpServerOptions) {
    if (!isHttpAdapter(options.adapter)) {
      throw new TypeError("HttpServer requires a valid HTTP adapter.");
    }

    this.name = options.name ?? "zudolib-http";

    this.adapter = options.adapter;

    this.metadata = Object.freeze({
      ...(options.metadata ?? {}),
    });

    this.gracefulShutdownTimeout = validateShutdownTimeout(
      options.gracefulShutdownTimeout ?? 30_000,
    );

    this.events = {};

    this.configuredHandler = options.handler;

    this.configuredErrorHandler = options.errorHandler;

    if (options.handler) {
      this.adapterHandler(options.handler);
    }

    if (options.errorHandler) {
      this.adapterErrorHandler(options.errorHandler);
    }
  }

  get state(): HttpServerState {
    return this.stateValue;
  }

  get isRunning(): boolean {
    return this.stateValue === "running";
  }

  get isStarting(): boolean {
    return this.stateValue === "starting";
  }

  get isStopping(): boolean {
    return this.stateValue === "stopping";
  }

  get isStopped(): boolean {
    return this.stateValue === "stopped" || this.stateValue === "created";
  }

  get address(): HttpServerAddress | undefined {
    return this.addressValue;
  }

  get startedAt(): Date | undefined {
    return this.startedAtValue;
  }

  get stoppedAt(): Date | undefined {
    return this.stoppedAtValue;
  }

  get requests(): number {
    return this.requestCount;
  }

  get uptime(): number {
    if (!this.startedAtValue) {
      return 0;
    }

    const end = this.stoppedAtValue ?? new Date();

    return Math.max(0, end.getTime() - this.startedAtValue.getTime());
  }

  async start(): Promise<this> {
    if (this.stateValue === "running") {
      return this;
    }

    if (this.stateValue === "starting") {
      await this.startPromise;

      return this;
    }

    if (this.stateValue === "stopping") {
      throw new InvalidHttpServerStateError(this.stateValue, "start");
    }

    this.stateValue = "starting";

    this.events.onStarting?.(this);

    this.startPromise = this.performStart();

    try {
      await this.startPromise;

      this.stateValue = "running";

      this.startedAtValue = new Date();

      this.stoppedAtValue = undefined;

      this.refreshAddress();

      this.events.onStarted?.(this);

      return this;
    } catch (error) {
      this.stateValue = "failed";

      const wrapped =
        error instanceof HttpServerStartError
          ? error
          : new HttpServerStartError("Failed to start the HTTP server.", error);

      this.events.onError?.(wrapped, this);

      throw wrapped;
    } finally {
      this.startPromise = undefined;
    }
  }

  async stop(
    options: {
      readonly force?: boolean;
      readonly timeout?: number;
    } = {},
  ): Promise<this> {
    if (this.stateValue === "created" || this.stateValue === "stopped") {
      return this;
    }

    if (this.stateValue === "stopping") {
      await this.stopPromise;

      return this;
    }

    if (this.stateValue === "starting") {
      throw new InvalidHttpServerStateError(this.stateValue, "stop");
    }

    this.stateValue = "stopping";

    this.events.onStopping?.(this);

    const timeout = validateShutdownTimeout(
      options.timeout ?? this.gracefulShutdownTimeout,
    );

    this.stopPromise = this.performStop(options.force ?? false, timeout);

    try {
      await this.stopPromise;

      this.stateValue = "stopped";

      this.stoppedAtValue = new Date();

      this.events.onStopped?.(this);

      return this;
    } catch (error) {
      this.stateValue = "failed";

      const wrapped =
        error instanceof HttpServerStopError
          ? error
          : new HttpServerStopError("Failed to stop the HTTP server.", error);

      this.events.onError?.(wrapped, this);

      throw wrapped;
    } finally {
      this.stopPromise = undefined;
    }
  }

  async restart(): Promise<this> {
    if (this.stateValue === "running" || this.stateValue === "failed") {
      await this.stop({
        force: this.stateValue === "failed",
      });
    }

    return this.start();
  }

  async close(): Promise<this> {
    return this.stop();
  }

  setHandler(handler: HttpHandler): this {
    this.adapterHandler(handler);

    return this;
  }

  setErrorHandler(handler: HttpErrorHandler): this {
    this.adapterErrorHandler(handler);

    return this;
  }

  private adapterHandler(handler: HttpHandler): void {
    const adapter = this.adapter as HttpAdapter & {
      handler?: HttpHandler;
    };

    if ("handler" in adapter) {
      adapter.handler = handler;

      return;
    }
  }

  private adapterErrorHandler(handler: HttpErrorHandler): void {
    const adapter = this.adapter as HttpAdapter & {
      errorHandler?: HttpErrorHandler;
    };

    if ("errorHandler" in adapter) {
      adapter.errorHandler = handler;
    }
  }

  recordRequest(): void {
    this.requestCount += 1;

    this.events.onRequest?.(this);
  }

  recordResponse(): void {
    this.events.onResponse?.(this);
  }

  resetRequestCount(): void {
    this.requestCount = 0;
  }

  on(
    event: keyof HttpServerEvents,
    listener: NonNullable<HttpServerEvents[keyof HttpServerEvents]>,
  ): () => void {
    const events = this.events as Record<string, unknown>;

    const previous = events[event as string];

    if (previous) {
      throw new HttpServerLifecycleError(
        `A listener for "${String(event)}" is already registered.`,
        {
          code: "HTTP_SERVER_EVENT_LISTENER_EXISTS",
        },
      );
    }

    events[event as string] = listener;

    return () => {
      if (events[event as string] === listener) {
        events[event as string] = undefined;
      }
    };
  }

  snapshot(): HttpServerSnapshot {
    const address = this.addressValue;
    const startedAt = this.startedAtValue;
    const stoppedAt = this.stoppedAtValue;

    return {
      name: this.name,

      state: this.stateValue,

      adapter: this.adapter.name,

      address: address === undefined ? undefined : { ...address },

      startedAt:
        startedAt === undefined ? undefined : new Date(startedAt.getTime()),

      stoppedAt:
        stoppedAt === undefined ? undefined : new Date(stoppedAt.getTime()),

      uptime: this.uptime,

      requests: this.requestCount,

      metadata: Object.freeze({ ...this.metadata }),
    };
  }

  toJSON(): HttpServerSnapshot {
    return this.snapshot();
  }

  private async performStart(): Promise<void> {
    await startAdapter(this.adapter);
  }

  private async performStop(force: boolean, timeout: number): Promise<void> {
    if (force) {
      await stopAdapter(this.adapter);

      return;
    }

    await withTimeout(
      stopAdapter(this.adapter),
      timeout,
      "HTTP server shutdown timed out.",
    );
  }

  private refreshAddress(): void {
    const adapter = this.adapter as HttpAdapter & {
      address?: HttpServerAddress;
    };

    if (adapter.address) {
      this.addressValue = adapter.address;
    }
  }
}
