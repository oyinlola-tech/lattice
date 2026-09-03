/**
 * @zudolib/validation/validationConstraints
 *
 * Built-in validation constraints and rules.
 */

// Base constraints
export {
  createConstraint,
  checkConstraint,
  checkConstraints,
  combineConstraints,
  not,
  required,
  assertNonNegativeInteger,
} from "./validationConstraints.base.js";

export type {
  ValidationConstraint,
  ConstraintOptions,
} from "./validationConstraints.base.js";

// String constraints
export {
  nonEmptyString,
  minLength,
  maxLength,
  lengthBetween,
  matches,
  email,
  uuid,
  httpUrl,
  ascii,
  digits,
  letters,
  slug,
} from "./validationConstraints.string.js";

// Number constraints
export {
  min,
  max,
  between,
  finiteNumber,
  integer,
  positive,
  nonNegative,
  even,
  odd,
} from "./validationConstraints.number.js";

// Collection constraints
export { oneOf, noneOf } from "./validationConstraints.collection.js";

// Date constraints
export { isoDate, futureDate, pastDate } from "./validationConstraints.date.js";

// Array constraints
export {
  minItems,
  maxItems,
  exactItems,
  everyItem,
  someItem,
} from "./validationConstraints.array.js";

// Circular reference detection
export {
  assertNoCircularReference,
  hasCircularReference,
} from "./validationConstraints.circular.js";

// Depth checking
export {
  getSerializationDepth,
  assertDepthWithinLimit,
} from "./validationConstraints.depth.js";

// Size estimation
export {
  estimateSerializedSize,
  assertSizeWithinLimit,
} from "./validationConstraints.size.js";
