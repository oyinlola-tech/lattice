import { describe, it, expect } from "vitest";
import { createFeatureFlags } from "../src/featureFlags/featureFlags.core.js";
import { createMemoryProvider } from "../src/provider/providerMemory.core.js";
import type { FeatureFlag } from "../src/featureFlagTypes/featureFlag.interface.js";

const flags: readonly FeatureFlag[] = [
  { key: "dark-mode", enabled: true, defaultValue: false },
  { key: "new-checkout", enabled: true, defaultValue: false, rules: [
    { type: "user", users: ["u1", "u2"], value: true },
  ]},
  { key: "ai-search", enabled: true, defaultValue: false, rules: [
    { type: "attribute", attribute: "plan", operator: "equals", value: "pro" },
  ]},
  { key: "rollout", enabled: true, defaultValue: false, rules: [
    { type: "percentage", percentage: 100, value: true },
  ]},
  { key: "disabled-flag", enabled: false, defaultValue: true },
  { key: "variant-test", enabled: true, defaultValue: "control", rules: [
    { type: "variant", variants: [
      { key: "control", weight: 50 },
      { key: "treatment", weight: 50 },
    ]},
  ]},
];

describe("createFeatureFlags", () => {
  it("isEnabled returns boolean", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.isEnabled("dark-mode")).toBe(false);
  });

  it("isEnabled returns true for matched rule", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.isEnabled("new-checkout", { userId: "u1" })).toBe(true);
  });

  it("isEnabled returns false for unmatched rule", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.isEnabled("new-checkout", { userId: "u99" })).toBe(false);
  });

  it("get returns typed value", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    const value = await flagsApi.get<string>("variant-test", { userId: "u1" });
    expect(["control", "treatment"]).toContain(value);
  });

  it("getBoolean returns fallback for missing flag", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.getBoolean("nonexistent", true)).toBe(true);
  });

  it("getBoolean returns actual value when flag exists", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.getBoolean("dark-mode", true)).toBe(false);
  });

  it("evaluate returns full evaluation result", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    const result = await flagsApi.evaluate("new-checkout", { userId: "u1" });
    expect(result.key).toBe("new-checkout");
    expect(result.value).toBe(true);
    expect(result.defaulted).toBe(false);
  });

  it("returns not_found for missing flag", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    const result = await flagsApi.evaluate("nonexistent");
    expect(result.reason).toBe("not_found");
    expect(result.defaulted).toBe(true);
  });

  it("throws on missing flag when configured", async () => {
    const flagsApi = createFeatureFlags({
      provider: createMemoryProvider(flags),
      throwOnMissing: true,
    });
    await expect(flagsApi.isEnabled("nonexistent")).rejects.toThrow("nonexistent");
  });

  it("returns disabled for disabled flag", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    const result = await flagsApi.evaluate("disabled-flag");
    expect(result.reason).toBe("disabled");
  });

  it("attribute targeting works", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.isEnabled("ai-search", { attributes: { plan: "pro" } })).toBe(true);
    expect(await flagsApi.isEnabled("ai-search", { attributes: { plan: "free" } })).toBe(false);
  });

  it("percentage rollout with 100% enables for all", async () => {
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(flags) });
    expect(await flagsApi.isEnabled("rollout", { userId: "anyone" })).toBe(true);
  });

  it("defaultContext is merged with provided context", async () => {
    const flagsApi = createFeatureFlags({
      provider: createMemoryProvider(flags),
      defaultContext: { attributes: { plan: "pro" } },
    });
    expect(await flagsApi.isEnabled("ai-search")).toBe(true);
  });

  it("snapshot returns client-visible flags", async () => {
    const clientFlags: readonly FeatureFlag[] = [
      { key: "ui-v2", enabled: true, defaultValue: true, visibility: "client" },
      { key: "internal", enabled: true, defaultValue: true, visibility: "server" },
    ];
    const flagsApi = createFeatureFlags({ provider: createMemoryProvider(clientFlags) });
    const snapshot = await flagsApi.snapshot();
    expect(snapshot.has("ui-v2")).toBe(true);
    expect(snapshot.has("internal")).toBe(false);
  });

  it("refresh reloads flags", async () => {
    const provider = createMemoryProvider(flags);
    const flagsApi = createFeatureFlags({ provider });
    await flagsApi.isEnabled("dark-mode");
    provider.set({ key: "new-flag", enabled: true, defaultValue: true });
    await flagsApi.refresh();
    expect(await flagsApi.isEnabled("new-flag")).toBe(true);
  });
});
