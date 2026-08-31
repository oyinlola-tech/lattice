/**
 * Test clock tests.
 */

import { describe, it, expect } from "vitest";

import {
  createTestClock,
} from "../src/testClock/testClock.core.js";

describe("createTestClock", () => {
  it("should default to current time", () => {
    const clock = createTestClock();
    const now = Date.now();

    expect(Math.abs(clock.timestamp - now)).toBeLessThan(100);
  });

  it("should accept an initial time", () => {
    const clock = createTestClock("2026-01-01T00:00:00Z");

    expect(clock.now.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("should set time", () => {
    const clock = createTestClock();

    clock.set("2026-06-15T12:00:00Z");

    expect(clock.now.toISOString()).toBe("2026-06-15T12:00:00.000Z");
  });

  it("should advance time", () => {
    const clock = createTestClock("2026-01-01T00:00:00Z");

    clock.advance(60_000);

    expect(clock.now.toISOString()).toBe("2026-01-01T00:01:00.000Z");
  });

  it("should add duration", () => {
    const clock = createTestClock("2026-01-01T00:00:00Z");

    clock.add({ hours: 1, minutes: 30 });

    expect(clock.now.toISOString()).toBe("2026-01-01T01:30:00.000Z");
  });

  it("should add days", () => {
    const clock = createTestClock("2026-01-01T00:00:00Z");

    clock.add({ days: 7 });

    expect(clock.now.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("should reset to real time", () => {
    const clock = createTestClock("2026-01-01T00:00:00Z");

    clock.reset();

    const now = Date.now();
    expect(Math.abs(clock.timestamp - now)).toBeLessThan(100);
  });
});
