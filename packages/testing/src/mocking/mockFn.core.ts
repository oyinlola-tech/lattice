/**
 * Mock function utilities.
 *
 * Creates mock functions that record calls and return configured values.
 */

/**
 * A mock function that records calls and returns configured values.
 */
export interface MockFn<
  TArgs extends readonly unknown[] = unknown[],
  TResult = unknown,
> {
  (...args: TArgs): TResult;
  readonly calls: readonly TArgs[];
  readonly results: readonly TResult[];
  readonly invoked: boolean;
  readonly callCount: number;
  mockReturnValue: (value: TResult) => void;
  mockResolvedValue: (value: TResult) => void;
  mockRejectedValue: (error: unknown) => void;
  mockImplementation: (fn: (...args: TArgs) => TResult) => void;
  mockReset: () => void;
  mockClear: () => void;
}

/**
 * Creates a mock function.
 *
 * @param defaultReturnValue - Optional default return value.
 * @returns A MockFn instance.
 *
 * @example
 * ```ts
 * const mockFn = createMockFn<string[], void>();
 *
 * mockFn("hello", "world");
 *
 * expect(mockFn.calls).toHaveLength(1);
 * expect(mockFn.calls[0]).toEqual(["hello", "world"]);
 * expect(mockFn.callCount).toBe(1);
 * ```
 */
export function createMockFn<
  TArgs extends readonly unknown[] = unknown[],
  TResult = unknown,
>(defaultReturnValue?: TResult): MockFn<TArgs, TResult> {
  const calls: TArgs[] = [];
  const results: TResult[] = [];
  let implementation: ((...args: TArgs) => TResult) | undefined;
  let returnValue: TResult | undefined = defaultReturnValue;
  let resolvedValue: TResult | undefined;
  let rejectedValue: unknown;
  let shouldReject = false;

  const mock = ((...args: TArgs): TResult => {
    calls.push(args);

    if (shouldReject) {
      throw rejectedValue;
    }

    if (resolvedValue !== undefined) {
      results.push(resolvedValue);
      return resolvedValue;
    }

    if (implementation) {
      const result = implementation(...args);
      results.push(result);
      return result;
    }

    if (returnValue !== undefined) {
      results.push(returnValue);
      return returnValue;
    }

    return undefined as TResult;
  }) as MockFn<TArgs, TResult>;

  Object.defineProperty(mock, "calls", {
    get: () => calls,
    enumerable: true,
  });

  Object.defineProperty(mock, "results", {
    get: () => results,
    enumerable: true,
  });

  Object.defineProperty(mock, "invoked", {
    get: () => calls.length > 0,
    enumerable: true,
  });

  Object.defineProperty(mock, "callCount", {
    get: () => calls.length,
    enumerable: true,
  });

  mock.mockReturnValue = (value: TResult): void => {
    returnValue = value;
    resolvedValue = undefined;
    shouldReject = false;
  };

  mock.mockResolvedValue = (value: TResult): void => {
    resolvedValue = value;
    returnValue = undefined;
    shouldReject = false;
  };

  mock.mockRejectedValue = (error: unknown): void => {
    rejectedValue = error;
    shouldReject = true;
    returnValue = undefined;
    resolvedValue = undefined;
  };

  mock.mockImplementation = (fn: (...args: TArgs) => TResult): void => {
    implementation = fn;
    returnValue = undefined;
    resolvedValue = undefined;
    shouldReject = false;
  };

  mock.mockReset = (): void => {
    calls.length = 0;
    results.length = 0;
    implementation = undefined;
    returnValue = defaultReturnValue;
    resolvedValue = undefined;
    rejectedValue = undefined;
    shouldReject = false;
  };

  mock.mockClear = (): void => {
    calls.length = 0;
    results.length = 0;
  };

  return mock;
}
