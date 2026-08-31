/**
 * @lattice/storage — Base Repository
 *
 * Provides a base implementation for repository CRUD operations.
 * Concrete repositories can extend this for domain-specific queries.
 */

import type { Database, Query, QueryParameter, QueryResult } from "../types/storage.type.js";

/**
 * Options for the base repository.
 */
export interface BaseRepositoryOptions {
  /** The database table name. */
  readonly tableName: string;
  /** The primary key column name (default: "id"). */
  readonly primaryKey?: string;
}

/**
 * Base repository providing common CRUD operations.
 * Override methods for domain-specific behavior.
 */
export class BaseRepository<
  Entity extends Record<string, unknown>,
  ID = string,
> {
  protected readonly tableName: string;
  protected readonly primaryKey: string;

  constructor(
    protected readonly database: Database,
    options: BaseRepositoryOptions,
  ) {
    this.tableName = options.tableName;
    this.primaryKey = options.primaryKey ?? "id";
  }

  /**
   * Find an entity by its primary key.
   */
  async findById(id: ID): Promise<Entity | null> {
    const query: Query = {
      text: `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
      parameters: [id as QueryParameter],
    };
    const result = await this.database.query<Entity>(query);
    return result.rows[0] ?? null;
  }

  /**
   * Find multiple entities by their IDs.
   */
  async findByIds(ids: readonly ID[]): Promise<readonly Entity[]> {
    if (ids.length === 0) return [];

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    const query: Query = {
      text: `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} IN (${placeholders})`,
      parameters: [...ids] as QueryParameter[],
    };
    const result = await this.database.query<Entity>(query);
    return result.rows;
  }

  /**
   * Create a new entity.
   */
  async create(entity: Entity): Promise<Entity> {
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const columns = keys.join(", ");

    const query: Query = {
      text: `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      parameters: values as QueryParameter[],
    };
    const result = await this.database.query<Entity>(query);
    return result.rows[0]!;
  }

  /**
   * Update an entity by primary key.
   */
  async update(id: ID, changes: Partial<Entity>): Promise<Entity> {
    const keys = Object.keys(changes);
    const values = Object.values(changes);

    if (keys.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`Entity not found: ${id}`);
      return existing;
    }

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const parameters = [
      ...values,
      id,
    ] as QueryParameter[];

    const query: Query = {
      text: `UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.primaryKey} = $${keys.length + 1} RETURNING *`,
      parameters,
    };
    const result = await this.database.query<Entity>(query);
    return result.rows[0]!;
  }

  /**
   * Delete an entity by primary key.
   */
  async delete(id: ID): Promise<void> {
    const query: Query = {
      text: `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
      parameters: [id as QueryParameter],
    };
    await this.database.execute(query);
  }

  /**
   * Check if an entity exists by primary key.
   */
  async exists(id: ID): Promise<boolean> {
    const query: Query = {
      text: `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = $1 LIMIT 1`,
      parameters: [id as QueryParameter],
    };
    const result = await this.database.query(query);
    return result.rowCount > 0;
  }

  /**
   * Find all entities with optional limit and offset.
   */
  async findAll(options?: {
    readonly limit?: number;
    readonly offset?: number;
    readonly orderBy?: string;
    readonly order?: "ASC" | "DESC";
  }): Promise<readonly Entity[]> {
    let text = `SELECT * FROM ${this.tableName}`;

    if (options?.orderBy) {
      text += ` ORDER BY ${options.orderBy} ${options.order ?? "ASC"}`;
    }

    if (options?.limit !== undefined) {
      text += ` LIMIT ${options.limit}`;
    }

    if (options?.offset !== undefined) {
      text += ` OFFSET ${options.offset}`;
    }

    const result = await this.database.query<Entity>({ text });
    return result.rows;
  }

  /**
   * Count entities matching optional where conditions.
   */
  async count(where?: Record<string, QueryParameter>): Promise<number> {
    let text = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const parameters: QueryParameter[] = [];

    if (where) {
      const keys = Object.keys(where);
      if (keys.length > 0) {
        const conditions = keys.map((key, i) => `${key} = $${i + 1}`);
        text += ` WHERE ${conditions.join(" AND ")}`;
        parameters.push(...Object.values(where));
      }
    }

    const result = await this.database.query<{ count: string }>({
      text,
      parameters,
    });
    return parseInt(result.rows[0]?.count ?? "0", 10);
  }
}
