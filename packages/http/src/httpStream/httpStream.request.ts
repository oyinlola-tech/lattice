/**
 * @oyinlola141/lattice-http/httpStream — Request/response stream accessors.
 */

import {
  Readable,
  Writable,
} from "node:stream";

import type {
  IncomingMessage,
  ServerResponse,
} from "node:http";

export function getRequestStream(
  request: IncomingMessage,
): Readable {
  return request;
}

export function getResponseStream(
  response: ServerResponse,
): Writable {
  return response;
}
