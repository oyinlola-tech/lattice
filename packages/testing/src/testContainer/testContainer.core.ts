/**
 * Test container helpers.
 *
 * Wraps the real Lattice container with test-friendly defaults
 * and override support for dependency injection testing.
 */

import { createStartedContainer } from "@zudo/container";

import type { Container, RegistrationToken } from "@zudo/container";

/**
 * A dependency override for test containers.
 */
export interface DependencyOverride<T = unknown> {
  readonly token: RegistrationToken<T>;
  readonly useValue: T;
}

/**
 * Options for creating a test container.
 */
export interface TestContainerOptions {
  readonly overrides?: readonly DependencyOverride[];
}

/**
 * A test container with convenience methods.
 */
export interface TestContainer {
  readonly container: Container;

  /**
   * Resolve a dependency from the container.
   */
  resolve: <T>(token: RegistrationToken<T>) => T;

  /**
   * Check if a token is registered.
   */
  has: <T>(token: RegistrationToken<T>) => boolean;

  /**
   * Dispose the container and clean up resources.
   */
  dispose: () => Promise<void>;
}

/**
 * Creates a pre-started test container with optional overrides.
 *
 * @param options - Test container configuration.
 * @returns A TestContainer instance.
 *
 * @example
 * ```ts
 * const testContainer = createTestContainer({
 *   overrides: [
 *     { token: paymentToken, useValue: fakePaymentService },
 *   ],
 * });
 *
 * const service = testContainer.resolve(userToken);
 * expect(service).toBeDefined();
 *
 * await testContainer.dispose();
 * ```
 */
export function createTestContainer(
  options: TestContainerOptions = {},
): TestContainer {
  const container = createStartedContainer();

  if (options.overrides) {
    for (const override of options.overrides) {
      container.registerValue(override.token, override.useValue);
    }
  }

  const resolve = <T>(token: RegistrationToken<T>): T =>
    container.resolve(token) as T;

  const has = <T>(token: RegistrationToken<T>): boolean => container.has(token);

  const dispose = async (): Promise<void> => {
    await container.dispose();
  };

  return {
    container,
    resolve,
    has,
    dispose,
  };
}
