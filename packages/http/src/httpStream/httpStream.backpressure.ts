/**
 * @zudo/http/httpStream — Backpressure-aware write and drain helpers.
 */

import { Writable } from "node:stream";

import { StreamError, normalizeStreamError } from "./httpStream.error.js";

export async function writeToStream(
  stream: NodeJS.WritableStream,
  chunk: Buffer | Uint8Array | string,
): Promise<void> {
  const writable = stream as Writable;

  if (writable.destroyed) {
    throw new StreamError("Cannot write to a destroyed stream.", {
      code: "STREAM_DESTROYED",
    });
  }

  const accepted = writable.write(chunk);

  if (accepted) {
    return;
  }

  await waitForDrain(writable);
}

export async function waitForDrain(
  stream: NodeJS.WritableStream,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const writable = stream as Writable;

    const onDrain = () => {
      cleanup();

      resolve();
    };

    const onError = (error: unknown) => {
      cleanup();

      reject(normalizeStreamError(error));
    };

    const cleanup = () => {
      writable.removeListener("drain", onDrain);

      writable.removeListener("error", onError);
    };

    writable.once("drain", onDrain);

    writable.once("error", onError);
  });
}
