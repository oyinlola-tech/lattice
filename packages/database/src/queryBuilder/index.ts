/**
 * @zudo/database — Query Builder
 *
 * Database-neutral query construction and filter helpers.
 */

export { QueryBuilder } from "./queryBuilder.core.js";

export { createQueryBuilder, cloneFilter } from "./queryBuilder.factory.js";

export type {
  QueryCondition,
  QueryFilter,
  QueryOperator,
  QueryBuilderState,
} from "./queryBuilder.type.js";

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
} from "./queryBuilder.filter.js";
