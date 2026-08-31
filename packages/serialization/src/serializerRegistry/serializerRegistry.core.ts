/**
 * @lattice/serialization — Serializer registry.
 *
 * Central registry for named serializer instances. Other packages
 * look up serializers by name instead of importing concrete classes.
 */

import type { Serializer } from "../serializerTypes/index.js";
import { SerializerNotFoundError } from "@lattice/errors";

/**
 * Registry of serializer instances keyed by canonical name.
 *
 * Provides a lookup mechanism so consuming packages depend on
 * interfaces, not concrete serializer implementations.
 */
export class SerializerRegistry {
  private readonly serializers = new Map<string, Serializer>();

  /** Register a serializer. Overwrites any existing registration with the same name. */
  register(serializer: Serializer): void {
    this.serializers.set(serializer.name, serializer);
  }

  /** Unregister a serializer by name. */
  unregister(name: string): boolean {
    return this.serializers.delete(name);
  }

  /** Retrieve a serializer by name. Throws SerializerNotFoundError if not found. */
  get(name: string): Serializer {
    const serializer = this.serializers.get(name);
    if (!serializer) throw new SerializerNotFoundError(name);
    return serializer;
  }

  /** Returns true when a serializer is registered for the name. */
  has(name: string): boolean {
    return this.serializers.has(name);
  }

  /** Returns all registered serializer names. */
  names(): string[] {
    return [...this.serializers.keys()];
  }

  /** Remove all registered serializers. */
  clear(): void {
    this.serializers.clear();
  }

  /** Number of registered serializers. */
  get size(): number {
    return this.serializers.size;
  }
}
