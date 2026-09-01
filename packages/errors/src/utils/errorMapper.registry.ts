/**
 * Central registry for converting third-party and native errors into application errors.
 */

import { BaseError } from "../base/core/baseError.core.js";
import type {
  ErrorMapperContext,
  ErrorMappingRule,
} from "./errorMapper.types.js";

/** Central registry for converting third-party and native errors into application errors. */
export class ErrorMapperRegistry {
  private readonly rules: ErrorMappingRule[] = [];

  /** Registers a mapping rule. */
  public register(rule: ErrorMappingRule): this {
    if (!rule.name.trim()) {
      throw new TypeError("Error mapping rule name cannot be empty.");
    }
    if (this.rules.some((existing) => existing.name === rule.name)) {
      throw new Error(
        `An error mapping rule named "${rule.name}" is already registered.`,
      );
    }
    this.rules.push(rule);
    this.rules.sort(
      (first, second) => (second.priority ?? 0) - (first.priority ?? 0),
    );
    return this;
  }

  /** Removes a mapping rule by name. */
  public unregister(name: string): boolean {
    const index = this.rules.findIndex((rule) => rule.name === name);
    if (index === -1) {
      return false;
    }
    this.rules.splice(index, 1);
    return true;
  }

  /** Returns whether a rule with the specified name exists. */
  public has(name: string): boolean {
    return this.rules.some((rule) => rule.name === name);
  }

  /** Finds the first rule that matches an error. */
  public find(
    error: unknown,
    context?: ErrorMapperContext,
  ): ErrorMappingRule | undefined {
    return this.rules.find((rule) => rule.predicate(error, context));
  }

  /** Maps an unknown error using the first matching rule. */
  public map(
    error: unknown,
    context?: ErrorMapperContext,
  ): BaseError | undefined {
    const rule = this.find(error, context);
    if (!rule) {
      return undefined;
    }
    return rule.mapper(error, context);
  }

  /** Returns all registered rules. */
  public getRules(): readonly ErrorMappingRule[] {
    return [...this.rules];
  }

  /** Clears all registered rules. */
  public clear(): void {
    this.rules.length = 0;
  }
}

/** Creates an error mapper registry. */
export function createErrorMapperRegistry(): ErrorMapperRegistry {
  return new ErrorMapperRegistry();
}
