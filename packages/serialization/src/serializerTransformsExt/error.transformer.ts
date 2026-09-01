/**
 * @oyinlola141/lattice-serialization — Error transformer.
 *
 * Preserves Error instances across serialization boundaries.
 * Stack traces are controlled via options for security.
 */

import type { TypeTransformer } from "../serializerTypes/index.js";
import { SerializationTags } from "@oyinlola141/lattice-constants";

const ERROR_TYPE = "Error" as const;

/** Transformer that handles Error round-trips. */
export const ErrorTransformer: TypeTransformer<Error> = {
  type: ERROR_TYPE,

  canSerialize(value: unknown): value is Error {
    return value instanceof Error;
  },

  serialize(value: Error): unknown {
    const result: Record<string, unknown> = {
      [SerializationTags.TYPE]: ERROR_TYPE,
      name: value.name,
      message: value.message,
    };

    if (value.stack !== undefined) {
      result.stack = value.stack;
    }

    const code = (value as unknown as Record<string, unknown>).code;
    if (typeof code === "string") {
      result.code = code;
    }

    return result;
  },

  deserialize(value: unknown): Error {
    const data = value as Record<string, unknown>;
    const message = typeof data.message === "string" ? data.message : "";
    const error = new Error(message);

    const name = data.name;
    if (typeof name === "string" && name !== "Error") {
      error.name = name;
    }

    const stack = data.stack;
    if (typeof stack === "string") {
      error.stack = stack;
    }

    const code = data.code;
    if (typeof code === "string") {
      (error as unknown as Record<string, unknown>).code = code;
    }

    return error;
  },
};
