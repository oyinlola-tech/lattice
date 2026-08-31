import type { OpenAPIDocument } from "../openApiTypes/openApiTypes.core.js";
import type { OpenAPIValidationIssue } from "../openApiErrors/openApiError.core.js";
import { OpenAPIValidationError } from "../openApiErrors/openApiError.core.js";

const OPERATIONS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

export interface OpenAPIValidator {
  validate(document: OpenAPIDocument): { readonly valid: boolean; readonly errors: readonly OpenAPIValidationIssue[]; readonly warnings: readonly OpenAPIValidationIssue[] };
  assertValid(document: OpenAPIDocument): void;
}

export class OpenAPIValidatorImpl implements OpenAPIValidator {
  public validate(document: OpenAPIDocument): { readonly valid: boolean; readonly errors: readonly OpenAPIValidationIssue[]; readonly warnings: readonly OpenAPIValidationIssue[] } {
    const errors: OpenAPIValidationIssue[] = [];
    const warnings: OpenAPIValidationIssue[] = [];
    this.validateDocumentStructure(document, errors, warnings);
    this.validatePaths(document, errors, warnings);
    this.validateOperationIds(document, errors, warnings);
    return { valid: errors.length === 0, errors: Object.freeze([...errors]), warnings: Object.freeze([...warnings]) };
  }

  public assertValid(document: OpenAPIDocument): void {
    const result = this.validate(document);
    if (!result.valid) throw new OpenAPIValidationError(result.errors);
  }

  private validateDocumentStructure(document: OpenAPIDocument, errors: OpenAPIValidationIssue[], warnings: OpenAPIValidationIssue[]): void {
    if (!document.openapi) errors.push({ path: "openapi", message: "OpenAPI version is required.", severity: "error" });
    if (!document.info) {
      errors.push({ path: "info", message: "Info object is required.", severity: "error" });
    } else {
      if (!document.info.title) errors.push({ path: "info.title", message: "Info title is required.", severity: "error" });
      if (!document.info.version) errors.push({ path: "info.version", message: "Info version is required.", severity: "error" });
    }
    if (!document.paths || Object.keys(document.paths).length === 0) {
      warnings.push({ path: "paths", message: "Document has no paths defined.", severity: "warning" });
    }
  }

  private validatePaths(document: OpenAPIDocument, errors: OpenAPIValidationIssue[], _warnings: OpenAPIValidationIssue[]): void {
    for (const [path, pathItem] of Object.entries(document.paths)) {
      if (!pathItem) continue;
      if (path.includes(":") && !path.includes("{")) {
        errors.push({ path: `paths.${path}`, message: `Path "${path}" contains un-converted path parameters. Use "/users/{id}" instead of "/users/:id".`, severity: "error" });
      }
      for (const method of OPERATIONS) {
        const operation = (pathItem as Record<string, unknown>)[method] as { parameters?: readonly { in?: string; required?: boolean; name?: string }[] } | undefined;
        if (!operation) continue;
        for (const param of operation.parameters ?? []) {
          if (param.in === "path" && !param.required) {
            errors.push({ path: `paths.${path}.${method}.parameters`, message: `Path parameter "${param.name}" must be required.`, severity: "error" });
          }
        }
      }
    }
  }

  private validateOperationIds(document: OpenAPIDocument, errors: OpenAPIValidationIssue[], _warnings: OpenAPIValidationIssue[]): void {
    const operationIds = new Set<string>();
    for (const [path, pathItem] of Object.entries(document.paths)) {
      if (!pathItem) continue;
      for (const method of OPERATIONS) {
        const operation = (pathItem as Record<string, { operationId?: string }>)[method];
        if (!operation?.operationId) continue;
        if (operationIds.has(operation.operationId)) {
          errors.push({ path: `paths.${path}.${method}.operationId`, message: `Duplicate operationId "${operation.operationId}".`, severity: "error" });
        }
        operationIds.add(operation.operationId);
      }
    }
  }
}
