/**
 * Core user type used across the auth system.
 *
 * @module authTypes/authUser
 */

import type { UserId } from "@zudolib/constants";

export type { UserId } from "@zudolib/constants";

/**
 * Authenticated user representation.
 */
export interface AuthUser {
  /** Unique identifier */
  readonly id: UserId;
  /** Email address */
  readonly email: string;
  /** Display name */
  readonly name?: string;
  /** Assigned roles */
  readonly roles: readonly string[];
  /** Custom claims */
  readonly claims?: Record<string, unknown>;
  /** Whether the user is active */
  readonly active: boolean;
  /** When the user was created */
  readonly createdAt: Date;
  /** When the user last logged in */
  readonly lastLoginAt?: Date;
}

/**
 * User credentials for login.
 */
export interface UserCredentials {
  /** User email or username */
  readonly identifier: string;
  /** Plain-text password (will be hashed for comparison) */
  readonly password: string;
}

/**
 * User registration input.
 */
export interface UserRegistration {
  readonly email: string;
  readonly password: string;
  readonly name?: string;
  readonly roles?: readonly string[];
}
