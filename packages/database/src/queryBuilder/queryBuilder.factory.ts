import type { QueryBuilderState, QueryFilter } from "./queryBuilder.type.js";
import { QueryBuilder } from "./queryBuilder.core.js";

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
export function cloneFilter(filter?: QueryFilter): QueryFilter | undefined {
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
