/**
 * @zudojs/schema/modifiers/optional-nullable
 *
 * Optional and nullable schema wrappers.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";

/**
 * Marks a schema as optional (accepts undefined).
 */
export class OptionalModifierSchema<T> extends Schema<T | undefined> {
  public readonly _type = "optional";

  constructor(private readonly _inner: Schema<T>) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): T | undefined {
    if (input === undefined) return undefined;
    return this._inner._parse(ctx, input);
  }
}

/**
 * Marks a schema as nullable (accepts null).
 */
export class NullableModifierSchema<T> extends Schema<T | null> {
  public readonly _type = "nullable";

  constructor(private readonly _inner: Schema<T>) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): T | null {
    if (input === null) return null;
    return this._inner._parse(ctx, input);
  }
}

/** Makes a schema optional. */
export function optionalSchema<T>(
  schema: Schema<T>,
): OptionalModifierSchema<T> {
  return new OptionalModifierSchema(schema);
}

/** Makes a schema nullable. */
export function nullableSchema<T>(
  schema: Schema<T>,
): NullableModifierSchema<T> {
  return new NullableModifierSchema(schema);
}
