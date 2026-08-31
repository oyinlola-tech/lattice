import type {
  ValidationConstraint,
} from "../validationConstraints/index.js";

import type {
  ValidationResult,
} from "../validationResult/validationResult.type.js";

import {
  checkConstraints,
} from "../validationConstraints/index.js";

import type {
  ValidationSchema,
} from "../validationSchema/validationSchema.core.js";

import {
  validate,
} from "../validationSchema/validationSchema.core.js";

/**
 * A named validation rule.
 */
export interface ValidationRule<T = unknown> {
  readonly name: string;
  readonly description?: string;
  readonly schema?: ValidationSchema<T>;
  readonly constraints?: readonly ValidationConstraint<T>[];
}

/**
 * Options used when registering a validation rule.
 */
export interface ValidationRuleOptions {
  readonly overwrite?: boolean;
}

/**
 * Registry of reusable validation schemas and constraints.
 */
export class ValidationRegistry {
  private readonly rules =
    new Map<
      string,
      ValidationRule
    >();

  /**
   * Registers a validation rule.
   */
  public register<T>(
    rule: ValidationRule<T>,
    options: ValidationRuleOptions = {},
  ): this {
    const name =
      normalizeRuleName(
        rule.name,
      );

    if (
      !options.overwrite &&
      this.rules.has(name)
    ) {
      throw new Error(
        `Validation rule "${name}" is already registered.`,
      );
    }

    if (
      !rule.schema &&
      (
        !rule.constraints ||
        rule.constraints.length === 0
      )
    ) {
      throw new TypeError(
        `Validation rule "${name}" must define a schema or at least one constraint.`,
      );
    }

    this.rules.set(
      name,
      Object.freeze({
        ...rule,
        name,
      }) as ValidationRule,
    );

    return this;
  }

  /**
   * Registers a schema as a named validation rule.
   */
  public registerSchema<T>(
    name: string,
    schema: ValidationSchema<T>,
    options: {
      readonly description?: string;
      readonly overwrite?: boolean;
    } = {},
  ): this {
    return this.register(
      {
        name,
        description:
          options.description,
        schema,
      },
      options,
    );
  }

  /**
   * Registers constraints as a named validation rule.
   */
  public registerConstraints<T>(
    name: string,
    constraints: readonly ValidationConstraint<T>[],
    options: {
      readonly description?: string;
      readonly overwrite?: boolean;
    } = {},
  ): this {
    return this.register(
      {
        name,
        description:
          options.description,
        constraints,
      },
      options,
    );
  }

  /**
   * Gets a registered rule.
   */
  public get<T = unknown>(
    name: string,
  ): ValidationRule<T> | undefined {
    return this.rules.get(
      normalizeRuleName(
        name,
      ),
    ) as
      | ValidationRule<T>
      | undefined;
  }

  /**
   * Gets a registered rule or throws when it does not exist.
   */
  public require<T = unknown>(
    name: string,
  ): ValidationRule<T> {
    const rule =
      this.get<T>(
        name,
      );

    if (!rule) {
      throw new Error(
        `Validation rule "${name}" is not registered.`,
      );
    }

    return rule;
  }

  /**
   * Checks whether a rule is registered.
   */
  public has(
    name: string,
  ): boolean {
    return this.rules.has(
      normalizeRuleName(
        name,
      ),
    );
  }

  /**
   * Removes a registered rule.
   */
  public unregister(
    name: string,
  ): boolean {
    return this.rules.delete(
      normalizeRuleName(
        name,
      ),
    );
  }

  /**
   * Returns all registered rule names.
   */
  public names(): readonly string[] {
    return Object.freeze([
      ...this.rules.keys(),
    ]);
  }

  /**
   * Returns all registered rules.
   */
  public entries(): readonly ValidationRule[] {
    return Object.freeze([
      ...this.rules.values(),
    ]);
  }

  /**
   * Returns the number of registered rules.
   */
  public get size(): number {
    return this.rules.size;
  }

  /**
   * Clears the registry.
   */
  public clear(): void {
    this.rules.clear();
  }

  /**
   * Validates a value using a registered rule.
   */
  public validate<T>(
    name: string,
    value: unknown,
  ): ValidationResult<T> {
    const rule =
      this.require<T>(
        name,
      );

    if (rule.schema) {
      return validate(
        rule.schema,
        value,
      );
    }

    if (
      rule.constraints &&
      rule.constraints.length > 0
    ) {
      return checkConstraints(
        rule.constraints,
        value as T,
      );
    }

    throw new TypeError(
      `Validation rule "${name}" has no validation implementation.`,
    );
  }

  /**
   * Creates a child registry containing a snapshot of this registry.
   */
  public clone(): ValidationRegistry {
    const registry =
      new ValidationRegistry();

    for (
      const rule of this.rules.values()
    ) {
      registry.register(
        rule,
      );
    }

    return registry;
  }

  /**
   * Imports all rules from another registry.
   */
  public extend(
    source: ValidationRegistry,
    options: ValidationRuleOptions = {},
  ): this {
    for (
      const rule of source.entries()
    ) {
      this.register(
        rule,
        options,
      );
    }

    return this;
  }

  /**
   * Creates a read-only view of the registry.
   */
  public readonly(): ReadonlyValidationRegistry {
    return new ReadonlyValidationRegistry(
      this,
    );
  }
}

/**
 * Read-only facade over a validation registry.
 */
export class ReadonlyValidationRegistry {
  constructor(
    private readonly registry: ValidationRegistry,
  ) {}

  public get<T = unknown>(
    name: string,
  ): ValidationRule<T> | undefined {
    return this.registry.get<T>(
      name,
    );
  }

  public require<T = unknown>(
    name: string,
  ): ValidationRule<T> {
    return this.registry.require<T>(
      name,
    );
  }

  public has(
    name: string,
  ): boolean {
    return this.registry.has(
      name,
    );
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

  public validate<T>(
    name: string,
    value: unknown,
  ): ValidationResult<T> {
    return this.registry.validate<T>(
      name,
      value,
    );
  }
}

/**
 * Creates an empty validation registry.
 */
export function createValidationRegistry(): ValidationRegistry {
  return new ValidationRegistry();
}

/**
 * Creates a registry from an initial collection of rules.
 */
export function createRegistryFromRules(
  rules: readonly ValidationRule[],
): ValidationRegistry {
  const registry =
    new ValidationRegistry();

  for (
    const rule of rules
  ) {
    registry.register(
      rule,
    );
  }

  return registry;
}

/**
 * Normalizes registry keys.
 */
function normalizeRuleName(
  name: string,
): string {
  const normalized =
    name.trim();

  if (
    normalized.length === 0
  ) {
    throw new TypeError(
      "Validation rule name cannot be empty.",
    );
  }

  return normalized;
}