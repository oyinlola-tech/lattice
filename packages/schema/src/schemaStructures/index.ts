/**
 * @oyinlola141/lattice-schema/structures
 *
 * Complex schema types: object, array, tuple, record, map, set.
 */

export {
  ObjectSchema,
  OptionalSchema,
  objectSchema,
} from "./schemaObject.core.js";
export type { SchemaShape } from "./schemaObject.core.js";
export { ArraySchema, arraySchema } from "./schemaArray.core.js";
export { TupleSchema, tupleSchema } from "./schemaTuple.core.js";
export { RecordSchema, recordSchema } from "./schemaRecord.core.js";
export {
  MapSchema,
  SetSchema,
  mapSchema,
  setSchema,
} from "./schemaMapSet.core.js";
