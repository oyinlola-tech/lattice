/**
 * @oyinlola141/lattice-http/httpStream — Read stream into Buffer or string.
 */

import type {
  HTTPStreamOptions,
} from "./httpStream.types.js";

import {
  consumeStream,
} from "./httpStream.consume.js";

import {
  toBuffer,
} from "./httpStream.helper.js";

export async function readStream(
  stream: NodeJS.ReadableStream,
  options:
    HTTPStreamOptions = {},
): Promise<Buffer> {
  const chunks: Buffer[] =
    [];

  let total = 0;

  await consumeStream(
    stream,
    (
      chunk,
    ) => {
      const buffer =
        toBuffer(
          chunk,
        );

      chunks.push(
        buffer,
      );

      total +=
        buffer.length;
    },
    options,
  );

  return Buffer.concat(
    chunks,
    total,
  );
}

export async function readStreamAsString(
  stream: NodeJS.ReadableStream,
  encoding:
    BufferEncoding = "utf8",
  options:
    HTTPStreamOptions = {},
): Promise<string> {
  const buffer =
    await readStream(
      stream,
      options,
    );

  return buffer.toString(
    encoding,
  );
}
