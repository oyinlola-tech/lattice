import { describe, it, expect } from "vitest";

import {
  JsonSerializer,
  createJsonSerializer,
  PassthroughSerializer,
} from "../src/serializer/serializer.core.js";

describe("Serializer", () => {
  describe("JsonSerializer", () => {
    it("should serialize data to JSON string", () => {
      const data = { userId: "123", name: "Test User" };
      const serialized = JsonSerializer.serialize(data);

      expect(serialized).toBe('{"userId":"123","name":"Test User"}');
    });

    it("should deserialize JSON string to data", () => {
      const json = '{"userId":"123","name":"Test User"}';
      const deserialized = JsonSerializer.deserialize<{ userId: string; name: string }>(json);

      expect(deserialized).toEqual({ userId: "123", name: "Test User" });
    });

    it("should handle nested objects", () => {
      const data = {
        user: {
          id: "123",
          preferences: {
            theme: "dark",
            notifications: true,
          },
        },
      };

      const serialized = JsonSerializer.serialize(data);
      const deserialized = JsonSerializer.deserialize<typeof data>(serialized);

      expect(deserialized).toEqual(data);
    });

    it("should handle arrays", () => {
      const data = [1, 2, 3, "four", { five: 5 }];

      const serialized = JsonSerializer.serialize(data);
      const deserialized = JsonSerializer.deserialize<typeof data>(serialized);

      expect(deserialized).toEqual(data);
    });
  });

  describe("createJsonSerializer", () => {
    it("should create a custom JSON serializer", () => {
      const serializer = createJsonSerializer({
        space: 2,
      });

      const data = { userId: "123" };
      const serialized = serializer.serialize(data);

      expect(serialized).toContain("\n");
      expect(serialized).toContain("  ");
    });
  });

  describe("PassthroughSerializer", () => {
    it("should pass through string data", () => {
      const data = "test-string";
      const serialized = PassthroughSerializer.serialize(data);

      expect(serialized).toBe("test-string");
    });

    it("should serialize non-string data to JSON", () => {
      const data = { userId: "123" };
      const serialized = PassthroughSerializer.serialize(data);

      expect(serialized).toBe('{"userId":"123"}');
    });

    it("should deserialize valid JSON", () => {
      const json = '{"userId":"123"}';
      const deserialized = PassthroughSerializer.deserialize<{ userId: string }>(json);

      expect(deserialized).toEqual({ userId: "123" });
    });

    it("should return raw string for invalid JSON", () => {
      const invalidJson = "not-valid-json";
      const deserialized = PassthroughSerializer.deserialize<string>(invalidJson);

      expect(deserialized).toBe("not-valid-json");
    });
  });
});
