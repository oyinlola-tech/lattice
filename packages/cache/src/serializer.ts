/**
 * @zudolib/cache — Serializer
 *
 * Provides serializer implementations for converting cache values
 * to and from storable representations. Delegates to @zudolib/serialization
 * for the actual JSON serialization with type preservation.
 */

import type { CacheSerializer } from "./types.js";
import { JSONSerializer } from "@zudolib/serialization";

/* -------------------------------------------------------------------------- */
/* JSON Serializer                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Serializes values to JSON strings and deserializes them back.
 *
 * Uses @zudolib/serialization's JSONSerializer for type preservation
 * (Date, BigInt, Map, Set, Uint8Array) when configured.
 */
export class JsonCacheSerializer implements CacheSerializer<unknown, string> {
  private readonly inner: JSONSerializer;
  private readonly preserveTypes: boolean;

  constructor(options?: { readonly preserveTypes?: boolean }) {
    this.preserveTypes = options?.preserveTypes ?? false;
    this.inner = new JSONSerializer();
  }

  serialize(value: unknown): string {
    return this.inner.serialize(value, {
      preserveTypes: this.preserveTypes,
    });
  }

  deserialize(value: string): unknown {
    return this.inner.deserialize(value, {
      preserveTypes: this.preserveTypes,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Raw Serializer                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Pass-through serializer for values that are already in
 * their storable form (e.g., strings, numbers).
 */
export class RawCacheSerializer implements CacheSerializer<unknown, unknown> {
  serialize(value: unknown): unknown {
    return value;
  }

  deserialize(value: unknown): unknown {
    return value;
  }
}

/* -------------------------------------------------------------------------- */
/* Default Singleton                                                          */
/* -------------------------------------------------------------------------- */

/** Default JSON serializer instance. */
export const defaultSerializer = new JsonCacheSerializer();

/** Default raw (pass-through) serializer instance. */
export const rawSerializer = new RawCacheSerializer();

/**
 * Returns the appropriate serializer for the given value type.
 *
 * - Objects, arrays, dates → JSON serializer
 * - Strings, numbers, booleans, null → raw serializer
 */
export function getSerializer(
  value: unknown,
): CacheSerializer<unknown, unknown> {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return rawSerializer;
  }

  return defaultSerializer;
}
