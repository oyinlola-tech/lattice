/**
 * @zudojs/http/httpStream — Consume a readable stream via chunk callback.
 */

import { HttpStreamError as StreamError } from "@zudojs/errors";

import type { HTTPStreamOptions } from "./httpStream.types.js";

import { createAbortError, normalizeStreamError } from "./httpStream.error.js";

import { isReadableEnded } from "./httpStream.state.js";

import { destroyStream } from "./httpStream.destroy.js";

import {
  createSettleGuard,
  cleanupListeners,
  wireAbortSignal,
} from "./httpStream.eventHelper.js";

export async function consumeStream(
  stream: NodeJS.ReadableStream,
  onChunk: (chunk: unknown) => void,
  options: HTTPStreamOptions = {},
): Promise<void> {
  const signal = options.signal;

  if (signal?.aborted) {
    throw createAbortError();
  }

  await new Promise<void>((resolve, reject) => {
    const guard = createSettleGuard();
    let cleanupFn: () => void;

    const finish = (error?: unknown) => {
      if (guard.settled()) return;

      guard.mark();

      cleanupFn();

      if (error) {
        reject(normalizeStreamError(error));
      } else {
        resolve();
      }
    };

    const onData = (chunk: unknown) => {
      try {
        onChunk(chunk);
      } catch (error) {
        finish(error);
      }
    };

    const onEnd = () => {
      finish();
    };

    const onError = (error: unknown) => {
      finish(error);
    };

    const onClose = () => {
      if (!guard.settled() && !isReadableEnded(stream)) {
        finish(
          new StreamError("Stream closed before completion.", {
            code: "STREAM_CLOSED",
          }),
        );
      }
    };

    const onAbort = () => {
      destroyStream(stream);
      finish(createAbortError());
    };

    stream.on("data", onData);
    stream.once("end", onEnd);
    stream.once("error", onError);
    stream.once("close", onClose);

    const removeAbort = wireAbortSignal(signal, onAbort);

    cleanupFn = () => {
      cleanupListeners(stream, [
        ["data", onData],
        ["end", onEnd],
        ["error", onError],
        ["close", onClose],
      ]);

      removeAbort();
    };
  });
}
