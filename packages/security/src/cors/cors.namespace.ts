/**
 * @oyinlola141/lattice-security — CORS Namespace
 *
 * Convenience namespace for CORS utilities.
 */

import {
  isOriginAllowed,
  generatePreflightHeaders,
  generateSimpleHeaders,
  isMethodAllowed,
  getDisallowedHeaders,
} from "./cors.core.js";

export type { CorsHeaders } from "./cors.core.js";

export const cors = {
  isOriginAllowed,
  generatePreflightHeaders,
  generateSimpleHeaders,
  isMethodAllowed,
  getDisallowedHeaders,
};
