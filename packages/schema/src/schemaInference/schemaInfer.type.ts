/**
 * @oyinlola141/lattice-schema/inference
 *
 * Type inference utilities for extracting TypeScript types from schemas.
 */

import type { Schema } from "../schemaBase/index.js";

/**
 * Infers the output type of a schema.
 *
 * @example
 * const UserSchema = schema.object({ name: schema.string() });
 * type User = Infer<typeof UserSchema>; // { name: string }
 */
export type Infer<TSchema> =
  TSchema extends Schema<infer TOutput, unknown>
    ? TOutput
    : TSchema extends Schema<infer TOutput>
      ? TOutput
      : never;

/**
 * Infers the input type of a schema.
 *
 * @example
 * const schema = schema.string().transform(Number);
 * type Input = Input<typeof schema>; // string
 */
export type SchemaInput<TSchema> =
  TSchema extends Schema<unknown, infer TInput>
    ? TInput
    : TSchema extends Schema<infer TOutput>
      ? TOutput
      : never;

/**
 * Infers the output type of a schema (alias for Infer).
 */
export type SchemaOutput<TSchema> = Infer<TSchema>;
