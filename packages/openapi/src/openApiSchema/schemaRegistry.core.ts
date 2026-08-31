import type { OpenAPISchema } from "../openApiTypes/openApiTypes.core.js";
import type { SchemaConversionResult } from "./schemaConverter.core.js";
import { convertSchema } from "./schemaConverter.core.js";

/**
 * Schema registry for OpenAPI component schemas.
 */
export interface SchemaRegistry {
  register(name: string, schema: unknown): void;

  get(name: string): OpenAPISchema | undefined;

  convert(name: string, schema: unknown): OpenAPISchema;

  ref(name: string): { $ref: string };

  clear(): void;
}

/**
 * Default schema registry implementation.
 */
export class SchemaRegistryImpl implements SchemaRegistry {
  private readonly schemas: Map<string, OpenAPISchema> = new Map();
  private readonly pending: Map<string, unknown> = new Map();

  public register(name: string, schema: unknown): void {
    if (this.schemas.has(name)) {
      throw new Error(`Schema "${name}" is already registered.`);
    }

    const result = convertSchema(schema);
    this.schemas.set(name, result.schema);
  }

  public get(name: string): OpenAPISchema | undefined {
    return this.schemas.get(name);
  }

  public convert(name: string, schema: unknown): OpenAPISchema {
    if (this.schemas.has(name)) {
      return this.schemas.get(name)!;
    }

    const result = convertSchema(schema);
    this.schemas.set(name, result.schema);
    return result.schema;
  }

  public ref(name: string): { $ref: string } {
    return {
      $ref: `#/components/schemas/${name}`,
    };
  }

  public clear(): void {
    this.schemas.clear();
    this.pending.clear();
  }
}
