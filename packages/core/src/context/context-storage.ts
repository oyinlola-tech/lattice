import { AsyncLocalStorage } from "node:async_hooks";

import type { ExecutionContext } from "./execution-context.js";

/**
 * Stores the current ExecutionContext across asynchronous
 * boundaries.
 *
 * This allows framework components to access the current
 * execution without explicitly passing the context through
 * every function call.
 */
export class ContextStorage {
  private readonly storage =
    new AsyncLocalStorage<ExecutionContext>();

  /**
   * Runs a function inside an execution context.
   *
   * The context is automatically available to all asynchronous
   * operations created within the callback.
   */
  public run<T>(
    context: ExecutionContext,
    callback: () => T,
  ): T {
    return this.storage.run(
      context,
      callback,
    );
  }

  /**
   * Returns the current execution context.
   *
   * Returns undefined when called outside a managed execution.
   */
  public get(): ExecutionContext | undefined {
    return this.storage.getStore();
  }

  /**
   * Returns the current execution context.
   *
   * Throws when no execution context is available.
   */
  public require(): ExecutionContext {
    const context = this.get();

    if (!context) {
      throw new Error(
        "No execution context is available.",
      );
    }

    return context;
  }

  /**
   * Checks whether an execution context is currently available.
   */
  public has(): boolean {
    return this.get() !== undefined;
  }

  /**
   * Executes a callback with a derived execution context.
   */
  public runWith<T>(
    context: ExecutionContext,
    callback: () => T,
  ): T {
    return this.run(context, callback);
  }

  /**
   * Executes a callback using the current context with
   * a temporary derived context.
   */
  public runDerived<T>(
    context: ExecutionContext,
    callback: () => T,
  ): T {
    return this.storage.run(
      context,
      callback,
    );
  }

  /**
   * Clears the current execution context by executing the
   * callback outside the current storage context.
   */
  public runWithoutContext<T>(
    callback: () => T,
  ): T {
    return this.storage.exit(callback);
  }
}

/**
 * Creates a ContextStorage instance.
 */
export function createContextStorage(): ContextStorage {
  return new ContextStorage();
}