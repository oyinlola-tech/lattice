import { describe, it, expect } from "vitest";
import { createFeatureFlagRegistry } from "../src/registry/registry.core.js";
import type { FeatureFlag } from "../src/featureFlagTypes/featureFlag.interface.js";

const flagA: FeatureFlag = { key: "a", enabled: true, defaultValue: true };
const flagB: FeatureFlag = { key: "b", enabled: false, defaultValue: false };

describe("registry", () => {
  it("stores and retrieves flags by key", () => {
    const registry = createFeatureFlagRegistry([flagA]);
    expect(registry.get("a")).toBeDefined();
    expect(registry.get("a")!.key).toBe("a");
  });

  it("returns undefined for missing key", () => {
    const registry = createFeatureFlagRegistry([]);
    expect(registry.get("missing")).toBeUndefined();
  });

  it("reports correct size", () => {
    const registry = createFeatureFlagRegistry([flagA, flagB]);
    expect(registry.size).toBe(2);
  });

  it("has() checks existence", () => {
    const registry = createFeatureFlagRegistry([flagA]);
    expect(registry.has("a")).toBe(true);
    expect(registry.has("b")).toBe(false);
  });

  it("set() adds a flag", () => {
    const registry = createFeatureFlagRegistry([]);
    registry.set(flagA);
    expect(registry.has("a")).toBe(true);
    expect(registry.size).toBe(1);
  });

  it("set() replaces existing flag", () => {
    const registry = createFeatureFlagRegistry([flagA]);
    registry.set({ key: "a", enabled: false, defaultValue: "updated" });
    expect(registry.get("a")!.defaultValue).toBe("updated");
  });

  it("setAll() adds multiple flags", () => {
    const registry = createFeatureFlagRegistry([]);
    registry.setAll([flagA, flagB]);
    expect(registry.size).toBe(2);
  });

  it("delete() removes a flag", () => {
    const registry = createFeatureFlagRegistry([flagA, flagB]);
    expect(registry.delete("a")).toBe(true);
    expect(registry.has("a")).toBe(false);
    expect(registry.size).toBe(1);
  });

  it("getAll() returns all flags", () => {
    const registry = createFeatureFlagRegistry([flagA, flagB]);
    const flags = registry.getAll();
    expect(flags).toHaveLength(2);
  });

  it("flags are immutable", () => {
    const registry = createFeatureFlagRegistry([flagA]);
    const flag = registry.get("a")!;
    expect(Object.isFrozen(flag)).toBe(true);
  });
});
