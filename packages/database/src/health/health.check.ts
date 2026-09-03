import { DatabaseError } from "@zudolib/errors";

import type { DatabaseClient } from "../databaseClient/databaseClient.core.js";

import { Prisma } from "@prisma/client";

/**
 * Health status of the database.
 */
export type DatabaseHealthStatus = "healthy" | "unhealthy" | "degraded";

/**
 * Detailed database health information.
 */
export interface DatabaseHealth {
  readonly status: DatabaseHealthStatus;
  readonly healthy: boolean;
  readonly latencyMs: number;
  readonly checkedAt: Date;
  readonly message?: string;
  readonly error?: {
    readonly name: string;
    readonly message: string;
  };
}

/**
 * Database health check options.
 */
export interface DatabaseHealthOptions {
  readonly timeoutMs?: number;
}

/**
 * Result of a database readiness check.
 */
export interface DatabaseReadiness {
  readonly ready: boolean;
  readonly checkedAt: Date;
  readonly latencyMs: number;
  readonly message?: string;
}

/**
 * Default database health-check timeout.
 */
export const DEFAULT_HEALTH_TIMEOUT_MS = 5_000;

/**
 * Performs a lightweight database health check.
 */
export async function checkDatabaseHealth(
  client: DatabaseClient,
  options: DatabaseHealthOptions = {},
): Promise<DatabaseHealth> {
  if (!client) {
    throw new TypeError("A database client is required.");
  }

  const timeoutMs = normalizeTimeout(options.timeoutMs);

  const checkedAt = new Date();

  const startedAt = performance.now();

  try {
    await withTimeout(executeHealthCheck(client), timeoutMs);

    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    return {
      status: latencyMs > timeoutMs * 0.75 ? "degraded" : "healthy",
      healthy: true,
      latencyMs,
      checkedAt,
      message: "Database connection is healthy.",
    };
  } catch (error) {
    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    const normalizedError = normalizeHealthError(error);

    return {
      status: "unhealthy",
      healthy: false,
      latencyMs,
      checkedAt,
      message: normalizedError.message,
      error: normalizedError,
    };
  }
}

/**
 * Performs a database readiness check.
 *
 * Readiness is intentionally stricter than health. A degraded
 * connection remains healthy but may still be considered ready.
 */
export async function checkDatabaseReadiness(
  client: DatabaseClient,
  options: DatabaseHealthOptions = {},
): Promise<DatabaseReadiness> {
  if (!client) {
    throw new TypeError("A database client is required.");
  }

  const timeoutMs = normalizeTimeout(options.timeoutMs);

  const checkedAt = new Date();

  const startedAt = performance.now();

  try {
    await withTimeout(executeHealthCheck(client), timeoutMs);

    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    return {
      ready: true,
      checkedAt,
      latencyMs,
      message: "Database is ready.",
    };
  } catch (error) {
    const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));

    return {
      ready: false,
      checkedAt,
      latencyMs,
      message: normalizeHealthError(error).message,
    };
  }
}

/**
 * Throws when the database is not healthy.
 */
export async function assertDatabaseHealth(
  client: DatabaseClient,
  options: DatabaseHealthOptions = {},
): Promise<DatabaseHealth> {
  const health = await checkDatabaseHealth(client, options);

  if (!health.healthy) {
    throw new DatabaseError("Database health check failed.", {
      metadata: {
        status: health.status,
        latencyMs: health.latencyMs,
        checkedAt: health.checkedAt.toISOString(),
      },
      cause: health.error ? new Error(health.error.message) : undefined,
    });
  }

  return health;
}

/**
 * Checks whether a database is reachable.
 */
export async function isDatabaseHealthy(
  client: DatabaseClient,
  options: DatabaseHealthOptions = {},
): Promise<boolean> {
  const health = await checkDatabaseHealth(client, options);

  return health.healthy;
}

/**
 * Executes the lightweight health query.
 */
async function executeHealthCheck(client: DatabaseClient): Promise<void> {
  try {
    await client.queryRaw<
      readonly [
        {
          result: number;
        },
      ]
    >(Prisma.sql`SELECT 1 AS result`);
  } catch (error) {
    throw new DatabaseError("Database health query failed.", {
      cause: error,
    });
  }
}

/**
 * Runs a promise with a timeout.
 */
async function withTimeout<TValue>(
  promise: Promise<TValue>,
  timeoutMs: number,
): Promise<TValue> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<TValue>((_resolve, reject) => {
        timeout = setTimeout(() => {
          reject(
            new DatabaseError(
              `Database health check timed out after ${timeoutMs}ms.`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

/**
 * Normalizes timeout values.
 */
function normalizeTimeout(timeoutMs?: number): number {
  if (timeoutMs === undefined) {
    return DEFAULT_HEALTH_TIMEOUT_MS;
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError(
      "Database health timeout must be a positive finite number.",
    );
  }

  return Math.floor(timeoutMs);
}

/**
 * Converts an unknown error into a safe health error.
 */
function normalizeHealthError(error: unknown): {
  readonly name: string;
  readonly message: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: "DatabaseHealthError",
    message: "Database health check failed.",
  };
}
