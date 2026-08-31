/**
 * CSP directive name validation.
 */

export function isValidDirectiveName(
  name: string,
): boolean {
  return /^[a-z][a-z0-9-]*$/i.test(
    name.trim(),
  );
}

export function normalizeDirectiveName(
  name: string,
): string {
  const normalized =
    name
      .trim()
      .toLowerCase();

  if (
    !isValidDirectiveName(
      normalized,
    )
  ) {
    throw new TypeError(
      `Invalid CSP directive name: ${name}`,
    );
  }

  return normalized;
}
