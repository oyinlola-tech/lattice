/**
 * Represents a generic operation that can be executed by Zudolib.
 *
 * A handler receives an input and produces an output.
 *
 * Examples:
 *
 * HTTP request      → HTTP response
 * Command           → Command result
 * Query             → Query result
 * Job               → Job result
 * Message           → Processing result
 * Event             → void
 */
export interface Handler<TInput = unknown, TOutput = unknown> {
  /**
   * Executes the handler.
   */
  handle(input: TInput): Promise<TOutput> | TOutput;
}

/**
 * A function-based handler.
 *
 * Useful when creating lightweight handlers without
 * defining a class.
 */
export type HandlerFunction<TInput = unknown, TOutput = unknown> = (
  input: TInput,
) => Promise<TOutput> | TOutput;

/**
 * Converts a handler function into a Handler object.
 */
export function createHandler<TInput, TOutput>(
  handler: HandlerFunction<TInput, TOutput>,
): Handler<TInput, TOutput> {
  return {
    handle: handler,
  };
}
