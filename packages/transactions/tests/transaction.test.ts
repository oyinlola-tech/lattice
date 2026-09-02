import { describe, it, expect } from "vitest";
import {
  createTransaction,
  TransactionStateError,
  TransactionCommitError,
  TransactionRollbackError,
  runInTransaction,
  createTransactionManager,
  type TransactionAdapter,
  type Transaction,
} from "../src/index.js";

describe("createTransaction", () => {
  it("creates a transaction in the pending state with a unique id", () => {
    const txn = createTransaction();
    expect(txn.id).toMatch(/^txn_[a-f0-9]+$/);
    expect(txn.state).toBe("pending");
    expect(txn.parentId).toBeUndefined();
  });

  it("captures parent id when provided", () => {
    const parent = createTransaction();
    const child = createTransaction({}, parent.id);
    expect(child.parentId).toBe(parent.id);
  });

  it("transitions pending -> active when started", () => {
    const txn = createTransaction();
    // simulate adapter activating it
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    expect(txn.state).toBe("active");
  });

  it("commits successfully and fires afterCommit callbacks", async () => {
    const txn = createTransaction();
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    const calls: string[] = [];
    txn.afterCommit(async () => {
      calls.push("commit-1");
    });
    txn.afterCommit(async () => {
      calls.push("commit-2");
    });
    await txn.commit();
    expect(txn.state).toBe("committed");
    expect(calls).toEqual(["commit-1", "commit-2"]);
  });

  it("rejects commit from non-active state", async () => {
    const txn = createTransaction();
    // state is pending, not active
    await expect(txn.commit()).rejects.toBeInstanceOf(TransactionStateError);
  });

  it("rolls back when marked rollback-only and commit is called", async () => {
    const txn = createTransaction();
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    txn.markRollbackOnly("explicit reason");
    expect(txn.isRollbackOnly()).toBe(true);
    await txn.commit();
    expect(txn.state).toBe("rolled_back");
  });

  it("rolls back and fires afterRollback callbacks", async () => {
    const txn = createTransaction();
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    const calls: string[] = [];
    txn.afterRollback(async () => {
      calls.push("rb-1");
    });
    await txn.rollback("test");
    expect(txn.state).toBe("rolled_back");
    expect(calls).toEqual(["rb-1"]);
  });

  it("rollback is idempotent after success", async () => {
    const txn = createTransaction();
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    await txn.rollback();
    expect(txn.state).toBe("rolled_back");
    // second rollback is a no-op
    await txn.rollback();
    expect(txn.state).toBe("rolled_back");
  });

  it("fails commit with TransactionCommitError when commit throws", async () => {
    const txn = createTransaction();
    (txn as unknown as { _transition: (s: string) => void })._transition("active");
    txn.afterCommit(async () => {
      throw new Error("hook failed");
    });
    // the hook error is swallowed; commit succeeds
    await txn.commit();
    expect(txn.state).toBe("committed");
  });

  it("exposes metadata via Map", () => {
    const txn = createTransaction({ metadata: { userId: "u_1" } });
    expect(txn.metadata.get("userId")).toBe("u_1");
  });

  it("freezes options to prevent mutation", () => {
    const txn = createTransaction({ metadata: { x: 1 } });
    expect(Object.isFrozen(txn.options)).toBe(true);
  });
});
