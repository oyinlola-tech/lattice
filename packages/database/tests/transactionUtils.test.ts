import { describe, it, expect } from "vitest";
import {
  createTransactionContext,
  createTransactionId,
  isTransactionActive,
  isTransactionCommitted,
  isTransactionFailed,
  TransactionManager,
} from "../src/index.js";

describe("Transaction utilities", () => {
  describe("createTransactionId", () => {
    it("should create a unique transaction ID", () => {
      const id1 = createTransactionId();
      const id2 = createTransactionId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });

  describe("createTransactionContext", () => {
    it("should create a transaction context", () => {
      const context = createTransactionContext();
      expect(context).toBeDefined();
      expect(context.transactionId).toBeDefined();
      expect(context.status).toBe("idle");
      expect(context.startedAt).toBeInstanceOf(Date);
    });

    it("should accept options", () => {
      const context = createTransactionContext({
        isolationLevel: "Serializable",
        metadata: { userId: "123" },
      });
      expect(context.isolationLevel).toBe("Serializable");
      expect(context.metadata?.userId).toBe("123");
    });
  });

  describe("isTransactionActive", () => {
    it("should return true for active status", () => {
      const context = { ...createTransactionContext(), status: "active" as const };
      expect(isTransactionActive(context)).toBe(true);
    });

    it("should return false for idle status", () => {
      const context = createTransactionContext();
      expect(isTransactionActive(context)).toBe(false);
    });
  });

  describe("isTransactionCommitted", () => {
    it("should return true for committed status", () => {
      const context = { ...createTransactionContext(), status: "committed" as const };
      expect(isTransactionCommitted(context)).toBe(true);
    });

    it("should return false for active transactions", () => {
      const context = createTransactionContext();
      expect(isTransactionCommitted(context)).toBe(false);
    });
  });

  describe("isTransactionFailed", () => {
    it("should return true for failed status", () => {
      const context = { ...createTransactionContext(), status: "failed" as const };
      expect(isTransactionFailed(context)).toBe(true);
    });

    it("should return false for active transactions", () => {
      const context = createTransactionContext();
      expect(isTransactionFailed(context)).toBe(false);
    });
  });
});
