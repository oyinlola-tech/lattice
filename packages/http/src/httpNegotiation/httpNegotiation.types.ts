/**
 * HTTP content negotiation types and constants.
 *
 * Core type definitions and quality bounds used across all
 * negotiation modules (Accept, Accept-Encoding, Accept-Language,
 * Accept-Charset).
 */

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

export const DEFAULT_NEGOTIATION_QUALITY = 1;

export const MIN_NEGOTIATION_QUALITY = 0;

export const MAX_NEGOTIATION_QUALITY = 1;
