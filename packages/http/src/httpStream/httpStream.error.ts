/**
 * @oyinlola141/lattice-http/httpStream — Stream error helpers.
 */

import { HttpStreamError as StreamError } from "@oyinlola141/lattice-errors";

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
