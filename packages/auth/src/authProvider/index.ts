/**
 * Main auth service: login, token verification, RBAC checks.
 *
 * @module authProvider
 */

export {
  createAuthService,
  type AuthServiceConfig,
  type LoginResult,
  type UserLookup,
  type PasswordVerifier,
} from "./authProvider.core.js";
