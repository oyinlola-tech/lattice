/**
 * @lattice/cache — Key Builder Tests
 *
 * Tests for DefaultKeyBuilder, key validation, namespace scoping,
 * and prefix/separator configuration.
 */

import { describe, it, expect } from "vitest";

import {
  DefaultKeyBuilder,
  createKeyBuilder,
  defaultKeyBuilder,
} from "../src/key-builder.js";
import { DEFAULT_PREFIX, DEFAULT_SEPARATOR, MAX_KEY_LENGTH } from "../src/constants.js";

// ─── DefaultKeyBuilder ─────────────────────────────────────────────────────

describe("DefaultKeyBuilder", () => {
  it("builds a key with default prefix and separator", () => {
    const builder = new DefaultKeyBuilder();
    const key = builder.build("user:123");
    expect(key).toBe(`${DEFAULT_PREFIX}${DEFAULT_SEPARATOR}user:123`);
  });

  it("builds a key with custom prefix", () => {
    const builder = new DefaultKeyBuilder({ prefix: "myapp" });
    const key = builder.build("user:123");
    expect(key).toBe("myapp:user:123");
  });

  it("builds a key with custom separator", () => {
    const builder = new DefaultKeyBuilder({ separator: "." });
    const key = builder.build("user:123");
    expect(key).toBe(`lattice.user:123`);
  });

  it("builds a key with no prefix", () => {
    const builder = new DefaultKeyBuilder({ prefix: "" });
    const key = builder.build("user:123");
    expect(key).toBe("user:123");
  });

  it("builds a key with namespace", () => {
    const builder = new DefaultKeyBuilder({ namespace: "auth" });
    const key = builder.build("token:abc");
    expect(key).toBe("lattice:auth:token:abc");
  });

  it("builds a key with prefix, namespace, and custom separator", () => {
    const builder = new DefaultKeyBuilder({
      prefix: "app",
      namespace: "cache",
      separator: ".",
    });
    const key = builder.build("data");
    expect(key).toBe("app.cache.data");
  });

  it("overrides namespace per-build", () => {
    const builder = new DefaultKeyBuilder({ namespace: "auth" });
    const key = builder.build("token", { namespace: "users" });
    expect(key).toBe("lattice:users:token");
  });

  it("overrides separator per-build", () => {
    const builder = new DefaultKeyBuilder();
    const key = builder.build("key", { separator: "." });
    expect(key).toBe("lattice.key");
  });

  it("overrides prefix per-build", () => {
    const builder = new DefaultKeyBuilder();
    const key = builder.build("key", { prefix: "override" });
    expect(key).toBe("override:key");
  });
});

// ─── Namespace Scoping ─────────────────────────────────────────────────────

describe("DefaultKeyBuilder namespace", () => {
  it("creates a namespaced builder", () => {
    const root = new DefaultKeyBuilder();
    const scoped = root.namespace("users");
    const key = scoped.build("profile");
    expect(key).toBe("lattice:users:profile");
  });

  it("namespaced builder preserves prefix and separator", () => {
    const root = new DefaultKeyBuilder({ prefix: "app", separator: "." });
    const scoped = root.namespace("v1");
    const key = scoped.build("items");
    expect(key).toBe("app.v1.items");
  });

  it("namespaced builder is independent of root", () => {
    const root = new DefaultKeyBuilder();
    const scoped = root.namespace("scope1");
    const rootKey = root.build("key");
    const scopedKey = scoped.build("key");
    expect(rootKey).toBe("lattice:key");
    expect(scopedKey).toBe("lattice:scope1:key");
  });
});

// ─── Validation ────────────────────────────────────────────────────────────

describe("DefaultKeyBuilder validation", () => {
  it("throws when key exceeds max length", () => {
    const builder = new DefaultKeyBuilder();
    const longKey = "a".repeat(MAX_KEY_LENGTH + 1);
    expect(() => builder.build(longKey)).toThrow();
  });

  it("accepts a key at max length", () => {
    const builder = new DefaultKeyBuilder({ prefix: "" });
    const maxKey = "a".repeat(MAX_KEY_LENGTH);
    expect(() => builder.build(maxKey)).not.toThrow();
  });

  it("throws for keys with invalid characters", () => {
    const builder = new DefaultKeyBuilder();
    expect(() => builder.build("key with spaces")).toThrow();
    expect(() => builder.build("key@special")).toThrow();
  });

  it("accepts valid key characters", () => {
    const builder = new DefaultKeyBuilder();
    expect(() => builder.build("valid-key_123.test")).not.toThrow();
    expect(() => builder.build("user:123")).not.toThrow();
  });
});

// ─── Factories ─────────────────────────────────────────────────────────────

describe("createKeyBuilder", () => {
  it("creates a DefaultKeyBuilder", () => {
    const builder = createKeyBuilder();
    expect(builder).toBeInstanceOf(DefaultKeyBuilder);
  });

  it("passes options through", () => {
    const builder = createKeyBuilder({ prefix: "custom" });
    expect(builder.build("key")).toBe("custom:key");
  });
});

describe("defaultKeyBuilder", () => {
  it("is a singleton", () => {
    expect(defaultKeyBuilder).toBeInstanceOf(DefaultKeyBuilder);
    expect(defaultKeyBuilder.build("key")).toBe("lattice:key");
  });
});
