/**
 * @oyinlola141/lattice-database — Query Builder
 *
 * Database-neutral query construction and filter helpers.
 */

export {
  QueryBuilder,
  createQueryBuilder,
  type QueryCondition,
  type QueryFilter,
  type QueryOperator,
  type QueryBuilderState,
} from "./queryBuilder.core.js";
export {
  equals,
  notEquals,
  inList,
  notInList,
  lessThan,
  lessThanOrEqual,
  greaterThan,
  greaterThanOrEqual,
  contains,
  startsWith,
  endsWith,
  isNull,
  isNotNull,
  and,
  or,
  not,
  condition,
  allOf,
  anyOf,
  fromObject,
  dateRange,
  oneOf,
  noneOf,
  optionalEquals,
  optionalContains,
  hasConditions,
  flattenAnd,
  cloneFilter,
} from "./queryBuilder.filter.js";
