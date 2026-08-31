/**
 * Internal media type parsing helper.
 *
 * @module httpHeaders/internal/mediaType
 */

/**
 * A parsed media type with type and subtype components.
 */
export interface ParsedMediaType {
  readonly type:
    | string;

  readonly subtype:
    | string;
}

/**
 * Parses a media type string into its type and subtype components.
 *
 * @param value - The media type string (e.g. `"text/html"` or `"application/json; charset=utf-8"`).
 * @returns The parsed media type, or `undefined` if invalid.
 */
export function parseMediaType(
  value:
    | string,
): ParsedMediaType
  | undefined {
  const media =
    value
      .split(";")[0]
      ?.trim()
      .toLowerCase();

  if (
    !media
  ) {
    return undefined;
  }

  const separator =
    media.indexOf(
      "/",
    );

  if (
    separator ===
      -1
  ) {
    return undefined;
  }

  const type =
    media
      .slice(
        0,
        separator,
      )
      .trim();

  const subtype =
    media
      .slice(
        separator + 1,
      )
      .trim();

  if (
    !type ||
    !subtype
  ) {
    return undefined;
  }

  return {
    type,
    subtype,
  };
}
