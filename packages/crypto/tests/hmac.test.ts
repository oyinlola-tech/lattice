import { describe, it, expect } from "vitest";
import {
  hmac,
  hmacSha256,
  hmacSha384,
  hmacSha512,
} from "../src/cryptoHash/index.js";

describe("hmac", () => {
  const key = new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
  ]);
  const data = new Uint8Array([104, 101, 108, 108, 111]);

  it("computes HMAC-SHA256", async () => {
    const result = await hmacSha256(data, key);
    expect(typeof result).toBe("string");
    expect(result.length).toBe(64);
  });

  it("computes HMAC-SHA384", async () => {
    const result = await hmacSha384(data, key);
    expect(typeof result).toBe("string");
    expect(result.length).toBe(96);
  });

  it("computes HMAC-SHA512", async () => {
    const result = await hmacSha512(data, key);
    expect(typeof result).toBe("string");
    expect(result.length).toBe(128);
  });

  it("returns hex by default", async () => {
    const result = await hmac(data, key, "sha256");
    expect(typeof result).toBe("string");
    expect(result.length).toBe(64);
  });

  it("produces deterministic output", async () => {
    const a = await hmacSha256(data, key);
    const b = await hmacSha256(data, key);
    expect(a).toBe(b);
  });

  it("changes output when key changes", async () => {
    const a = await hmacSha256(data, key);
    const b = await hmacSha256(
      data,
      new Uint8Array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]),
    );
    expect(a).not.toBe(b);
  });

  it("changes output when data changes", async () => {
    const a = await hmacSha256(data, key);
    const b = await hmacSha256(new Uint8Array([119, 111, 114, 108, 100]), key);
    expect(a).not.toBe(b);
  });
});
