/**
 * zudolib-cli — Compatibility Validator Tests
 *
 * Tests for CompatibilityValidator.
 */

import { describe, it, expect } from "vitest";
import { CompatibilityValidator } from "../src/validators/compatibility/compatibilityValidator.core.js";

describe("CompatibilityValidator", () => {
  const validator = new CompatibilityValidator();

  it("detects next and vite incompatibility", () => {
    const result = validator.validate({ framework: "next", buildTool: "vite" });
    expect(result.valid).toBe(false);
    expect(result.checks.length).toBeGreaterThan(0);
  });

  it("detects nuxt and vite incompatibility", () => {
    const result = validator.validate({ framework: "nuxt", buildTool: "vite" });
    expect(result.valid).toBe(false);
  });

  it("passes for compatible options", () => {
    const result = validator.validate({
      framework: "react",
      buildTool: "vite",
    });
    expect(result.valid).toBe(true);
  });
});
