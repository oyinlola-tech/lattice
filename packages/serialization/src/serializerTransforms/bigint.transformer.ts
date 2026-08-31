/**
 * @lattice/serialization — BigInt transformer.
 *
 * Preserves BigInt values across serialization boundaries
 * using string representation.
 */

import type { TypeTransformer } from "../serializerTypes/index.js";
import { SerializationTags } from "@lattice/constants";

const BIGINT_TYPE = "BigInt" as const;

/** Transformer that handles BigInt round-trips. */
export const BigIntTransformer: TypeTransformer<bigint> = {
  type: BIGINT_TYPE,

  canSerialize(value: unknown): value is bigint {
    return typeof value === "bigint";
  },

  serialize(value: bigint): unknown {
    return {
      [SerializationTags.TYPE]: BIGINT_TYPE,
      [SerializationTags.VALUE]: value.toString(),
    };
  },

  deserialize(value: unknown): bigint {
    const data = value as Record<string, unknown>;
    const raw = data[SerializationTags.VALUE];
    if (typeof raw !== "string") {
      throw new Error(`Invalid BigInt serialized value: expected string, got ${typeof raw}`);
    }
    try {
      return BigInt(raw);
    } catch {
      throw new Error(`Cannot parse BigInt from: "${raw}"`);
    }
  },
};
