/**
 * Accept header parsing and matching.
 *
 * Handles content type negotiation for the HTTP Accept header,
 * including wildcard matching and structured syntax suffix support.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  parseNegotiationHeader,
} from "./httpNegotiation.parsing.js";

import {
  normalizeMediaType,
  splitMediaType,
} from "./httpNegotiation.mediaType.js";

import {
  negotiate,
} from "./httpNegotiation.negotiate.js";

export function parseAccept(
  header:
    | string
    | undefined
    | null,
): NegotiationPreference[] {
  return parseNegotiationHeader(
    header,
  );
}

export function matchesAccept(
  accepted: string,
  available: string,
): boolean {
  const left =
    normalizeMediaType(
      accepted,
    );

  const right =
    normalizeMediaType(
      available,
    );

  if (
    left ===
    right
  ) {
    return true;
  }

  const leftParts =
    splitMediaType(left);

  const rightParts =
    splitMediaType(right);

  if (
    !leftParts ||
    !rightParts
  ) {
    return false;
  }

  const [
    leftType,
    leftSubtype,
  ] = leftParts;

  const [
    rightType,
    rightSubtype,
  ] = rightParts;

  if (
    leftType === "*" &&
    leftSubtype === "*"
  ) {
    return true;
  }

  if (
    leftType !== "*" &&
    leftType !== rightType
  ) {
    return false;
  }

  if (
    leftSubtype === "*"
  ) {
    return true;
  }

  if (
    leftSubtype === rightSubtype
  ) {
    return true;
  }

  if (
    leftSubtype.startsWith(
      "*+",
    )
  ) {
    return rightSubtype.endsWith(
      leftSubtype.slice(1),
    );
  }

  return false;
}

export function negotiateAccept(
  header:
    | string
    | undefined
    | null,
  available: readonly string[],
): string | undefined {
  return negotiate(
    parseAccept(header),
    available,
    matchesAccept,
  );
}
