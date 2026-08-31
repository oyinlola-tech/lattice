/**
 * Request ID generation.
 *
 * Generates unique request identifiers using the Web Crypto API
 * with a fallback to timestamp-based generation.
 */

export function generateRequestId(): string {
  const cryptoObject =
    globalThis.crypto;

  if (
    cryptoObject &&
    typeof cryptoObject.randomUUID ===
      "function"
  ) {
    return cryptoObject.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}
