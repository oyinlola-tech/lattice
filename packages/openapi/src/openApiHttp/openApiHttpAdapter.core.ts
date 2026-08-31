import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIVersion } from "../openApiTypes/openApiTypes.core.js";
import { OpenAPIDocumentBuilder } from "../openApiDocument/openApiDocument.builder.js";
import { OpenAPIRegistryImpl } from "../openApiRegistry/openApiRegistry.core.js";
import { OpenAPIRouteScannerImpl } from "../openApiRouting/routeScanner.core.js";
import { OpenAPIValidatorImpl } from "../openApiValidation/openApiValidator.core.js";
import { toOpenAPIJSON, toOpenAPIYAML } from "../openApiSerialization/openApiSerializer.core.js";

/**
 * High-level OpenAPI manager that coordinates generation, validation, and serving.
 */
export class OpenAPIManager {
  private readonly registry: OpenAPIRegistryImpl;

  private readonly scanner: OpenAPIRouteScannerImpl;

  private readonly validator: OpenAPIValidatorImpl;

  private cachedDocument?: OpenAPIDocument;

  constructor(version = "3.1.0") {
    this.registry = new OpenAPIRegistryImpl(version);
    this.scanner = new OpenAPIRouteScannerImpl();
    this.validator = new OpenAPIValidatorImpl();
  }

  public get registryInstance(): OpenAPIRegistryImpl {
    return this.registry;
  }

  public get scannerInstance(): OpenAPIRouteScannerImpl {
    return this.scanner;
  }

  public addRoute(route: {
    readonly method: "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";
    readonly path: string;
    readonly metadata?: {
      readonly openapi?: {
        readonly operationId?: string;
        readonly summary?: string;
        readonly description?: string;
        readonly tags?: readonly string[];
        readonly responses?: Record<string, unknown>;
        readonly requestBody?: unknown;
        readonly parameters?: readonly unknown[];
        readonly security?: readonly Record<string, readonly string[]>[];
      };
    };
  }): void {
    this.scanner.addRoute(route as never);
  }

  public addSchema(name: string, schema: unknown): void {
    this.registry.registerSchema(name, schema as never);
  }

  public generate(validate = false): OpenAPIDocument {
    const routes = this.scanner.scan();

    for (const route of routes) {
      this.registry.registerRoute(route);
    }

    const document = this.registry.generate();

    if (validate) {
      this.validator.assertValid(document);
    }

    this.cachedDocument = document;
    return document;
  }

  public getDocument(validate = false): Readonly<OpenAPIDocument> {
    if (this.cachedDocument) {
      return this.cachedDocument;
    }
    return this.generate(validate);
  }

  public invalidate(): void {
    this.cachedDocument = undefined;
    this.scanner.clear();
    this.registry.clear();
  }

  public toJSON(validate = false): string {
    return toOpenAPIJSON(this.getDocument(validate));
  }

  public toYAML(validate = false): string {
    return toOpenAPIYAML(this.getDocument(validate));
  }
}
