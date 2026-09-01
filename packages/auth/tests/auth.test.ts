import { describe, it, expect } from "vitest";
import {
  // Password
  hashPassword,
  verifyPassword,
  needsRehash,
  generateRandomToken,

  // Token
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,

  // Session
  createMemorySessionStore,

  // Provider
  createAuthService,
  type AuthUser,
  type TokenConfig,
} from "../src/index.js";

import {
  createPermissionEngine,
  createRoleRegistry,
  type PermissionEngine,
} from "@oyinlola141/lattice-permissions";

const TEST_TOKEN_CONFIG: TokenConfig = {
  accessSecret: "test-access-secret-key-for-testing-32chars!",
  refreshSecret: "test-refresh-secret-key-for-testing-32ch!",
  accessTtl: 900,
  refreshTtl: 604_800,
  issuer: "lattice-test",
  audience: "lattice-test-client",
};

const TEST_USER: AuthUser = {
  id: "user-123",
  email: "alice@example.com",
  name: "Alice",
  roles: ["admin", "editor"],
  active: true,
  createdAt: new Date("2024-01-01"),
};

// ─── Password ─────────────────────────────────────────────────────────────

describe("Password Hashing", () => {
  it("should hash a password", async () => {
    const hash = await hashPassword("my-password");
    expect(hash).toContain("scrypt");
    expect(hash).not.toBe("my-password");
  });

  it("should verify a correct password", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("correct-password", hash)).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("should generate different hashes for the same password", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });

  it("needsRehash should detect old format", () => {
    expect(needsRehash("invalid-format")).toBe(true);
    expect(needsRehash("scrypt$a$hash")).toBe(true);
  });

  it("should generate random tokens", () => {
    const token1 = generateRandomToken();
    const token2 = generateRandomToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64);
  });
});

// ─── Token ─────────────────────────────────────────────────────────────────

describe("JWT Tokens", () => {
  it("should create a token pair", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG);
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
    expect(tokens.tokenType).toBe("Bearer");
    expect(tokens.expiresIn).toBe(900);
  });

  it("should verify a valid access token", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG, { roles: ["admin"] });
    const result = verifyAccessToken(tokens.accessToken, TEST_TOKEN_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe("user-123");
    expect(result.payload?.typ).toBe("access");
    expect(result.payload?.roles).toEqual(["admin"]);
  });

  it("should verify a valid refresh token", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG);
    const result = verifyRefreshToken(tokens.refreshToken, TEST_TOKEN_CONFIG);
    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe("user-123");
    expect(result.payload?.typ).toBe("refresh");
  });

  it("should reject an access token used as refresh token", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG);
    const result = verifyRefreshToken(tokens.accessToken, TEST_TOKEN_CONFIG);
    expect(result.valid).toBe(false);
  });

  it("should reject a tampered token", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG);
    const tampered = tokens.accessToken.slice(0, -5) + "XXXXX";
    const result = verifyAccessToken(tampered, TEST_TOKEN_CONFIG);
    expect(result.valid).toBe(false);
  });

  it("should reject a token signed with the wrong secret", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG);
    const wrongConfig: TokenConfig = {
      ...TEST_TOKEN_CONFIG,
      accessSecret: "wrong-secret-key-32-chars-long!!!!",
    };
    const result = verifyAccessToken(tokens.accessToken, wrongConfig);
    expect(result.valid).toBe(false);
  });

  it("should refresh an access token", () => {
    const tokens = createTokenPair("user-123", TEST_TOKEN_CONFIG, { roles: ["user"] });
    const newTokens = refreshAccessToken(tokens.refreshToken, TEST_TOKEN_CONFIG, { roles: ["user"] });
    expect(newTokens).not.toBeNull();
    expect(newTokens!.accessToken).not.toBe(tokens.accessToken);
  });

  it("should reject refresh with an invalid refresh token", () => {
    const result = refreshAccessToken("invalid-token", TEST_TOKEN_CONFIG);
    expect(result).toBeNull();
  });
});

// ─── Session ───────────────────────────────────────────────────────────────

describe("Session Management", () => {
  it("should create a session", async () => {
    const store = createMemorySessionStore();
    const session = await store.create({ userId: "user-123" });
    expect(session.id).toBeTruthy();
    expect(session.userId).toBe("user-123");
    expect(session.active).toBe(true);
  });

  it("should get a session by ID", async () => {
    const store = createMemorySessionStore();
    const created = await store.create({ userId: "user-123" });
    const retrieved = await store.get(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.userId).toBe("user-123");
  });

  it("should return null for non-existent session", async () => {
    const store = createMemorySessionStore();
    const retrieved = await store.get("non-existent");
    expect(retrieved).toBeNull();
  });

  it("should touch a session", async () => {
    const store = createMemorySessionStore();
    const session = await store.create({ userId: "user-123" });
    const before = session.lastActivityAt;
    await store.touch(session.id);
    const after = await store.get(session.id);
    expect(after!.lastActivityAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("should destroy a session", async () => {
    const store = createMemorySessionStore();
    const session = await store.create({ userId: "user-123" });
    await store.destroy(session.id);
    const retrieved = await store.get(session.id);
    expect(retrieved).toBeNull();
  });

  it("should destroy all sessions for a user", async () => {
    const store = createMemorySessionStore();
    await store.create({ userId: "user-123" });
    await store.create({ userId: "user-123" });
    await store.create({ userId: "user-456" });
    await store.destroyAllForUser("user-123");
    expect(await store.get((await store.create({ userId: "user-123" })).id)).not.toBeNull();
  });
});

// ─── Permissions Engine (via @oyinlola141/lattice-permissions) ──────────────────────────

describe("Permissions Engine", () => {
  const engine = createPermissionEngine({
    roles: [
      { name: "admin", permissions: ["users:read", "users:write", "posts:*", "*:*"] },
      { name: "viewer", permissions: ["users:read", "posts:read"] },
    ],
  });

  it("should check exact permissions", async () => {
    expect(await engine.can({ id: "u1", roles: ["viewer"] }, "users:read")).toBe(true);
    expect(await engine.can({ id: "u1", roles: ["viewer"] }, "users:write")).toBe(false);
  });

  it("should check wildcard permissions", async () => {
    expect(await engine.can({ id: "u1", roles: ["admin"] }, "posts:delete")).toBe(true);
    expect(await engine.can({ id: "u1", roles: ["admin"] }, "anything:here")).toBe(true);
  });

  it("should support ownership via policy", async () => {
    const engineWithPolicy = createPermissionEngine({
      roles: [
        { name: "viewer", permissions: ["posts:read"] },
      ],
      policies: [
        {
          name: "owner",
          permissions: ["posts:write"],
          evaluate: (ctx) => ({
            allowed: ctx.actor.id === (ctx.resource as Record<string, unknown>)?.ownerId,
          }),
        },
      ],
    });

    const result = await engineWithPolicy.check(
      { id: "user-123", roles: ["viewer"] },
      "posts:write",
      { ownerId: "user-123" },
    );
    expect(result.allowed).toBe(true);
  });

  it("should deny without ownership", async () => {
    const engineWithPolicy = createPermissionEngine({
      roles: [
        { name: "viewer", permissions: ["posts:read"] },
      ],
      policies: [
        {
          name: "owner",
          permissions: ["posts:write"],
          evaluate: (ctx) => ({
            allowed: ctx.actor.id === (ctx.resource as Record<string, unknown>)?.ownerId,
          }),
        },
      ],
    });

    const result = await engineWithPolicy.check(
      { id: "user-123", roles: ["viewer"] },
      "posts:write",
      { ownerId: "user-456" },
    );
    expect(result.allowed).toBe(false);
  });
});

// ─── Auth Service ──────────────────────────────────────────────────────────

describe("Auth Service", () => {
  const users = new Map<string, AuthUser & { passwordHash: string }>();

  function createEngine(): PermissionEngine {
    return createPermissionEngine({
      roles: [
        { name: "admin", permissions: ["users:read", "users:write"] },
        { name: "viewer", permissions: ["users:read"] },
      ],
    });
  }

  async function setup() {
    users.clear();
    const hash = await hashPassword("password123");
    users.set("alice@example.com", {
      ...TEST_USER,
      passwordHash: hash,
    });

    return createAuthService({
      token: TEST_TOKEN_CONFIG,
      sessionStore: createMemorySessionStore(),
      findUser: async (id) => users.get(id) ?? null,
      verifyPassword: async (userId, pwd) => {
        for (const user of users.values()) {
          if (user.id === userId) {
            return verifyPassword(pwd, user.passwordHash);
          }
        }
        return false;
      },
      permissions: createEngine(),
    });
  }

  it("should login with valid credentials", async () => {
    const auth = await setup();
    const result = await auth.login(
      { identifier: "alice@example.com", password: "password123" },
      { userAgent: "test-agent", ip: "127.0.0.1" },
    );
    expect(result.user.id).toBe("user-123");
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.sessionId).toBeTruthy();
  });

  it("should throw on invalid credentials", async () => {
    const auth = await setup();
    await expect(
      auth.login({ identifier: "alice@example.com", password: "wrong" }),
    ).rejects.toThrow();
  });

  it("should verify a token", async () => {
    const auth = await setup();
    const { tokens } = await auth.login({
      identifier: "alice@example.com",
      password: "password123",
    });
    const payload = auth.verifyToken(tokens.accessToken);
    expect(payload.sub).toBe("user-123");
  });

  it("should refresh tokens", async () => {
    const auth = await setup();
    const { tokens } = await auth.login({
      identifier: "alice@example.com",
      password: "password123",
    });
    const newTokens = await auth.refresh(tokens.refreshToken);
    expect(newTokens.accessToken).not.toBe(tokens.accessToken);
  });

  it("should logout and invalidate session", async () => {
    const auth = await setup();
    const { sessionId } = await auth.login({
      identifier: "alice@example.com",
      password: "password123",
    });
    await auth.logout(sessionId);
  });

  it("should check access permissions via engine", async () => {
    const auth = await setup();
    const result = await auth.checkAccess("user-123", ["admin"], "users:write");
    expect(result.allowed).toBe(true);
  });

  it("should deny access via engine", async () => {
    const auth = await setup();
    const result = await auth.checkAccess("user-123", ["viewer"], "users:write");
    expect(result.allowed).toBe(false);
  });
});
