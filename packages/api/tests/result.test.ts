import { describe, expect, it } from "vitest";

import { apiFailure, apiSuccess, isApiFailure, isApiSuccess } from "../src/api/result/apiResult.type.js";

describe("apiSuccess", () => {
  it("creates a successful result", () => {
    const result = apiSuccess({ id: "1" });

    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ id: "1" });
  });
});

describe("apiFailure", () => {
  it("creates a failed result", () => {
    const error = new Error("Not found");
    const result = apiFailure(error);

    expect(result.ok).toBe(false);
    expect(result.error).toBe(error);
  });
});

describe("isApiSuccess", () => {
  it("returns true for successful results", () => {
    const result = apiSuccess({ id: "1" });

    expect(isApiSuccess(result)).toBe(true);
  });

  it("returns false for failed results", () => {
    const result = apiFailure(new Error("Not found"));

    expect(isApiSuccess(result)).toBe(false);
  });
});

describe("isApiFailure", () => {
  it("returns true for failed results", () => {
    const result = apiFailure(new Error("Not found"));

    expect(isApiFailure(result)).toBe(true);
  });

  it("returns false for successful results", () => {
    const result = apiSuccess({ id: "1" });

    expect(isApiFailure(result)).toBe(false);
  });
});
