import type { Provider } from "./provider.js";
import type { Scope } from "./scope.js";
import type { Token } from "./token.js";
import { ProviderNotFoundError, ProviderAlreadyRegisteredError } from "../errors/exceptions.js";

/**
 * Internal representation of a registered dependency.
 */
interface ProviderRegistration {
  readonly provider: Provider<unknown>;
  readonly scope: Scope;
  instance?: unknown;
}

/**
 * Dependency Injection container for Lattice applications.
 *
 * The container is responsible for registering and resolving
 * application dependencies.
 */
export class Container {
  private readonly providers = new Map<
    Token<unknown>,
    ProviderRegistration
  >();

  /**
   * Registers a provider in the container.
   */
  public register<T>(
    token: Token<T>,
    provider: Provider<T>,
    scope: Scope = "singleton",
  ): void {
    if (this.providers.has(token)) {
      throw new ProviderAlreadyRegisteredError(token);
    }

    this.providers.set(token, {
      provider: provider as Provider<unknown>,
      scope,
    });
  }

  /**
   * Resolves a dependency from the container.
   */
  public resolve<T>(token: Token<T>): T {
    const registration = this.providers.get(token);

    if (!registration) {
      throw new ProviderNotFoundError(token);
    }

    if (
      registration.scope === "singleton" &&
      registration.instance !== undefined
    ) {
      return registration.instance as T;
    }

    const instance = this.createInstance<T>(registration.provider);

    if (registration.scope === "singleton") {
      registration.instance = instance;
    }

    return instance;
  }

  /**
   * Checks whether a token has been registered.
   */
  public has<T>(token: Token<T>): boolean {
    return this.providers.has(token);
  }

  /**
   * Removes a provider from the container.
   *
   * Primarily useful for testing and controlled runtime scenarios.
   */
  public unregister<T>(token: Token<T>): boolean {
    return this.providers.delete(token);
  }

  /**
   * Clears all registered providers.
   */
  public clear(): void {
    this.providers.clear();
  }

  /**
   * Creates an instance from a provider definition.
   */
  private createInstance<T>(provider: Provider<T>): T {
    if ("useValue" in provider) {
      return provider.useValue;
    }

    if ("useFactory" in provider) {
      return provider.useFactory(this);
    }

    if ("useClass" in provider) {
      return new provider.useClass();
    }

    throw new Error("Invalid provider definition.");
  }

  /**
   * Produces a readable representation of a dependency token.
   */
  private describeToken(token: Token<unknown>): string {
    if (typeof token === "string") {
      return token;
    }

    if (typeof token === "symbol") {
      return token.description ?? token.toString();
    }

    if (typeof token === "function") {
      return token.name || "anonymous class";
    }

    return "unknown";
  }
}