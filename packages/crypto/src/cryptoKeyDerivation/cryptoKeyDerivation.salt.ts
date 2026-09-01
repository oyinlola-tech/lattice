import { createNodeCryptoProvider } from "../node/index.js";

/**
 * Creates a random salt.
 */
export async function generateSalt(length = 16): Promise<Uint8Array> {
  if (!Number.isInteger(length) || length < 16) {
    throw new RangeError(
      "Salt length must be an integer of at least 16 bytes.",
    );
  }

  const provider = createNodeCryptoProvider();

  return provider.randomBytes(length);
}
