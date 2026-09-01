/**
 * @oyinlola141/lattice-schema/coerce
 *
 * Explicit coercion schemas — convert string/number inputs to the expected type.
 * Useful for HTTP query parameters and form data.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue } from "../schemaBase/index.js";
import { SchemaIssueCode } from "@oyinlola141/lattice-constants";

/**
 * Coerces input to a number before validating.
 */
export class CoerceNumberSchema extends Schema<number> {
  public readonly _type = "coerce.number";

  public _parse(ctx: SchemaParseContext, input: unknown): number {
    if (typeof input === "number" && !Number.isNaN(input)) {
      return input;
    }

    if (typeof input === "string") {
      const num = Number(input);
      if (!Number.isNaN(num)) {
        return num;
      }
    }

    addIssue(ctx, {
      code: SchemaIssueCode.COERCION_FAILED,
      path: [...ctx.path],
      message: `Cannot coerce ${typeof input} to number`,
      expected: "number",
      received: typeof input,
    });
    throw new Error("Validation failed");
  }
}

/**
 * Coerces input to a boolean before validating.
 *
 * Truthy: `"true"`, `"1"`, `1`, `true`
 * Falsy: `"false"`, `"0"`, `0`, `false`
 */
export class CoerceBooleanSchema extends Schema<boolean> {
  public readonly _type = "coerce.boolean";

  public _parse(ctx: SchemaParseContext, input: unknown): boolean {
    if (typeof input === "boolean") return input;

    if (input === "true" || input === 1 || input === true) return true;
    if (input === "false" || input === 0 || input === false) return false;

    addIssue(ctx, {
      code: SchemaIssueCode.COERCION_FAILED,
      path: [...ctx.path],
      message: `Cannot coerce ${typeof input} to boolean`,
      expected: "boolean",
      received: typeof input,
    });
    throw new Error("Validation failed");
  }
}

/**
 * Coerces input to a string before validating.
 */
export class CoerceStringSchema extends Schema<string> {
  public readonly _type = "coerce.string";

  public _parse(ctx: SchemaParseContext, input: unknown): string {
    if (typeof input === "string") return input;

    if (input !== null && input !== undefined) {
      return String(input);
    }

    addIssue(ctx, {
      code: SchemaIssueCode.COERCION_FAILED,
      path: [...ctx.path],
      message: `Cannot coerce ${typeof input} to string`,
      expected: "string",
      received: typeof input,
    });
    throw new Error("Validation failed");
  }
}

/**
 * Coerces input to a BigInt before validating.
 */
export class CoerceBigIntSchema extends Schema<bigint> {
  public readonly _type = "coerce.bigint";

  public _parse(ctx: SchemaParseContext, input: unknown): bigint {
    if (typeof input === "bigint") return input;

    if (typeof input === "number" && Number.isInteger(input)) {
      return BigInt(input);
    }

    if (typeof input === "string") {
      try {
        return BigInt(input);
      } catch {
        // Fall through
      }
    }

    addIssue(ctx, {
      code: SchemaIssueCode.COERCION_FAILED,
      path: [...ctx.path],
      message: `Cannot coerce ${typeof input} to bigint`,
      expected: "bigint",
      received: typeof input,
    });
    throw new Error("Validation failed");
  }
}

/** Creates a coercion number schema. */
export function coerceNumberSchema(): CoerceNumberSchema {
  return new CoerceNumberSchema();
}

/** Creates a coercion boolean schema. */
export function coerceBooleanSchema(): CoerceBooleanSchema {
  return new CoerceBooleanSchema();
}

/** Creates a coercion string schema. */
export function coerceStringSchema(): CoerceStringSchema {
  return new CoerceStringSchema();
}

/** Creates a coercion bigint schema. */
export function coerceBigIntSchema(): CoerceBigIntSchema {
  return new CoerceBigIntSchema();
}
