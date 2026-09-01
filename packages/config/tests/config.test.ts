import { describe, it, expect } from "vitest";

import { validateConfigObject } from "../src/configSchema/configSchema.validator.js";

import {
  ConfigSourceType,
  createConfigSource,
} from "../src/configSource/configSource.core.js";

import { createConfigStore } from "../src/configStore/configStore.factory.js";

import {
  createConfigEntry,
  isConfigEntry,
} from "../src/configEntry/configEntry.type.js";

import {
  isConfigPrimitive,
  isConfigValue,
  cloneConfigValue,
  freezeConfigValue,
  configValueToString,
} from "../src/configValue/configValue.core.js";

import { createConfigManager } from "../src/configManager/configManager.factory.js";

import { ConfigManagerState } from "../src/configManager/configManager.type.js";

import { createConfigResolver } from "../src/configResolver/core/configResolver.factory.js";

// ---------------------------------------------------------------------------
// ConfigValue
// ---------------------------------------------------------------------------

describe("ConfigValue", () => {
  it("recognizes primitives", () => {
    expect(isConfigPrimitive("hello")).toBe(true);
    expect(isConfigPrimitive(42)).toBe(true);
    expect(isConfigPrimitive(true)).toBe(true);
    expect(isConfigPrimitive(null)).toBe(true);
    expect(isConfigPrimitive(undefined)).toBe(true);
    expect(isConfigPrimitive({})).toBe(false);
  });

  it("recognizes config values", () => {
    expect(isConfigValue("hello")).toBe(true);
    expect(isConfigValue(42)).toBe(true);
    expect(isConfigValue({ a: 1 })).toBe(true);
    expect(isConfigValue([1, 2, 3])).toBe(true);
  });

  it("clones values", () => {
    const original = { a: { b: 1 } };
    const cloned = cloneConfigValue(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it("freezes values", () => {
    const obj = { a: 1 };
    const frozen = freezeConfigValue(obj);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("converts to string", () => {
    expect(configValueToString("hello")).toBe("hello");
    expect(configValueToString(42)).toBe("42");
    expect(configValueToString(true)).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// ConfigEntry
// ---------------------------------------------------------------------------

describe("ConfigEntry", () => {
  it("creates a config entry", () => {
    const entry = createConfigEntry({ key: "db.host", value: "localhost" });
    expect(entry.key).toBe("db.host");
    expect(entry.value).toBe("localhost");
    expect(isConfigEntry(entry)).toBe(true);
  });

  it("rejects non-entries", () => {
    expect(isConfigEntry({ key: "x" })).toBe(false);
    expect(isConfigEntry(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ConfigStore
// ---------------------------------------------------------------------------

describe("ConfigStore", () => {
  it("creates a store with initial values", () => {
    const store = createConfigStore({
      initialValues: {
        "app.name": "test",
        "app.port": 3000,
      },
    });

    expect(store.get("app.name")).toBe("test");
    expect(store.get("app.port")).toBe(3000);
    expect(store.size).toBe(2);
  });

  it("sets and gets values", () => {
    const store = createConfigStore();
    store.set("key", "value");
    expect(store.get("key")).toBe("value");
  });

  it("deletes values", () => {
    const store = createConfigStore();
    store.set("key", "value");
    expect(store.delete("key")).toBe(true);
    expect(store.get("key")).toBeUndefined();
  });

  it("freezes values when configured", () => {
    const store = createConfigStore({ freeze: true });
    store.set("key", { nested: true });
    const entry = store.getEntry("key");
    expect(entry).toBeDefined();
  });

  it("converts to object", () => {
    const store = createConfigStore({
      initialValues: { a: 1, b: "two" },
    });
    const obj = store.toObject();
    expect(obj.a).toBe(1);
    expect(obj.b).toBe("two");
  });

  it("disposes cleanly", () => {
    const store = createConfigStore();
    store.set("key", "value");
    store.dispose();
    expect(store.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// ConfigResolver
// ---------------------------------------------------------------------------

describe("ConfigResolver", () => {
  it("gets values from the store", () => {
    const store = createConfigStore({
      initialValues: { "app.host": "localhost" },
    });
    const resolver = createConfigResolver(store);

    expect(resolver.get("app.host")).toBe("localhost");
  });

  it("returns undefined for missing keys", () => {
    const store = createConfigStore();
    const resolver = createConfigResolver(store);

    expect(resolver.get("missing")).toBeUndefined();
  });

  it("creates scoped resolvers", () => {
    const store = createConfigStore({
      initialValues: {
        "db.host": "localhost",
        "db.port": 5432,
      },
    });
    const resolver = createConfigResolver(store);
    const scoped = resolver.scoped("db");

    expect(scoped.get("host")).toBe("localhost");
    expect(scoped.get("port")).toBe(5432);
  });
});

// ---------------------------------------------------------------------------
// ConfigSchema validation
// ---------------------------------------------------------------------------

describe("ConfigSchema validation", () => {
  it("validates an object against a schema", () => {
    const result = validateConfigObject(
      { name: "test", port: 3000 },
      {
        type: "object",
        properties: {
          name: { type: "string" },
          port: { type: "number" },
        },
      },
    );

    expect(result.valid).toBe(true);
  });

  it("detects type mismatches", () => {
    const result = validateConfigObject(
      { name: 42 },
      {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      },
    );

    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ConfigSource
// ---------------------------------------------------------------------------

describe("ConfigSource", () => {
  it("creates a source with loader", async () => {
    const source = createConfigSource({ name: "test-source" }, async () => ({
      values: { key: "value" },
      source: "test",
      type: ConfigSourceType.CUSTOM,
    }));

    expect(source.name).toBe("test-source");
    expect(source.type).toBe(ConfigSourceType.CUSTOM);

    const result = await source.load({
      environment: "test",
    });
    expect(result.values.key).toBe("value");
  });
});

// ---------------------------------------------------------------------------
// ConfigManager
// ---------------------------------------------------------------------------

describe("ConfigManager", () => {
  it("creates in CREATED state", () => {
    const manager = createConfigManager();
    expect(manager.getState()).toBe(ConfigManagerState.CREATED);
  });

  it("loads and transitions to READY", async () => {
    const manager = createConfigManager();
    await manager.load();
    expect(manager.getState()).toBe(ConfigManagerState.READY);
    expect(manager.isReady).toBe(true);
  });

  it("gets values set before load", async () => {
    const manager = createConfigManager({
      initialValues: {
        "app.name": "lattice",
      },
    });

    // Initial values are in the store before load
    expect(manager.get("app.name")).toBe("lattice");

    await manager.load();
    expect(manager.isReady).toBe(true);
  });

  it("sets runtime values", async () => {
    const manager = createConfigManager();
    await manager.load();

    manager.set("runtime.key", "runtime-value");
    expect(manager.get("runtime.key")).toBe("runtime-value");
  });

  it("deletes values", async () => {
    const manager = createConfigManager({
      initialValues: { "to.delete": true },
    });

    expect(manager.get("to.delete")).toBe(true);
    expect(manager.delete("to.delete")).toBe(true);
    expect(manager.get("to.delete")).toBeUndefined();
  });

  it("tracks status", async () => {
    const manager = createConfigManager();

    const status1 = manager.getStatus();
    expect(status1.state).toBe(ConfigManagerState.CREATED);

    await manager.load();

    const status2 = manager.getStatus();
    expect(status2.state).toBe(ConfigManagerState.READY);
    expect(status2.loaded).toBe(true);
  });

  it("subscribes to state changes", async () => {
    const manager = createConfigManager();

    const states: string[] = [];
    manager.subscribe((status) => {
      states.push(status.state);
    });

    await manager.load();

    expect(states).toContain(ConfigManagerState.READY);
  });

  it("converts to object", async () => {
    const manager = createConfigManager({
      initialValues: { a: 1, b: "two" },
    });

    const obj = manager.toObject();
    expect(obj.a).toBe(1);
    expect(obj.b).toBe("two");
  });

  it("disposes cleanly", async () => {
    const manager = createConfigManager();
    await manager.dispose();

    expect(manager.getState()).toBe(ConfigManagerState.DISPOSED);
    expect(() => manager.get("key")).toThrow();
  });

  it("rejects operations after dispose", async () => {
    const manager = createConfigManager();
    await manager.dispose();

    expect(() => manager.get("key")).toThrow("disposed");
  });

  it("manages lifecycle states", async () => {
    const manager = createConfigManager();

    expect(manager.getState()).toBe(ConfigManagerState.CREATED);
    expect(manager.isLoading).toBe(false);

    await manager.load();
    expect(manager.getState()).toBe(ConfigManagerState.READY);
    expect(manager.isLoading).toBe(false);

    // Reload
    await manager.reload();
    expect(manager.getState()).toBe(ConfigManagerState.READY);
  });
});
