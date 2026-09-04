/**
 * @zudojs/schema/modifiers/refine
 *
 * Refine schema — adds custom synchronous validation logic.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue } from "../schemaBase/index.js";
import { SchemaIssueCode } from "@zudojs/constants";

/**
 * Schema that adds a custom refinement check to another schema.
 */
export class RefineSchema<T> extends Schema<T> {
  public readonly _type = "refine";

  constructor(
    private readonly _inner: Schema<T>,
    private readonly _check: (value: T) => boolean,
    private readonly _message: string,
  ) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): T {
    const value = this._inner._parse(ctx, input);

    if (!this._check(value)) {
      addIssue(ctx, {
        code: SchemaIssueCode.CUSTOM,
        path: [...ctx.path],
        message: this._message,
      });
      throw new Error("Validation failed");
    }

    return value;
  }
}

/** Adds a custom refinement check to a schema. */
export function refineSchema<T>(
  schema: Schema<T>,
  check: (value: T) => boolean,
  message: string,
): RefineSchema<T> {
  return new RefineSchema(schema, check, message);
}
