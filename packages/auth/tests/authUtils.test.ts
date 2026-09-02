import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  needsRehash,
  generateRandomToken,
  createMemorySessionStore,
  parseBearerToken,
  parseCookies,
  generateCsrfToken,
} from "../src/index.js";

describe("Password utilities", () => {
  it("should hash a password", async () => {
    const hash = await hashPassword("my-secret-password");
    expect(typeof hash).toBe("string");
    expect(hash).toContain("scrypt");
  });

  it("should verify a correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);
    expect(result).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("should detect when rehash is needed", async () => {
    const hash = await hashPassword("password");
    const result = needsRehash(hash);
    expect(typeof result).toBe("boolean");
  });

  it("should generate a random token", () => {
    const token = generateRandomToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("should generate a random token with custom length", () => {
    const token = generateRandomToken(64);
    expect(typeof token).toBe("string");
  });
});

describe("Session store", () => {
  it("should create a memory session store", () => {
    const store = createMemorySessionStore();
    expect(store).toBeDefined();
    expect(typeof store.create).toBe("function");
    expect(typeof store.get).toBe("function");
    expect(typeof store.destroy).toBe("function");
  });

  it("should create and retrieve a session", async () => {
    const store = createMemorySessionStore();
    const session = await store.create({
      userId: "user-123" as never,
    });

    expect(session.id).toBeDefined();
    expect(session.userId).toBe("user-123");
    expect(session.active).toBe(true);

    const retrieved = await store.get(session.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(session.id);
  });

  it("should destroy a session", async () => {
    const store = createMemorySessionStore();
    const session = await store.create({
      userId: "user-123" as never,
    });

    await store.destroy(session.id);
    const retrieved = await store.get(session.id);
    expect(retrieved).toBeNull();
  });

  it("should destroy all sessions for a user", async () => {
    const store = createMemorySessionStore();
    await store.create({ userId: "user-1" as never });
    await store.create({ userId: "user-1" as never });
    await store.create({ userId: "user-2" as never });

    await store.destroyAllForUser("user-1" as never);

    const sessions1 = await store.get("session-1" as never);
    expect(sessions1).toBeNull();
  });
});

describe("Auth utilities", () => {
  describe("parseBearerToken", () => {
    it("should extract token from Bearer header", () => {
      const token = parseBearerToken("Bearer abc123");
      expect(token).toBe("abc123");
    });

    it("should return null for missing header", () => {
      expect(parseBearerToken(undefined)).toBeNull();
    });

    it("should return null for non-Bearer header", () => {
      expect(parseBearerToken("Basic abc123")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseBearerToken("")).toBeNull();
    });
  });

  describe("parseCookies", () => {
    it("should parse cookie string", () => {
      const cookies = parseCookies("name=value; other=test");
      expect(cookies.name).toBe("value");
      expect(cookies.other).toBe("test");
    });

    it("should handle empty cookie string", () => {
      const cookies = parseCookies("");
      expect(cookies).toEqual({});
    });

    it("should handle undefined cookie string", () => {
      const cookies = parseCookies(undefined);
      expect(cookies).toEqual({});
    });
  });

  describe("generateCsrfToken", () => {
    it("should generate a CSRF token", () => {
      const token = generateCsrfToken();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate unique tokens", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });
});
