import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  encryptEnvelope,
  decryptEnvelope,
} from "../src/cryptoCipher/index.js";

const TEST_KEY = new Uint8Array(32).fill(42);

describe("encrypt / decrypt", () => {
  it("round-trips binary data", async () => {
    const plaintext = new Uint8Array([1, 2, 3, 4, 5]);
    const encrypted = await encrypt(plaintext, TEST_KEY);
    const decrypted = await decrypt(
      encrypted.ciphertext,
      TEST_KEY,
      encrypted.iv,
      encrypted.authTag,
    );
    expect(decrypted).toEqual(plaintext);
  });

  it("round-trips string data", async () => {
    const result = await encryptString("hello world", TEST_KEY);
    const decrypted = await decryptString(
      result.ciphertext,
      TEST_KEY,
      result.iv,
      result.authTag,
    );
    expect(decrypted).toBe("hello world");
  });

  it("includes AAD when provided", async () => {
    const plaintext = new Uint8Array([1, 2, 3]);
    const aad = new Uint8Array([9, 9, 9]);
    const encrypted = await encrypt(plaintext, TEST_KEY, { aad });
    expect(encrypted.ciphertext.length).toBeGreaterThan(0);
    const decrypted = await decrypt(
      encrypted.ciphertext,
      TEST_KEY,
      encrypted.iv,
      encrypted.authTag,
      aad,
    );
    expect(decrypted).toEqual(plaintext);
  });

  it("produces different ciphertexts for same plaintext", async () => {
    const plaintext = new Uint8Array([1, 2, 3]);
    const a = await encrypt(plaintext, TEST_KEY);
    const b = await encrypt(plaintext, TEST_KEY);
    expect(a.ciphertext).not.toEqual(b.ciphertext);
    expect(a.iv).not.toEqual(b.iv);
  });

  it("fails decryption with wrong key", async () => {
    const plaintext = new Uint8Array([1, 2, 3]);
    const encrypted = await encrypt(plaintext, TEST_KEY);
    const wrongKey = new Uint8Array(32).fill(99);
    await expect(
      decrypt(encrypted.ciphertext, wrongKey, encrypted.iv, encrypted.authTag),
    ).rejects.toThrow();
  });

  it("fails decryption with wrong AAD", async () => {
    const plaintext = new Uint8Array([1, 2, 3]);
    const encrypted = await encrypt(plaintext, TEST_KEY, {
      aad: new Uint8Array([1]),
    });
    await expect(
      decrypt(
        encrypted.ciphertext,
        TEST_KEY,
        encrypted.iv,
        encrypted.authTag,
        new Uint8Array([2]),
      ),
    ).rejects.toThrow();
  });
});

describe("encryptEnvelope / decryptEnvelope", () => {
  it("round-trips envelope", async () => {
    const plaintext = new Uint8Array([10, 20, 30]);
    const envelope = await encryptEnvelope(plaintext, TEST_KEY);
    const decrypted = await decryptEnvelope(envelope, TEST_KEY);
    expect(decrypted).toEqual(plaintext);
  });

  it("envelope format is version.algorithm.iv.tag.ciphertext", async () => {
    const envelope = await encryptEnvelope(new Uint8Array([1]), TEST_KEY);
    const parts = envelope.split(".");
    expect(parts.length).toBe(5);
    expect(parts[0]).toBe("v1");
    expect(parts[1]).toBe("aes-256-gcm");
  });

  it("rejects invalid envelope", async () => {
    await expect(decryptEnvelope("invalid", TEST_KEY)).rejects.toThrow();
    await expect(
      decryptEnvelope("v1.aes-256-gcm.abc", TEST_KEY),
    ).rejects.toThrow();
  });
});
