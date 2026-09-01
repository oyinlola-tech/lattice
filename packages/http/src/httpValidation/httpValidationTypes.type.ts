/**
 * HTTP validation types.
 *
 * Shared result types used across all HTTP validation modules.
 */

export interface HTTPValidationResult {
  readonly valid: boolean;
  readonly value?: string;
  readonly reason?: string;
}

export interface HTTPHeaderValidationResult extends HTTPValidationResult {
  readonly name?: string;
  readonly headerValue?: string;
}
