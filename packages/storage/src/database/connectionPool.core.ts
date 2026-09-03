/**
 * Connection pool that manages database connections with backpressure.
 */

import { StorageError } from "@zudoliblib/errors";
import type {
  Connection,
  ConnectionPoolOptions,
  PoolStats,
} from "../types/storage.type.js";

/** Default pool options. */
const DEFAULT_POOL_OPTIONS: ConnectionPoolOptions = {
  min: 2,
  max: 10,
  acquireTimeout: 30_000,
  idleTimeout: 30_000,
  connectionTimeout: 10_000,
  maxLifetime: 0,
};

export class ConnectionPool {
  private readonly options: ConnectionPoolOptions;
  private readonly available: Connection[] = [];
  private readonly inUse = new Set<Connection>();
  private readonly waitQueue: Array<{
    resolve: (conn: Connection) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];
  private connectionIdCounter = 0;
  private closed = false;

  constructor(
    private readonly factory: () => Promise<Connection>,
    options?: Partial<ConnectionPoolOptions>,
  ) {
    this.options = { ...DEFAULT_POOL_OPTIONS, ...options };
  }

  /** Initialize the pool with minimum connections. */
  async initialize(): Promise<void> {
    const initial = Math.min(this.options.min, this.options.max);
    for (let i = 0; i < initial; i++) {
      const conn = await this.createConnection();
      this.available.push(conn);
    }
  }

  /** Acquire a connection from the pool. */
  async acquire(): Promise<Connection> {
    if (this.closed) {
      throw new StorageError("Pool is closed", {
        code: "STORAGE_CONNECTION_POOL_CLOSED",
        statusCode: 503,
      });
    }

    while (this.available.length > 0) {
      const conn = this.available.pop()!;
      if (await this.isConnectionAlive(conn)) {
        this.inUse.add(conn);
        return conn;
      }
      await this.safeClose(conn);
    }

    if (this.inUse.size < this.options.max) {
      const conn = await this.createConnection();
      this.inUse.add(conn);
      return conn;
    }

    return this.waitForConnection();
  }

  /** Release a connection back to the pool. */
  async release(connection: Connection): Promise<void> {
    this.inUse.delete(connection);

    if (this.closed) {
      await this.safeClose(connection);
      return;
    }

    if (this.waitQueue.length > 0) {
      const waiter = this.waitQueue.shift()!;
      clearTimeout(waiter.timer);
      this.inUse.add(connection);
      waiter.resolve(connection);
      return;
    }

    this.available.push(connection);
  }

  /** Use a connection and automatically release it. */
  async use<T>(fn: (conn: Connection) => Promise<T>): Promise<T> {
    const conn = await this.acquire();
    try {
      return await fn(conn);
    } finally {
      await this.release(conn);
    }
  }

  /** Get pool statistics. */
  getStats(): PoolStats {
    return {
      total: this.available.length + this.inUse.size,
      idle: this.available.length,
      active: this.inUse.size,
      waiting: this.waitQueue.length,
    };
  }

  /** Drain all connections gracefully. */
  async drain(): Promise<void> {
    this.closed = true;

    for (const waiter of this.waitQueue) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("Pool is draining"));
    }
    this.waitQueue.length = 0;

    while (this.available.length > 0) {
      const conn = this.available.pop()!;
      await this.safeClose(conn);
    }

    const drainTimeout = 30_000;
    const start = Date.now();
    while (this.inUse.size > 0 && Date.now() - start < drainTimeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    for (const conn of this.inUse) {
      await this.safeClose(conn);
    }
    this.inUse.clear();
  }

  /** Check if the pool is healthy. */
  async healthCheck(): Promise<{ healthy: boolean; stats: PoolStats }> {
    const stats = this.getStats();

    if (this.available.length === 0 && this.inUse.size === 0) {
      try {
        const conn = await this.createConnection();
        this.available.push(conn);
        return { healthy: true, stats: this.getStats() };
      } catch {
        return { healthy: false, stats };
      }
    }

    for (const conn of this.available) {
      if (await this.isConnectionAlive(conn)) return { healthy: true, stats };
    }

    return { healthy: this.inUse.size > 0, stats };
  }

  private async createConnection(): Promise<Connection> {
    const conn = await this.factory();
    this.connectionIdCounter++;
    return conn;
  }

  private async isConnectionAlive(conn: Connection): Promise<boolean> {
    try {
      return await conn.ping();
    } catch {
      return false;
    }
  }

  private async safeClose(conn: Connection): Promise<void> {
    try {
      await conn.close();
    } catch {
      /* Ignore close errors */
    }
  }

  private waitForConnection(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waitQueue.findIndex((w) => w.resolve === resolve);
        if (idx !== -1) this.waitQueue.splice(idx, 1);
        reject(new Error("Acquire timeout: no connection available"));
      }, this.options.acquireTimeout);

      this.waitQueue.push({ resolve, reject, timer });
    });
  }
}
