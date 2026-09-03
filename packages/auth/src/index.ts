/**
 * @zudo/auth
 *
 * Authentication and authorization services for the Zudo framework.
 *
 * Provides JWT token management (access + refresh), password hashing (scrypt),
 * session management, RBAC (role-based access control), and auth utilities.
 *
 * @module @zudo/auth
 */

export * from "./authTypes/index.js";
export * from "./authErrors/index.js";
export * from "./authPassword/index.js";
export * from "./authToken/index.js";
export { jwt } from "./authToken/jwt.namespace.js";
export * from "./authSession/index.js";
export * from "./authProvider/index.js";
export * from "./authUtils/index.js";
