import { describe, it, expect } from "vitest";
import {
  createQueryBuilder,
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
  hasConditions,
  flattenAnd,
  cloneFilter,
} from "../src/index.js";

type TestField = "name" | "age" | "email" | "status";

describe("QueryBuilder", () => {
  it("should create an empty query builder", () => {
    const builder = createQueryBuilder<TestField>();
    const state = builder.build();
    expect(state.filter).toBeUndefined();
    expect(state.pagination).toBeUndefined();
    expect(state.sort).toBeUndefined();
    expect(state.select).toBeUndefined();
  });

  it("should add where conditions", () => {
    const state = createQueryBuilder<TestField>()
      .where("name", "John")
      .where("age", 30)
      .build();

    expect(state.filter).toBeDefined();
    expect(state.filter?.conditions).toHaveLength(2);
  });

  it("should add whereOperator conditions", () => {
    const state = createQueryBuilder<TestField>()
      .whereOperator("age", "gte", 18)
      .build();

    expect(state.filter?.conditions).toHaveLength(1);
    expect(state.filter?.conditions?.[0].operator).toBe("gte");
  });

  it("should chain multiple conditions", () => {
    const state = createQueryBuilder<TestField>()
      .where("status", "active")
      .whereOperator("age", "gte", 18)
      .whereOperator("age", "lte", 65)
      .build();

    expect(state.filter?.conditions).toHaveLength(3);
  });

  it("should set pagination", () => {
    const state = createQueryBuilder<TestField>()
      .page(2)
      .limit(20)
      .build();

    expect(state.pagination).toEqual({ page: 2, limit: 20 });
  });

  it("should set sort order", () => {
    const state = createQueryBuilder<TestField>()
      .orderByAsc("name")
      .build();

    expect(state.sort).toHaveLength(1);
    expect(state.sort?.[0]).toEqual({ field: "name", direction: "asc" });
  });

  it("should set descending sort", () => {
    const state = createQueryBuilder<TestField>()
      .orderByDesc("age")
      .build();

    expect(state.sort?.[0].direction).toBe("desc");
  });

  it("should select specific fields", () => {
    const state = createQueryBuilder<TestField>()
      .select("name", "email")
      .build();

    expect(state.select).toEqual(["name", "email"]);
  });

  it("should clone a builder", () => {
    const original = createQueryBuilder<TestField>()
      .where("name", "John")
      .page(1);

    const cloned = original.clone().where("age", 30);
    const originalState = original.build();
    const clonedState = cloned.build();

    expect(originalState.filter?.conditions).toHaveLength(1);
    expect(clonedState.filter?.conditions).toHaveLength(2);
  });

  it("should convert to QueryOptions", () => {
    const options = createQueryBuilder<TestField>()
      .where("status", "active")
      .page(1)
      .limit(10)
      .orderByAsc("name")
      .toQueryOptions();

    expect(options.pagination).toBeDefined();
    expect(options.sort).toBeDefined();
  });

  it("should clear filters", () => {
    const state = createQueryBuilder<TestField>()
      .where("name", "John")
      .clearFilters()
      .build();

    expect(state.filter).toBeUndefined();
  });

  it("should clear pagination", () => {
    const state = createQueryBuilder<TestField>()
      .page(2)
      .limit(10)
      .clearPagination()
      .build();

    expect(state.pagination).toBeUndefined();
  });

  it("should clear sort", () => {
    const state = createQueryBuilder<TestField>()
      .orderByAsc("name")
      .clearSort()
      .build();

    expect(state.sort).toBeUndefined();
  });

  it("should clear select", () => {
    const state = createQueryBuilder<TestField>()
      .select("name")
      .clearSelect()
      .build();

    expect(state.select).toBeUndefined();
  });
});

describe("Query filter helpers", () => {
  it("equals should create an equals condition", () => {
    const filter = equals("name", "John");
    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions?.[0].operator).toBe("equals");
  });

  it("notEquals should create a not condition", () => {
    const filter = notEquals("status", "deleted");
    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions?.[0].operator).toBe("not");
  });

  it("inList should create an in condition", () => {
    const filter = inList("status", ["active", "pending"]);
    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions?.[0].operator).toBe("in");
  });

  it("notInList should create a notIn condition", () => {
    const filter = notInList("status", ["deleted"]);
    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions?.[0].operator).toBe("notIn");
  });

  it("lessThan should create a lt condition", () => {
    const filter = lessThan("age", 18);
    expect(filter.conditions?.[0].operator).toBe("lt");
  });

  it("lessThanOrEqual should create a lte condition", () => {
    const filter = lessThanOrEqual("age", 18);
    expect(filter.conditions?.[0].operator).toBe("lte");
  });

  it("greaterThan should create a gt condition", () => {
    const filter = greaterThan("age", 65);
    expect(filter.conditions?.[0].operator).toBe("gt");
  });

  it("greaterThanOrEqual should create a gte condition", () => {
    const filter = greaterThanOrEqual("age", 65);
    expect(filter.conditions?.[0].operator).toBe("gte");
  });

  it("contains should create a contains condition", () => {
    const filter = contains("name", "oh");
    expect(filter.conditions?.[0].operator).toBe("contains");
  });

  it("startsWith should create a startsWith condition", () => {
    const filter = startsWith("name", "Jo");
    expect(filter.conditions?.[0].operator).toBe("startsWith");
  });

  it("endsWith should create an endsWith condition", () => {
    const filter = endsWith("name", "hn");
    expect(filter.conditions?.[0].operator).toBe("endsWith");
  });

  it("isNull should create an isNull condition", () => {
    const filter = isNull("email");
    expect(filter.conditions?.[0].operator).toBe("isNull");
  });

  it("isNotNull should create an isNotNull condition", () => {
    const filter = isNotNull("email");
    expect(filter.conditions?.[0].operator).toBe("isNotNull");
  });

  it("and should combine filters with AND", () => {
    const filter = and(equals("name", "John"), equals("age", 30));
    expect(filter.and).toHaveLength(2);
  });

  it("or should combine filters with OR", () => {
    const filter = or(equals("name", "John"), equals("name", "Jane"));
    expect(filter.or).toHaveLength(2);
  });

  it("not should negate a filter", () => {
    const filter = not(equals("status", "deleted"));
    expect(filter.not).toBeDefined();
  });

  it("condition should create a raw condition", () => {
    const filter = condition("name", "equals", "John");
    expect(filter.conditions).toHaveLength(1);
    expect(filter.conditions?.[0].field).toBe("name");
  });

  it("allOf should create an AND filter", () => {
    const filter = allOf([equals("a", 1), equals("b", 2)]);
    expect(filter.and).toHaveLength(2);
  });

  it("anyOf should create an OR filter", () => {
    const filter = anyOf([equals("a", 1), equals("b", 2)]);
    expect(filter.or).toHaveLength(2);
  });

  it("fromObject should create filter from key-value pairs", () => {
    const filter = fromObject({ name: "John", age: 30 });
    expect(filter.conditions).toHaveLength(2);
  });

  it("hasConditions should check if filter has conditions", () => {
    expect(hasConditions(equals("name", "John"))).toBe(true);
    expect(hasConditions({})).toBe(false);
  });

  it("flattenAnd should flatten nested AND filters into conditions", () => {
    const nested = and(and(equals("a", 1), equals("b", 2)), equals("c", 3));
    const flat = flattenAnd(nested);
    expect(Array.isArray(flat)).toBe(true);
    expect(flat).toHaveLength(3);
  });

  it("cloneFilter should deep clone a filter", () => {
    const original = equals("name", "John");
    const cloned = cloneFilter(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });
});
