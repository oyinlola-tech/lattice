/**
 * CSP policy check functions.
 */

import type { CSPDirectives } from '../types/httpCsp.type.js';
import { getCSPDirective, getEffectiveDirective } from '../parsing/httpCsp.parsing.js';
import { sourceMatchesHost } from '../internal/httpCsp.internal.js';
import { createNonceSource } from '../nonce/httpCsp.nonce.js';

export function allowsSource(
  policy: string | CSPDirectives,
  directive: string,
  source: string,
): boolean {
  const values = getCSPDirective(policy, directive);
  const normalized = source.trim();

  if (values.includes("'none'")) {
    return false;
  }

  if (values.includes("*")) {
    return true;
  }

  return values.some(
    (value) =>
      value === normalized ||
      sourceMatchesHost(value, normalized),
  );
}

export function allowsInlineScript(
  policy: string | CSPDirectives,
): boolean {
  const values = getEffectiveDirective(policy, "script-src");
  return values.includes("'unsafe-inline'");
}

export function allowsEval(
  policy: string | CSPDirectives,
): boolean {
  const values = getEffectiveDirective(policy, "script-src");
  return (
    values.includes("'unsafe-eval'") ||
    values.includes("'wasm-unsafe-eval'")
  );
}

export function allowsNonce(
  policy: string | CSPDirectives,
  nonce: string,
): boolean {
  const values = getEffectiveDirective(policy, "script-src");
  return values.includes(createNonceSource(nonce));
}
