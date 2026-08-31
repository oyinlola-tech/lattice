/**
 * @lattice/serialization — JSON serializer.
 *
 * Provides both a fast path (native JSON.stringify/parse) and an
 * advanced path with type preservation via transformer registry.
 *
 * Fast path: nearly zero overhead over native JSON.
 * Advanced path: recursive traversal with type detection and tagged representations.
 */

import type {
  Serializer,
  SerializeOptions,
  DeserializeOptions,
} from "../serializerTypes/index.js";
import { TransformerRegistry } from "../serializerTransforms/index.js";
import {
  DateTransformer,
  BigIntTransformer,
  MapTransformer,
  SetTransformer,
} from "../serializerTransforms/index.js";
import {
  BufferTransformer,
  ErrorTransformer,
} from "../serializerTransformsExt/index.js";
import { SerializationLimits, SerializationTags } from "@lattice/constants";
import { isPlainObject } from "@lattice/types";
import {
  assertNoCircularReference,
  assertDepthWithinLimit,
  assertSizeWithinLimit,
} from "@lattice/validation";

/** Default transformer registry with all built-in transformers. */
function createDefaultTransformers(): TransformerRegistry {
  const registry = new TransformerRegistry();
  registry.register(DateTransformer);
  registry.register(BigIntTransformer);
  registry.register(MapTransformer);
  registry.register(SetTransformer);
  registry.register(BufferTransformer);
  registry.register(ErrorTransformer);
  return registry;
}

/**
 * JSON serializer with optional type preservation.
 *
 * Fast path (default): delegates to native JSON.stringify/parse.
 * Advanced path (preserveTypes: true): recursive traversal with
 * transformer-based type preservation.
 */
export class JSONSerializer implements Serializer<unknown, string> {
  public readonly name = "json";
  public readonly contentType = "application/json";

  private readonly transformers: TransformerRegistry;

  constructor(options?: { readonly transformers?: TransformerRegistry }) {
    this.transformers = options?.transformers ?? createDefaultTransformers();
  }

  /** Register a custom type transformer. */
  registerTransformer(transformer: import("../serializerTypes/index.js").TypeTransformer): void {
    this.transformers.register(transformer);
  }

  serialize(value: unknown, options?: SerializeOptions): string {
    const maxDepth = options?.maxDepth ?? SerializationLimits.MAX_DEPTH;
    const maxSize = options?.maxSize ?? SerializationLimits.MAX_SIZE;

    if (options?.preserveTypes === true) {
      assertNoCircularReference(value);
      assertDepthWithinLimit(value, maxDepth);
      const transformed = this.transformValue(value, 0, maxDepth);
      const json = options?.pretty
        ? JSON.stringify(transformed, null, options?.indent ?? 2)
        : JSON.stringify(transformed);
      this.assertOutputSize(json, maxSize);
      return json;
    }

    const json = options?.pretty
      ? JSON.stringify(value, null, options?.indent ?? 2)
      : JSON.stringify(value);
    this.assertOutputSize(json, maxSize);
    return json;
  }

  deserialize<T = unknown>(value: string, options?: DeserializeOptions): T {
    if (options?.strict === true) {
      this.assertValidJson(value);
    }

    const parsed: unknown = JSON.parse(value);

    if (options?.preserveTypes === true) {
      const maxDepth = options?.maxDepth ?? SerializationLimits.MAX_DEPTH;
      assertDepthWithinLimit(parsed, maxDepth);
      return this.restoreValue(parsed, 0, maxDepth) as T;
    }

    return parsed as T;
  }

  /** Transform a value recursively, applying type transformers. */
  private transformValue(
    value: unknown,
    depth: number,
    maxDepth: number,
  ): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value === "bigint") {
      const transformer = this.transformers.findForValue(value);
      return transformer ? transformer.serialize(value) : value.toString();
    }

    if (typeof value !== "object") return value;

    if (depth >= maxDepth) return value;

    if (Array.isArray(value)) {
      return value.map((item) => this.transformValue(item, depth + 1, maxDepth));
    }

    const transformer = this.transformers.findForValue(value);
    if (transformer) {
      const raw = transformer.serialize(value);
      return this.transformValue(raw, depth + 1, maxDepth);
    }

    if (value instanceof Map) {
      const entries: Array<[unknown, unknown]> = [];
      for (const [k, v] of value) {
        entries.push([
          this.transformValue(k, depth + 1, maxDepth),
          this.transformValue(v, depth + 1, maxDepth),
        ]);
      }
      return {
        [SerializationTags.TYPE]: "Map",
        [SerializationTags.VALUE]: entries,
      };
    }

    if (value instanceof Set) {
      return {
        [SerializationTags.TYPE]: "Set",
        [SerializationTags.VALUE]: [...value].map((v) =>
          this.transformValue(v, depth + 1, maxDepth),
        ),
      };
    }

    if (isPlainObject(value)) {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        result[key] = this.transformValue(
          (value as Record<string, unknown>)[key],
          depth + 1,
          maxDepth,
        );
      }
      return result;
    }

    return value;
  }

  /** Restore a value recursively, applying type transformers. */
  private restoreValue(
    value: unknown,
    depth: number,
    maxDepth: number,
  ): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value !== "object") return value;

    if (depth >= maxDepth) return value;

    if (Array.isArray(value)) {
      return value.map((item) => this.restoreValue(item, depth + 1, maxDepth));
    }

    const obj = value as Record<string, unknown>;
    const typeTag = obj[SerializationTags.TYPE];

    if (typeof typeTag === "string") {
      const transformer = this.transformers.get(typeTag);
      return transformer.deserialize(value);
    }

    if (isPlainObject(value)) {
      const result: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        result[key] = this.restoreValue(
          (value as Record<string, unknown>)[key],
          depth + 1,
          maxDepth,
        );
      }
      return result;
    }

    return value;
  }

  /** Assert JSON string is valid. */
  private assertValidJson(value: string): void {
    try {
      JSON.parse(value);
    } catch (err) {
      throw new Error(`Invalid JSON: ${(err as Error).message}`);
    }
  }

  /** Assert serialized output is within size limits. */
  private assertOutputSize(json: string, maxSize: number): void {
    const size = typeof Buffer !== "undefined"
      ? Buffer.byteLength(json, "utf-8")
      : new TextEncoder().encode(json).byteLength;
    if (size > maxSize) {
      throw new Error(`Serialized payload too large: ${size} bytes (max: ${maxSize})`);
    }
  }
}
