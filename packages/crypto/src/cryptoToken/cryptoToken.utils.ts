/**
 * Removes a known token prefix.
 */
export function removeTokenPrefix(token: string, prefix: string): string {
  assertToken(token);

  if (token.startsWith(prefix)) {
    return token.slice(prefix.length);
  }

  return token;
}

/**
 * Checks whether a token has the expected prefix.
 */
export function hasTokenPrefix(token: string, prefix: string): boolean {
  return (
    typeof token === "string" &&
    typeof prefix === "string" &&
    token.startsWith(prefix)
  );
}

/**
 * Validates the basic shape of an opaque token.
 */
export function isValidToken(token: string, minimumLength = 16): boolean {
  return typeof token === "string" && token.length >= minimumLength;
}

function assertToken(token: string): void {
  if (typeof token !== "string" || token.length === 0) {
    throw new TypeError("Token must be a non-empty string.");
  }
}
