/**
 * Core authentication and authorization types for Lattice.
 *
 * This module intentionally contains contracts and domain types only.
 * Runtime authentication logic belongs in the appropriate auth services.
 */

/**
 * Supported authentication providers.
 */
export type AuthProvider =
  | "password"
  | "google"
  | "apple";

/**
 * Supported account types.
 */
export type AccountType =
  | "student"
  | "teacher"
  | "school-admin"
  | "admin"
  | "super-admin";

/**
 * Authentication session status.
 */
export type SessionStatus =
  | "active"
  | "revoked"
  | "expired";

/**
 * Verification purpose.
 */
export type VerificationPurpose =
  | "email-verification"
  | "phone-verification"
  | "login"
  | "password-reset"
  | "password-change"
  | "account-recovery"
  | "two-factor";

/**
 * Supported one-time-password delivery channels.
 */
export type OtpChannel =
  | "email"
  | "sms"
  | "authenticator";

/**
 * Multi-factor authentication methods.
 */
export type MfaMethod =
  | "totp"
  | "sms"
  | "email"
  | "recovery-code";

/**
 * Password reset token status.
 */
export type PasswordResetStatus =
  | "pending"
  | "used"
  | "expired"
  | "revoked";

/**
 * OAuth account information.
 */
export interface OAuthAccount {
  readonly provider: Exclude<
    AuthProvider,
    "password"
  >;
  readonly providerAccountId: string;
  readonly email?: string;
  readonly emailVerified?: boolean;
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresAt?: Date;
}

/**
 * Basic authenticated user identity.
 */
export interface AuthIdentity {
  readonly userId: string;
  readonly accountType: AccountType;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly provider: AuthProvider;
}

/**
 * Authentication credentials.
 */
export interface PasswordCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Registration data.
 */
export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly birthday: Date;
  readonly accountType: AccountType;
  readonly phoneNumber?: string;
  readonly studentId?: string;
  readonly schoolId?: string;
}

/**
 * Login input.
 */
export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

/**
 * OAuth authentication input.
 */
export interface OAuthLoginInput {
  readonly provider: Exclude<
    AuthProvider,
    "password"
  >;
  readonly authorizationCode?: string;
  readonly idToken?: string;
  readonly redirectUri?: string;
  readonly state?: string;
  readonly codeVerifier?: string;
}

/**
 * Password reset request.
 */
export interface ForgotPasswordInput {
  readonly email: string;
}

/**
 * OTP verification request.
 */
export interface VerifyOtpInput {
  readonly userId?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly code: string;
  readonly purpose: VerificationPurpose;
}

/**
 * OTP generation request.
 */
export interface SendOtpInput {
  readonly userId?: string;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly purpose: VerificationPurpose;
  readonly channel: OtpChannel;
}

/**
 * Reset password input.
 */
export interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
}

/**
 * Change password input.
 */
export interface ChangePasswordInput {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
}

/**
 * Authentication token pair.
 */
export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly tokenType: "Bearer";
  readonly expiresIn: number;
  readonly refreshExpiresIn?: number;
}

/**
 * Authentication response.
 */
export interface AuthResponse {
  readonly user: AuthIdentity;
  readonly tokens: AuthTokens;
  readonly session: AuthSession;
}

/**
 * Authentication session.
 */
export interface AuthSession {
  readonly id: string;
  readonly userId: string;
  readonly status: SessionStatus;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly lastActivityAt?: Date;
  readonly revokedAt?: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly deviceId?: string;
}

/**
 * Session creation data.
 */
export interface CreateSessionInput {
  readonly userId: string;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly deviceId?: string;
}

/**
 * Refresh-token input.
 */
export interface RefreshTokenInput {
  readonly refreshToken: string;
}

/**
 * Logout input.
 */
export interface LogoutInput {
  readonly sessionId: string;
  readonly userId: string;
  readonly allSessions?: boolean;
}

/**
 * OTP record.
 */
export interface OtpRecord {
  readonly id: string;
  readonly userId?: string;
  readonly destination: string;
  readonly channel: OtpChannel;
  readonly purpose: VerificationPurpose;
  readonly codeHash: string;
  readonly expiresAt: Date;
  readonly consumedAt?: Date;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly createdAt: Date;
}

/**
 * Password reset record.
 */
export interface PasswordResetToken {
  readonly id: string;
  readonly userId: string;
  readonly tokenHash: string;
  readonly status: PasswordResetStatus;
  readonly expiresAt: Date;
  readonly usedAt?: Date;
  readonly revokedAt?: Date;
  readonly createdAt: Date;
}

/**
 * MFA configuration.
 */
export interface MfaConfiguration {
  readonly enabled: boolean;
  readonly methods: readonly MfaMethod[];
  readonly preferredMethod?: MfaMethod;
  readonly configuredAt?: Date;
}

/**
 * Authentication request context.
 */
export interface AuthRequestContext {
  readonly requestId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly deviceId?: string;
}

/**
 * Authorization subject.
 */
export interface AuthorizationSubject {
  readonly userId: string;
  readonly accountType: AccountType;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

/**
 * Authorization resource.
 */
export interface AuthorizationResource {
  readonly type: string;
  readonly id?: string;
}

/**
 * Authorization action.
 */
export type AuthorizationAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "execute";

/**
 * Authorization decision.
 */
export interface AuthorizationDecision {
  readonly allowed: boolean;
  readonly reason?: string;
}

/**
 * Authentication configuration.
 */
export interface AuthConfig {
  readonly accessTokenSecret: string;
  readonly accessTokenExpiresIn: number;
  readonly refreshTokenSecret?: string;
  readonly refreshTokenExpiresIn?: number;
  readonly passwordResetExpiresIn: number;
  readonly otpExpiresIn: number;
  readonly otpMaxAttempts: number;
  readonly sessionExpiresIn: number;
  readonly issuer?: string;
  readonly audience?: string;
}

/**
 * Password policy.
 */
export interface PasswordPolicy {
  readonly minLength: number;
  readonly maxLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumber: boolean;
  readonly requireSpecialCharacter: boolean;
  readonly preventCommonPasswords: boolean;
  readonly preventPasswordReuse: number;
}

/**
 * Authentication event metadata.
 */
export interface AuthEventMetadata {
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly deviceId?: string;
  readonly provider?: AuthProvider;
}

/**
 * Authentication audit event.
 */
export interface AuthAuditEvent {
  readonly type: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly metadata?: AuthEventMetadata;
  readonly occurredAt: Date;
}

/**
 * OAuth provider profile.
 */
export interface OAuthProfile {
  readonly provider: Exclude<
    AuthProvider,
    "password"
  >;
  readonly providerAccountId: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly avatarUrl?: string;
}

/**
 * Authenticated request state.
 */
export interface AuthenticatedRequest {
  readonly identity: AuthIdentity;
  readonly session: AuthSession;
}

/**
 * Auth service result.
 */
export interface AuthServiceResult<
  T,
> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

/**
 * Checks whether a value is a supported authentication provider.
 */
export function isAuthProvider(
  value: unknown,
): value is AuthProvider {
  return (
    value === "password" ||
    value === "google" ||
    value === "apple"
  );
}

/**
 * Checks whether a value is a supported account type.
 */
export function isAccountType(
  value: unknown,
): value is AccountType {
  return (
    value === "student" ||
    value === "teacher" ||
    value === "school-admin" ||
    value === "admin" ||
    value === "super-admin"
  );
}

/**
 * Checks whether a value is a supported verification purpose.
 */
export function isVerificationPurpose(
  value: unknown,
): value is VerificationPurpose {
  return (
    value ===
      "email-verification" ||
    value ===
      "phone-verification" ||
    value === "login" ||
    value ===
      "password-reset" ||
    value ===
      "password-change" ||
    value ===
      "account-recovery" ||
    value === "two-factor"
  );
}

/**
 * Checks whether a value is a supported OTP channel.
 */
export function isOtpChannel(
  value: unknown,
): value is OtpChannel {
  return (
    value === "email" ||
    value === "sms" ||
    value ===
      "authenticator"
  );
}

/**
 * Checks whether a value is a supported MFA method.
 */
export function isMfaMethod(
  value: unknown,
): value is MfaMethod {
  return (
    value === "totp" ||
    value === "sms" ||
    value === "email" ||
    value ===
      "recovery-code"
  );
}