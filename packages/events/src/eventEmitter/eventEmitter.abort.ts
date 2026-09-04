/**
 * Event emitter abort error helper for Zudojs.
 */

/**
 * Creates an AbortError consistently across runtimes.
 */
export function createAbortError(): Error {
  const error = new Error("Event dispatch was aborted.");

  error.name = "AbortError";

  return error;
}
