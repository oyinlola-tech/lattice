/**
 * Cleanup manager tests.
 */

import { describe, it, expect } from "vitest";

import { createCleanupManager } from "../src/cleanupManager/cleanupManager.core.js";

describe("createCleanupManager", () => {
  it("should register and execute cleanup functions", async () => {
    const cleanup = createCleanupManager();
    const order: number[] = [];

    cleanup.register(() => {
      order.push(1);
    });
    cleanup.register(() => {
      order.push(2);
    });

    await cleanup.dispose();

    expect(order).toEqual([2, 1]);
  });

  it("should mark as disposed after dispose", async () => {
    const cleanup = createCleanupManager();

    expect(cleanup.disposed).toBe(false);

    await cleanup.dispose();

    expect(cleanup.disposed).toBe(true);
  });

  it("should not throw when disposing twice", async () => {
    const cleanup = createCleanupManager();

    await cleanup.dispose();
    await cleanup.dispose();

    expect(cleanup.disposed).toBe(true);
  });

  it("should handle async cleanup functions", async () => {
    const cleanup = createCleanupManager();
    const order: number[] = [];

    cleanup.register(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      order.push(1);
    });

    cleanup.register(async () => {
      order.push(2);
    });

    await cleanup.dispose();

    expect(order).toEqual([2, 1]);
  });

  it("should throw when registering after dispose", async () => {
    const cleanup = createCleanupManager();

    await cleanup.dispose();

    expect(() => cleanup.register(() => {})).toThrow(
      "Cannot register cleanup after manager has been disposed.",
    );
  });

  it("should report correct count", () => {
    const cleanup = createCleanupManager();

    expect(cleanup.count).toBe(0);

    cleanup.register(() => {});
    expect(cleanup.count).toBe(1);

    cleanup.register(() => {});
    expect(cleanup.count).toBe(2);
  });
});
