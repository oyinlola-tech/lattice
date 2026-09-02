import { describe, it, expect } from "vitest";
import {
  systemClock,
  systemClockSeconds,
  systemRandom,
  FixedClock,
  SeededRandom,
} from "../src/index.js";

describe("systemClock", () => {
  it("returns a number close to Date.now()", () => {
    const before = Date.now();
    const t = systemClock.now();
    const after = Date.now();
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });
});

describe("systemClockSeconds", () => {
  it("returns floor(Date.now() / 1000)", () => {
    const t = systemClockSeconds.nowSeconds();
    expect(t).toBe(Math.floor(Date.now() / 1000));
  });
});

describe("systemRandom", () => {
  it("uuid() returns a v4 string", () => {
    const id = systemRandom.uuid();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("uuid() returns unique values", () => {
    const a = systemRandom.uuid();
    const b = systemRandom.uuid();
    expect(a).not.toBe(b);
  });

  it("int(max) returns a value in [0, max)", () => {
    for (let i = 0; i < 100; i++) {
      const n = systemRandom.int(10);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(10);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it("int throws on invalid max", () => {
    expect(() => systemRandom.int(0)).toThrow(RangeError);
    expect(() => systemRandom.int(-1)).toThrow(RangeError);
    expect(() => systemRandom.int(1.5)).toThrow(RangeError);
  });

  it("string(length) returns alphanumeric of the given length", () => {
    const s = systemRandom.string(16);
    expect(s).toHaveLength(16);
    expect(s).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("custom(length, alphabet) uses the given alphabet", () => {
    const s = systemRandom.custom(20, "01");
    expect(s).toHaveLength(20);
    expect(s).toMatch(/^[01]+$/);
  });
});

describe("FixedClock", () => {
  it("returns the configured time", () => {
    const c = new FixedClock(1000);
    expect(c.now()).toBe(1000);
  });
  it("set() updates the time", () => {
    const c = new FixedClock();
    c.set(2000);
    expect(c.now()).toBe(2000);
  });
  it("advance() moves the time forward", () => {
    const c = new FixedClock(0);
    c.advance(500);
    expect(c.now()).toBe(500);
  });
});

describe("SeededRandom", () => {
  it("is deterministic with the same seed", () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    expect(a.int(1000)).toBe(b.int(1000));
    expect(a.uuid()).toBe(b.uuid());
  });
  it("produces different streams with different seeds", () => {
    const a = new SeededRandom(1);
    const b = new SeededRandom(2);
    expect(a.uuid()).not.toBe(b.uuid());
  });
});
