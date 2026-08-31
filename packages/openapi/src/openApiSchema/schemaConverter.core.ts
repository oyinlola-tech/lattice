import type { OpenAPISchema } from "../openApiTypes/openApiTypes.core.js";

export interface SchemaConversionResult {
  readonly schema: OpenAPISchema;
  readonly warnings: readonly string[];
}

function isOptional(value: unknown): boolean {
  if (value && typeof value === "object" && "_type" in value) {
    return (value as { _type?: string })._type === "optional";
  }
  return false;
}

function extractMeta(schema: { _metadata?: { description?: string; example?: unknown; deprecated?: boolean; title?: string } }): Partial<OpenAPISchema> {
  const m = schema._metadata;
  if (!m) return {};
  return {
    ...(m.description ? { description: m.description } : {}),
    ...(m.example !== undefined ? { example: m.example } : {}),
    ...(m.deprecated ? { deprecated: true } : {}),
    ...(m.title ? { title: m.title } : {}),
  };
}

type SchemaInput = { _type: string; _metadata?: { description?: string; example?: unknown; deprecated?: boolean; title?: string }; [key: string]: unknown };

export function convertSchema(input: unknown, _visited = new Set<object>()): SchemaConversionResult {
  if (input && typeof input === "object" && "_type" in input) {
    const schema = input as SchemaInput;
    const meta = extractMeta(schema);

    switch (schema._type) {
      case "string":
      case "number":
      case "boolean":
        return { schema: { type: schema._type, ...meta }, warnings: [] };

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
          if (!isOptional(value) && requiredKeys.includes(key)) required.push(key);
        }
        return {
          schema: { type: "object", ...(Object.keys(properties).length > 0 ? { properties } : {}), ...(required.length > 0 ? { required } : {}), ...meta },
          warnings,
        };
      }

      case "array": {
        const items = (schema as { items?: unknown }).items;
        const warnings: string[] = [];
        let itemsSchema: OpenAPISchema | undefined;
        if (items) {
          const converted = convertSchema(items, _visited);
          itemsSchema = converted.schema;
          warnings.push(...converted.warnings);
        }
        return { schema: { type: "array", ...(itemsSchema ? { items: itemsSchema } : {}), ...meta }, warnings };
      }

      case "enum":
      case "literal":
        return { schema: { type: "string", enum: (schema as { values?: readonly unknown[] }).values ?? [], ...meta }, warnings: [] };

      case "union": {
        const options = (schema as { options?: readonly unknown[] }).options ?? [];
        const warnings: string[] = [];
        const oneOf = options.map((option) => {
          const converted = convertSchema(option, _visited);
          warnings.push(...converted.warnings);
          return converted.schema;
        });
        return { schema: { oneOf, ...meta }, warnings };
      }

      case "optional": {
        const inner = (schema as { inner?: unknown }).inner;
        if (!inner) return { schema: {}, warnings: ["Optional schema has no inner schema."] };
        return convertSchema(inner, _visited);
      }

      case "nullable": {
        const inner = (schema as { inner?: unknown }).inner;
        if (!inner) return { schema: { nullable: true }, warnings: ["Nullable schema has no inner schema."] };
        const converted = convertSchema(inner, _visited);
        return { schema: { ...converted.schema, nullable: true }, warnings: converted.warnings };
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
  if (typeof input === "string") return { schema: { type: "string" }, warnings: [] };
  if (typeof input === "number") return { schema: { type: "number" }, warnings: [] };
  if (typeof input === "boolean") return { schema: { type: "boolean" }, warnings: [] };
  return { schema: {}, warnings: ["Unable to convert unknown schema input."] };
}

export interface SchemaConverter {
  convert(input: unknown, visited?: Set<object>): SchemaConversionResult;
}

export function createSchemaConverter(): SchemaConverter {
  return { convert: convertSchema };
}
