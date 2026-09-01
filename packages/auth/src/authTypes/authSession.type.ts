/**
 * Session types and interfaces.
 *
 * @module authSession/authSession
 */

import type { UserId } from "../authTypes/authUser.type.js";
import type { SessionId } from "@oyinlola141/lattice-constants";

export type { SessionId } from "@oyinlola141/lattice-constants";

/**
 * Server-side session representation.
 */
export interface AuthSession {
  /** Unique session identifier */
  readonly id: SessionId;
  /** User who owns this session */
  readonly userId: UserId;
  /** Client user-agent string */
  readonly userAgent?: string;
  /** Client IP address */
  readonly ip?: string;
  /** Session creation time */
  readonly createdAt: Date;
  /** Last activity time */
  readonly lastActivityAt: Date;
  /** Session expiration time */
  readonly expiresAt: Date;
  /** Whether the session is active */
  readonly active: boolean;
  /** Session metadata */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Options for creating a session.
 */
export interface CreateSessionOptions {
  readonly userId: UserId;
  readonly userAgent?: string;
  readonly ip?: string;
  readonly ttlSeconds?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Session store interface.
 */
export interface SessionStore {
  /** Create a new session */
  create(options: CreateSessionOptions): Promise<AuthSession>;
  /** Get a session by ID */
  get(sessionId: SessionId): Promise<AuthSession | null>;
  /** Update session activity */
  touch(sessionId: SessionId): Promise<void>;
  /** Destroy a session */
  destroy(sessionId: SessionId): Promise<void>;
  /** Destroy all sessions for a user */
  destroyAllForUser(userId: UserId): Promise<void>;
}
