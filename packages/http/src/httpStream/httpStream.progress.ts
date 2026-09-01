/**
 * @oyinlola141/lattice-http/httpStream — Pipe streams with progress reporting.
 */

import type {
  StreamPipeOptions,
  StreamResult,
  StreamProgressHandler,
} from "./httpStream.types.js";

import {
  createAbortError,
} from "./httpStream.error.js";

import {
  destroyStream,
} from "./httpStream.destroy.js";

import {
  getChunkSize,
} from "./httpStream.helper.js";

import {
  isWritableFinished,
} from "./httpStream.state.js";

import {
  createSettleGuard,
  cleanupListeners,
  wireAbortSignal,
} from "./httpStream.eventHelper.js";

export async function pipeStreamWithProgress(
  source: NodeJS.ReadableStream,
  destination: NodeJS.WritableStream,
  onProgress: StreamProgressHandler,
  options: StreamPipeOptions = {},
): Promise<StreamResult> {
  const signal = options.signal;

  if (signal?.aborted) {
    throw createAbortError();
  }

  let bytes = 0;
  let chunks = 0;

  return new Promise<StreamResult>((resolve, reject) => {
    const guard = createSettleGuard();
    let cleanupFn: () => void;

    const fail = (error: unknown) => {
      if (guard.settled()) return;

      guard.mark();

      cleanupFn();

      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const complete = () => {
      if (guard.settled()) return;

      guard.mark();

      cleanupFn();

      resolve({ bytes });
    };

    const onData = (chunk: unknown) => {
      try {
        chunks += 1;
        bytes += getChunkSize(chunk);
        onProgress({ bytes, chunks });
      } catch (error) {
        destroyStream(source);
        destroyStream(destination);
        fail(error);
      }
    };

    const onEnd = () => {
      if (options.end === false) {
        complete();
        return;
      }

      if (!isWritableFinished(destination)) {
        destination.end();
        return;
      }

      complete();
    };

    const onFinish = () => { complete(); };

    const onError = (error: unknown) => {
      destroyStream(destination);
      fail(error);
    };

    const onDestinationError = (error: unknown) => {
      destroyStream(source);
      fail(error);
    };

    const onAbort = () => {
      destroyStream(source);
      destroyStream(destination);
      fail(createAbortError());
    };

    source.on("data", onData);
    source.once("end", onEnd);
    source.once("error", onError);

    destination.once("error", onDestinationError);
    destination.once("finish", onFinish);

    const removeAbort = wireAbortSignal(signal, onAbort);

    cleanupFn = () => {
      cleanupListeners(source, [
        ["data", onData],
        ["end", onEnd],
        ["error", onError],
      ]);

      cleanupListeners(destination, [
        ["error", onDestinationError],
        ["finish", onFinish],
      ]);

      removeAbort();
    };

    try {
      source.pipe(destination, {
        end: options.end !== false,
      });
    } catch (error) {
      fail(error);
    }
  });
}
