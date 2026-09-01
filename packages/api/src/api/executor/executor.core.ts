import type { APIContext } from "../context/context.type.js";

import type { APIResult } from "../result/apiResult.type.js";

import type { APIOperation } from "../operation/operation.type.js";

import type { APIInterceptor } from "../interceptors/interceptor.type.js";

/**
 * Execution context passed through the interceptor pipeline.
 */
export interface APIExecutionContext<TInput = unknown, TOutput = unknown> {
  readonly operation: APIOperation<TInput, TOutput>;

  readonly input: TInput;

  readonly context: APIContext;

  readonly result?: APIResult<TOutput>;
}

/**
 * Error normalizer for converting unknown errors into Error instances.
 */
export function normalizeAPIError(
  error: unknown,
  operationName?: string,
): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(
    `Unexpected non-error thrown in operation "${operationName}": ${String(error)}`,
  );
}

/**
 * Executes an API operation through its interceptor pipeline.
 */
export class APIExecutor {
  private readonly interceptors: readonly APIInterceptor[];

  constructor(interceptors: readonly APIInterceptor[] = []) {
    this.interceptors = Object.freeze([...interceptors]);
  }

  /**
   * Executes an operation with the given input and context.
   */
  async execute<TInput = unknown, TOutput = unknown>(
    operation: APIOperation<TInput, TOutput>,
    input: TInput,
    context: APIContext,
  ): Promise<APIResult<TOutput>> {
    const executionContext: APIExecutionContext<TInput, TOutput> = {
      operation,
      input,
      context,
    };

    const executeNext = async (): Promise<APIResult<TOutput>> => {
      try {
        const output = await operation.handler(input, context);
        return { ok: true, data: output } as APIResult<TOutput>;
      } catch (error) {
        return {
          ok: false,
          error: normalizeAPIError(error, operation.name),
        } as APIResult<TOutput>;
      }
    };

    return this.runPipeline(executionContext, executeNext);
  }

  /**
   * Runs the interceptor pipeline.
   */
  private async runPipeline<TInput, TOutput>(
    context: APIExecutionContext<TInput, TOutput>,
    next: () => Promise<APIResult<TOutput>>,
  ): Promise<APIResult<TOutput>> {
    const interceptors = this.interceptors;
    let index = 0;

    const runNext = async (): Promise<APIResult<unknown>> => {
      if (index >= interceptors.length) {
        return next();
      }

      const interceptor = interceptors[index];
      index += 1;

      if (!interceptor) {
        return next();
      }

      return interceptor.intercept(context, runNext);
    };

    const result = await runNext();
    return result as APIResult<TOutput>;
  }
}
