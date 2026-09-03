/**
 * @zudoliblib/security — CORS Barrel
 */

export type { CorsHeaders } from "./cors.core.js";
export {
  isOriginAllowed,
  generatePreflightHeaders,
  generateSimpleHeaders,
  isMethodAllowed,
  getDisallowedHeaders,
} from "./cors.core.js";
