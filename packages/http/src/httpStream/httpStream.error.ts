/**
 * @zudoliblib/http/httpStream — Stream error helpers.
 */

import { HttpStreamError as StreamError } from "@zudoliblib/errors";

export { StreamError };

export function createAbortError(): StreamError {
  return new StreamError("Stream operation was aborted.", {
    code: "STREAM_ABORTED",
  });
}

export function normalizeStreamError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new StreamError(String(error));
}
