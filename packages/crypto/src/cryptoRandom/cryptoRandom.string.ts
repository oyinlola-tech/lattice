import {
  createNodeCryptoProvider,
} from "../node/index.js";

const provider = createNodeCryptoProvider();

/**
 * Generates a cryptographically secure random hexadecimal string.
 */
export async function randomHex(
  length: number,
): Promise<string> {
  const bytes = await provider.randomBytes(
    Math.ceil(length / 2),
  );

  return Buffer.from(bytes)
    .toString("hex")
    .slice(0, length);
}

/**
 * Generates a cryptographically secure random base64 string.
 */
export async function randomBase64(
  byteLength: number,
): Promise<string> {
  const bytes = await provider.randomBytes(byteLength);

  return Buffer.from(bytes).toString("base64");
}

/**
 * Generates a cryptographically secure URL-safe random string.
 */
export async function randomBase64Url(
  byteLength: number,
): Promise<string> {
  const bytes = await provider.randomBytes(byteLength);

  return Buffer.from(bytes).toString("base64url");
}

/**
 * Generates a random token suitable for use as an opaque identifier.
 *
 * The returned token contains only URL-safe characters.
 */
export async function randomToken(
  byteLength = 32,
): Promise<string> {
  return randomBase64Url(byteLength);
}

/**
 * Generates a random numeric code.
 *
 * Leading zeroes are preserved.
 */
export async function randomNumericCode(
  length = 6,
): Promise<string> {
  let result = "";

  while (result.length < length) {
    const value = await provider.randomInt(0, 1_000_000);

    result += String(value).padStart(6, "0");
  }

  return result.slice(0, length);
}

/**
 * Generates a random alphanumeric token.
 */
export async function randomAlphanumeric(
  length: number,
): Promise<string> {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  while (result.length < length) {
    const index = await provider.randomInt(
      0,
      alphabet.length,
    );

    result += alphabet[index]!;
  }

  return result;
}

/**
 * Generates random characters from a caller-provided alphabet.
 *
 * The alphabet must not be empty.
 */
export async function randomFromAlphabet(
  length: number,
  alphabet: string,
): Promise<string> {
  if (alphabet.length === 0) {
    throw new RangeError(
      "alphabet must not be empty.",
    );
  }

  const characters = Array.from(alphabet);

  let result = "";

  while (result.length < length) {
    const index = await provider.randomInt(
      0,
      characters.length,
    );

    result += characters[index]!;
  }

  return result;
}
