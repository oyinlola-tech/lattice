import { describe, it, expect } from "vitest";
import { hashString } from "../src/rollout/rolloutHashing.js";
import { getBucket, isInRollout } from "../src/rollout/rolloutBucketing.js";

describe("rolloutHashing", () => {
  it("produces deterministic hashes", () => {
    const a = hashString("flag:user_123");
    const b = hashString("flag:user_123");
    expect(a).toBe(b);
  });

  it("produces different hashes for different inputs", () => {
    const a = hashString("flag:user_1");
    const b = hashString("flag:user_2");
    expect(a).not.toBe(b);
  });

  it("returns unsigned 32-bit integers", () => {
    const hash = hashString("test");
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
  });
});

describe("rolloutBucketing", () => {
  it("returns bucket in [0, buckets)", () => {
    for (let i = 0; i < 100; i++) {
      const bucket = getBucket("flag", `user_${i}`, 1000);
      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThan(1000);
    }
  });

  it("is deterministic for same input", () => {
    const a = getBucket("flag", "user_123");
    const b = getBucket("flag", "user_123");
    expect(a).toBe(b);
  });

  it("0% rollout always returns false", () => {
    expect(isInRollout("flag", "user_1", 0)).toBe(false);
  });

  it("100% rollout always returns true", () => {
    expect(isInRollout("flag", "user_1", 100)).toBe(true);
  });

  it("same subject always gets same result for same percentage", () => {
    const result1 = isInRollout("flag", "user_123", 25);
    const result2 = isInRollout("flag", "user_123", 25);
    expect(result1).toBe(result2);
  });

  it("increasing rollout preserves existing users", () => {
    const users = Array.from({ length: 100 }, (_, i) => `user_${i}`);
    const in10 = users.filter((u) => isInRollout("flag", u, 10));
    const in20 = users.filter((u) => isInRollout("flag", u, 20));
    for (const user of in10) {
      expect(in20).toContain(user);
    }
  });

  it("supports sub-percent precision", () => {
    const users = Array.from({ length: 1000 }, (_, i) => `user_${i}`);
    const in1 = users.filter((u) => isInRollout("flag", u, 1));
    const in2 = users.filter((u) => isInRollout("flag", u, 2));
    expect(in2.length).toBeGreaterThanOrEqual(in1.length);
  });
});
