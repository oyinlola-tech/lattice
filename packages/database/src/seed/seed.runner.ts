import {
  DatabaseError,
} from "@oyinlola141/lattice-errors";

import type {
  DatabaseClient,
  DatabaseTransactionContext,
} from "../databaseClient/databaseClient.core.js";

import { Prisma } from "@prisma/client";

/**
 * Defines a database seed operation.
 */
export interface Seed {
  /**
   * Unique seed name.
   */
  readonly name: string;

  /**
   * Seed execution order.
   */
  readonly order?: number;

  /**
   * Executes the seed.
   */
  readonly run: (
    database: DatabaseTransactionContext,
  ) => Promise<void>;

  /**
   * Optional cleanup operation.
   */
  readonly rollback?: (
    database: DatabaseTransactionContext,
  ) => Promise<void>;
}

/**
 * Persisted seed execution record.
 */
export interface SeedRecord {
  readonly name: string;
  readonly appliedAt: Date;
}

/**
 * Result returned by the seed runner.
 */
export interface SeedResult {
  readonly applied: readonly SeedRecord[];
  readonly skipped: readonly SeedRecord[];
}

/**
 * Seed runner configuration.
 */
export interface SeedRunnerOptions {
  readonly tableName?: string;
  readonly lockKey?: string;
}

/**
 * Default seed tracking table.
 */
export const DEFAULT_SEED_TABLE =
  "_seeds";

/**
 * Default seed advisory lock.
 */
export const DEFAULT_SEED_LOCK =
  "database:seeds";

/**
 * Runs and tracks database seeds.
 */
export class SeedRunner {
  private readonly client:
    DatabaseClient;

  private readonly seeds:
    readonly Seed[];

  private readonly tableName:
    string;

  private readonly lockKey:
    string;

  constructor(
    client: DatabaseClient,
    seeds: readonly Seed[],
    options: SeedRunnerOptions = {},
  ) {
    if (!client) {
      throw new TypeError(
        "A database client is required.",
      );
    }

    this.client =
      client;

    this.seeds =
      normalizeSeeds(
        seeds,
      );

    this.tableName =
      options.tableName ??
      DEFAULT_SEED_TABLE;

    this.lockKey =
      options.lockKey ??
      DEFAULT_SEED_LOCK;

    validateIdentifier(
      this.tableName,
      "seed table name",
    );

    validateLockKey(
      this.lockKey,
    );
  }

  /**
   * Returns the seed runner status.
   */
  public async status(): Promise<{
    readonly pending: readonly Seed[];
    readonly applied: readonly SeedRecord[];
  }> {
    await this.ensureSeedTable();

    const applied =
      await this.getAppliedSeeds();

    const appliedNames =
      new Set(
        applied.map(
          (seed) =>
            seed.name,
        ),
      );

    const pending =
      this.seeds.filter(
        (seed) =>
          !appliedNames.has(
            seed.name,
          ),
      );

    return {
      pending,
      applied,
    };
  }

  /**
   * Executes every pending seed.
   */
  public async run(): Promise<SeedResult> {
    await this.ensureSeedTable();

    const applied =
      await this.getAppliedSeeds();

    const appliedNames =
      new Set(
        applied.map(
          (seed) =>
            seed.name,
        ),
      );

    const pending =
      this.seeds.filter(
        (seed) =>
          !appliedNames.has(
            seed.name,
          ),
      );

    if (
      pending.length === 0
    ) {
      return {
        applied: [],
        skipped: applied,
      };
    }

    const newlyApplied:
      SeedRecord[] =
      [];

    await this.client.transaction(
      async (
        transaction,
      ) => {
        await this.acquireSeedLock(
          transaction,
        );

        for (
          const seed of pending
        ) {
          await this.executeSeed(
            transaction,
            seed,
          );

          const record =
            await this.recordSeed(
              transaction,
              seed,
            );

          newlyApplied.push(
            record,
          );
        }
      },
    );

    return {
      applied:
        newlyApplied,
      skipped:
        applied,
    };
  }

  /**
   * Executes one named seed.
   */
  public async runOne(
    name: string,
  ): Promise<SeedRecord> {
    validateSeedName(
      name,
    );

    await this.ensureSeedTable();

    const seed =
      this.seeds.find(
        (candidate) =>
          candidate.name ===
          name,
      );

    if (!seed) {
      throw new DatabaseError(
        `Seed "${name}" is not registered.`,
      );
    }

    const applied =
      await this.getAppliedSeeds();

    const existing =
      applied.find(
        (record) =>
          record.name ===
          name,
      );

    if (existing) {
      return existing;
    }

    let result:
      SeedRecord | undefined;

    await this.client.transaction(
      async (
        transaction,
      ) => {
        await this.acquireSeedLock(
          transaction,
        );

        const current =
          await this.getAppliedSeeds(
            transaction,
          );

        const alreadyApplied =
          current.find(
            (record) =>
              record.name ===
              name,
          );

        if (
          alreadyApplied
        ) {
          result =
            alreadyApplied;

          return;
        }

        await this.executeSeed(
          transaction,
          seed,
        );

        result =
          await this.recordSeed(
            transaction,
            seed,
          );
      },
    );

    if (!result) {
      throw new DatabaseError(
        `Seed "${name}" did not produce an execution record.`,
      );
    }

    return result;
  }

  /**
   * Rolls back the most recently applied seed.
   */
  public async rollback(): Promise<SeedRecord | null> {
    await this.ensureSeedTable();

    const applied =
      await this.getAppliedSeeds();

    if (
      applied.length === 0
    ) {
      return null;
    }

    const latest =
      applied[
        applied.length - 1
      ];

    if (!latest) {
      return null;
    }

    const seed =
      this.seeds.find(
        (candidate) =>
          candidate.name ===
          latest.name,
      );

    if (!seed) {
      throw new DatabaseError(
        `Seed "${latest.name}" is recorded as applied but is not registered.`,
      );
    }

    if (
      !seed.rollback
    ) {
      throw new DatabaseError(
        `Seed "${seed.name}" does not define a rollback operation.`,
      );
    }

    await this.client.transaction(
      async (
        transaction,
      ) => {
        await this.acquireSeedLock(
          transaction,
        );

        await seed.rollback!(
          transaction,
        );

        await this.deleteSeedRecord(
          transaction,
          seed.name,
        );
      },
    );

    return latest;
  }

  /**
   * Rolls back every applied seed in reverse execution order.
   */
  public async rollbackAll(): Promise<
    readonly SeedRecord[]
  > {
    await this.ensureSeedTable();

    const applied =
      await this.getAppliedSeeds();

    if (
      applied.length === 0
    ) {
      return [];
    }

    const rolledBack:
      SeedRecord[] =
      [];

    await this.client.transaction(
      async (
        transaction,
      ) => {
        await this.acquireSeedLock(
          transaction,
        );

        for (
          let index =
            applied.length - 1;
          index >= 0;
          index -= 1
        ) {
          const record =
            applied[index];

          if (!record) {
            continue;
          }

          const seed =
            this.seeds.find(
              (candidate) =>
                candidate.name ===
                record.name,
            );

          if (!seed) {
            throw new DatabaseError(
              `Seed "${record.name}" is not registered.`,
            );
          }

          if (
            !seed.rollback
          ) {
            throw new DatabaseError(
              `Seed "${seed.name}" does not define a rollback operation.`,
            );
          }

          await seed.rollback(
            transaction,
          );

          await this.deleteSeedRecord(
            transaction,
            seed.name,
          );

          rolledBack.push(
            record,
          );
        }
      },
    );

    return rolledBack;
  }

  /**
   * Creates the seed tracking table if it does not exist.
   */
  public async ensureSeedTable(): Promise<void> {
    const table =
      quoteIdentifier(
        this.tableName,
      );

    try {
      await this.client.executeRaw(
        Prisma.sql`
          CREATE TABLE IF NOT EXISTS ${table} (
            "name" VARCHAR(255) PRIMARY KEY,
            "applied_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `,
      );
    } catch (error) {
      throw new DatabaseError(
        "Failed to initialize the seed tracking table.",
        {
          cause: error,
          metadata: {
            tableName:
              this.tableName,
          },
        },
      );
    }
  }

  /**
   * Returns all applied seeds.
   */
  public async getAppliedSeeds(
    transaction?: DatabaseTransactionContext,
  ): Promise<readonly SeedRecord[]> {
    const table =
      quoteIdentifier(
        this.tableName,
      );

    try {
      let rows;
      if (transaction) {
        rows = await transaction.$queryRawUnsafe(`
          SELECT
            "name",
            "applied_at"
          FROM ${table}
          ORDER BY "applied_at" ASC, "name" ASC
        `);
      } else {
        rows = await this.client.queryRaw(
          Prisma.sql`
            SELECT
              "name",
              "applied_at"
            FROM ${table}
            ORDER BY "applied_at" ASC, "name" ASC
          `,
        );
      }

      return (rows as readonly { name: string; applied_at: Date; }[]).map(
        (row) => ({
          name:
            row.name,
          appliedAt:
            new Date(
              row.applied_at,
            ),
        }),
      );
    } catch (error) {
      throw new DatabaseError(
        "Failed to read seed execution history.",
        {
          cause: error,
          metadata: {
            tableName:
              this.tableName,
          },
        },
      );
    }
  }

  /**
   * Executes a seed.
   */
  private async executeSeed(
    transaction: DatabaseTransactionContext,
    seed: Seed,
  ): Promise<void> {
    try {
      await seed.run(
        transaction,
      );
    } catch (error) {
      throw new DatabaseError(
        `Seed "${seed.name}" failed.`,
        {
          cause: error,
          metadata: {
            name:
              seed.name,
            order:
              seed.order ??
              0,
          },
        },
      );
    }
  }

  /**
   * Records a successfully executed seed.
   */
  private async recordSeed(
    transaction: DatabaseTransactionContext,
    seed: Seed,
  ): Promise<SeedRecord> {
    const table =
      quoteIdentifier(
        this.tableName,
      );

    try {
      await transaction.$executeRawUnsafe(
        `
          INSERT INTO ${table}
            ("name")
          VALUES
            ($1)
        `,
        seed.name,
      );

      return {
        name:
          seed.name,
        appliedAt:
          new Date(),
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to record seed "${seed.name}".`,
        {
          cause: error,
          metadata: {
            name:
              seed.name,
          },
        },
      );
    }
  }

  /**
   * Removes a seed execution record.
   */
  private async deleteSeedRecord(
    transaction: DatabaseTransactionContext,
    name: string,
  ): Promise<void> {
    const table =
      quoteIdentifier(
        this.tableName,
      );

    try {
      await transaction.$executeRawUnsafe(
        `
          DELETE FROM ${table}
          WHERE "name" = $1
        `,
        name,
      );
    } catch (error) {
      throw new DatabaseError(
        `Failed to remove seed record "${name}".`,
        {
          cause: error,
          metadata: {
            name,
          },
        },
      );
    }
  }

  /**
   * Acquires the advisory lock used for seed execution.
   */
  private async acquireSeedLock(
    transaction: DatabaseTransactionContext,
  ): Promise<void> {
    try {
      const lock =
        hashLockKey(
          this.lockKey,
        );

      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(
          ${lock}
        )
      `;
    } catch (error) {
      throw new DatabaseError(
        "Failed to acquire the database seed lock.",
        {
          cause: error,
          metadata: {
            lockKey:
              this.lockKey,
          },
        },
      );
    }
  }
}

/**
 * Creates a seed runner.
 */
export function createSeedRunner(
  client: DatabaseClient,
  seeds: readonly Seed[],
  options?: SeedRunnerOptions,
): SeedRunner {
  return new SeedRunner(
    client,
    seeds,
    options,
  );
}

/**
 * Validates and sorts seed definitions.
 */
export function normalizeSeeds(
  seeds: readonly Seed[],
): readonly Seed[] {
  if (
    !Array.isArray(
      seeds,
    )
  ) {
    throw new TypeError(
      "Seeds must be an array.",
    );
  }

  const normalized =
    seeds
      .map(
        (seed) => {
          validateSeed(
            seed,
          );

          return Object.freeze({
            ...seed,
          });
        },
      )
      .sort(
        (
          first,
          second,
        ) =>
          (first.order ?? 0) -
          (second.order ?? 0),
      );

  const names =
    new Set<string>();

  for (
    const seed of normalized
  ) {
    if (
      names.has(
        seed.name,
      )
    ) {
      throw new TypeError(
        `Duplicate seed name: "${seed.name}".`,
      );
    }

    names.add(
      seed.name,
    );
  }

  return Object.freeze(
    normalized,
  );
}

/**
 * Validates one seed definition.
 */
export function validateSeed(
  seed: Seed,
): void {
  if (
    !seed ||
    typeof seed !==
      "object"
  ) {
    throw new TypeError(
      "A seed definition is required.",
    );
  }

  validateSeedName(
    seed.name,
  );

  if (
    seed.order !==
      undefined &&
    !Number.isInteger(
      seed.order,
    )
  ) {
    throw new TypeError(
      `Seed "${seed.name}" has an invalid order.`,
    );
  }

  if (
    typeof seed.run !==
    "function"
  ) {
    throw new TypeError(
      `Seed "${seed.name}" requires a run function.`,
    );
  }

  if (
    seed.rollback !==
      undefined &&
    typeof seed.rollback !==
      "function"
  ) {
    throw new TypeError(
      `Seed "${seed.name}" has an invalid rollback function.`,
    );
  }
}

/**
 * Validates a seed name.
 */
function validateSeedName(
  name: string,
): void {
  if (
    typeof name !==
      "string" ||
    name.trim().length ===
      0
  ) {
    throw new TypeError(
      "Seed name is required.",
    );
  }

  if (
    name.length > 255
  ) {
    throw new TypeError(
      "Seed name cannot exceed 255 characters.",
    );
  }
}

/**
 * Validates an SQL identifier.
 */
function validateIdentifier(
  identifier: string,
  name: string,
): void {
  if (
    typeof identifier !==
      "string" ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(
      identifier,
    )
  ) {
    throw new TypeError(
      `Invalid ${name}: "${identifier}".`,
    );
  }
}

/**
 * Validates an advisory lock key.
 */
function validateLockKey(
  lockKey: string,
): void {
  if (
    typeof lockKey !==
      "string" ||
    lockKey.trim().length ===
      0
  ) {
    throw new TypeError(
      "A database seed lock key is required.",
    );
  }
}

/**
 * Quotes a validated SQL identifier.
 */
function quoteIdentifier(
  identifier: string,
): string {
  validateIdentifier(
    identifier,
    "identifier",
  );

  return `"${identifier}"`;
}

/**
 * Generates a deterministic signed 64-bit advisory lock key.
 */
function hashLockKey(
  value: string,
): bigint {
  let hash =
    1469598103934665603n;

  const bytes =
    new TextEncoder().encode(
      value,
    );

  for (
    const byte of bytes
  ) {
    hash ^= BigInt(
      byte,
    );

    hash =
      BigInt.asIntN(
        64,
        hash *
          1099511628211n,
      );
  }

  return BigInt.asIntN(
    64,
    hash,
  );
}