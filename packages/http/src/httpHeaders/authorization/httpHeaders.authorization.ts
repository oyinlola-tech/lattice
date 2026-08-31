/**
 * Authorization header utilities.
 *
 * @module httpHeaders/authorization
 */

/**
 * A parsed Authorization header with scheme and credentials.
 */
export interface ParsedAuthorization {
  readonly scheme:
    | string;

  readonly credentials:
    | string;
}

/**
 * Parses an Authorization header value into scheme and credentials.
 *
 * @param value - The raw Authorization header value.
 * @returns The parsed authorization, or `undefined` if invalid.
 */
export function parseAuthorization(
  value:
    | string
    | undefined,
):
  | ParsedAuthorization
  | undefined {
  if (
    !value
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  const separator =
    trimmed.indexOf(
      " ",
    );

  if (
    separator ===
      -1
  ) {
    return undefined;
  }

  const scheme =
    trimmed
      .slice(
        0,
        separator,
      )
      .trim();

  const credentials =
    trimmed
      .slice(
        separator + 1,
      )
      .trim();

  if (
    !scheme ||
    !credentials
  ) {
    return undefined;
  }

  return {
    scheme,
    credentials,
  };
}

/**
 * Checks if an Authorization header value uses the Bearer scheme.
 *
 * @param value - The raw Authorization header value.
 * @returns `true` if the scheme is `"Bearer"` (case-insensitive).
 */
export function isBearerAuthorization(
  value:
    | string
    | undefined,
): boolean {
  return (
    parseAuthorization(
      value,
    )?.scheme.toLowerCase() ===
    "bearer"
  );
}

/**
 * Extracts the Bearer token from an Authorization header value.
 *
 * @param value - The raw Authorization header value.
 * @returns The Bearer token, or `undefined` if not a Bearer authorization.
 */
export function getBearerToken(
  value:
    | string
    | undefined,
): string
  | undefined {
  const parsed =
    parseAuthorization(
      value,
    );

  if (
    !parsed ||
    parsed.scheme.toLowerCase() !==
      "bearer"
  ) {
    return undefined;
  }

  return parsed.credentials;
}
