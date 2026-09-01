/**
 * @oyinlola141/lattice-http/httpStream — Buffer conversion, chunk size, and readable creation helpers.
 */

import {
  Readable,
} from "node:stream";

export function toBuffer(
  chunk: unknown,
): Buffer {
  if (
    Buffer.isBuffer(
      chunk,
    )
  ) {
    return chunk;
  }

  if (
    chunk instanceof Uint8Array
  ) {
    return Buffer.from(
      chunk,
    );
  }

  if (
    typeof chunk ===
    "string"
  ) {
    return Buffer.from(
      chunk,
      "utf8",
    );
  }

  if (
    chunk ===
    null ||
    chunk ===
    undefined
  ) {
    return Buffer.alloc(
      0,
    );
  }

  return Buffer.from(
    String(
      chunk,
    ),
    "utf8",
  );
}

export function getChunkSize(
  chunk: unknown,
): number {
  if (
    Buffer.isBuffer(
      chunk,
    )
  ) {
    return chunk.length;
  }

  if (
    chunk instanceof Uint8Array
  ) {
    return chunk.byteLength;
  }

  if (
    typeof chunk ===
    "string"
  ) {
    return Buffer.byteLength(
      chunk,
      "utf8",
    );
  }

  return Buffer.byteLength(
    String(
      chunk,
    ),
    "utf8",
  );
}

export function toReadableStream(
  data:
    | Buffer
    | Uint8Array
    | string,
): Readable {
  return Readable.from(
    [data],
  );
}
