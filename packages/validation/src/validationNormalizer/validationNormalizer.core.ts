import type {
  ValidationResult,
} from "../validationResult/validationResult.type.js";

import {
  failure,
  success,
} from "../validationResult/validationResult.type.js";

import {
  ConstraintValidationError,
} from "../validationErrors/validationError.base.js";

/**
 * A synchronous normalizer.
 */
export type Normalizer<T> = (
  value: T,
) => T;

/**
 * An asynchronous normalizer.
 */
export type AsyncNormalizer<T> = (
  value: T,
) => T | Promise<T>;

/**
 * Options used by normalization helpers.
 */
export interface NormalizerOptions {
  readonly name?: string;
  readonly errorMessage?: string;
}

/**
 * A reusable normalizer.
 */
export interface ValidationNormalizer<T> {
  readonly name: string;

  normalize(
    value: T,
  ): T;

  safeNormalize(
    value: T,
  ): ValidationResult<T>;
}

/**
 * A reusable asynchronous normalizer.
 */
export interface AsyncValidationNormalizer<T> {
  readonly name: string;

  normalize(
    value: T,
  ): Promise<T>;

  safeNormalize(
    value: T,
  ): Promise<ValidationResult<T>>;
}

/**
 * Creates a reusable synchronous normalizer.
 */
export function createNormalizer<T>(
  normalizer: Normalizer<T>,
  options: NormalizerOptions = {},
): ValidationNormalizer<T> {
  const name =
    options.name ??
    "ValidationNormalizer";

  return Object.freeze({
    name,

    normalize(
      value: T,
    ): T {
      try {
        return normalizer(
          value,
        );
      } catch (error) {
        throw new ConstraintValidationError(
          options.errorMessage ??
            "Value normalization failed.",
          [],
          {
            cause: error,
          },
        );
      }
    },

    safeNormalize(
      value: T,
    ): ValidationResult<T> {
      try {
        return success(
          normalizer(
            value,
          ),
        );
      } catch (error) {
        return failure([
          {
            path: [],
            code:
              "normalization_failed",
            message:
              options.errorMessage ??
              "Value normalization failed.",
            received:
              error instanceof Error
                ? error.message
                : error,
          },
        ]);
      }
    },
  });
}

/**
 * Creates a reusable asynchronous normalizer.
 */
export function createAsyncNormalizer<T>(
  normalizer: AsyncNormalizer<T>,
  options: NormalizerOptions = {},
): AsyncValidationNormalizer<T> {
  const name =
    options.name ??
    "AsyncValidationNormalizer";

  return Object.freeze({
    name,

    async normalize(
      value: T,
    ): Promise<T> {
      try {
        return await normalizer(
          value,
        );
      } catch (error) {
        throw new ConstraintValidationError(
          options.errorMessage ??
            "Value normalization failed.",
          [],
          {
            cause: error,
          },
        );
      }
    },

    async safeNormalize(
      value: T,
    ): Promise<ValidationResult<T>> {
      try {
        return success(
          await normalizer(
            value,
          ),
        );
      } catch (error) {
        return failure([
          {
            path: [],
            code:
              "normalization_failed",
            message:
              options.errorMessage ??
              "Value normalization failed.",
            received:
              error instanceof Error
                ? error.message
                : error,
          },
        ]);
      }
    },
  });
}

/**
 * Trims leading and trailing whitespace.
 */
export function normalizeTrim(
  value: string,
): string {
  return value.trim();
}

/**
 * Converts consecutive whitespace characters into a single space.
 */
export function normalizeWhitespace(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /\s+/gu,
      " ",
    );
}

/**
 * Converts a string to lowercase.
 */
export function normalizeLowercase(
  value: string,
): string {
  return value.toLowerCase();
}

/**
 * Converts a string to uppercase.
 */
export function normalizeUppercase(
  value: string,
): string {
  return value.toUpperCase();
}

/**
 * Normalizes Unicode text using NFC normalization.
 */
export function normalizeUnicode(
  value: string,
): string {
  return value.normalize(
    "NFC",
  );
}

/**
 * Normalizes an email address.
 *
 * This intentionally does not attempt provider-specific rules such as
 * removing dots or plus-addressing because those rules are not universal.
 */
export function normalizeEmail(
  value: string,
): string {
  return normalizeUnicode(
    normalizeWhitespace(
      value,
    ),
  ).toLowerCase();
}

/**
 * Normalizes a URL by removing surrounding whitespace.
 */
export function normalizeUrl(
  value: string,
): string {
  return normalizeWhitespace(
    normalizeUnicode(
      value,
    ),
  );
}

/**
 * Normalizes an identifier by trimming and lowercasing it.
 */
export function normalizeIdentifier(
  value: string,
): string {
  return normalizeLowercase(
    normalizeWhitespace(
      normalizeUnicode(
        value,
      ),
    ),
  );
}

/**
 * Removes surrounding quotes from a string.
 */
export function normalizeQuotes(
  value: string,
): string {
  const normalized =
    value.trim();

  if (
    normalized.length >= 2 &&
    (
      (
        normalized.startsWith(
          '"',
        ) &&
        normalized.endsWith(
          '"',
        )
      ) ||
      (
        normalized.startsWith(
          "'",
        ) &&
        normalized.endsWith(
          "'",
        )
      )
    )
  ) {
    return normalized.slice(
      1,
      -1,
    );
  }

  return normalized;
}

/**
 * Removes Unicode byte-order marks from the beginning of text.
 */
export function removeBom(
  value: string,
): string {
  return value.replace(
    /^\uFEFF/u,
    "",
  );
}

/**
 * Normalizes an array by applying a normalizer to every item.
 */
export function normalizeArray<T>(
  values: readonly T[],
  normalizer: Normalizer<T>,
): T[] {
  return values.map(
    normalizer,
  );
}

/**
 * Normalizes an array asynchronously.
 */
export async function normalizeArrayAsync<T>(
  values: readonly T[],
  normalizer: AsyncNormalizer<T>,
): Promise<T[]> {
  return Promise.all(
    values.map(
      normalizer,
    ),
  );
}

/**
 * Composes multiple normalizers into one.
 */
export function composeNormalizers<T>(
  ...normalizers: readonly Normalizer<T>[]
): Normalizer<T> {
  return (
    value: T,
  ): T => {
    let current =
      value;

    for (
      const normalizer of normalizers
    ) {
      current =
        normalizer(
          current,
        );
    }

    return current;
  };
}

/**
 * Creates a normalizer that only changes a value when the
 * supplied predicate returns true.
 */
export function conditionalNormalizer<T>(
  predicate: (
    value: T,
  ) => boolean,
  normalizer: Normalizer<T>,
): Normalizer<T> {
  return (
    value: T,
  ): T =>
    predicate(value)
      ? normalizer(value)
      : value;
}

/**
 * Normalizes an optional string.
 */
export function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  return normalizeWhitespace(
    normalizeUnicode(
      value,
    ),
  );
}

/**
 * Normalizes a nullable string.
 */
export function normalizeNullableString(
  value: string | null,
): string | null {
  if (
    value === null
  ) {
    return null;
  }

  return normalizeWhitespace(
    normalizeUnicode(
      value,
    ),
  );
}

/**
 * Normalizes an optional nullable string.
 */
export function normalizeOptionalNullableString(
  value:
    | string
    | null
    | undefined,
): string | null | undefined {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  return normalizeWhitespace(
    normalizeUnicode(
      value,
    ),
  );
}