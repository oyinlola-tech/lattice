/**
 * Middleware pipeline execution logic.
 *
 * @module httpMiddleware/pipeline/execution
 */

import type {
  HttpMiddlewareContext,
  HttpMiddlewareErrorHandler,
  HttpMiddlewareState,
  InternalMiddleware,
} from "../httpMiddleware.type.js";

import type { HttpRequestContext as RequestContext } from "../../httpRequest/httpRequest.context.js";

import type { HttpResponseContext as ResponseContext } from "../../httpResponse/httpResponse.context.js";

import {
  HttpMiddlewareError,
  HttpMiddlewarePipelineError,
} from "../httpMiddleware.error.js";

import { normalizeResult } from "./httpPipeline.helper.js";

import { list } from "./httpPipeline.registration.js";

export interface PipelineExecutionOptions {
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly onError: HttpMiddlewareErrorHandler | undefined;
}

export async function executePipeline(
  entries: InternalMiddleware[],
  request: RequestContext,
  response: ResponseContext,
  options: {
    readonly state?: HttpMiddlewareState;
    readonly signal?: AbortSignal;
    readonly metadata?: Readonly<Record<string, unknown>>;
  } = {},
  pipelineOptions: PipelineExecutionOptions,
): Promise<ResponseContext> {
  const middlewares = list(entries);

  const context: HttpMiddlewareContext = {
    request,
    response,
    state: options.state ?? (new Map() as unknown as HttpMiddlewareState),
    signal: options.signal ?? new AbortController().signal,
    metadata: Object.freeze({
      ...pipelineOptions.metadata,
      ...(options.metadata ?? {}),
    }),
  };

  const errors: HttpMiddlewareError[] = [];

  const dispatch = async (index: number): Promise<ResponseContext> => {
    if (index >= middlewares.length) {
      return response;
    }

    const entry = middlewares[index];

    if (!entry) {
      return response;
    }

    try {
      const result = await entry.middleware(context, () => dispatch(index + 1));

      return normalizeResult(result, response);
    } catch (error) {
      const middlewareError = new HttpMiddlewareError(
        `Middleware "${entry.name}" threw an error.`,
        {
          middlewareId: entry.id,
          middlewareName: entry.name,
          cause: error,
        },
      );

      errors.push(middlewareError);

      if (pipelineOptions.onError) {
        try {
          const errorResult = await pipelineOptions.onError(error, context);

          return normalizeResult(errorResult, response);
        } catch {
          // Fall through to safe response
        }
      }

      return response;
    }
  };

  const result = await dispatch(0);

  if (errors.length > 0) {
    throw new HttpMiddlewarePipelineError(errors);
  }

  return result;
}
