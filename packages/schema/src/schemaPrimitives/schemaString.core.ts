/**
 * @lattice/schema/primitives/string
 *
 * String schema with constraints, format validation, and transformations.
 */

import { Schema } from "../schemaBase/index.js";
import type { SchemaParseContext } from "../schemaBase/index.js";
import { addIssue } from "../schemaBase/index.js";
import { SchemaIssueCode, SCHEMA_STRING_FORMATS } from "@lattice/constants";
import { OptionalModifierSchema } from "../schemaModifiers/schemaOptionalNullable.core.js";
import { NullableModifierSchema } from "../schemaModifiers/schemaOptionalNullable.core.js";
import { DefaultSchema } from "../schemaModifiers/schemaDefault.core.js";
import { RefineSchema } from "../schemaModifiers/schemaRefine.core.js";

/** Configuration for string schema constraints. */
interface StringSchemaConfig {
  readonly min?: number;
  readonly max?: number;
  readonly length?: number;
  readonly pattern?: RegExp;
  readonly format?: string;
  readonly trim?: boolean;
  readonly toLowerCase?: boolean;
  readonly toUpperCase?: boolean;
}

/**
 * Schema for string values with optional constraints.
 */
export class StringSchema extends Schema<string> {
  public readonly _type = "string";
  private readonly _config: StringSchemaConfig;

  constructor(config: StringSchemaConfig = {}) {
    super();
    this._config = config;
  }

  public _parse(ctx: SchemaParseContext, input: unknown): string {
    if (typeof input !== "string") {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_TYPE,
        path: [...ctx.path],
        message: `Expected string, received ${typeof input}`,
        expected: "string",
        received: typeof input,
      });
      throw new Error("Validation failed");
    }

    let value = input;

    if (this._config.trim) {
      value = value.trim();
    }
    if (this._config.toLowerCase) {
      value = value.toLowerCase();
    }
    if (this._config.toUpperCase) {
      value = value.toUpperCase();
    }

    this._validateConstraints(ctx, value);
    return value;
  }

  private _validateConstraints(ctx: SchemaParseContext, value: string): void {
    const c = this._config;
    let failed = false;

    if (c.min !== undefined && value.length < c.min) {
      addIssue(ctx, {
        code: SchemaIssueCode.TOO_SMALL,
        path: [...ctx.path],
        message: `String must be at least ${c.min} characters`,
        expected: `>= ${c.min}`,
        received: String(value.length),
      });
      failed = true;
    }
    if (c.max !== undefined && value.length > c.max) {
      addIssue(ctx, {
        code: SchemaIssueCode.TOO_LARGE,
        path: [...ctx.path],
        message: `String must be at most ${c.max} characters`,
        expected: `<= ${c.max}`,
        received: String(value.length),
      });
      failed = true;
    }
    if (c.length !== undefined && value.length !== c.length) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_LENGTH,
        path: [...ctx.path],
        message: `String must be exactly ${c.length} characters`,
        expected: String(c.length),
        received: String(value.length),
      });
      failed = true;
    }
    if (c.pattern !== undefined && !c.pattern.test(value)) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_FORMAT,
        path: [...ctx.path],
        message: `String does not match pattern`,
        expected: c.pattern.source,
      });
      failed = true;
    }
    if (c.format !== undefined) {
      const fmtFailed = this._validateFormat(ctx, value, c.format);
      if (fmtFailed) failed = true;
    }
    if (failed) {
      throw new Error("Validation failed");
    }
  }

  private _validateFormat(ctx: SchemaParseContext, value: string, format: string): boolean {
    const formats: Record<string, RegExp> = {
      email: SCHEMA_STRING_FORMATS.EMAIL,
      url: SCHEMA_STRING_FORMATS.URL,
      uuid: SCHEMA_STRING_FORMATS.UUID,
      "uuid-v4": SCHEMA_STRING_FORMATS.UUID_V4,
      datetime: SCHEMA_STRING_FORMATS.DATETIME,
      date: SCHEMA_STRING_FORMATS.DATE,
      time: SCHEMA_STRING_FORMATS.TIME,
      ipv4: SCHEMA_STRING_FORMATS.IPV4,
      hexColor: SCHEMA_STRING_FORMATS.HEX_COLOR,
    };
    const pattern = formats[format];
    if (pattern && !pattern.test(value)) {
      addIssue(ctx, {
        code: SchemaIssueCode.INVALID_FORMAT,
        path: [...ctx.path],
        message: `Invalid ${format} format`,
        expected: format,
      });
      return true;
    }
    return false;
  }

  /** Minimum character length. */
  public min(min: number): StringSchema {
    return new StringSchema({ ...this._config, min });
  }

  /** Maximum character length. */
  public max(max: number): StringSchema {
    return new StringSchema({ ...this._config, max });
  }

  /** Exact character length. */
  public length(length: number): StringSchema {
    return new StringSchema({ ...this._config, length });
  }

  /** Matches a regex pattern. */
  public regex(pattern: RegExp): StringSchema {
    return new StringSchema({ ...this._config, pattern });
  }

  /** Validates email format. */
  public email(): StringSchema {
    return new StringSchema({ ...this._config, format: "email" });
  }

  /** Validates URL format. */
  public url(): StringSchema {
    return new StringSchema({ ...this._config, format: "url" });
  }

  /** Validates UUID format. */
  public uuid(): StringSchema {
    return new StringSchema({ ...this._config, format: "uuid" });
  }

  /** Validates UUID v4 format. */
  public uuidv4(): StringSchema {
    return new StringSchema({ ...this._config, format: "uuid-v4" });
  }

  /** Validates ISO datetime format. */
  public datetime(): StringSchema {
    return new StringSchema({ ...this._config, format: "datetime" });
  }

  /** Validates date-only format. */
  public date(): StringSchema {
    return new StringSchema({ ...this._config, format: "date" });
  }

  /** Validates IPv4 format. */
  public ipv4(): StringSchema {
    return new StringSchema({ ...this._config, format: "ipv4" });
  }

  /** Validates hex color format. */
  public hexColor(): StringSchema {
    return new StringSchema({ ...this._config, format: "hexColor" });
  }

  /** Trims whitespace. */
  public trim(): StringSchema {
    return new StringSchema({ ...this._config, trim: true });
  }

  /** Converts to lowercase. */
  public toLowerCase(): StringSchema {
    return new StringSchema({ ...this._config, toLowerCase: true });
  }

  /** Converts to uppercase. */
  public toUpperCase(): StringSchema {
    return new StringSchema({ ...this._config, toUpperCase: true });
  }

  /** Makes this schema optional (accepts undefined). */
  public optional(): Schema<string | undefined> {
    return new OptionalModifierSchema(this);
  }

  /** Makes this schema nullable (accepts null). */
  public nullable(): Schema<string | null> {
    return new NullableModifierSchema(this);
  }

  /** Adds a default value when input is undefined. */
  public default(defaultValue: string | (() => string)): Schema<string> {
    return new DefaultSchema(this, defaultValue);
  }

  /** Adds a custom refinement check. */
  public refine(
    check: (value: string) => boolean,
    message: string,
  ): Schema<string> {
    return new RefineSchema(this, check, message);
  }

  /** Transforms the string value. */
  public transform<TOutput>(fn: (value: string) => TOutput): TransformSchema<string, TOutput> {
    return new TransformSchema(this, fn);
  }
}

/**
 * Schema that applies a transform function to the output of another schema.
 */
export class TransformSchema<TInput, TOutput> extends Schema<TOutput> {
  public readonly _type = "transform";

  constructor(
    private readonly _base: Schema<TInput>,
    private readonly _fn: (value: TInput) => TOutput,
  ) {
    super();
  }

  public _parse(ctx: SchemaParseContext, input: unknown): TOutput {
    const value = this._base._parse(ctx, input);
    try {
      return this._fn(value);
    } catch (error) {
      addIssue(ctx, {
        code: SchemaIssueCode.TRANSFORM_FAILED,
        path: [...ctx.path],
        message: `Transform failed: ${String(error)}`,
      });
      throw new Error("Validation failed");
    }
  }
}

/** Creates a string schema. */
export function stringSchema(): StringSchema {
  return new StringSchema();
}
