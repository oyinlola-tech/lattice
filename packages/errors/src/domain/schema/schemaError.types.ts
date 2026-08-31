/**
 * Specific schema error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { SchemaError } from "./schemaError.base.js";

/**
 * Error thrown when a value does not match the expected type.
 */
export class SchemaTypeError extends SchemaError {
  constructor(expected: string, received: string, path: readonly (string | number)[] = []) {
    super(`Expected ${expected}, received ${received}`, {
      code: ErrorCode.SCHEMA_INVALID_TYPE,
      issues: [{ code: "invalid_type", path, expected, received }],
    });
  }
}

/**
 * Error thrown when a literal value does not match.
 */
export class SchemaLiteralError extends SchemaError {
  constructor(expected: unknown, received: unknown, path: readonly (string | number)[] = []) {
    super(`Expected literal ${JSON.stringify(expected)}, received ${JSON.stringify(received)}`, {
      code: ErrorCode.SCHEMA_INVALID_LITERAL,
      issues: [{ code: "invalid_literal", path, expected, received }],
    });
  }
}

/**
 * Error thrown when a value is not in the allowed enum values.
 */
export class SchemaEnumError extends SchemaError {
  constructor(expected: readonly unknown[], received: unknown, path: readonly (string | number)[] = []) {
    super(`Expected one of ${expected.map((v) => JSON.stringify(v)).join(", ")}`, {
      code: ErrorCode.SCHEMA_INVALID_ENUM,
      issues: [{ code: "invalid_enum", path, expected, received }],
    });
  }
}

/**
 * Error thrown when string constraints are violated.
 */
export class SchemaStringError extends SchemaError {
  constructor(message: string, path: readonly (string | number)[] = [], details?: Record<string, unknown>) {
    super(message, {
      code: ErrorCode.SCHEMA_INVALID_STRING,
      issues: [{ code: "invalid_string", path, ...details }],
    });
  }
}

/**
 * Error thrown when number constraints are violated.
 */
export class SchemaNumberError extends SchemaError {
  constructor(message: string, path: readonly (string | number)[] = [], details?: Record<string, unknown>) {
    super(message, {
      code: ErrorCode.SCHEMA_INVALID_NUMBER,
      issues: [{ code: "invalid_number", path, ...details }],
    });
  }
}

/**
 * Error thrown when a required field is missing.
 */
export class SchemaRequiredError extends SchemaError {
  constructor(path: readonly (string | number)[] = []) {
    super(`Required field missing at path: ${path.length > 0 ? path.join(".") : "(root)"}`, {
      code: ErrorCode.SCHEMA_VALIDATION,
      issues: [{ code: "required", path }],
    });
  }
}

/**
 * Error thrown when a union schema fails to match any variant.
 */
export class SchemaUnionError extends SchemaError {
  constructor(path: readonly (string | number)[] = [], issues?: readonly unknown[]) {
    super("Invalid union: no matching schema found", {
      code: ErrorCode.SCHEMA_INVALID_UNION,
      issues: issues ?? [{ code: "invalid_union", path }],
    });
  }
}

/**
 * Error thrown when a key is not allowed in a strict object schema.
 */
export class SchemaUnknownKeyError extends SchemaError {
  constructor(key: string, path: readonly (string | number)[] = []) {
    super(`Unknown key: ${key}`, {
      code: ErrorCode.SCHEMA_UNKNOWN_KEY,
      issues: [{ code: "unknown_keys", path, key }],
    });
  }
}
