/**
 * Read-only facade over a validation registry.
 */

import type { ValidationResult } from "../validationResult/validationResult.type.js";
import type { ValidationRule } from "./validationRegistry.core.js";
import type { ValidationRegistry } from "./validationRegistry.core.js";

export class ReadonlyValidationRegistry {
  constructor(private readonly registry: ValidationRegistry) {}

  public get<T = unknown>(name: string): ValidationRule<T> | undefined {
    return this.registry.get<T>(name);
  }

  public require<T = unknown>(name: string): ValidationRule<T> {
    return this.registry.require<T>(name);
  }

  public has(name: string): boolean {
    return this.registry.has(name);
  }

  public names(): readonly string[] {
    return this.registry.names();
  }

  public entries(): readonly ValidationRule[] {
    return this.registry.entries();
  }

  public get size(): number {
    return this.registry.size;
  }

  public validate<T>(name: string, value: unknown): ValidationResult<T> {
    return this.registry.validate<T>(name, value);
  }
}
