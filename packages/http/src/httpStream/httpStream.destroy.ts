/**
 * @oyinlola141/lattice-http/httpStream — Stream destruction helper.
 */

import { Readable, Writable } from "node:stream";

export function destroyStream(
  stream: NodeJS.ReadableStream | NodeJS.WritableStream,
  error?: Error,
): void {
  const candidate = stream as Readable | Writable;

  if (typeof candidate.destroy === "function" && !candidate.destroyed) {
    candidate.destroy(error);
  }
}
