/**
 * @zudo/storage — JSON Serializer
 *
 * Serializes/deserializes data for storage with support for BigInt, Date,
 * Map, Set, and Uint8Array via @zudo/serialization's type preservation.
 */

import type { Serializer, SerializationFormat } from "../types/storage.type.js";
import { JSONSerializer } from "@zudo/serialization";

/**
 * JSON serializer with extended type support for storage operations.
 *
 * Delegates to @zudo/serialization's JSONSerializer for type preservation
 * (BigInt, Date, Map, Set, Uint8Array) and wraps the output as Uint8Array
 * to satisfy the storage Serializer contract.
 */
export class JsonSerializer implements Serializer {
  private readonly inner: JSONSerializer;

  constructor() {
    this.inner = new JSONSerializer();
  }

  serialize<T>(value: T, _format?: SerializationFormat): Uint8Array {
    const json = this.inner.serialize(value, { preserveTypes: true });
    return new TextEncoder().encode(json);
  }

  deserialize<T>(data: Uint8Array, _format?: SerializationFormat): T {
    const json = new TextDecoder().decode(data);
    return this.inner.deserialize<T>(json, { preserveTypes: true });
  }
}
