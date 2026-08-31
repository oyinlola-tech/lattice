/**
 * Cache-Control directive token parsing.
 *
 * @module httpHeaders/cacheControlTokens
 */

/**
 * Parses individual directive tokens into a directives record.
 *
 * @param items - The split header value items.
 * @returns A record of parsed directives.
 */
export function parseDirectiveTokens(
  items:
    | string[],
): Record<
  string,
  string | true
> {
  const directives:
    Record<
      string,
      string | true
    > =
    {};

  for (
    const item of items
  ) {
    const index =
      item.indexOf(
        "=",
      );

    if (
      index ===
        -1
    ) {
      directives[
        item.toLowerCase()
      ] = true;

      continue;
    }

    const key =
      item
        .slice(
          0,
          index,
        )
        .trim()
        .toLowerCase();

    let directiveValue =
      item
        .slice(
          index + 1,
        )
        .trim();

    if (
      directiveValue.length >=
        2 &&
      directiveValue.startsWith(
        '"',
      ) &&
      directiveValue.endsWith(
        '"',
      )
    ) {
      directiveValue =
        directiveValue.slice(
          1,
          -1,
        );
    }

    directives[key] =
      directiveValue;
  }

  return directives;
}
