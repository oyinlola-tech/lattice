/**
 * @zudolib/schema
 *
 * Schema definition and parsing engine for the Zudo framework.
 *
 * Provides type-safe data contracts with validation, transformation,
 * type inference, and structured error reporting.
 *
 * @example
 * ```ts
 * import { schema, type Infer } from "@zudolib/schema";
 *
 * const UserSchema = schema.object({
 *   id: schema.string().uuid(),
 *   name: schema.string().min(2).max(100),
 *   email: schema.string().email(),
 *   role: schema.enum(["admin", "user"]),
 * });
 *
 * type User = Infer<typeof UserSchema>;
 * // { id: string; name: string; email: string; role: "admin" | "user" }
 *
 * const result = UserSchema.safeParse(input);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */

export { Schema } from "./schemaBase/index.js";
export type {
  SchemaIssue,
  SchemaPathSegment,
  SchemaResult,
  SchemaSuccess,
  SchemaFailure,
  SchemaParseOptions,
  SchemaParseContext,
  SchemaMetadata,
} from "./schemaBase/index.js";
export {
  schemaSuccess,
  schemaFailure,
  isSchemaSuccess,
  isSchemaFailure,
  unwrapSchemaResult,
  createParseContext,
  childContext,
  addIssue,
  isMaxDepthExceeded,
  shouldAbortEarly,
} from "./schemaBase/index.js";

export {
  StringSchema,
  TransformSchema,
  stringSchema,
  NumberSchema,
  numberSchema,
  BooleanSchema,
  booleanSchema,
  LiteralSchema,
  literalSchema,
  NullSchema,
  UndefinedSchema,
  AnySchema,
  UnknownSchema,
  NeverSchema,
  nullSchema,
  undefinedSchema,
  anySchema,
  unknownSchema,
  neverSchema,
} from "./schemaPrimitives/index.js";

export {
  ObjectSchema,
  OptionalSchema,
  objectSchema,
  ArraySchema,
  arraySchema,
  TupleSchema,
  tupleSchema,
  RecordSchema,
  recordSchema,
  MapSchema,
  SetSchema,
  mapSchema,
  setSchema,
} from "./schemaStructures/index.js";
export type { SchemaShape } from "./schemaStructures/index.js";

export {
  UnionSchema,
  DiscriminatedUnionSchema,
  unionSchema,
  IntersectionSchema,
  intersectionSchema,
  LazySchema,
  lazySchema,
  EnumSchema,
  enumSchema,
} from "./schemaComposition/index.js";

export {
  OptionalModifierSchema,
  NullableModifierSchema,
  optionalSchema,
  nullableSchema,
  DefaultSchema,
  defaultSchema,
  RefineSchema,
  refineSchema,
  TransformModifierSchema,
  transformSchema,
} from "./schemaModifiers/index.js";

export {
  CoerceNumberSchema,
  CoerceBooleanSchema,
  CoerceStringSchema,
  CoerceBigIntSchema,
  coerceNumberSchema,
  coerceBooleanSchema,
  coerceStringSchema,
  coerceBigIntSchema,
} from "./schemaCoerce/index.js";

export type {
  Infer,
  SchemaInput,
  SchemaOutput,
} from "./schemaInference/index.js";

export { schema } from "./schemaRoot/index.js";
