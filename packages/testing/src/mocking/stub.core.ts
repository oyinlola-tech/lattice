/**
 * Stub utilities.
 *
 * Creates fake implementations of interfaces for testing.
 */

/**
 * Creates a stub object from an interface.
 *
 * All methods return undefined by default. Override specific methods
 * by passing an overrides object.
 *
 * @typeParam T - The interface type to stub.
 * @param overrides - Optional method implementations.
 * @returns A stub object matching the interface.
 *
 * @example
 * ```ts
 * interface UserService {
 *   find(id: string): Promise<User | null>;
 *   create(data: CreateUserInput): Promise<User>;
 * }
 *
 * const stub = createStub<UserService>({
 *   find: async (id) => ({ id, name: "Test" }),
 * });
 *
 * expect(await stub.find("123")).toEqual({ id: "123", name: "Test" });
 * expect(stub.create).toBeUndefined();
 * ```
 */
export function createStub<T extends Record<string, unknown>>(
  overrides: Partial<T> = {} as Partial<T>,
): T {
  return new Proxy({} as T, {
    get(_target, prop, _receiver) {
      const key = prop as keyof T;

      if (key in overrides) {
        return overrides[key];
      }

      if (typeof prop === "symbol") {
        return undefined;
      }

      return (..._args: unknown[]) => undefined;
    },
  });
}

/**
 * Creates a stub class constructor.
 *
 * @typeParam T - The class type to stub.
 * @param overrides - Optional property and method implementations.
 * @returns A stub class constructor.
 *
 * @example
 * ```ts
 * class RealDatabase {
 *   async connect(): Promise<void> { /* real implementation *\/ }
 *   async query(sql: string): Promise<unknown[]> { /* real implementation *\/ }
 * }
 *
 * const StubDatabase = createStubClass(RealDatabase, {
 *   connect: async () => {},
 *   query: async () => [],
 * });
 *
 * const db = new StubDatabase();
 * await db.connect();
 * ```
 */
export function createStubClass<T>(
  _OriginalClass: new (...args: unknown[]) => T,
  overrides: Partial<T> = {} as Partial<T>,
): new () => T {
  return class {
    constructor() {
      for (const [key, value] of Object.entries(overrides)) {
        (this as Record<string, unknown>)[key] = value;
      }
    }
  } as new () => T;
}
