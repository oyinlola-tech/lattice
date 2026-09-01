import type { ConfigValue } from "../../configValue/configValue.core.js";

import {
  parseConfigBigInt,
  parseConfigBoolean,
  parseConfigDate,
  parseConfigNumber,
} from "../../configValue/configValue.core.js";

import { ConfigResolutionError } from "../core/configResolver.error.js";

/**
 * Typed accessor methods for configuration resolution.
 *
 * These functions provide type-safe access to configuration values
 * with optional fallback and type coercion support.
 */
export function resolveString(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: string,
  strict = true,
): string | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (typeof value !== "string") {
    if (strict) {
      throw new ConfigResolutionError(key, [
        {
          path: key,
          message: `Expected configuration "${key}" to be string.`,
          code: "TYPE_MISMATCH",
          expected: "string",
          received: typeof value,
        },
      ]);
    }
    return fallback;
  }

  return value;
}

export function resolveRequiredString(
  get: (key: string) => ConfigValue | undefined,
  key: string,
): string {
  const value = resolveString(get, key);

  if (value === undefined) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Required string configuration "${key}" is missing.`,
        code: "REQUIRED_STRING",
      },
    ]);
  }

  return value;
}

export function resolveNumber(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: number,
  strict = true,
): number | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      return value;
    }
  }

  if (typeof value === "string") {
    const parsed = parseConfigNumber(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  if (strict) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Expected configuration "${key}" to be number.`,
        code: "TYPE_MISMATCH",
        expected: "number",
        received: typeof value,
      },
    ]);
  }

  return fallback;
}

export function resolveRequiredNumber(
  get: (key: string) => ConfigValue | undefined,
  key: string,
): number {
  const value = resolveNumber(get, key);

  if (value === undefined) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Required number configuration "${key}" is missing.`,
        code: "REQUIRED_NUMBER",
      },
    ]);
  }

  return value;
}

export function resolveBoolean(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: boolean,
  strict = true,
): boolean | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseConfigBoolean(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  if (strict) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Expected configuration "${key}" to be boolean.`,
        code: "TYPE_MISMATCH",
        expected: "boolean",
        received: typeof value,
      },
    ]);
  }

  return fallback;
}

export function resolveRequiredBoolean(
  get: (key: string) => ConfigValue | undefined,
  key: string,
): boolean {
  const value = resolveBoolean(get, key);

  if (value === undefined) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Required boolean configuration "${key}" is missing.`,
        code: "REQUIRED_BOOLEAN",
      },
    ]);
  }

  return value;
}

export function resolveBigint(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: bigint,
  strict = true,
): bigint | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseConfigBigInt(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  if (strict) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Expected configuration "${key}" to be bigint.`,
        code: "TYPE_MISMATCH",
        expected: "bigint",
        received: typeof value,
      },
    ]);
  }

  return fallback;
}

export function resolveDate(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: Date,
  strict = true,
): Date | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (value instanceof Date) {
    return parseConfigDate(value);
  }

  if (typeof value === "string") {
    const parsed = parseConfigDate(value);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  if (strict) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Expected configuration "${key}" to be date.`,
        code: "TYPE_MISMATCH",
        expected: "date",
        received: typeof value,
      },
    ]);
  }

  return fallback;
}

export function resolveRequiredDate(
  get: (key: string) => ConfigValue | undefined,
  key: string,
): Date {
  const value = resolveDate(get, key);

  if (value === undefined) {
    throw new ConfigResolutionError(key, [
      {
        path: key,
        message: `Required date configuration "${key}" is missing.`,
        code: "REQUIRED_DATE",
      },
    ]);
  }

  return value;
}

export function resolveObject<T extends ConfigValue = ConfigValue>(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: T,
  strict = true,
): T | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    value instanceof Date
  ) {
    if (strict) {
      throw new ConfigResolutionError(key, [
        {
          path: key,
          message: `Expected configuration "${key}" to be object.`,
          code: "TYPE_MISMATCH",
          expected: "object",
          received: typeof value,
        },
      ]);
    }
    return fallback;
  }

  return value as T;
}

export function resolveArray<T extends ConfigValue = ConfigValue>(
  get: (key: string) => ConfigValue | undefined,
  key: string,
  fallback?: readonly T[],
  strict = true,
): readonly T[] | undefined {
  const value = get(key);

  if (value === undefined) {
    return fallback;
  }

  if (!Array.isArray(value)) {
    if (strict) {
      throw new ConfigResolutionError(key, [
        {
          path: key,
          message: `Expected configuration "${key}" to be array.`,
          code: "TYPE_MISMATCH",
          expected: "array",
          received: typeof value,
        },
      ]);
    }
    return fallback;
  }

  return value as unknown as readonly T[];
}
