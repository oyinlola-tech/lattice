import type {
  PaginationInput,
  QueryOptions,
  SortDirection,
  SortInput,
} from "../databaseType/databaseType.type.js";

export type {
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
