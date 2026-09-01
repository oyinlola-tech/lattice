/**
 * @oyinlola141/lattice-schema/structures/object
 *
 * Object schema with shape validation, unknown key handling, and composition methods.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue, childContext } from "../schemaBase/index.js";
import { SchemaIssueCode, SCHEMA_FORBIDDEN_KEYS } from "@oyinlola141/lattice-constants";

/** Shape type — record of property names to schemas. */
export type SchemaShape = Record<string, Schema<unknown>>;

/** Unknown keys handling strategy. */
type UnknownKeyStrategy = "strip" | "strict" | "passthrough";

/** Configuration for object schema. */
interface ObjectSchemaConfig {
  readonly shape: SchemaShape;
  readonly unknownKeys?: UnknownKeyStrategy;
  readonly requiredKeys?: ReadonlySet<string>;
}

/**
 * Schema for object values with a defined shape.
 */
export class ObjectSchema<TOutput extends Record<string, unknown>> extends Schema<TOutput> {
  public readonly _type = "object";
  private readonly _config: ObjectSchemaConfig;
  private readonly _keys: readonly string[];
  private readonly _keySet: ReadonlySet<string>;

  constructor(config: ObjectSchemaConfig) {
    super();
    this._config = config;
    this._keys = Object.keys(config.shape);
    this._keySet = new Set(this._keys);
  }

  public _parse(ctx: SchemaParseContext, input: unknown): TOutput {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_TYPE,
        path: [...ctx.path],
        message: `Expected object, received ${Array.isArray(input) ? "array" : typeof input}`,
        expected: "object",
        received: Array.isArray(input) ? "array" : typeof input,
      });
      throw new Error("Validation failed");
    }

    const obj = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    // Check for prototype pollution keys
    for (const key of Object.keys(obj)) {
      if (SCHEMA_FORBIDDEN_KEYS.has(key)) {
        addIssue(ctx, {
          code: SchemaIssueCode.INVALID_KEY,
          path: [...ctx.path],
          message: `Forbidden key: ${key}`,
        });
        throw new Error("Validation failed");
      }
    }

    // Validate known properties
    for (const key of this._keys) {
      const childCtx = childContext(ctx, key);
      const schema = this._config.shape[key];
      if (!schema) continue;
      const value = obj[key];

      if (value === undefined) {
        if (this._config.requiredKeys?.has(key) || !this._isOptional(schema)) {
          addIssue(ctx, {
            code: SchemaIssueCode.REQUIRED,
            path: [...childCtx.path],
            message: `Required field missing: ${key}`,
          });
          if (ctx.options.abortEarly) break;
          continue;
        }
        result[key] = undefined as TOutput[typeof key];
        continue;
      }

      try {
        result[key] = schema._parse(childCtx, value) as TOutput[typeof key];
      } catch {
        if (ctx.options.abortEarly) break;
      }
    }

    // Handle unknown keys
    if (this._config.unknownKeys !== "passthrough") {
      const extraKeys = Object.keys(obj).filter((k) => !this._keySet.has(k));
      if (extraKeys.length > 0 && this._config.unknownKeys === "strict") {
        for (const key of extraKeys) {
          addIssue(ctx, {
            code: SchemaIssueCode.UNKNOWN_KEYS,
            path: [...ctx.path],
            message: `Unknown key: ${key}`,
            details: { key },
          });
        }
        throw new Error("Validation failed");
      }
    }

    return result as TOutput;
  }

  private _isOptional(schema: Schema<unknown>): boolean {
    return schema._type === "optional";
  }

  // --- Composition methods ---

  /** Creates a new schema with only the specified keys. */
  public pick<K extends keyof TOutput>(keys: readonly K[]): ObjectSchema<Pick<TOutput, K>> {
    const newShape: Record<string, Schema<unknown>> = {};
    for (const key of keys) {
      const k = key as string;
      if (this._config.shape[k]) {
        newShape[k] = this._config.shape[k];
      }
    }
    return new ObjectSchema({ shape: newShape as SchemaShape, unknownKeys: "strip" });
  }

  /** Creates a new schema without the specified keys. */
  public omit<K extends keyof TOutput>(keys: readonly K[]): ObjectSchema<Omit<TOutput, K>> {
    const newShape: Record<string, Schema<unknown>> = {};
    for (const key of this._keys) {
      if (!(keys as readonly string[]).includes(key) && this._config.shape[key]) {
        newShape[key] = this._config.shape[key]!;
      }
    }
    return new ObjectSchema({ shape: newShape as SchemaShape, unknownKeys: "strip" });
  }

  /** Makes all properties optional. */
  public partial(): ObjectSchema<{ [K in keyof TOutput]?: TOutput[K] }> {
    const newShape: Record<string, Schema<unknown>> = {};
    for (const key of this._keys) {
      const schema = this._config.shape[key];
      if (schema) {
        newShape[key] = schema._type === "optional" ? schema : new OptionalSchema(schema);
      }
    }
    return new ObjectSchema({ shape: newShape as SchemaShape, unknownKeys: this._config.unknownKeys });
  }

  /** Makes all properties required. */
  public required(): ObjectSchema<{ [K in keyof TOutput]-?: TOutput[K] }> {
    const newShape: Record<string, Schema<unknown>> = {};
    for (const key of this._keys) {
      const schema = this._config.shape[key];
      if (!schema) continue;
      newShape[key] = schema._type === "optional"
        ? (schema as unknown as OptionalSchema<unknown>)._inner
        : schema;
    }
    return new ObjectSchema({ shape: newShape as SchemaShape, unknownKeys: this._config.unknownKeys });
  }

  /** Merges another object schema's shape into this one. */
  public extend<TEnd extends Record<string, unknown>>(
    other: ObjectSchema<TEnd>,
  ): ObjectSchema<TOutput & TEnd> {
    const newShape = { ...this._config.shape, ...other._config.shape };
    return new ObjectSchema({ shape: newShape, unknownKeys: this._config.unknownKeys });
  }

  /** Merges two object schemas (last wins on conflicts). */
  public merge<TEnd extends Record<string, unknown>>(
    other: ObjectSchema<TEnd>,
  ): ObjectSchema<TOutput & TEnd> {
    return this.extend(other);
  }

  /** Sets unknown keys strategy to strip. */
  public strip(): ObjectSchema<TOutput> {
    return new ObjectSchema({ ...this._config, unknownKeys: "strip" });
  }

  /** Sets unknown keys strategy to strict (reject unknown). */
  public strict(): ObjectSchema<TOutput> {
    return new ObjectSchema({ ...this._config, unknownKeys: "strict" });
  }

  /** Sets unknown keys strategy to passthrough. */
  public passthrough(): ObjectSchema<TOutput> {
    return new ObjectSchema({ ...this._config, unknownKeys: "passthrough" });
  }
}

/**
 * Wrapper schema that marks an inner schema as optional.
 */
export class OptionalSchema<T> extends Schema<T | undefined> {
  public readonly _type = "optional";

  constructor(public readonly _inner: Schema<T>) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): T | undefined {
    if (input === undefined) return undefined;
    return this._inner._parse(ctx, input);
  }
}

/** Creates an object schema from a shape. */
export function objectSchema<T extends Record<string, Schema<unknown>>>(
  shape: T,
): ObjectSchema<{
  [K in keyof T]: T[K] extends Schema<infer U> ? U : never;
}> {
  return new ObjectSchema({ shape: shape as unknown as SchemaShape });
}
