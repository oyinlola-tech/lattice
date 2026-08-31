import type { APIOperation } from "../operation/operation.type.js";

/**
 * Registry for API operations.
 *
 * Enforces uniqueness and provides O(1) lookup by operation name.
 */
export class APIOperationRegistry {
  private readonly operations = new Map<string, APIOperation>();

  private frozen = false;

  /**
   * Registers an operation.
   *
   * @throws {APIDuplicateOperationError} if an operation with the same name is already registered.
   */
  register(operation: APIOperation): void {
    if (this.frozen) {
      throw new Error("Cannot register operations on a frozen registry.");
    }

    const existing = this.operations.get(operation.name);
    if (existing !== undefined) {
      throw new Error(`Operation "${operation.name}" is already registered.`);
    }

    this.operations.set(operation.name, Object.freeze(operation));
  }

  /**
   * Retrieves an operation by name.
   */
  get(name: string): APIOperation | undefined {
    return this.operations.get(name);
  }

  /**
   * Determines whether an operation is registered.
   */
  has(name: string): boolean {
    return this.operations.has(name);
  }

  /**
   * Retrieves an operation by name or throws.
   */
  require(name: string): APIOperation {
    const operation = this.get(name);
    if (operation === undefined) {
      throw new Error(`Operation "${name}" is not registered.`);
    }
    return operation;
  }

  /**
   * Returns all registered operations.
   */
  getAll(): readonly APIOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Finds operations by tag.
   */
  findByTag(tag: string): readonly APIOperation[] {
    return this.getAll().filter((operation) =>
      operation.metadata?.tags?.includes(tag),
    );
  }

  /**
   * Unregisters an operation.
   */
  unregister(name: string): boolean {
    if (this.frozen) {
      throw new Error("Cannot unregister operations on a frozen registry.");
    }
    return this.operations.delete(name);
  }

  /**
   * Prevents further mutation of the registry.
   */
  freeze(): void {
    this.frozen = true;
  }

  /**
   * Determines whether the registry is frozen.
   */
  isFrozen(): boolean {
    return this.frozen;
  }
}
