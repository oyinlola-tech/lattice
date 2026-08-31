import {
  createNodeCryptoProvider,
} from "../node/index.js";

const provider = createNodeCryptoProvider();

/**
 * Generates a cryptographically secure random boolean.
 */
export async function randomBoolean(): Promise<boolean> {
  return (await provider.randomInt(0, 2)) === 1;
}

/**
 * Generates a random value from a collection.
 */
export async function randomChoice<T>(
  values: readonly T[],
): Promise<T> {
  if (values.length === 0) {
    throw new RangeError(
      "Cannot choose from an empty collection.",
    );
  }

  return values[await provider.randomInt(0, values.length)]!;
}

/**
 * Fills an existing Uint8Array with cryptographically secure
 * random bytes.
 */
export async function fillRandomBytes(
  target: Uint8Array,
): Promise<Uint8Array> {
  if (!(target instanceof Uint8Array)) {
    throw new TypeError(
      "target must be a Uint8Array.",
    );
  }

  const bytes = await provider.randomBytes(
    target.byteLength,
  );

  target.set(bytes);

  return target;
}
