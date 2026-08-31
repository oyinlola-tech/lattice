import { describe, it, expect } from "vitest";
import { sha256, sha384, sha512, sha3_256, sha3_384, sha3_512, hash } from "../src/cryptoHash/index.js";

describe("hash", () => {
  it("hashes empty string with sha256", async () => {
    const result = await sha256("");
    expect(result).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("hashes 'hello' with sha256", async () => {
    const result = await sha256("hello");
    expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("hashes with sha384", async () => {
    const result = await sha384("hello");
    expect(result).toBe("59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f");
  });

  it("hashes with sha512", async () => {
    const result = await sha512("hello");
    expect(result.length).toBe(128);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("hashes with sha3-256", async () => {
    const result = await sha3_256("hello");
    expect(result.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("hashes with sha3-384", async () => {
    const result = await sha3_384("hello");
    expect(result.length).toBe(96);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("hashes with sha3-512", async () => {
    const result = await sha3_512("hello");
    expect(result.length).toBe(128);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it("returns HashResult with default options", async () => {
    const result = await hash("hello");
    expect(result.algorithm).toBe("sha256");
    expect(result.digest).toBeInstanceOf(Uint8Array);
    expect(result.encoded).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("returns base64 encoded digest", async () => {
    const result = await sha256("hello", "base64");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns base64url encoded digest", async () => {
    const result = await sha256("hello", "base64url");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
