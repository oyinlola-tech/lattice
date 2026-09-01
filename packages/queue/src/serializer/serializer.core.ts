/**
 * @oyinlola141/lattice-queue — Serializer
 *
 * Job payload serialization using @oyinlola141/lattice-serialization's JSONSerializer.
 */

import type { Serializer } from "./serializer.type.js";
import { JSONSerializer } from "@oyinlola141/lattice-serialization";

/** Default JSON serializer backed by @oyinlola141/lattice-serialization. */
export const JsonSerializer: Serializer = Object.freeze({
  serialize<T>(data: T): string {
    return new JSONSerializer().serialize(data);
  },

  deserialize<T>(data: string): T {
    return new JSONSerializer().deserialize<T>(data);
  },
});

/**
 * Creates a serializer with custom options.
 */
export function createJsonSerializer(
  options?: {
    replacer?: (key: string, value: unknown) => unknown;
    space?: number;
    preserveTypes?: boolean;
  },
): Serializer {
  const inner = new JSONSerializer();
  return Object.freeze({
    serialize<T>(data: T): string {
      return inner.serialize(data, {
        pretty: options?.space !== undefined,
        preserveTypes: options?.preserveTypes,
        indent: options?.space,
      });
    },

    deserialize<T>(data: string): T {
      return inner.deserialize<T>(data, {
        preserveTypes: options?.preserveTypes,
      });
    },
  });
}

/** No-op serializer that passes data through unchanged. */
export const PassthroughSerializer: Serializer = Object.freeze({
  serialize<T>(data: T): string {
    if (typeof data === "string") {
      return data;
    }
    return new JSONSerializer().serialize(data);
  },

  deserialize<T>(data: string): T {
    try {
      return new JSONSerializer().deserialize<T>(data);
    } catch {
      return data as T;
    }
  },
});
