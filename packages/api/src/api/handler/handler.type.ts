import type { APIContext } from "../context/context.type.js";

/**
 * Handler for an API operation.
 *
 * Receives validated input and the execution context,
 * and returns the operation output.
 */
export type APIHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: APIContext,
) => Promise<TOutput>;
