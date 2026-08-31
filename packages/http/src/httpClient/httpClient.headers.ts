/**
 * HTTP client header merging.
 *
 * @module httpClient/headers
 */

export function mergeHeaders(
  defaults: HeadersInit,
  overrides?: HeadersInit,
): Headers {
  const result = new Headers(defaults);

  if (overrides) {
    const additional = new Headers(overrides);

    for (const [key, value] of additional.entries()) {
      result.set(key, value);
    }
  }

  return result;
}
