/**
 * @lattice/schema/composition/union
 *
 * Union schema — validates against multiple schemas, returning the first match.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue, createParseContext } from "../schemaBase/index.js";
import { SchemaIssueCode } from "@lattice/constants";

/** Helper type to infer union output from schema array. */
type UnionOutput<TSchemas extends readonly Schema<unknown>[]> =
  TSchemas[number] extends Schema<infer U> ? U : never;

/**
 * Schema that accepts values matching any of the provided schemas.
 */
export class UnionSchema<TSchemas extends readonly Schema<unknown>[]> extends Schema<
  UnionOutput<TSchemas>
> {
  public readonly _type = "union";

  constructor(private readonly _schemas: TSchemas) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): UnionOutput<TSchemas> {
    for (const schema of this._schemas) {
      const childCtx = createParseContext({
        maxDepth: ctx.options.maxDepth,
        path: [...ctx.path],
      });
      try {
        const result = schema._parse(childCtx, input);
        if (childCtx.issues.length === 0) {
          return result as UnionOutput<TSchemas>;
        }
      } catch {
        // Continue to next schema
      }
    }

    addIssue(ctx, {
      code: SchemaIssueCode.INVALID_UNION,
      path: [...ctx.path],
      message: `Invalid union: no matching schema found`,
    });
    throw new Error("Validation failed");
  }
}

/**
 * Discriminated union schema — uses a discriminator key to select the right schema.
 */
export class DiscriminatedUnionSchema<
  K extends string,
  TSchemas extends readonly Schema<Record<string, unknown>>[],
> extends Schema<UnionOutput<TSchemas>> {
  public readonly _type = "discriminatedUnion";
  private readonly _schemaMap: Map<string, Schema<unknown>>;

  constructor(
    private readonly _discriminator: K,
    schemas: TSchemas,
  ) {
    super();
    this._schemaMap = new Map();
    for (const schema of schemas) {
      this._schemaMap.set(String(schema._type), schema);
    }
  }

  public _parse(ctx: SchemaParseContext, input: unknown): UnionOutput<TSchemas> {
    if (typeof input !== "object" || input === null) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_TYPE,
        path: [...ctx.path],
        message: `Expected object for discriminated union, received ${typeof input}`,
        expected: "object",
        received: typeof input,
      });
      throw new Error("Validation failed");
    }

    const obj = input as Record<string, unknown>;
    const discriminatorValue = String(obj[this._discriminator]);

    const schema = this._schemaMap.get(discriminatorValue);
    if (schema) {
      return schema._parse(ctx, input) as UnionOutput<TSchemas>;
    }

    addIssue(ctx, {
      code: SchemaIssueCode.INVALID_UNION,
      path: [...ctx.path],
      message: `No matching variant for discriminator "${this._discriminator}" = "${discriminatorValue}"`,
      expected: `one of [${[...this._schemaMap.keys()].join(", ")}]`,
      received: discriminatorValue,
    });
    throw new Error("Validation failed");
  }
}

/** Creates a union schema. */
export function unionSchema<T extends readonly Schema<unknown>[]>(
  schemas: T,
): UnionSchema<T> {
  return new UnionSchema(schemas);
}
