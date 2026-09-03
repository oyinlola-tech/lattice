/**
 * @zudolib/schema/composition/lazy
 *
 * Lazy schema for recursive and self-referencing data structures.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";

/**
 * Schema that defers creation of the inner schema until parse time.
 * Essential for recursive data structures like trees and nested comments.
 */
export class LazySchema<TOutput, TInput = TOutput> extends Schema<
  TOutput,
  TInput
> {
  public readonly _type = "lazy";
  private readonly _factory: () => Schema<TOutput, TInput>;
  private _inner: Schema<TOutput, TInput> | undefined;

  constructor(factory: () => Schema<TOutput, TInput>) {
    super();
    this._factory = factory;
  }

  private _resolve(): Schema<TOutput, TInput> {
    if (!this._inner) {
      this._inner = this._factory();
    }
    return this._inner;
  }

  public _parse(ctx: SchemaParseContext, input: TInput): TOutput {
    return this._resolve()._parse(ctx, input);
  }
}

/** Creates a lazy schema from a factory function. */
export function lazySchema<TOutput, TInput = TOutput>(
  factory: () => Schema<TOutput, TInput>,
): LazySchema<TOutput, TInput> {
  return new LazySchema(factory);
}
