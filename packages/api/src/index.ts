/**
 * @zudo/api
 *
 * Application-facing API layer for the Zudo framework.
 *
 * Provides transport-agnostic operation definitions, execution context,
 * interceptors, policies, and result types.
 *
 * @example
 * ```ts
 * import { defineOperation, APIOperationRegistry, APIExecutor } from "@zudo/api";
 *
 * const getUser = defineOperation({
 *   name: "users.get",
 *   input: GetUserSchema,
 *   output: UserSchema,
 *   handler: async (input, context) => {
 *     return userService.findById(input.id);
 *   },
 * });
 *
 * const registry = new APIOperationRegistry();
 * registry.register(getUser);
 *
 * const executor = new APIExecutor();
 * const result = await executor.execute(getUser, { id: "123" }, context);
 * ```
 */

// Result types
export type {
  APISuccess,
  APIFailure,
  APIResult,
} from "./api/result/apiResult.type.js";

export {
  apiSuccess,
  apiFailure,
  isApiSuccess,
  isApiFailure,
} from "./api/result/apiResult.type.js";

// Errors
export type { APIErrorOptions } from "./api/errors/index.js";

export {
  APIError,
  APIValidationError,
  APIAuthenticationError,
  APIAuthorizationError,
  APINotFoundError,
  APIConflictError,
  APIRateLimitError,
  APITimeoutError,
  APIUnavailableError,
  APIInternalError,
  APIVersionError,
  APIOperationNotFoundError,
  APIDuplicateOperationError,
  APIIdempotencyError,
  createAPIError,
  isAPIError,
} from "./api/errors/index.js";

// Constants
export {
  DEFAULT_OPERATION_TIMEOUT,
  MAX_INTERCEPTORS,
  MAX_POLICIES,
} from "./api/constants.js";

// Context
export type { APIContext, APIContextKey } from "./api/context/context.type.js";

export {
  createAPIContext,
  RequestIdContextKey,
  CorrelationIdContextKey,
  TenantIdContextKey,
  UserIdContextKey,
  StartTimeContextKey,
} from "./api/context/context.type.js";

// Handler
export type { APIHandler } from "./api/handler/handler.type.js";

// Operation
export type {
  APIOperation,
  APIOperationMetadata,
  DefineOperationOptions,
} from "./api/operation/operation.type.js";

export { defineOperation } from "./api/operation/operation.type.js";

// Registry
export { APIOperationRegistry } from "./api/registry/index.js";

// Interceptors
export type {
  APIInterceptor,
  APIExecutionContext,
} from "./api/interceptors/interceptor.type.js";

export { createNoopInterceptor } from "./api/interceptors/interceptor.type.js";

// Executor
export { APIExecutor, normalizeAPIError } from "./api/executor/index.js";
