/**
 * HTTP content negotiation utilities.
 *
 * Implements parsing and matching for common HTTP negotiation headers:
 *
 *   Accept
 *   Accept-Encoding
 *   Accept-Language
 *   Accept-Charset
 *
 * The implementation intentionally keeps the API framework agnostic so it can
 * be used by both the HTTP server and HTTP client layers.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface NegotiationPreference {
  readonly value: string;
  readonly quality: number;
  readonly parameters: Readonly<Record<string, string>>;
  readonly specificity: number;
  readonly order: number;
}

export interface NegotiationMatch<T = string> {
  readonly value: T;
  readonly preference: NegotiationPreference;
  readonly score: number;
}

export interface NegotiationOptions {
  readonly defaultQuality?: number;
  readonly caseSensitive?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const DEFAULT_NEGOTIATION_QUALITY = 1;

export const MIN_NEGOTIATION_QUALITY = 0;

export const MAX_NEGOTIATION_QUALITY = 1;

/* -------------------------------------------------------------------------- */
/* Generic Parsing                                                            */
/* -------------------------------------------------------------------------- */

export function parseNegotiationHeader(
  header: string | undefined | null,
): NegotiationPreference[] {
  if (header === undefined || header === null || header.trim().length === 0) {
    return [];
  }

  return header
    .split(",")
    .map((part, index) => parsePreference(part, index))
    .filter((preference) => preference.value.length > 0)
    .sort(comparePreferences);
}

export function parsePreference(
  value: string,
  order = 0,
): NegotiationPreference {
  const parts = splitParameters(value);

  const token = parts.shift()?.trim() ?? "";

  const parameters: Record<string, string> = {};

  let quality = DEFAULT_NEGOTIATION_QUALITY;

  for (const parameter of parts) {
    const separator = parameter.indexOf("=");

    if (separator === -1) {
      const key = parameter.trim().toLowerCase();

      if (key.length > 0) {
        parameters[key] = "";
      }

      continue;
    }

    const key = parameter.slice(0, separator).trim().toLowerCase();

    const rawValue = parameter.slice(separator + 1).trim();

    const parsedValue = unquote(rawValue);

    if (key === "q") {
      quality = parseQuality(parsedValue);
      continue;
    }

    if (key.length > 0) {
      parameters[key] = parsedValue;
    }
  }

  return {
    value: unquote(token),
    quality,
    parameters,
    specificity: calculateSpecificity(token, parameters),
    order,
  };
}

/* -------------------------------------------------------------------------- */
/* Quality                                                                    */
/* -------------------------------------------------------------------------- */

export function parseQuality(value: string): number {
  const normalized = value.trim();

  if (normalized === "") {
    return 0;
  }

  const quality = Number(normalized);

  if (!Number.isFinite(quality)) {
    return 0;
  }

  return clamp(quality, MIN_NEGOTIATION_QUALITY, MAX_NEGOTIATION_QUALITY);
}

export function formatQuality(quality: number): string {
  const normalized = clamp(
    quality,
    MIN_NEGOTIATION_QUALITY,
    MAX_NEGOTIATION_QUALITY,
  );

  if (normalized === 1) {
    return "1";
  }

  if (normalized === 0) {
    return "0";
  }

  return normalized.toFixed(3).replace(/0+$/, "");
}

export function isAcceptableQuality(quality: number): boolean {
  return Number.isFinite(quality) && quality > 0;
}

/* -------------------------------------------------------------------------- */
/* Preference Sorting                                                          */
/* -------------------------------------------------------------------------- */

export function comparePreferences(
  left: NegotiationPreference,
  right: NegotiationPreference,
): number {
  if (left.quality !== right.quality) {
    return right.quality - left.quality;
  }

  if (left.specificity !== right.specificity) {
    return right.specificity - left.specificity;
  }

  return left.order - right.order;
}

export function sortPreferences(
  preferences: readonly NegotiationPreference[],
): NegotiationPreference[] {
  return [...preferences].sort(comparePreferences);
}

/* -------------------------------------------------------------------------- */
/* Accept                                                                     */
/* -------------------------------------------------------------------------- */

export function parseAccept(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesAccept(accepted: string, available: string): boolean {
  const left = normalizeMediaType(accepted);

  const right = normalizeMediaType(available);

  if (left === right) {
    return true;
  }

  const leftParts = splitMediaType(left);

  const rightParts = splitMediaType(right);

  if (!leftParts || !rightParts) {
    return false;
  }

  const [leftType, leftSubtype] = leftParts;

  const [rightType, rightSubtype] = rightParts;

  if (leftType === "*" && leftSubtype === "*") {
    return true;
  }

  if (leftType !== "*" && leftType !== rightType) {
    return false;
  }

  if (leftSubtype === "*") {
    return true;
  }

  if (leftSubtype === rightSubtype) {
    return true;
  }

  /*
   * Structured syntax suffix wildcard:
   *
   * application/*+json
   */
  if (leftSubtype.startsWith("*+")) {
    return rightSubtype.endsWith(leftSubtype.slice(1));
  }

  return false;
}

export function negotiateAccept(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  return negotiate(parseAccept(header), available, matchesAccept);
}

/* -------------------------------------------------------------------------- */
/* Accept-Encoding                                                            */
/* -------------------------------------------------------------------------- */

export function parseAcceptEncoding(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesEncoding(accepted: string, available: string): boolean {
  const left = normalizeToken(accepted);

  const right = normalizeToken(available);

  return left === "*" || left === right;
}

export function negotiateEncoding(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  const preferences = parseAcceptEncoding(header);

  if (preferences.length === 0) {
    return available[0];
  }

  return negotiate(preferences, available, matchesEncoding);
}

export function getEncodingQuality(
  header: string | undefined | null,
  encoding: string,
): number {
  const preferences = parseAcceptEncoding(header);

  if (preferences.length === 0) {
    return 1;
  }

  return getPreferenceQuality(preferences, encoding, matchesEncoding);
}

/* -------------------------------------------------------------------------- */
/* Accept-Language                                                            */
/* -------------------------------------------------------------------------- */

export function parseAcceptLanguage(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesLanguage(accepted: string, available: string): boolean {
  const left = normalizeLanguageTag(accepted);

  const right = normalizeLanguageTag(available);

  if (left === "*" || left === right) {
    return true;
  }

  /*
   * RFC-style basic language range matching:
   *
   * en matches en-US
   * en-US matches en-US
   * en-US does not match en-GB
   */
  return right.startsWith(`${left}-`);
}

export function negotiateLanguage(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  return negotiate(parseAcceptLanguage(header), available, matchesLanguage);
}

export function getLanguageQuality(
  header: string | undefined | null,
  language: string,
): number {
  const preferences = parseAcceptLanguage(header);

  if (preferences.length === 0) {
    return 1;
  }

  return getPreferenceQuality(preferences, language, matchesLanguage);
}

/* -------------------------------------------------------------------------- */
/* Accept-Charset                                                             */
/* -------------------------------------------------------------------------- */

export function parseAcceptCharset(
  header: string | undefined | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(header);
}

export function matchesCharset(accepted: string, available: string): boolean {
  const left = normalizeToken(accepted);

  const right = normalizeToken(available);

  return left === "*" || left === right;
}

export function negotiateCharset(
  header: string | undefined | null,
  available: readonly string[],
): string | undefined {
  return negotiate(parseAcceptCharset(header), available, matchesCharset);
}

/* -------------------------------------------------------------------------- */
/* Generic Negotiation                                                        */
/* -------------------------------------------------------------------------- */

export function negotiate<T>(
  preferences: readonly NegotiationPreference[],
  available: readonly T[],
  matcher: (accepted: string, available: T) => boolean,
): T | undefined {
  if (available.length === 0) {
    return undefined;
  }

  const sorted = sortPreferences(preferences);

  for (const preference of sorted) {
    if (!isAcceptableQuality(preference.quality)) {
      continue;
    }

    for (const candidate of available) {
      if (matcher(preference.value, candidate)) {
        return candidate;
      }
    }
  }

  return undefined;
}

export function getPreferenceQuality<T>(
  preferences: readonly NegotiationPreference[],
  value: T,
  matcher: (accepted: string, available: T) => boolean,
): number {
  let best: NegotiationPreference | undefined;

  for (const preference of preferences) {
    if (matcher(preference.value, value)) {
      if (
        !best ||
        preference.quality > best.quality ||
        (preference.quality === best.quality &&
          preference.specificity > best.specificity)
      ) {
        best = preference;
      }
    }
  }

  return best?.quality ?? 0;
}

/* -------------------------------------------------------------------------- */
/* Media Type Helpers                                                         */
/* -------------------------------------------------------------------------- */

export function normalizeMediaType(value: string): string {
  return value.trim().split(";", 1)[0].trim().toLowerCase();
}

export function splitMediaType(value: string): [string, string] | undefined {
  const normalized = normalizeMediaType(value);

  const separator = normalized.indexOf("/");

  if (separator <= 0 || separator === normalized.length - 1) {
    return undefined;
  }

  return [normalized.slice(0, separator), normalized.slice(separator + 1)];
}

export function mediaTypeSpecificity(value: string): number {
  const parts = splitMediaType(value);

  if (!parts) {
    return 0;
  }

  const [type, subtype] = parts;

  if (type === "*" && subtype === "*") {
    return 0;
  }

  if (subtype === "*") {
    return 1;
  }

  if (subtype.startsWith("*+")) {
    return 2;
  }

  return 3;
}

/* -------------------------------------------------------------------------- */
/* Language Helpers                                                           */
/* -------------------------------------------------------------------------- */

export function normalizeLanguageTag(value: string): string {
  return value.trim().replace(/_/g, "-").toLowerCase();
}

export function languageSpecificity(value: string): number {
  const normalized = normalizeLanguageTag(value);

  if (normalized === "*") {
    return 0;
  }

  return normalized.split("-").filter(Boolean).length;
}

/* -------------------------------------------------------------------------- */
/* Encoding Helpers                                                           */
/* -------------------------------------------------------------------------- */

export function normalizeEncoding(value: string): string {
  return normalizeToken(value);
}

export function isIdentityEncoding(value: string): boolean {
  return normalizeEncoding(value) === "identity";
}

export function isWildcardEncoding(value: string): boolean {
  return normalizeEncoding(value) === "*";
}

/* -------------------------------------------------------------------------- */
/* Preference Construction                                                    */
/* -------------------------------------------------------------------------- */

export function createPreference(
  value: string,
  options: {
    readonly quality?: number;
    readonly parameters?: Readonly<Record<string, string>>;
    readonly order?: number;
    readonly specificity?: number;
  } = {},
): NegotiationPreference {
  const parameters = options.parameters ?? {};

  return {
    value: value.trim(),
    quality: options.quality ?? DEFAULT_NEGOTIATION_QUALITY,
    parameters,
    specificity: options.specificity ?? calculateSpecificity(value, parameters),
    order: options.order ?? 0,
  };
}

/* -------------------------------------------------------------------------- */
/* Header Formatting                                                          */
/* -------------------------------------------------------------------------- */

export function formatNegotiationPreferences(
  preferences: readonly NegotiationPreference[],
): string {
  return preferences.map(formatPreference).join(", ");
}

export function formatPreference(preference: NegotiationPreference): string {
  const parameters = Object.entries(preference.parameters).map(
    ([key, value]) => `${key}=${quoteIfNeeded(value)}`,
  );

  if (preference.quality !== DEFAULT_NEGOTIATION_QUALITY) {
    parameters.push(`q=${formatQuality(preference.quality)}`);
  }

  return [preference.value, ...parameters].join("; ");
}

/* -------------------------------------------------------------------------- */
/* Internal Helpers                                                           */
/* -------------------------------------------------------------------------- */

function calculateSpecificity(
  value: string,
  parameters: Readonly<Record<string, string>>,
): number {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("/")) {
    return mediaTypeSpecificity(normalized) + Object.keys(parameters).length;
  }

  if (normalized.includes("-")) {
    return languageSpecificity(normalized) + Object.keys(parameters).length;
  }

  return (normalized === "*" ? 0 : 1) + Object.keys(parameters).length;
}

function splitParameters(value: string): string[] {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;

  for (const character of value) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      current += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      current += character;
      continue;
    }

    if (character === ";" && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);

  return result;
}

function unquote(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return trimmed;
}

function quoteIfNeeded(value: string): string {
  if (/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
