/**
 * Negotiation preference construction.
 *
 * Factory function for building NegotiationPreference objects
 * with optional quality, parameters, and specificity overrides.
 */

import type {
  NegotiationPreference,
} from "./httpNegotiation.types.js";

import {
  DEFAULT_NEGOTIATION_QUALITY,
} from "./httpNegotiation.types.js";

import {
  calculateSpecificity,
} from "./httpNegotiation.internal.js";

export function createPreference(
  value: string,
  options: {
    readonly quality?: number;
    readonly parameters?: Readonly<
      Record<string, string>
    >;
    readonly order?: number;
    readonly specificity?: number;
  } = {},
): NegotiationPreference {
  const parameters =
    options.parameters ??
    {};

  return {
    value:
      value.trim(),
    quality:
      options.quality ??
      DEFAULT_NEGOTIATION_QUALITY,
    parameters,
    specificity:
      options.specificity ??
      calculateSpecificity(
        value,
        parameters,
      ),
    order:
      options.order ?? 0,
  };
}
