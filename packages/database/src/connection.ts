import {
  DatabaseError,
} from "@lattice/errors";

import {
  DatabaseClient,
  type DatabaseClientOptions,
} from "./client";

import type {
  DatabaseHealth,
  DatabaseStatus,
} from "./types";

/**
 * Connection lifecycle events.
 */
export type DatabaseConnectionEvent =
  | "connecting"
  | "connected"
  | "disconnecting"
  | "disconnected"
  | "error";

/**
 * Listener invoked when the connection state changes.
 */
export type DatabaseConnectionListener = (
  event: DatabaseConnectionEvent,
  details: DatabaseConnectionEventDetails,
) => void;

/**
 * Details associated with a connection event.
 */
export interface DatabaseConnectionEventDetails {
  readonly status: DatabaseStatus;
  readonly timestamp: Date;
  readonly error?: unknown;
}

/**
 * Options for the connection manager.
 */
export interface DatabaseConnectionManagerOptions
  extends DatabaseClientOptions {
  readonly autoConnect?: boolean;
  readonly healthCheckIntervalMs?: number;
}

/**
 * Manages the database connection lifecycle.
 *
 * The manager intentionally does not connect during construction.
 * Application bootstrap should call `connect()` explicitly unless
 * `autoConnect` is enabled.
 */
export class DatabaseConnectionManager {
  private readonly client:
    DatabaseClient;

  private readonly listeners =
    new Set<DatabaseConnectionListener>();

  private readonly autoConnect: boolean;

  private readonly healthCheckIntervalMs?: number;

  private healthCheckTimer?:
    ReturnType<
      typeof setInterval
    >;

  private connectionPromise?:
    Promise<void>;

  constructor(
    options: DatabaseConnectionManagerOptions = {},
  ) {
    this.client =
      new DatabaseClient(
        options,
      );

    this.autoConnect =
      options.autoConnect ??
      false;

    this.healthCheckIntervalMs =
      options.healthCheckIntervalMs;
  }

  /**
   * Initializes the connection manager.
   */
  public async initialize(): Promise<void> {
    if (
      !this.autoConnect
    ) {
      return;
    }

    await this.connect();
  }

  /**
   * Opens the database connection.
   */
  public async connect(): Promise<void> {
    if (
      this.client.getStatus() ===
      "connected"
    ) {
      return;
    }

    if (
      this.connectionPromise
    ) {
      return this.connectionPromise;
    }

    this.emit(
      "connecting",
    );

    this.connectionPromise =
      this.client
        .connect()
        .then(() => {
          this.emit(
            "connected",
          );

          this.startHealthChecks();
        })
        .catch((error) => {
          this.emit(
            "error",
            error,
          );

          throw this.normalizeError(
            error,
            "Database connection failed.",
          );
        })
        .finally(() => {
          this.connectionPromise =
            undefined;
        });

    return this.connectionPromise;
  }

  /**
   * Closes the database connection.
   */
  public async disconnect(): Promise<void> {
    this.stopHealthChecks();

    const status =
      this.client.getStatus();

    if (
      status ===
        "disconnected" ||
      status ===
        "disconnecting"
    ) {
      return;
    }

    this.emit(
      "disconnecting",
    );

    try {
      await this.client.disconnect();

      this.emit(
        "disconnected",
      );
    } catch (error) {
      this.emit(
        "error",
        error,
      );

      throw this.normalizeError(
        error,
        "Database disconnection failed.",
      );
    }
  }

  /**
   * Ensures that the connection is ready.
   */
  public async ensureConnected(): Promise<void> {
    if (
      this.client.getStatus() !==
      "connected"
    ) {
      await this.connect();
    }
  }

  /**
   * Returns the current connection status.
   */
  public getStatus(): DatabaseStatus {
    return this.client.getStatus();
  }

  /**
   * Performs a database health check.
   */
  public async healthCheck(): Promise<DatabaseHealth> {
    return this.client.healthCheck();
  }

  /**
   * Returns the underlying database client.
   */
  public getClient(): DatabaseClient {
    return this.client;
  }

  /**
   * Subscribes to connection lifecycle events.
   */
  public on(
    listener: DatabaseConnectionListener,
  ): () => void {
    if (
      typeof listener !==
      "function"
    ) {
      throw new TypeError(
        "A connection listener must be a function.",
      );
    }

    this.listeners.add(
      listener,
    );

    return () => {
      this.off(
        listener,
      );
    };
  }

  /**
   * Removes a connection listener.
   */
  public off(
    listener: DatabaseConnectionListener,
  ): boolean {
    return this.listeners.delete(
      listener,
    );
  }

  /**
   * Removes all connection listeners.
   */
  public removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Starts periodic database health checks.
   */
  public startHealthChecks(): void {
    this.stopHealthChecks();

    const interval =
      this.healthCheckIntervalMs;

    if (
      !interval ||
      interval <= 0
    ) {
      return;
    }

    this.healthCheckTimer =
      setInterval(
        () => {
          void this.runScheduledHealthCheck();
        },
        interval,
      );

    this.unrefTimer();
  }

  /**
   * Stops periodic database health checks.
   */
  public stopHealthChecks(): void {
    if (
      !this.healthCheckTimer
    ) {
      return;
    }

    clearInterval(
      this.healthCheckTimer,
    );

    this.healthCheckTimer =
      undefined;
  }

  /**
   * Releases connection manager resources.
   */
  public async destroy(): Promise<void> {
    this.stopHealthChecks();

    await this.disconnect();

    this.removeAllListeners();
  }

  /**
   * Emits a connection lifecycle event.
   */
  private emit(
    event: DatabaseConnectionEvent,
    error?: unknown,
  ): void {
    const details: DatabaseConnectionEventDetails =
      Object.freeze({
        status:
          this.client.getStatus(),
        timestamp:
          new Date(),
        error,
      });

    for (
      const listener of [
        ...this.listeners,
      ]
    ) {
      try {
        listener(
          event,
          details,
        );
      } catch {
        // Connection lifecycle listeners must never break the
        // database connection lifecycle itself.
      }
    }
  }

  /**
   * Runs a scheduled health check.
   */
  private async runScheduledHealthCheck(): Promise<void> {
    try {
      const health =
        await this.healthCheck();

      if (
        health.status ===
        "error"
      ) {
        this.emit(
          "error",
          health.error,
        );
      }
    } catch (error) {
      this.emit(
        "error",
        error,
      );
    }
  }

  /**
   * Prevents the health-check timer from keeping Node alive.
   */
  private unrefTimer(): void {
    const timer =
      this.healthCheckTimer as
        | (
            ReturnType<
              typeof setInterval
            > & {
              unref?: () => void;
            }
          )
        | undefined;

    timer?.unref?.();
  }

  /**
   * Normalizes connection failures.
   */
  private normalizeError(
    error: unknown,
    fallbackMessage: string,
  ): DatabaseError {
    if (
      error instanceof
      DatabaseError
    ) {
      return error;
    }

    return new DatabaseError(
      error instanceof Error
        ? error.message
        : fallbackMessage,
      {
        cause: error,
        metadata: {
          status:
            this.client.getStatus(),
        },
      },
    );
  }
}

/**
 * Creates a database connection manager.
 */
export function createConnectionManager(
  options: DatabaseConnectionManagerOptions = {},
): DatabaseConnectionManager {
  return new DatabaseConnectionManager(
    options,
  );
}