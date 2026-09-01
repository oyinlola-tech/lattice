/**
 * @oyinlola141/lattice-http/httpStream — Create PassThrough and Readable stream instances.
 */

import { Readable, PassThrough } from "node:stream";

import type { HTTPStreamOptions } from "./httpStream.types.js";

import { DEFAULT_STREAM_HIGH_WATER_MARK } from "./httpStream.constants.js";

export function createPassThrough(
  options: HTTPStreamOptions = {},
): PassThrough {
  return new PassThrough({
    highWaterMark: options.highWaterMark ?? DEFAULT_STREAM_HIGH_WATER_MARK,
  });
}

export function createReadableStream(
  data: Iterable<unknown> | AsyncIterable<unknown>,
  options: HTTPStreamOptions = {},
): Readable {
  return Readable.from(data, {
    highWaterMark: options.highWaterMark ?? DEFAULT_STREAM_HIGH_WATER_MARK,
    signal: options.signal,
  });
}
