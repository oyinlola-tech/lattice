/**
 * Lattice HTTP route result body serialization helpers.
 */

import type { RouteResultBody } from "./httpRoute.result.type.js";

import { isReadableStream } from "./httpRoute.result.util.js";

/* -------------------------------------------------------------------------- */
/* Body Serialization                                                         */
/* -------------------------------------------------------------------------- */

export function serializeBody(
  body: RouteResultBody,
  contentType?: string,
): BodyInit | null {
  if (body === null || body === undefined) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  if (body instanceof Uint8Array) {
    return body as unknown as BodyInit;
  }

  if (body instanceof ArrayBuffer) {
    return body;
  }

  if (isReadableStream(body)) {
    return body;
  }

  if (isJsonContentType(contentType)) {
    return JSON.stringify(body);
  }

  return JSON.stringify(body);
}

function isJsonContentType(contentType?: string): boolean {
  if (!contentType) {
    return false;
  }

  return (
    contentType.toLowerCase().includes("application/json") ||
    contentType.toLowerCase().includes("+json")
  );
}

/* -------------------------------------------------------------------------- */
/* Value Helpers                                                              */
/* -------------------------------------------------------------------------- */

export function valueToJsonObject(
  value: number | boolean | bigint,
): Record<string, unknown> {
  return {
    value: typeof value === "bigint" ? value.toString() : value,
  };
}

export function isJsonSerializable(value: unknown): boolean {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "bigint") {
    return false;
  }

  if (
    value instanceof Uint8Array ||
    value instanceof ArrayBuffer ||
    isReadableStream(value)
  ) {
    return false;
  }

  return true;
}
