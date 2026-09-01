/**
 * HTTP redirect utilities.
 *
 * Provides redirect status classification, Location header handling,
 * URL resolution, and redirect policy helpers for the HTTP package.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface RedirectOptions {
  readonly statusCode?: number;
  readonly preserveMethod?: boolean;
  readonly absolute?: boolean;
  readonly baseURL?: string | URL;
}

export interface RedirectResult {
  readonly statusCode: number;
  readonly location: string;
  readonly preserveMethod: boolean;
}

export interface RedirectPolicy {
  readonly maxRedirects: number;
  readonly preserveMethod: boolean;
  readonly allowCrossOrigin: boolean;
  readonly allowDowngrade: boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_REDIRECT_STATUS = 302;

export const DEFAULT_MAX_REDIRECTS = 20;

export const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308] as const;

/* -------------------------------------------------------------------------- */
/* Redirect Classification                                                    */
/* -------------------------------------------------------------------------- */

export function isRedirectStatus(statusCode: number): boolean {
  return (
    REDIRECT_STATUS_CODES.includes(
      statusCode as (typeof REDIRECT_STATUS_CODES)[number],
    ) ||
    (statusCode >= 300 && statusCode < 400 && statusCode !== 304)
  );
}

export function isPermanentRedirect(statusCode: number): boolean {
  return statusCode === 301 || statusCode === 308;
}

export function isTemporaryRedirect(statusCode: number): boolean {
  return statusCode === 302 || statusCode === 303 || statusCode === 307;
}

export function isMethodPreservingRedirect(statusCode: number): boolean {
  return statusCode === 307 || statusCode === 308;
}

export function isMethodChangingRedirect(statusCode: number): boolean {
  return statusCode === 301 || statusCode === 302 || statusCode === 303;
}

/* -------------------------------------------------------------------------- */
/* Redirect Status                                                            */
/* -------------------------------------------------------------------------- */

export function getRedirectStatus(statusCode: number | undefined): number {
  const status = statusCode ?? DEFAULT_REDIRECT_STATUS;

  if (!isRedirectStatus(status)) {
    throw new RangeError(`Invalid redirect status code: ${status}`);
  }

  return status;
}

/* -------------------------------------------------------------------------- */
/* Location Validation                                                       */
/* -------------------------------------------------------------------------- */

export function isValidLocation(
  location: string | URL | undefined | null,
): boolean {
  if (location === undefined || location === null) {
    return false;
  }

  const value = location instanceof URL ? location.href : location;

  if (value.length === 0 || /[\r\n]/.test(value)) {
    return false;
  }

  return true;
}

export function validateLocation(location: string | URL): string {
  if (!isValidLocation(location)) {
    throw new TypeError("Invalid redirect Location.");
  }

  return location instanceof URL ? location.href : location;
}

/* -------------------------------------------------------------------------- */
/* URL Resolution                                                             */
/* -------------------------------------------------------------------------- */

export function resolveRedirectURL(
  location: string | URL,
  currentURL: string | URL,
): URL {
  const locationValue = validateLocation(location);

  const base = currentURL instanceof URL ? currentURL : new URL(currentURL);

  return new URL(locationValue, base);
}

export function resolveRedirectLocation(
  location: string | URL,
  currentURL: string | URL,
): string {
  return resolveRedirectURL(location, currentURL).href;
}

/* -------------------------------------------------------------------------- */
/* Location Formatting                                                        */
/* -------------------------------------------------------------------------- */

export function formatLocation(
  location: string | URL,
  options: {
    readonly absolute?: boolean;
    readonly baseURL?: string | URL;
  } = {},
): string {
  const value = validateLocation(location);

  if (!options.absolute) {
    return value;
  }

  if (isAbsoluteURL(value)) {
    return value;
  }

  if (!options.baseURL) {
    throw new TypeError(
      "A baseURL is required to create an absolute redirect Location.",
    );
  }

  return resolveRedirectLocation(value, options.baseURL);
}

/* -------------------------------------------------------------------------- */
/* Redirect Creation                                                          */
/* -------------------------------------------------------------------------- */

export function createRedirect(
  location: string | URL,
  options: RedirectOptions = {},
): RedirectResult {
  const statusCode = getRedirectStatus(options.statusCode);

  const formattedLocation = formatLocation(location, {
    absolute: options.absolute ?? false,
    baseURL: options.baseURL,
  });

  return {
    statusCode,
    location: formattedLocation,
    preserveMethod:
      isMethodPreservingRedirect(statusCode) || options.preserveMethod === true,
  };
}

/* -------------------------------------------------------------------------- */
/* Method Semantics                                                           */
/* -------------------------------------------------------------------------- */

export function shouldPreserveRedirectMethod(
  statusCode: number,
  method: string,
): boolean {
  const normalized = method.trim().toUpperCase();

  if (isMethodPreservingRedirect(statusCode)) {
    return true;
  }

  /*
   * Historically, 301/302 may rewrite POST to GET.
   * For methods other than POST, the original method is normally retained.
   */
  if ((statusCode === 301 || statusCode === 302) && normalized === "POST") {
    return false;
  }

  if (statusCode === 303) {
    return false;
  }

  return true;
}

export function getRedirectMethod(statusCode: number, method: string): string {
  const normalized = method.trim().toUpperCase();

  if (statusCode === 303) {
    return "GET";
  }

  if ((statusCode === 301 || statusCode === 302) && normalized === "POST") {
    return "GET";
  }

  return normalized;
}

/* -------------------------------------------------------------------------- */
/* Redirect Policy                                                            */
/* -------------------------------------------------------------------------- */

export function createRedirectPolicy(
  options: Partial<RedirectPolicy> | undefined = {},
): RedirectPolicy {
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  if (!Number.isInteger(maxRedirects) || maxRedirects < 0) {
    throw new RangeError("maxRedirects must be a non-negative integer.");
  }

  return {
    maxRedirects,
    preserveMethod: options.preserveMethod ?? false,
    allowCrossOrigin: options.allowCrossOrigin ?? true,
    allowDowngrade: options.allowDowngrade ?? false,
  };
}

/* -------------------------------------------------------------------------- */
/* Redirect Policy Evaluation                                                 */
/* -------------------------------------------------------------------------- */

export function canFollowRedirect(
  fromURL: string | URL,
  toURL: string | URL,
  policy: RedirectPolicy,
): boolean {
  const from = normalizeURL(fromURL);

  const to = normalizeURL(toURL);

  if (!policy.allowCrossOrigin && !isSameOrigin(from, to)) {
    return false;
  }

  if (!policy.allowDowngrade && isHTTPS(from) && !isHTTPS(to)) {
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Redirect Chain                                                             */
/* -------------------------------------------------------------------------- */

export function resolveRedirectChain(
  initialURL: string | URL,
  locations: readonly (string | URL)[],
  policy: Partial<RedirectPolicy> | undefined = {},
): URL[] {
  const redirectPolicy = createRedirectPolicy(policy);

  if (locations.length > redirectPolicy.maxRedirects) {
    throw new RangeError(
      `Redirect chain exceeds the maximum of ${redirectPolicy.maxRedirects} redirects.`,
    );
  }

  const chain: URL[] = [];

  let current = normalizeURL(initialURL);

  for (const location of locations) {
    const next = resolveRedirectURL(location, current);

    if (!canFollowRedirect(current, next, redirectPolicy)) {
      throw new Error("Redirect is blocked by the configured redirect policy.");
    }

    chain.push(next);
    current = next;
  }

  return chain;
}

/* -------------------------------------------------------------------------- */
/* Redirect Loop Detection                                                    */
/* -------------------------------------------------------------------------- */

export function hasRedirectLoop(locations: readonly (string | URL)[]): boolean {
  const seen = new Set<string>();

  for (const location of locations) {
    const normalized = normalizeURL(location).href;

    if (seen.has(normalized)) {
      return true;
    }

    seen.add(normalized);
  }

  return false;
}

export function assertNoRedirectLoop(
  locations: readonly (string | URL)[],
): void {
  if (hasRedirectLoop(locations)) {
    throw new Error("Redirect loop detected.");
  }
}

/* -------------------------------------------------------------------------- */
/* Origin Helpers                                                             */
/* -------------------------------------------------------------------------- */

export function isSameOrigin(left: string | URL, right: string | URL): boolean {
  const leftURL = normalizeURL(left);

  const rightURL = normalizeURL(right);

  return (
    leftURL.protocol === rightURL.protocol &&
    leftURL.hostname === rightURL.hostname &&
    getEffectivePort(leftURL) === getEffectivePort(rightURL)
  );
}

export function isCrossOrigin(
  left: string | URL,
  right: string | URL,
): boolean {
  return !isSameOrigin(left, right);
}

export function isHTTPS(value: string | URL): boolean {
  return normalizeURL(value).protocol === "https:";
}

/* -------------------------------------------------------------------------- */
/* Relative Redirects                                                         */
/* -------------------------------------------------------------------------- */

export function isAbsoluteURL(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol.length > 0 && url.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isRelativeURL(value: string): boolean {
  if (/[\r\n]/.test(value)) {
    return false;
  }

  return !isAbsoluteURL(value);
}

export function toRelativeLocation(
  target: string | URL,
  base: string | URL,
): string {
  const targetURL = normalizeURL(target);

  const baseURL = normalizeURL(base);

  if (!isSameOrigin(targetURL, baseURL)) {
    return targetURL.href;
  }

  const targetPath = `${targetURL.pathname}${targetURL.search}${targetURL.hash}`;

  return targetPath || "/";
}

/* -------------------------------------------------------------------------- */
/* Security Helpers                                                           */
/* -------------------------------------------------------------------------- */

export function isSafeRedirectProtocol(location: string | URL): boolean {
  try {
    const value = validateLocation(location);

    /*
     * Relative references are safe from protocol changes because they are
     * resolved against the current request origin.
     */
    if (!isAbsoluteURL(value)) {
      return true;
    }

    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isPotentiallyUnsafeRedirect(location: string | URL): boolean {
  return !isSafeRedirectProtocol(location);
}

/* -------------------------------------------------------------------------- */
/* Redirect Header Helpers                                                    */
/* -------------------------------------------------------------------------- */

export function createLocationHeader(location: string | URL): {
  readonly name: "Location";
  readonly value: string;
} {
  return {
    name: "Location",
    value: validateLocation(location),
  };
}

export function getLocationHeader(
  headers: Headers | Readonly<Record<string, string>>,
): string | undefined {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get("location") ?? undefined;
  }

  const record = headers as Readonly<Record<string, string>>;

  const key = Object.keys(record).find(
    (name) => name.toLowerCase() === "location",
  );

  return key ? record[key] : undefined;
}

/* -------------------------------------------------------------------------- */
/* URL Normalization                                                          */
/* -------------------------------------------------------------------------- */

function normalizeURL(value: string | URL): URL {
  if (value instanceof URL) {
    return new URL(value.href);
  }

  return new URL(value);
}

function getEffectivePort(url: URL): string {
  if (url.port) {
    return url.port;
  }

  if (url.protocol === "https:") {
    return "443";
  }

  if (url.protocol === "http:") {
    return "80";
  }

  return "";
}
