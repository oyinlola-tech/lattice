/**
 * Spy utilities.
 *
 * Wraps existing functions to record calls while preserving behavior.
 */

/**
 * A spy that wraps an existing function.
 */
export interface SpyFn<TArgs extends readonly unknown[] = unknown[], TResult = unknown> {
  (...args: TArgs): TResult;
  readonly original: (...args: TArgs) => TResult;
  readonly calls: readonly TArgs[];
  readonly results: readonly TResult[];
  readonly callCount: number;
  restore: () => void;
}

/**
 * Creates a spy that wraps an existing function.
 *
 * @param fn - The function to spy on.
 * @returns A SpyFn instance.
 *
 * @example
 * ```ts
 * const original = (a: number, b: number) => a + b;
 * const spy = createSpyFn(original);
 *
 * expect(spy(1, 2)).toBe(3);
 * expect(spy.calls).toHaveLength(1);
 * expect(spy.calls[0]).toEqual([1, 2]);
 *
 * spy.restore();
 * ```
 */
export function createSpyFn<
  TArgs extends readonly unknown[] = unknown[],
  TResult = unknown,
>(fn: (...args: TArgs) => TResult): SpyFn<TArgs, TResult> {
  const calls: TArgs[] = [];
  const results: TResult[] = [];

  const spy = ((...args: TArgs): TResult => {
    calls.push(args);
    const result = fn(...args);
    results.push(result);
    return result;
  }) as SpyFn<TArgs, TResult>;

  Object.defineProperty(spy, "original", {
    value: fn,
    writable: false,
    enumerable: true,
  });

  Object.defineProperty(spy, "calls", {
    get: () => calls,
    enumerable: true,
  });

  Object.defineProperty(spy, "results", {
    get: () => results,
    enumerable: true,
  });

  Object.defineProperty(spy, "callCount", {
    get: () => calls.length,
    enumerable: true,
  });

  spy.restore = (): void => {
    calls.length = 0;
    results.length = 0;
  };

  return spy;
}

/**
 * A spy that wraps an object method.
 */
export interface SpyMethod<TObj, TMethod extends keyof TObj> {
  readonly object: TObj;
  readonly property: TMethod;
  readonly calls: readonly unknown[][];
  readonly callCount: number;
  restore: () => void;
}

/**
 * Creates a spy on an object method.
 *
 * @param object - The object containing the method.
 * @param property - The method name to spy on.
 * @returns A SpyMethod instance.
 *
 * @example
 * ```ts
 * const service = { save: (data: unknown) => ({ ...data, saved: true }) };
 * const spy = createSpyMethod(service, "save");
 *
 * service.save({ id: "123" });
 *
 * expect(spy.calls).toHaveLength(1);
 *
 * spy.restore();
 * ```
 */
export function createSpyMethod<TObj, TMethod extends keyof TObj>(
  object: TObj,
  property: TMethod,
): SpyMethod<TObj, TMethod> {
  const original = object[property] as unknown;
  const calls: unknown[][] = [];

  if (typeof original !== "function") {
    throw new TypeError(`Property "${String(property)}" is not a function.`);
  }

  const originalFn = original as (...args: unknown[]) => unknown;

  (object as Record<string | symbol, unknown>)[property as string] = (
    (...args: unknown[]) => {
      calls.push(args);
      return originalFn(...args);
    }
  ) as unknown as TMethod;

  return {
    object,
    property,
    calls,
    get callCount(): number {
      return calls.length;
    },
    restore: (): void => {
      (object as Record<string | symbol, unknown>)[property as string] = original;
      calls.length = 0;
    },
  };
}
