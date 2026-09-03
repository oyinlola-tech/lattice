/**
 * Error assertion helpers.
 *
 * Assert errors, error types, and error messages.
 */

import type { BaseError } from "@zudo/errors";

/**
 * Asserts that a function throws an error.
 *
 * @param fn - The function to call.
 * @param expectedMessage - Optional expected error message substring.
 * @returns The thrown error.
 */
export function assertThrows(
  fn: () => unknown,
  expectedMessage?: string,
): Error {
  try {
    fn();
  } catch (error) {
    if (expectedMessage !== undefined) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes(expectedMessage)) {
        throw new Error(
          `Expected error message to contain "${expectedMessage}", got "${message}".`,
        );
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  throw new Error("Expected function to throw, but it did not.");
}

/**
 * Asserts that an async function rejects.
 *
 * @param fn - The async function to call.
 * @param expectedMessage - Optional expected error message substring.
 * @returns The rejected error.
 */
export async function assertRejects(
  fn: () => Promise<unknown>,
  expectedMessage?: string,
): Promise<Error> {
  try {
    await fn();
  } catch (error) {
    if (expectedMessage !== undefined) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes(expectedMessage)) {
        throw new Error(
          `Expected error message to contain "${expectedMessage}", got "${message}".`,
        );
      }
    }
    return error instanceof Error ? error : new Error(String(error));
  }

  throw new Error("Expected function to reject, but it did not.");
}

/**
 * Asserts that an error is a BaseError with a specific code.
 *
 * @param error - The error to check.
 * @param code - Expected error code.
 */
export function assertErrorCode(error: unknown, code: string): void {
  if (!(error instanceof Error)) {
    throw new Error(
      `Expected error to be an Error instance, got ${typeof error}.`,
    );
  }

  const baseError = error as BaseError;

  if (baseError.code !== code) {
    throw new Error(`Expected error code "${code}", got "${baseError.code}".`);
  }
}

/**
 * Asserts that an error has specific metadata.
 *
 * @param error - The error to check.
 * @param key - Metadata key.
 * @param value - Expected metadata value.
 */
export function assertErrorMetadata(
  error: unknown,
  key: string,
  value: unknown,
): void {
  if (!(error instanceof Error)) {
    throw new Error(
      `Expected error to be an Error instance, got ${typeof error}.`,
    );
  }

  const baseError = error as BaseError;
  const actual = baseError.metadata?.[key];

  if (actual !== value) {
    throw new Error(
      `Expected error metadata "${key}" to be "${value}", got "${actual}".`,
    );
  }
}
