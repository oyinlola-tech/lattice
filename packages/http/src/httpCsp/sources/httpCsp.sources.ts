/**
 * CSP source type detection helpers.
 */

export function isSelfSource(
  source: string,
): boolean {
  return source.trim() === "'self'";
}

export function isNoneSource(
  source: string,
): boolean {
  return source.trim() === "'none'";
}

export function isUnsafeInlineSource(
  source: string,
): boolean {
  return source.trim() === "'unsafe-inline'";
}

export function isUnsafeEvalSource(
  source: string,
): boolean {
  return source.trim() === "'unsafe-eval'";
}

export function isNonceSource(
  source: string,
): boolean {
  return /^'nonce-[^']+'$/i.test(source.trim());
}

export function isHashSource(
  source: string,
): boolean {
  return /^'(sha256|sha384|sha512)-[^']+'$/i.test(
    source.trim(),
  );
}
