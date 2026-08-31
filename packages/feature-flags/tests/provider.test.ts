import { describe, it, expect } from "vitest";
import { createMemoryProvider } from "../src/provider/providerMemory.core.js";
import { createEnvironmentProvider } from "../src/provider/providerEnvironment.core.js";
import { createCompositeProvider } from "../src/provider/providerComposite.core.js";
import { createCachedProvider } from "../src/provider/providerCached.core.js";
import type { FeatureFlag } from "../src/featureFlagTypes/featureFlag.interface.js";

const testFlags: readonly FeatureFlag[] = [
  { key: "flag-a", enabled: true, defaultValue: true },
  { key: "flag-b", enabled: true, defaultValue: "variant-a" },
];

describe("memoryProvider", () => {
  it("returns flags by key", async () => {
    const provider = createMemoryProvider(testFlags);
    const flag = await provider.get("flag-a");
    expect(flag).toBeDefined();
    expect(flag!.key).toBe("flag-a");
  });

  it("returns undefined for missing key", async () => {
    const provider = createMemoryProvider(testFlags);
    const flag = await provider.get("missing");
    expect(flag).toBeUndefined();
  });

  it("returns all flags", async () => {
    const provider = createMemoryProvider(testFlags);
    const flags = await provider.getAll();
    expect(flags).toHaveLength(2);
  });
});

describe("environmentProvider", () => {
  it("reads flags from env with prefix", async () => {
    const provider = createEnvironmentProvider({
      prefix: "FEATURE_",
      env: { FEATURE_NEW_UI: "true", FEATURE_OLD_UI: "false", OTHER_VAR: "ignored" },
    });
    const flag = await provider.get("NEW_UI");
    expect(flag).toBeDefined();
    expect(flag!.defaultValue).toBe(true);
  });

  it("parses numeric values", async () => {
    const provider = createEnvironmentProvider({
      prefix: "FEATURE_",
      env: { FEATURE_ROLLOUT: "25" },
    });
    const flag = await provider.get("ROLLOUT");
    expect(flag!.defaultValue).toBe(25);
  });

  it("returns all feature flags", async () => {
    const provider = createEnvironmentProvider({
      prefix: "FEATURE_",
      env: { FEATURE_A: "true", FEATURE_B: "hello" },
    });
    const flags = await provider.getAll();
    expect(flags).toHaveLength(2);
  });
});

describe("compositeProvider", () => {
  it("resolves from first provider", async () => {
    const primary = createMemoryProvider([{ key: "f1", enabled: true, defaultValue: "primary" }]);
    const fallback = createMemoryProvider([{ key: "f1", enabled: true, defaultValue: "fallback" }]);
    const provider = createCompositeProvider([primary, fallback]);
    const flag = await provider.get("f1");
    expect(flag!.defaultValue).toBe("primary");
  });

  it("falls through to second provider", async () => {
    const primary = createMemoryProvider([]);
    const fallback = createMemoryProvider([{ key: "f1", enabled: true, defaultValue: "fallback" }]);
    const provider = createCompositeProvider([primary, fallback]);
    const flag = await provider.get("f1");
    expect(flag!.defaultValue).toBe("fallback");
  });

  it("merges all flags without duplicates", async () => {
    const a = createMemoryProvider([{ key: "f1", enabled: true, defaultValue: true }]);
    const b = createMemoryProvider([{ key: "f1", enabled: true, defaultValue: false }, { key: "f2", enabled: true, defaultValue: true }]);
    const provider = createCompositeProvider([a, b]);
    const flags = await provider.getAll();
    expect(flags).toHaveLength(2);
  });
});

describe("cachedProvider", () => {
  it("caches flag lookups", async () => {
    let callCount = 0;
    const inner = {
      async get(key: string) {
        callCount++;
        return { key, enabled: true, defaultValue: true };
      },
      async getAll() {
        callCount++;
        return [{ key: "f1", enabled: true, defaultValue: true }];
      },
    };
    const provider = createCachedProvider(inner, { ttl: 60_000 });
    await provider.get("f1");
    await provider.get("f1");
    await provider.get("f1");
    expect(callCount).toBe(1);
  });

  it("refresh clears cache", async () => {
    let callCount = 0;
    const inner = {
      async get(key: string) {
        callCount++;
        return { key, enabled: true, defaultValue: true };
      },
      async getAll() {
        callCount++;
        return [];
      },
    };
    const provider = createCachedProvider(inner, { ttl: 60_000 });
    await provider.get("f1");
    await provider.refresh();
    await provider.get("f1");
    expect(callCount).toBe(2);
  });
});
