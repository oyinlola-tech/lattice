import { createNodeCryptoProvider } from "../node/index.js";

const provider = createNodeCryptoProvider();

/**
 * Generates cryptographically secure random bytes.
 */
export async function randomBytesSecure(length: number): Promise<Uint8Array> {
  return provider.randomBytes(length);
}

/**
 * Generates a cryptographically secure random integer.
 *
 * The returned value is in the range:
 * min <= value < max
 */
export async function randomInteger(min: number, max: number): Promise<number> {
  return provider.randomInt(min, max);
}

/**
 * Generates a cryptographically secure random integer
 * from zero up to, but excluding, max.
 */
export async function randomIntegerBelow(max: number): Promise<number> {
  return provider.randomInt(0, max);
}

/**
 * Generates a random UUID v4.
 */
export async function randomUuid(): Promise<string> {
  return provider.randomUUID();
}
