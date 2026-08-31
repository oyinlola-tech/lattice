/**
 * Generic HTTP negotiation header parsing.
 *
 * Parses comma-separated preference lists with quality values
 * and parameters, used as the foundation for Accept, Accept-Encoding,
 * Accept-Language, and Accept-Charset header parsing.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  DEFAULT_NEGOTIATION_QUALITY,
} from "./httpNegotiation.types.js";

import {
  calculateSpecificity,
  splitParameters,
  unquote,
} from "./httpNegotiation.internal.js";

import {
  parseQuality,
} from "./httpNegotiation.quality.js";

import {
  comparePreferences,
} from "./httpNegotiation.sorting.js";

export function parseNegotiationHeader(
  header:
    | string
    | undefined
    | null,
): NegotiationPreference[] {
  if (
    header ===
      undefined ||
    header ===
      null ||
    header.trim().length ===
      0
  ) {
    return [];
  }

  return header
    .split(",")
    .map(
      (part, index) =>
        parsePreference(
          part,
          index,
        ),
    )
    .filter(
      (
        preference,
      ) => preference.value.length > 0,
    )
    .sort(comparePreferences);
}

export function parsePreference(
  value: string,
  order = 0,
): NegotiationPreference {
  const parts =
    splitParameters(value);

  const token =
    parts.shift()?.trim() ?? "";

  const parameters: Record<
    string,
    string
  > = {};

  let quality =
    DEFAULT_NEGOTIATION_QUALITY;

  for (const parameter of parts) {
    const separator =
      parameter.indexOf("=");

    if (separator === -1) {
      const key =
        parameter
          .trim()
          .toLowerCase();

      if (key.length > 0) {
        parameters[key] = "";
      }

      continue;
    }

    const key =
      parameter
        .slice(
          0,
          separator,
        )
        .trim()
        .toLowerCase();

    const rawValue =
      parameter
        .slice(
          separator + 1,
        )
        .trim();

    const parsedValue =
      unquote(rawValue);

    if (key === "q") {
      quality =
        parseQuality(
          parsedValue,
        );
      continue;
    }

    if (key.length > 0) {
      parameters[key] =
        parsedValue;
    }
  }

  return {
    value: unquote(token),
    quality,
    parameters,
    specificity: calculateSpecificity(
      token,
      parameters,
    ),
    order,
  };
}
