import type {
  PaginationInput,
  QueryOptions,
  SortDirection,
  SortInput,
} from "../databaseType/databaseType.type.js";

/**
 * A generic query condition.
 */
export type QueryOperator =
  | "equals"
  | "not"
  | "in"
  | "notIn"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "isNull"
  | "isNotNull";

/**
 * Generic filter condition.
 */
export interface QueryCondition {
  readonly field: string;
  readonly operator: QueryOperator;
  readonly value?: unknown;
}

/**
 * Generic logical filter.
 */
export interface QueryFilter {
  readonly conditions?: readonly QueryCondition[];
  readonly and?: readonly QueryFilter[];
  readonly or?: readonly QueryFilter[];
  readonly not?: QueryFilter;
}

/**
 * Query builder state.
 */
export interface QueryBuilderState<TField extends string = string> {
  readonly filter?: QueryFilter;
  readonly pagination?: PaginationInput;
  readonly sort?: readonly SortInput<TField>[];
  readonly select?: readonly TField[];
}

/**
 * Query builder used to construct database-neutral query definitions.
 *
 * The builder does not execute queries. It produces a plain query
 * definition that repositories or adapters can translate into their
 * ORM-specific representation.
 */
export class QueryBuilder<TField extends string = string> {
  private filterState?: QueryFilter;

  private paginationState?: PaginationInput;

  private sortState: SortInput<TField>[] = [];

  private selectState: TField[] = [];

  /**
   * Adds an equality condition.
   */
  public where(field: TField, value: unknown): this {
    return this.addCondition({
      field,
      operator: "equals",
      value,
    });
  }

  /**
   * Adds a condition using a specific operator.
   */
  public whereOperator(
    field: TField,
    operator: QueryOperator,
    value?: unknown,
  ): this {
    return this.addCondition({
      field,
      operator,
      value,
    });
  }

  /**
   * Adds a not-equal condition.
   */
  public whereNot(field: TField, value: unknown): this {
    return this.whereOperator(field, "not", value);
  }

  /**
   * Adds an IN condition.
   */
  public whereIn(field: TField, values: readonly unknown[]): this {
    return this.whereOperator(field, "in", [...values]);
  }

  /**
   * Adds a NOT IN condition.
   */
  public whereNotIn(field: TField, values: readonly unknown[]): this {
    return this.whereOperator(field, "notIn", [...values]);
  }

  /**
   * Adds a less-than condition.
   */
  public whereLessThan(field: TField, value: unknown): this {
    return this.whereOperator(field, "lt", value);
  }

  /**
   * Adds a less-than-or-equal condition.
   */
  public whereLessThanOrEqual(field: TField, value: unknown): this {
    return this.whereOperator(field, "lte", value);
  }

  /**
   * Adds a greater-than condition.
   */
  public whereGreaterThan(field: TField, value: unknown): this {
    return this.whereOperator(field, "gt", value);
  }

  /**
   * Adds a greater-than-or-equal condition.
   */
  public whereGreaterThanOrEqual(field: TField, value: unknown): this {
    return this.whereOperator(field, "gte", value);
  }

  /**
   * Adds a contains condition.
   */
  public whereContains(field: TField, value: string): this {
    return this.whereOperator(field, "contains", value);
  }

  /**
   * Adds a starts-with condition.
   */
  public whereStartsWith(field: TField, value: string): this {
    return this.whereOperator(field, "startsWith", value);
  }

  /**
   * Adds an ends-with condition.
   */
  public whereEndsWith(field: TField, value: string): this {
    return this.whereOperator(field, "endsWith", value);
  }

  /**
   * Adds an IS NULL condition.
   */
  public whereNull(field: TField): this {
    return this.whereOperator(field, "isNull");
  }

  /**
   * Adds an IS NOT NULL condition.
   */
  public whereNotNull(field: TField): this {
    return this.whereOperator(field, "isNotNull");
  }

  /**
   * Adds an AND group.
   */
  public and(...filters: QueryFilter[]): this {
    const existing = this.filterState;

    const group: QueryFilter = {
      and: filters,
    };

    this.filterState = existing
      ? {
          and: [existing, group],
        }
      : group;

    return this;
  }

  /**
   * Adds an OR group.
   */
  public or(...filters: QueryFilter[]): this {
    const existing = this.filterState;

    const group: QueryFilter = {
      or: filters,
    };

    this.filterState = existing
      ? {
          and: [existing, group],
        }
      : group;

    return this;
  }

  /**
   * Adds a NOT group.
   */
  public not(filter: QueryFilter): this {
    const existing = this.filterState;

    const group: QueryFilter = {
      not: filter,
    };

    this.filterState = existing
      ? {
          and: [existing, group],
        }
      : group;

    return this;
  }

  /**
   * Sets the requested page.
   */
  public page(page: number): this {
    this.paginationState = {
      ...this.paginationState,
      page,
    };

    return this;
  }

  /**
   * Sets the requested page size.
   */
  public limit(limit: number): this {
    this.paginationState = {
      ...this.paginationState,
      limit,
    };

    return this;
  }

  /**
   * Sets pagination.
   */
  public paginate(pagination: PaginationInput): this {
    this.paginationState = {
      ...pagination,
    };

    return this;
  }

  /**
   * Sorts ascending by a field.
   */
  public orderByAsc(field: TField): this {
    return this.orderBy(field, "asc");
  }

  /**
   * Sorts descending by a field.
   */
  public orderByDesc(field: TField): this {
    return this.orderBy(field, "desc");
  }

  /**
   * Adds a sort definition.
   */
  public orderBy(field: TField, direction: SortDirection = "asc"): this {
    this.sortState.push({
      field,
      direction,
    });

    return this;
  }

  /**
   * Replaces all sort definitions.
   */
  public sort(sort: readonly SortInput<TField>[]): this {
    this.sortState = [...sort];

    return this;
  }

  /**
   * Selects specific fields.
   */
  public select(...fields: TField[]): this {
    this.selectState = [...new Set(fields)];

    return this;
  }

  /**
   * Clears all filters.
   */
  public clearFilters(): this {
    this.filterState = undefined;

    return this;
  }

  /**
   * Clears pagination.
   */
  public clearPagination(): this {
    this.paginationState = undefined;

    return this;
  }

  /**
   * Clears sorting.
   */
  public clearSort(): this {
    this.sortState = [];

    return this;
  }

  /**
   * Clears selected fields.
   */
  public clearSelect(): this {
    this.selectState = [];

    return this;
  }

  /**
   * Returns the immutable query definition.
   */
  public build(): QueryBuilderState<TField> {
    return Object.freeze({
      filter: cloneFilter(this.filterState),
      pagination: this.paginationState
        ? Object.freeze({
            ...this.paginationState,
          })
        : undefined,
      sort:
        this.sortState.length > 0
          ? Object.freeze([...this.sortState])
          : undefined,
      select:
        this.selectState.length > 0
          ? Object.freeze([...this.selectState])
          : undefined,
    });
  }

  /**
   * Converts the builder into generic query options.
   */
  public toQueryOptions(): QueryOptions<TField> {
    return {
      pagination: this.paginationState,
      sort: this.sortState.length > 0 ? [...this.sortState] : undefined,
    };
  }

  /**
   * Creates an independent copy of the builder.
   */
  public clone(): QueryBuilder<TField> {
    const builder = new QueryBuilder<TField>();

    builder.filterState = cloneFilter(this.filterState);

    builder.paginationState = this.paginationState
      ? {
          ...this.paginationState,
        }
      : undefined;

    builder.sortState = [...this.sortState];

    builder.selectState = [...this.selectState];

    return builder;
  }

  /**
   * Adds a condition to the current filter.
   */
  private addCondition(condition: QueryCondition): this {
    const existing = this.filterState;

    if (!existing) {
      this.filterState = {
        conditions: [condition],
      };

      return this;
    }

    if (existing.conditions && !existing.and && !existing.or && !existing.not) {
      this.filterState = {
        conditions: [...existing.conditions, condition],
      };

      return this;
    }

    this.filterState = {
      and: [
        existing,
        {
          conditions: [condition],
        },
      ],
    };

    return this;
  }
}

/**
 * Creates a new query builder.
 */
export function createQueryBuilder<
  TField extends string = string,
>(): QueryBuilder<TField> {
  return new QueryBuilder<TField>();
}

/**
 * Clones a query filter without sharing mutable arrays.
 */
function cloneFilter(filter?: QueryFilter): QueryFilter | undefined {
  if (!filter) {
    return undefined;
  }

  return {
    conditions: filter.conditions
      ? filter.conditions.map((condition) => ({
          ...condition,
          ...(Array.isArray(condition.value)
            ? {
                value: [...condition.value],
              }
            : {}),
        }))
      : undefined,

    and: filter.and
      ? filter.and.map((child) => cloneFilter(child)!)
      : undefined,

    or: filter.or ? filter.or.map((child) => cloneFilter(child)!) : undefined,

    not: filter.not ? cloneFilter(filter.not) : undefined,
  };
}
