/**
 * Built-in tenant resolvers.
 *
 * @module resolvers
 */

export {
  createHeaderResolver,
  type HeaderResolverOptions,
} from "./headerResolver.core.js";
export {
  createSubdomainResolver,
  type SubdomainResolverOptions,
} from "./subdomainResolver.core.js";
export {
  createPathResolver,
  type PathResolverOptions,
} from "./pathResolver.core.js";
export {
  createJwtResolver,
  type JwtResolverOptions,
} from "./jwtResolver.core.js";
