/**
 * @zudojs/schema/base
 *
 * Abstract base class for all Zudojs schemas.
 * Defines the core parsing pipeline: Input → validate → Output.
 */

import type {
  SchemaParseContext,
  SchemaParseOptions,
  SchemaResult,
  SchemaMetadata,
} from "./schemaBase.type.js";
import { createParseContext } from "./schemaBase.context.js";
import { schemaSuccess, schemaFailure } from "./schemaBase.result.js";
import { SchemaError } from "@zudojs/errors";

/**
 * Base schema class. All schema types extend this.
 *
 * @typeParam TOutput - The output type after parsing/transforms.
 * @typeParam TInput - The input type (defaults to TOutput).
 */
export abstract class Schema<TOutput, TInput = TOutput> {
  /** The schema type name for debugging. */
  public abstract readonly _type: string;

  /** Optional metadata (description, example, etc.). */
  protected _metadata: SchemaMetadata | undefined;

  /**
   * Internal parse implementation — subclasses implement this.
   */
  public abstract _parse(ctx: SchemaParseContext, input: unknown): TOutput;

  /**
   * Parses input and returns the output value.
   * Throws SchemaError on failure.
   */
  public parse(input: TInput, options?: SchemaParseOptions): TOutput {
    const ctx = createParseContext(options);
    try {
      return this._parse(ctx, input);
    } catch (error) {
      if (error instanceof SchemaError) {
        throw error;
      }
      throw new SchemaError(String(error), {
        issues: ctx.issues.length > 0 ? ctx.issues : undefined,
        cause: error,
      });
    }
  }

  /**
   * Parses input and returns a discriminated result.
   * Never throws.
   */
  public safeParse(
    input: TInput,
    options?: SchemaParseOptions,
  ): SchemaResult<TOutput> {
    const ctx = createParseContext(options);
    try {
      const data = this._parse(ctx, input);
      if (ctx.issues.length > 0) {
        return schemaFailure([...ctx.issues]);
      }
      return schemaSuccess(data);
    } catch {
      if (ctx.issues.length > 0) {
        return schemaFailure([...ctx.issues]);
      }
      return schemaFailure([
        {
          code: "custom",
          path: [],
          message: "Unknown validation error",
        },
      ]);
    }
  }

  /**
   * Returns the output type TOutput. Runtime no-op, purely for type inference.
   */
  public _output(): TOutput {
    return undefined as unknown as TOutput;
  }

  /**
   * Returns the input type TInput. Runtime no-op, purely for type inference.
   */
  public _input(): TInput {
    return undefined as unknown as TInput;
  }

  /** Attaches metadata to the schema. */
  public describe(description: string): this {
    this._metadata = { ...this._metadata, description };
    return this;
  }

  /** Attaches example metadata. */
  public example(value: unknown): this {
    this._metadata = { ...this._metadata, example: value };
    return this;
  }

  /** Attaches title metadata. */
  public title(title: string): this {
    this._metadata = { ...this._metadata, title };
    return this;
  }

  /** Marks the schema as deprecated. */
  public deprecated(): this {
    this._metadata = { ...this._metadata, deprecated: true };
    return this;
  }

  /** Returns the current metadata. */
  public getMetadata(): SchemaMetadata | undefined {
    return this._metadata;
  }
}
