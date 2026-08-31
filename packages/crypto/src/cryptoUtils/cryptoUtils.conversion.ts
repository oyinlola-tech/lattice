/**
 * Supported binary input types.
 */
export type BinaryInput =
  | Uint8Array
  | ArrayBuffer
  | string;

/**
 * Converts supported binary input into a Uint8Array.
 */
export function toBytes(
  value: BinaryInput,
): Uint8Array {
  if (
    typeof value === "string"
  ) {
    return new Uint8Array(
      Buffer.from(
        value,
        "utf8",
      ),
    );
  }

  if (
    value instanceof Uint8Array
  ) {
    return new Uint8Array(
      value,
    );
  }

  if (
    value instanceof ArrayBuffer
  ) {
    return new Uint8Array(
      value.slice(0),
    );
  }

  throw new TypeError(
    "Value must be a string, Uint8Array, or ArrayBuffer.",
  );
}

/**
 * Creates a defensive copy of byte material.
 */
export function cloneBytes(
  value: Uint8Array,
): Uint8Array {
  return new Uint8Array(
    value,
  );
}

/**
 * Concatenates multiple byte arrays.
 */
export function concatBytes(
  ...values: readonly Uint8Array[]
): Uint8Array {
  let totalLength = 0;

  for (
    const value of values
  ) {
    totalLength +=
      value.byteLength;
  }

  const result =
    new Uint8Array(
      totalLength,
    );

  let offset = 0;

  for (
    const value of values
  ) {
    result.set(
      value,
      offset,
    );

    offset +=
      value.byteLength;
  }

  return result;
}

/**
 * Returns a slice of bytes as a defensive copy.
 */
export function sliceBytes(
  value: Uint8Array,
  start?: number,
  end?: number,
): Uint8Array {
  return new Uint8Array(
    value.slice(
      start,
      end,
    ),
  );
}

/**
 * Clears sensitive byte material from memory where possible.
 */
export function wipe(
  value: Uint8Array,
): void {
  value.fill(0);
}
