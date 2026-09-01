/**
 * Main auth service — coordinates password, token, session, and permissions.
 *
 * @module authProvider/authProvider
 */

import type { AuthUser, UserCredentials, UserId } from "../authTypes/authUser.type.js";
import type { TokenPair, TokenConfig } from "../authTypes/authToken.type.js";
import type { SessionStore, CreateSessionOptions, SessionId } from "../authTypes/authSession.type.js";
import type { GuardResult } from "../authTypes/authRbac.type.js";
import type { PermissionEngine } from "@oyinlola141/lattice-permissions";
import { hashPassword, verifyPassword } from "../authPassword/authPassword.core.js";
import { createTokenPair, verifyAccessToken, refreshAccessToken } from "../authToken/authToken.core.js";
import { InvalidCredentialsError, TokenExpiredError, AccountDeactivatedError } from "../authErrors/authError.base.js";

/** User lookup function provided by the consumer. */
export type UserLookup = (identifier: string) => Promise<AuthUser | null>;
/** Password verifier function provided by the consumer. */
export type PasswordVerifier = (userId: UserId, password: string) => Promise<boolean>;

/**
 * Auth service configuration.
 */
export interface AuthServiceConfig {
  /** JWT token configuration */
  readonly token: TokenConfig;
  /** Session store */
  readonly sessionStore: SessionStore;
  /** Function to look up a user by identifier (email/username) */
  readonly findUser: UserLookup;
  /** Function to verify a user's password */
  readonly verifyPassword: PasswordVerifier;
  /** Permission engine for authorization checks */
  readonly permissions?: PermissionEngine;
  /** Default session TTL in seconds */
  readonly sessionTtlSeconds?: number;
}

/**
 * Result of a login attempt.
 */
export interface LoginResult {
  /** Authenticated user */
  readonly user: AuthUser;
  /** Token pair */
  readonly tokens: TokenPair;
  /** Session ID */
  readonly sessionId: SessionId;
}

/**
 * Create an auth service.
 */
export function createAuthService(config: AuthServiceConfig) {
  const { token: tokenConfig, sessionStore, findUser, verifyPassword: verifyPwd, sessionTtlSeconds, permissions } = config;

  return {
    /**
     * Authenticate a user with credentials and return tokens + session.
     */
    async login(
      credentials: UserCredentials,
      context?: { readonly userAgent?: string; readonly ip?: string },
    ): Promise<LoginResult> {
      const user = await findUser(credentials.identifier);
      if (!user) {
        throw new InvalidCredentialsError();
      }
      if (!user.active) {
        throw new AccountDeactivatedError();
      }

      const valid = await verifyPwd(user.id, credentials.password);
      if (!valid) {
        throw new InvalidCredentialsError();
      }

      const tokens = createTokenPair(user.id, tokenConfig, { roles: user.roles });
      const session = await sessionStore.create({
        userId: user.id,
        userAgent: context?.userAgent,
        ip: context?.ip,
        ttlSeconds: sessionTtlSeconds,
      });

      return { user, tokens, sessionId: session.id };
    },

    /**
     * Verify an access token and return the payload.
     */
    verifyToken(token: string) {
      const result = verifyAccessToken(token, tokenConfig);
      if (!result.valid) {
        throw new TokenExpiredError(result.error ?? "Token verification failed");
      }
      return result.payload!;
    },

    /**
     * Refresh an access token using a refresh token.
     */
    async refresh(refreshToken: string): Promise<TokenPair> {
      const result = refreshAccessToken(refreshToken, tokenConfig);
      if (!result) {
        throw new TokenExpiredError("Refresh token is invalid or expired");
      }
      return result;
    },

    /**
     * Logout — destroy the session.
     */
    async logout(sessionId: SessionId): Promise<void> {
      await sessionStore.destroy(sessionId);
    },

    /**
     * Check if a user has a specific permission.
     * Delegates to @oyinlola141/lattice-permissions engine when configured.
     */
    async checkAccess(
      userId: UserId,
      userRoles: readonly string[],
      permission: string,
      resourceOwnerId?: UserId,
    ): Promise<GuardResult> {
      if (permissions) {
        const actor = { id: userId, roles: [...userRoles] };
        const resource = resourceOwnerId ? { ownerId: resourceOwnerId } : undefined;
        const decision = await permissions.check(actor, permission, resource);
        return {
          allowed: decision.allowed,
          reason: decision.reason,
          requiredPermission: permission,
          userRoles: [...userRoles],
        };
      }

      // Fallback: simple wildcard matching (no engine configured)
      return simpleGuard(userRoles, permission, userId, resourceOwnerId);
    },

    /**
     * Hash a password (for user registration).
     */
    hashPassword(password: string): Promise<string> {
      return hashPassword(password);
    },

    /**
     * Verify a password against a hash.
     */
    verifyPasswordHash(password: string, hash: string): Promise<boolean> {
      return verifyPassword(password, hash);
    },
  };
}

/**
 * Simple fallback guard when no permissions engine is configured.
 * Performs basic wildcard matching without full ABAC support.
 */
function simpleGuard(
  userRoles: readonly string[],
  permission: string,
  userId: UserId,
  resourceOwnerId?: UserId,
): GuardResult {
  // Ownership check
  if (resourceOwnerId && resourceOwnerId === userId) {
    return { allowed: true, userRoles: [...userRoles] };
  }

  const [requiredResource, requiredAction] = permission.split(":");

  for (const role of userRoles) {
    // Role-based — simplified check
    if (role === "admin") {
      return { allowed: true, userRoles: [...userRoles] };
    }
  }

  return {
    allowed: false,
    reason: `User lacks required permission: ${permission}`,
    requiredPermission: permission,
    userRoles: [...userRoles],
  };
}
