/**
 * @oyinlola141/lattice-cache — Serializer Tests
 *
 * Tests for JsonCacheSerializer, RawCacheSerializer,
 * and getSerializer utility.
 */

import { describe, it, expect } from "vitest";

import {
  JsonCacheSerializer,
  RawCacheSerializer,
  defaultSerializer,
  rawSerializer,
  getSerializer,
} from "../src/serializer.js";

// ─── JsonCacheSerializer ───────────────────────────────────────────────────

describe("JsonCacheSerializer", () => {
  const serializer = new JsonCacheSerializer();

  it("serializes primitives", () => {
    expect(serializer.serialize("hello")).toBe('"hello"');
    expect(serializer.serialize(42)).toBe("42");
    expect(serializer.serialize(true)).toBe("true");
    expect(serializer.serialize(null)).toBe("null");
  });

  it("deserializes primitives", () => {
    expect(serializer.deserialize('"hello"')).toBe("hello");
    expect(serializer.deserialize("42")).toBe(42);
    expect(serializer.deserialize("true")).toBe(true);
    expect(serializer.deserialize("null")).toBe(null);
  });

  it("round-trips objects", () => {
    const obj = { name: "test", count: 42, nested: { a: [1, 2, 3] } };
    const serialized = serializer.serialize(obj);
    const deserialized = serializer.deserialize(serialized);
    expect(deserialized).toEqual(obj);
  });

  it("round-trips arrays", () => {
    const arr = [1, "two", true, null, { three: 3 }];
    const serialized = serializer.serialize(arr);
    const deserialized = serializer.deserialize(serialized);
    expect(deserialized).toEqual(arr);
  });

  it("handles Date objects with type preservation", () => {
    const dateSerializer = new JsonCacheSerializer({
      preserveTypes: true,
    });

    const input = { createdAt: new Date("2024-01-15T12:00:00.000Z") };
    const serialized = dateSerializer.serialize(input);
    const deserialized = dateSerializer.deserialize(serialized) as {
      createdAt: Date;
    };
    expect(deserialized.createdAt).toBeInstanceOf(Date);
    expect(deserialized.createdAt.toISOString()).toBe(
      "2024-01-15T12:00:00.000Z",
    );
  });

  it("handles empty objects and arrays", () => {
    expect(serializer.deserialize(serializer.serialize({}))).toEqual({});
    expect(serializer.deserialize(serializer.serialize([]))).toEqual([]);
  });
});

// ─── RawCacheSerializer ────────────────────────────────────────────────────

describe("RawCacheSerializer", () => {
  const serializer = new RawCacheSerializer();

  it("passes through primitives", () => {
    expect(serializer.serialize("hello")).toBe("hello");
    expect(serializer.serialize(42)).toBe(42);
    expect(serializer.serialize(true)).toBe(true);
    expect(serializer.serialize(null)).toBe(null);
    expect(serializer.serialize(undefined)).toBe(undefined);
  });

  it("passes through objects by reference", () => {
    const obj = { a: 1 };
    expect(serializer.serialize(obj)).toBe(obj);
  });

  it("passes through arrays by reference", () => {
    const arr = [1, 2, 3];
    expect(serializer.serialize(arr)).toBe(arr);
  });

  it("deserialize is identity", () => {
    expect(serializer.deserialize("hello")).toBe("hello");
    expect(serializer.deserialize(42)).toBe(42);
    expect(serializer.deserialize({ a: 1 })).toEqual({ a: 1 });
  });
});

// ─── getSerializer ─────────────────────────────────────────────────────────

describe("getSerializer", () => {
  it("returns raw serializer for strings", () => {
    expect(getSerializer("hello")).toBe(rawSerializer);
  });

  it("returns raw serializer for numbers", () => {
    expect(getSerializer(42)).toBe(rawSerializer);
  });

  it("returns raw serializer for booleans", () => {
    expect(getSerializer(true)).toBe(rawSerializer);
  });

  it("returns raw serializer for null", () => {
    expect(getSerializer(null)).toBe(rawSerializer);
  });

  it("returns raw serializer for undefined", () => {
    expect(getSerializer(undefined)).toBe(rawSerializer);
  });

  it("returns default (JSON) serializer for objects", () => {
    expect(getSerializer({ a: 1 })).toBe(defaultSerializer);
  });

  it("returns default (JSON) serializer for arrays", () => {
    expect(getSerializer([1, 2, 3])).toBe(defaultSerializer);
  });
});

// ─── Singleton Instances ───────────────────────────────────────────────────

describe("singleton instances", () => {
  it("defaultSerializer is JsonCacheSerializer", () => {
    expect(defaultSerializer).toBeInstanceOf(JsonCacheSerializer);
  });

  it("rawSerializer is RawCacheSerializer", () => {
    expect(rawSerializer).toBeInstanceOf(RawCacheSerializer);
  });
});
