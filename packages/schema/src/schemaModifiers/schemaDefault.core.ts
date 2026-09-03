/**
 * @zudo/schema/modifiers/default
 *
 * Default value schema — applies a default when input is undefined.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";

/**
 * Schema that applies a default value when the input is undefined.
 */
export class DefaultSchema<TOutput> extends Schema<TOutput> {
  public readonly _type = "default";

  constructor(
    private readonly _inner: Schema<TOutput>,
    private readonly _defaultValue: TOutput | (() => TOutput),
  ) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): TOutput {
    if (input === undefined) {
      const defaultVal =
        typeof this._defaultValue === "function"
          ? (this._defaultValue as () => TOutput)()
          : this._defaultValue;
      return this._inner._parse(ctx, defaultVal);
    }
    return this._inner._parse(ctx, input);
  }
}

/** Applies a default value when input is undefined. */
export function defaultSchema<T>(
  schema: Schema<T>,
  defaultValue: T | (() => T),
): DefaultSchema<T> {
  return new DefaultSchema(schema, defaultValue);
}
