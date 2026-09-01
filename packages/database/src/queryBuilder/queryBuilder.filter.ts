import type {
  QueryCondition,
  QueryFilter,
  QueryOperator,
} from "./queryBuilder.core.js";

/**
 * Creates an equality filter.
 */
export function equals(field: string, value: unknown): QueryFilter {
  return condition(field, "equals", value);
}

/**
 * Creates a not-equal filter.
 */
export function notEquals(field: string, value: unknown): QueryFilter {
  return condition(field, "not", value);
}

/**
 * Creates an IN filter.
 */
export function inList(field: string, values: readonly unknown[]): QueryFilter {
  return condition(field, "in", [...values]);
}

/**
 * Creates a NOT IN filter.
 */
export function notInList(
  field: string,
  values: readonly unknown[],
): QueryFilter {
  return condition(field, "notIn", [...values]);
}

/**
 * Creates a less-than filter.
 */
export function lessThan(field: string, value: unknown): QueryFilter {
  return condition(field, "lt", value);
}

/**
 * Creates a less-than-or-equal filter.
 */
export function lessThanOrEqual(field: string, value: unknown): QueryFilter {
  return condition(field, "lte", value);
}

/**
 * Creates a greater-than filter.
 */
export function greaterThan(field: string, value: unknown): QueryFilter {
  return condition(field, "gt", value);
}

/**
 * Creates a greater-than-or-equal filter.
 */
export function greaterThanOrEqual(field: string, value: unknown): QueryFilter {
  return condition(field, "gte", value);
}

/**
 * Creates a contains filter.
 */
export function contains(field: string, value: string): QueryFilter {
  return condition(field, "contains", value);
}

/**
 * Creates a starts-with filter.
 */
export function startsWith(field: string, value: string): QueryFilter {
  return condition(field, "startsWith", value);
}

/**
 * Creates an ends-with filter.
 */
export function endsWith(field: string, value: string): QueryFilter {
  return condition(field, "endsWith", value);
}

/**
 * Creates an IS NULL filter.
 */
export function isNull(field: string): QueryFilter {
  return condition(field, "isNull");
}

/**
 * Creates an IS NOT NULL filter.
 */
export function isNotNull(field: string): QueryFilter {
  return condition(field, "isNotNull");
}

/**
 * Combines filters using AND.
 */
export function and(...filters: readonly QueryFilter[]): QueryFilter {
  return {
    and: filters.map(cloneFilter),
  };
}

/**
 * Combines filters using OR.
 */
export function or(...filters: readonly QueryFilter[]): QueryFilter {
  return {
    or: filters.map(cloneFilter),
  };
}

/**
 * Negates a filter.
 */
export function not(filter: QueryFilter): QueryFilter {
  return {
    not: cloneFilter(filter),
  };
}

/**
 * Creates a generic filter condition.
 */
export function condition(
  field: string,
  operator: QueryOperator,
  value?: unknown,
): QueryFilter {
  validateField(field);

  const result: QueryCondition = {
    field,
    operator,
  };

  if (value !== undefined) {
    (
      result as {
        value?: unknown;
      }
    ).value = cloneValue(value);
  }

  return {
    conditions: [result],
  };
}

/**
 * Combines multiple filters with AND only when necessary.
 */
export function allOf(filters: readonly QueryFilter[]): QueryFilter {
  const normalized = filters.filter(Boolean).map(cloneFilter);

  if (normalized.length === 0) {
    return {
      conditions: [],
    };
  }

  if (normalized.length === 1) {
    return normalized[0]!;
  }

  return {
    and: normalized,
  };
}

/**
 * Combines multiple filters with OR only when necessary.
 */
export function anyOf(filters: readonly QueryFilter[]): QueryFilter {
  const normalized = filters.filter(Boolean).map(cloneFilter);

  if (normalized.length === 0) {
    return {
      conditions: [],
    };
  }

  if (normalized.length === 1) {
    return normalized[0]!;
  }

  return {
    or: normalized,
  };
}

/**
 * Creates a filter from a plain object.
 *
 * Every property becomes an equality condition.
 */
export function fromObject<T extends Record<string, unknown>>(
  values: T,
): QueryFilter {
  const conditions = Object.entries(values).map(
    ([field, value]) =>
      ({
        field,
        operator: "equals",
        value: cloneValue(value),
      }) satisfies QueryCondition,
  );

  return {
    conditions,
  };
}

/**
 * Creates filters for a date range.
 */
export function dateRange(
  field: string,
  options: {
    readonly from?: Date;
    readonly to?: Date;
  },
): QueryFilter {
  validateField(field);

  const conditions: QueryCondition[] = [];

  if (options.from) {
    validateDate(options.from, "from");

    conditions.push({
      field,
      operator: "gte",
      value: new Date(options.from.getTime()),
    });
  }

  if (options.to) {
    validateDate(options.to, "to");

    conditions.push({
      field,
      operator: "lte",
      value: new Date(options.to.getTime()),
    });
  }

  if (conditions.length === 0) {
    return {
      conditions: [],
    };
  }

  if (conditions.length === 1) {
    return {
      conditions,
    };
  }

  return {
    and: [
      {
        conditions,
      },
    ],
  };
}

/**
 * Creates a filter for a value being one of several options.
 */
export function oneOf<T>(field: string, values: readonly T[]): QueryFilter {
  return inList(field, values);
}

/**
 * Creates a filter for a value not being one of several options.
 */
export function noneOf<T>(field: string, values: readonly T[]): QueryFilter {
  return notInList(field, values);
}

/**
 * Creates an optional equality filter.
 *
 * Returns an empty filter when the value is undefined.
 */
export function optionalEquals(field: string, value: unknown): QueryFilter {
  if (value === undefined) {
    return {
      conditions: [],
    };
  }

  return equals(field, value);
}

/**
 * Creates an optional text search filter.
 */
export function optionalContains(
  field: string,
  value?: string | null,
): QueryFilter {
  if (value === undefined || value === null || value.trim().length === 0) {
    return {
      conditions: [],
    };
  }

  return contains(field, value.trim());
}

/**
 * Checks whether a filter contains any actual constraints.
 */
export function hasConditions(filter?: QueryFilter): boolean {
  if (!filter) {
    return false;
  }

  if (filter.conditions && filter.conditions.length > 0) {
    return true;
  }

  if (filter.and?.some(hasConditions)) {
    return true;
  }

  if (filter.or?.some(hasConditions)) {
    return true;
  }

  return filter.not ? hasConditions(filter.not) : false;
}

/**
 * Flattens an AND-only filter into individual conditions.
 */
export function flattenAnd(filter: QueryFilter): QueryCondition[] {
  const result: QueryCondition[] = [];

  if (filter.conditions) {
    result.push(...filter.conditions.map(cloneCondition));
  }

  for (const child of filter.and ?? []) {
    result.push(...flattenAnd(child));
  }

  return result;
}

/**
 * Creates a new filter without mutating the source.
 */
export function cloneFilter(filter: QueryFilter): QueryFilter {
  return {
    conditions: filter.conditions
      ? filter.conditions.map(cloneCondition)
      : undefined,

    and: filter.and ? filter.and.map(cloneFilter) : undefined,

    or: filter.or ? filter.or.map(cloneFilter) : undefined,

    not: filter.not ? cloneFilter(filter.not) : undefined,
  };
}

/**
 * Clones a single condition.
 */
function cloneCondition(condition: QueryCondition): QueryCondition {
  return {
    ...condition,
    ...(condition.value !== undefined
      ? {
          value: cloneValue(condition.value),
        }
      : {}),
  };
}

/**
 * Clones supported filter values.
 */
function cloneValue(value: unknown): unknown {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(
      value as Record<string, unknown>,
    )) {
      result[key] = cloneValue(entry);
    }

    return result;
  }

  return value;
}

/**
 * Validates a filter field.
 */
function validateField(field: string): void {
  if (typeof field !== "string" || field.trim().length === 0) {
    throw new TypeError("A filter field is required.");
  }
}

/**
 * Validates a date value.
 */
function validateDate(value: Date, name: string): void {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new TypeError(`Invalid ${name} date.`);
  }
}
