import { describe, it, expect } from "vitest";
import {
  generateToken,
  generateApiKey,
  generateSessionToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generateCsrfToken,
  generateOtp,
  hashToken,
  verifyTokenHash,
  isValidToken,
} from "../src/cryptoToken/index.js";

describe("token generation", () => {
  it("generates a random token", async () => {
    const token = await generateToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(32);
  });

  it("generates tokens with prefix", async () => {
    expect(await generateApiKey()).toMatch(/^lat_/);
    expect(await generateSessionToken()).toMatch(/^sess_/);
    expect(await generateRefreshToken()).toMatch(/^ref_/);
    expect(await generateVerificationToken()).toMatch(/^verify_/);
    expect(await generatePasswordResetToken()).toMatch(/^reset_/);
    expect(await generateCsrfToken()).toMatch(/^csrf_/);
  });

  it("generates unique tokens", async () => {
    const a = await generateToken();
    const b = await generateToken();
    expect(a).not.toBe(b);
  });
});

describe("OTP generation", () => {
  it("generates 6-digit OTP by default", async () => {
    const otp = await generateOtp();
    expect(otp.length).toBe(6);
    expect(/^\d+$/.test(otp)).toBe(true);
  });

  it("generates OTP with specified digits", async () => {
    const otp = await generateOtp(8);
    expect(otp.length).toBe(8);
  });

  it("preserves leading zeros", async () => {
    const otp = await generateOtp(6);
    expect(otp.length).toBe(6);
  });

  it("rejects invalid digit counts", async () => {
    await expect(generateOtp(3)).rejects.toThrow();
    await expect(generateOtp(13)).rejects.toThrow();
  });
});

describe("hashToken / verifyTokenHash", () => {
  it("hashes a token", async () => {
    const hash = await hashToken("my-secret-token");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64);
  });

  it("verifies a token against its hash", async () => {
    const token = "my-secret-token";
    const hash = await hashToken(token);
    expect(await verifyTokenHash(token, hash)).toBe(true);
  });

  it("rejects wrong token", async () => {
    const hash = await hashToken("correct-token");
    expect(await verifyTokenHash("wrong-token", hash)).toBe(false);
  });

  it("returns false for malformed hash", async () => {
    expect(await verifyTokenHash("token", "not-a-hex-hash")).toBe(false);
  });
});

describe("isValidToken", () => {
  it("returns true for valid token", () => {
    expect(isValidToken("abcdefghijklmnop")).toBe(true);
  });

  it("returns false for short token", () => {
    expect(isValidToken("short")).toBe(false);
  });

  it("returns false for empty token", () => {
    expect(isValidToken("")).toBe(false);
  });
});
