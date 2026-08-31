import type { OpenAPISchema } from "../openApiTypes/openApiTypes.core.js";
import { OpenAPISchemaError } from "../openApiErrors/openApiError.core.js";

/**
 * Result of a schema conversion.
 */
export interface SchemaConversionResult {
  readonly schema: OpenAPISchema;

  readonly warnings: readonly string[];
}

/**
 * Determines whether a schema value is optional.
 */
function isOptional(value: unknown): boolean {
  if (value && typeof value === "object" && "_type" in value) {
    return (value as { _type?: string })._type === "optional";
  }
  return false;
}

/**
 * Converts a Lattice Schema to an OpenAPI SchemaObject.
 *
 * This is a minimal converter that handles the most common schema types.
 * For complex schemas, extend this function or provide a custom converter.
 */
export function convertSchema(input: unknown, _visited = new Set<object>()): SchemaConversionResult {
  if (input && typeof input === "object" && "_type" in input) {
    const schema = input as { _type: string; _metadata?: { description?: string; example?: unknown; deprecated?: boolean; title?: string }; [key: string]: unknown };

    switch (schema._type) {
      case "string": {
        const result: OpenAPISchema = {
          type: "string",
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.example !== undefined ? { example: schema._metadata.example } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings: [] };
      }

      case "number": {
        const result: OpenAPISchema = {
          type: "number",
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.example !== undefined ? { example: schema._metadata.example } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings: [] };
      }

      case "boolean": {
        const result: OpenAPISchema = {
          type: "boolean",
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.example !== undefined ? { example: schema._metadata.example } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings: [] };
      }

      case "object": {
        const shape = (schema as { shape?: Record<string, unknown> }).shape ?? {};
        const requiredKeys = (schema as { requiredKeys?: readonly string[] }).requiredKeys ?? [];
        const properties: Record<string, OpenAPISchema> = {};
        const required: string[] = [];
        const warnings: string[] = [];

        for (const [key, value] of Object.entries(shape)) {
          const converted = convertSchema(value, _visited);
          properties[key] = converted.schema;
          warnings.push(...converted.warnings);
          if (!isOptional(value) && requiredKeys.includes(key)) {
            required.push(key);
          }
        }

        const result: OpenAPISchema = {
          type: "object",
          ...(Object.keys(properties).length > 0 ? { properties } : {}),
          ...(required.length > 0 ? { required } : {}),
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings };
      }

      case "array": {
        const items = (schema as { items?: unknown }).items;
        let itemsSchema: OpenAPISchema | undefined;
        const warnings: string[] = [];

        if (items) {
          const converted = convertSchema(items, _visited);
          itemsSchema = converted.schema;
          warnings.push(...converted.warnings);
        }

        const result: OpenAPISchema = {
          type: "array",
          ...(itemsSchema ? { items: itemsSchema } : {}),
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings };
      }

      case "enum": {
        const values = (schema as { values?: readonly unknown[] }).values ?? [];
        const result: OpenAPISchema = {
          type: "string",
          enum: values as readonly unknown[],
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings: [] };
      }

      case "literal": {
        const values = (schema as { values?: readonly unknown[] }).values ?? [];
        const result: OpenAPISchema = {
          type: "string",
          enum: values as readonly unknown[],
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings: [] };
      }

      case "union": {
        const options = (schema as { options?: readonly unknown[] }).options ?? [];
        const warnings: string[] = [];
        const oneOf = options.map((option) => {
          const converted = convertSchema(option, _visited);
          warnings.push(...converted.warnings);
          return converted.schema;
        });

        const result: OpenAPISchema = {
          oneOf,
          ...(schema._metadata?.description ? { description: schema._metadata.description } : {}),
          ...(schema._metadata?.deprecated ? { deprecated: true } : {}),
          ...(schema._metadata?.title ? { title: schema._metadata.title } : {}),
        };
        return { schema: result, warnings };
      }

      case "optional": {
        const inner = (schema as { inner?: unknown }).inner;
        if (!inner) {
          return { schema: {}, warnings: ["Optional schema has no inner schema."] };
        }
        return convertSchema(inner, _visited);
      }

      case "nullable": {
        const inner = (schema as { inner?: unknown }).inner;
        if (!inner) {
          return { schema: { nullable: true }, warnings: ["Nullable schema has no inner schema."] };
        }
        const converted = convertSchema(inner, _visited);
        return {
          schema: { ...converted.schema, nullable: true },
          warnings: converted.warnings,
        };
      }

      default:
        return { schema: {}, warnings: [`Unsupported schema type: ${(schema as { _type?: string })._type ?? "unknown"}`] };
    }
  }

  if (Array.isArray(input)) {
    const items = input[0];
    if (items) {
      const converted = convertSchema(items, _visited);
      return { schema: { type: "array", items: converted.schema }, warnings: converted.warnings };
    }
    return { schema: { type: "array" }, warnings: [] };
  }

  if (typeof input === "string") {
    return { schema: { type: "string" }, warnings: [] };
  }

  if (typeof input === "number") {
    return { schema: { type: "number" }, warnings: [] };
  }

  if (typeof input === "boolean") {
    return { schema: { type: "boolean" }, warnings: [] };
  }

  return { schema: {}, warnings: ["Unable to convert unknown schema input."] };
}

/**
 * Creates a schema converter with custom options.
 */
export function createSchemaConverter(): SchemaConverter {
  return {
    convert: convertSchema,
  };
}

/**
 * Schema converter interface.
 */
export interface SchemaConverter {
  convert(input: unknown, visited?: Set<object>): SchemaConversionResult;
}
