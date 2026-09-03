/**
 * @zudo/schema/structures/map-set
 *
 * Map and Set schemas.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue } from "../schemaBase/index.js";
import { SchemaIssueCode } from "@zudo/constants";

/**
 * Schema for Map objects.
 */
export class MapSchema<TKey, TValue> extends Schema<Map<TKey, TValue>> {
  public readonly _type = "map";

  constructor(
    private readonly _keySchema: Schema<TKey>,
    private readonly _valueSchema: Schema<TValue>,
  ) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): Map<TKey, TValue> {
    if (!(input instanceof Map)) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_TYPE,
        path: [...ctx.path],
        message: `Expected Map, received ${typeof input}`,
        expected: "Map",
        received: typeof input,
      });
      throw new Error("Validation failed");
    }

    const result = new Map<TKey, TValue>();
    for (const [key, value] of input) {
      const k = this._keySchema._parse(ctx, key);
      const v = this._valueSchema._parse(ctx, value);
      result.set(k, v);
    }

    return result;
  }
}

/**
 * Schema for Set objects.
 */
export class SetSchema<TValue> extends Schema<Set<TValue>> {
  public readonly _type = "set";

  constructor(private readonly _valueSchema: Schema<TValue>) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): Set<TValue> {
    if (!(input instanceof Set)) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_TYPE,
        path: [...ctx.path],
        message: `Expected Set, received ${typeof input}`,
        expected: "Set",
        received: typeof input,
      });
      throw new Error("Validation failed");
    }

    const result = new Set<TValue>();
    for (const value of input) {
      result.add(this._valueSchema._parse(ctx, value));
    }

    return result;
  }
}

/** Creates a map schema from key and value schemas. */
export function mapSchema<TKey, TValue>(
  keySchema: Schema<TKey>,
  valueSchema: Schema<TValue>,
): MapSchema<TKey, TValue> {
  return new MapSchema(keySchema, valueSchema);
}

/** Creates a set schema from a value schema. */
export function setSchema<TValue>(
  valueSchema: Schema<TValue>,
): SetSchema<TValue> {
  return new SetSchema(valueSchema);
}
