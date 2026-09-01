import type { DatabaseOperationOptions } from "../databaseType/databaseType.type.js";

/**
 * Describes a relation between two database entities.
 */
export interface RelationDefinition<TParent = unknown, TChild = unknown> {
  readonly name: string;
  readonly parent: TParent;
  readonly child: TChild;
  readonly type: RelationType;
  readonly foreignKey: string;
  readonly referencedKey: string;
  readonly nullable?: boolean;
}

/**
 * Supported database relation types.
 */
export type RelationType =
  "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";

/**
 * Generic relation loading options.
 */
export interface RelationLoadOptions extends DatabaseOperationOptions {
  readonly includeDeleted?: boolean;
  readonly depth?: number;
}

/**
 * Describes a relation that can be included in a query.
 */
export interface RelationInclude {
  readonly relation: string;
  readonly select?: readonly string[];
  readonly include?: readonly RelationInclude[];
}

/**
 * Creates a one-to-one relation definition.
 */
export function oneToOne<TParent = unknown, TChild = unknown>(
  definition: Omit<RelationDefinition<TParent, TChild>, "type">,
): RelationDefinition<TParent, TChild> {
  return Object.freeze({
    ...definition,
    type: "one-to-one",
  });
}

/**
 * Creates a one-to-many relation definition.
 */
export function oneToMany<TParent = unknown, TChild = unknown>(
  definition: Omit<RelationDefinition<TParent, TChild>, "type">,
): RelationDefinition<TParent, TChild> {
  return Object.freeze({
    ...definition,
    type: "one-to-many",
  });
}

/**
 * Creates a many-to-one relation definition.
 */
export function manyToOne<TParent = unknown, TChild = unknown>(
  definition: Omit<RelationDefinition<TParent, TChild>, "type">,
): RelationDefinition<TParent, TChild> {
  return Object.freeze({
    ...definition,
    type: "many-to-one",
  });
}

/**
 * Creates a many-to-many relation definition.
 */
export function manyToMany<TParent = unknown, TChild = unknown>(
  definition: Omit<RelationDefinition<TParent, TChild>, "type">,
): RelationDefinition<TParent, TChild> {
  return Object.freeze({
    ...definition,
    type: "many-to-many",
  });
}

/**
 * Creates a relation include definition.
 */
export function includeRelation(
  relation: string,
  options: {
    readonly select?: readonly string[];
    readonly include?: readonly RelationInclude[];
  } = {},
): RelationInclude {
  validateRelationName(relation);

  return Object.freeze({
    relation,
    select: options.select
      ? Object.freeze([...new Set(options.select)])
      : undefined,
    include: options.include ? Object.freeze([...options.include]) : undefined,
  });
}

/**
 * Creates a nested relation include.
 */
export function includeRelations(
  ...includes: readonly RelationInclude[]
): readonly RelationInclude[] {
  return Object.freeze([...includes]);
}

/**
 * Relation registry used by database infrastructure.
 */
export class RelationRegistry {
  private readonly relations = new Map<string, RelationDefinition>();

  /**
   * Registers a relation.
   */
  public register(relation: RelationDefinition): this {
    validateRelation(relation);

    if (this.relations.has(relation.name)) {
      throw new Error(`Relation "${relation.name}" is already registered.`);
    }

    this.relations.set(
      relation.name,
      Object.freeze({
        ...relation,
      }),
    );

    return this;
  }

  /**
   * Registers multiple relations.
   */
  public registerMany(relations: readonly RelationDefinition[]): this {
    for (const relation of relations) {
      this.register(relation);
    }

    return this;
  }

  /**
   * Gets a relation by name.
   */
  public get(name: string): RelationDefinition | undefined {
    return this.relations.get(name);
  }

  /**
   * Checks whether a relation exists.
   */
  public has(name: string): boolean {
    return this.relations.has(name);
  }

  /**
   * Removes a relation.
   */
  public remove(name: string): boolean {
    return this.relations.delete(name);
  }

  /**
   * Returns all registered relations.
   */
  public all(): readonly RelationDefinition[] {
    return Object.freeze([...this.relations.values()]);
  }

  /**
   * Returns relations for a specific parent entity.
   */
  public forParent(parent: unknown): readonly RelationDefinition[] {
    return Object.freeze(
      [...this.relations.values()].filter(
        (relation) => relation.parent === parent,
      ),
    );
  }

  /**
   * Returns relations for a specific child entity.
   */
  public forChild(child: unknown): readonly RelationDefinition[] {
    return Object.freeze(
      [...this.relations.values()].filter(
        (relation) => relation.child === child,
      ),
    );
  }

  /**
   * Clears all registered relations.
   */
  public clear(): void {
    this.relations.clear();
  }

  /**
   * Returns the number of registered relations.
   */
  public get size(): number {
    return this.relations.size;
  }
}

/**
 * Creates a relation registry.
 */
export function createRelationRegistry(
  relations: readonly RelationDefinition[] = [],
): RelationRegistry {
  const registry = new RelationRegistry();

  registry.registerMany(relations);

  return registry;
}

/**
 * Validates a relation definition.
 */
export function validateRelation(relation: RelationDefinition): void {
  if (!relation || typeof relation !== "object") {
    throw new TypeError("A relation definition is required.");
  }

  validateRelationName(relation.name);

  if (relation.parent === undefined || relation.parent === null) {
    throw new TypeError(
      `Relation "${relation.name}" requires a parent entity.`,
    );
  }

  if (relation.child === undefined || relation.child === null) {
    throw new TypeError(`Relation "${relation.name}" requires a child entity.`);
  }

  if (!isRelationType(relation.type)) {
    throw new TypeError(
      `Relation "${relation.name}" has an invalid relation type.`,
    );
  }

  if (
    typeof relation.foreignKey !== "string" ||
    relation.foreignKey.trim().length === 0
  ) {
    throw new TypeError(`Relation "${relation.name}" requires a foreign key.`);
  }

  if (
    typeof relation.referencedKey !== "string" ||
    relation.referencedKey.trim().length === 0
  ) {
    throw new TypeError(
      `Relation "${relation.name}" requires a referenced key.`,
    );
  }
}

/**
 * Checks whether a value is a supported relation type.
 */
export function isRelationType(value: unknown): value is RelationType {
  return (
    value === "one-to-one" ||
    value === "one-to-many" ||
    value === "many-to-one" ||
    value === "many-to-many"
  );
}

/**
 * Returns whether the relation represents a collection.
 */
export function isCollectionRelation(relation: RelationDefinition): boolean {
  return relation.type === "one-to-many" || relation.type === "many-to-many";
}

/**
 * Returns whether the relation represents a single entity.
 */
export function isSingleRelation(relation: RelationDefinition): boolean {
  return relation.type === "one-to-one" || relation.type === "many-to-one";
}

/**
 * Validates a relation name.
 */
function validateRelationName(name: string): void {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new TypeError("A relation name is required.");
  }
}
