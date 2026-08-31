/**
 * Predefined CSP policies.
 */

import type { CSPResult } from '../types/httpCsp.type.js';
import { createCSP } from '../formatting/httpCsp.formatting.js';

export function strictCSP(): CSPResult {
  return createCSP({
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: true,
  });
}

export function apiCSP(): CSPResult {
  return createCSP({
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"],
  });
}

export function browserCSP(
  nonce: string | undefined,
): CSPResult {
  const scriptSrc = nonce
    ? ["'self'", `'nonce-${nonce}'`]
    : ["'self'"];

  return createCSP({
    defaultSrc: ["'self'"],
    scriptSrc,
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'", "https:", "data:"],
    connectSrc: ["'self'", "https:"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: true,
  });
}
