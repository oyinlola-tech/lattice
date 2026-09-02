import { describe, it, expect } from "vitest";
import {
  BaseError,
  createErrorMetadata,
  mergeErrorMetadata,
} from "../src/index.js";

describe("Error Context and Metadata", () => {
  describe("BaseError metadata", () => {
    it("should have empty metadata by default", () => {
      const error = new BaseError("test");
      expect(error.metadata).toEqual({});
    });

    it("should freeze metadata", () => {
      const error = new BaseError("test");
      expect(Object.isFrozen(error.metadata)).toBe(true);
    });
  });

  describe("createErrorMetadata", () => {
    it("should create metadata object", () => {
      const metadata = createErrorMetadata({
        requestId: "123",
        userId: "user-456",
      });

      expect(metadata).toEqual({
        requestId: "123",
        userId: "user-456",
      });
    });
  });

  describe("mergeErrorMetadata", () => {
    it("should merge two metadata objects", () => {
      const base = { requestId: "123" };
      const extra = { userId: "user-456" };

      const merged = mergeErrorMetadata(base, extra);

      expect(merged).toEqual({
        requestId: "123",
        userId: "user-456",
      });
    });

    it("should override existing keys", () => {
      const base = { requestId: "123", userId: "old" };
      const extra = { userId: "new" };

      const merged = mergeErrorMetadata(base, extra);

      expect(merged).toEqual({
        requestId: "123",
        userId: "new",
      });
    });
  });

  describe("Error instanceof checks", () => {
    it("should work with catch blocks", () => {
      try {
        throw new BaseError("test error");
      } catch (error) {
        expect(error).toBeInstanceOf(BaseError);
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
