/**
 * @lattice/schema/composition/intersection
 *
 * Intersection schema — validates against all schemas, merging results.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue } from "../schemaBase/index.js";
import { SchemaIssueCode } from "@lattice/constants";

/**
 * Schema that accepts values matching all provided schemas.
 * Results are merged left to right.
 */
export class IntersectionSchema<TLeft, TRight> extends Schema<TLeft & TRight> {
  public readonly _type = "intersection";

  constructor(
    private readonly _left: Schema<TLeft>,
    private readonly _right: Schema<TRight>,
  ) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): TLeft & TRight {
    let leftResult: TLeft;
    try {
      leftResult = this._left._parse(ctx, input);
    } catch {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_UNION,
        path: [...ctx.path],
        message: "Intersection left schema failed",
      });
      throw new Error("Validation failed");
    }

    let rightResult: TRight;
    try {
      rightResult = this._right._parse(ctx, input);
    } catch {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_UNION,
        path: [...ctx.path],
        message: "Intersection right schema failed",
      });
      throw new Error("Validation failed");
    }

    return { ...leftResult, ...rightResult } as TLeft & TRight;
  }
}

/** Creates an intersection schema from two schemas. */
export function intersectionSchema<TLeft, TRight>(
  left: Schema<TLeft>,
  right: Schema<TRight>,
): IntersectionSchema<TLeft, TRight> {
  return new IntersectionSchema(left, right);
}
