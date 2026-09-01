import { describe, it, expect } from "vitest";
import { timingSafeEqual } from "../src/compare/compare.helper.js";

describe("timingSafeEqual", () => {
  it("returns true for equal byte arrays", () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([1, 2, 3, 4]);
    expect(timingSafeEqual(a, b)).toBe(true);
  });

  it("returns false for different byte arrays", () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const b = new Uint8Array([1, 2, 3, 5]);
    expect(timingSafeEqual(a, b)).toBe(false);
  });

  it("returns false for different lengths", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3, 4]);
    expect(timingSafeEqual(a, b)).toBe(false);
  });

  it("returns true for empty arrays", () => {
    expect(timingSafeEqual(new Uint8Array([]), new Uint8Array([]))).toBe(true);
  });

  it("returns false when one is empty", () => {
    expect(timingSafeEqual(new Uint8Array([1]), new Uint8Array([]))).toBe(
      false,
    );
  });

  it("handles large arrays", () => {
    const a = new Uint8Array(1024).fill(42);
    const b = new Uint8Array(1024).fill(42);
    expect(timingSafeEqual(a, b)).toBe(true);
  });
});
