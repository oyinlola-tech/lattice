import { describe, expect, it } from "vitest";

import {
  OpenAPIManager,
  OpenAPIRegistryImpl,
  OpenAPIRouteScannerImpl,
  OpenAPIValidatorImpl,
  OpenAPIDocumentBuilder,
  toOpenAPIPath,
  convertRouteToOpenAPI,
  convertSchema,
  createComponentReference,
  toOpenAPIJSON,
  toOpenAPIYAML,
  COMPONENT_REF_PREFIX,
} from "../src/index.js";

describe("toOpenAPIPath", () => {
  it("converts simple path parameters", () => {
    expect(toOpenAPIPath("/users/:id")).toBe("/users/{id}");
  });

  it("converts multiple path parameters", () => {
    expect(toOpenAPIPath("/users/:userId/posts/:postId")).toBe(
      "/users/{userId}/posts/{postId}",
    );
  });

  it("leaves paths without parameters unchanged", () => {
    expect(toOpenAPIPath("/users")).toBe("/users");
  });

  it("throws on optional path parameters", () => {
    expect(() => toOpenAPIPath("/users/:id?")).toThrow(
      "Optional path parameter",
    );
  });
});

describe("convertRouteToOpenAPI", () => {
  it("converts a basic route", () => {
    const result = convertRouteToOpenAPI("get", "/users/:id");
    expect(result.path).toBe("/users/{id}");
    expect(result.method).toBe("get");
    expect(result.operation.responses["200"].description).toBe("OK");
  });

  it("includes metadata in the operation", () => {
    const result = convertRouteToOpenAPI("post", "/users", {
      openapi: {
        operationId: "users.create",
        summary: "Create a user",
        tags: ["Users"],
      },
    });

    expect(result.operation.operationId).toBe("users.create");
    expect(result.operation.summary).toBe("Create a user");
    expect(result.operation.tags).toEqual(["Users"]);
  });
});

describe("convertSchema", () => {
  it("converts string schema", () => {
    const result = convertSchema({ _type: "string" });
    expect(result.schema.type).toBe("string");
    expect(result.warnings).toEqual([]);
  });

  it("converts number schema", () => {
    const result = convertSchema({ _type: "number" });
    expect(result.schema.type).toBe("number");
  });

  it("converts boolean schema", () => {
    const result = convertSchema({ _type: "boolean" });
    expect(result.schema.type).toBe("boolean");
  });

  it("converts object schema with properties", () => {
    const result = convertSchema({
      _type: "object",
      shape: {
        id: { _type: "string" },
        name: { _type: "string" },
      },
      requiredKeys: ["id"],
    });

    expect(result.schema.type).toBe("object");
    expect(result.schema.properties).toBeDefined();
    expect(result.schema.required).toEqual(["id"]);
  });

  it("converts array schema", () => {
    const result = convertSchema({
      _type: "array",
      items: { _type: "string" },
    });

    expect(result.schema.type).toBe("array");
    expect((result.schema as { items: unknown }).items).toEqual({
      type: "string",
    });
  });

  it("converts enum schema", () => {
    const result = convertSchema({
      _type: "enum",
      values: ["active", "inactive"],
    });

    expect(result.schema.type).toBe("string");
    expect((result.schema as { enum: unknown[] }).enum).toEqual([
      "active",
      "inactive",
    ]);
  });

  it("converts union schema", () => {
    const result = convertSchema({
      _type: "union",
      options: [{ _type: "string" }, { _type: "number" }],
    });

    expect(result.schema.oneOf).toHaveLength(2);
  });

  it("includes metadata in schema", () => {
    const result = convertSchema({
      _type: "string",
      _metadata: {
        description: "A name",
        example: "John",
        deprecated: true,
        title: "Name",
      },
    });

    expect(result.schema.description).toBe("A name");
    expect(result.schema.example).toBe("John");
    expect(result.schema.deprecated).toBe(true);
    expect(result.schema.title).toBe("Name");
  });
});

describe("createComponentReference", () => {
  it("creates a schema reference", () => {
    const ref = createComponentReference("schemas", "User");
    expect(ref.$ref).toBe(`${COMPONENT_REF_PREFIX}/schemas/User`);
  });

  it("creates a response reference", () => {
    const ref = createComponentReference("responses", "NotFound");
    expect(ref.$ref).toBe(`${COMPONENT_REF_PREFIX}/responses/NotFound`);
  });
});

describe("OpenAPIValidatorImpl", () => {
  it("validates a minimal document", () => {
    const validator = new OpenAPIValidatorImpl();
    const result = validator.validate({
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/users": { get: { responses: { "200": { description: "OK" } } } },
      },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detects missing required fields", () => {
    const validator = new OpenAPIValidatorImpl();
    const result = validator.validate({
      openapi: "3.1.0",
      info: { title: "", version: "" },
      paths: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "info.title")).toBe(true);
    expect(result.errors.some((e) => e.path === "info.version")).toBe(true);
  });

  it("detects duplicate operation IDs", () => {
    const validator = new OpenAPIValidatorImpl();
    const result = validator.validate({
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/users": {
          get: {
            operationId: "users.list",
            responses: { "200": { description: "OK" } },
          },
          post: {
            operationId: "users.list",
            responses: { "201": { description: "Created" } },
          },
        },
      },
    });

    expect(result.valid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("Duplicate operationId")),
    ).toBe(true);
  });

  it("warns on empty paths", () => {
    const validator = new OpenAPIValidatorImpl();
    const result = validator.validate({
      openapi: "3.1.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {},
    });

    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.path === "paths")).toBe(true);
  });

  it("assertValid throws on invalid documents", () => {
    const validator = new OpenAPIValidatorImpl();
    expect(() => {
      validator.assertValid({
        openapi: "",
        info: { title: "", version: "" },
        paths: {},
      });
    }).toThrow();
  });
});

describe("OpenAPIManager", () => {
  it("generates a document from routes", () => {
    const manager = new OpenAPIManager("3.1.0");

    manager.addRoute({
      method: "get",
      path: "/users/:id",
      metadata: {
        openapi: {
          operationId: "users.get",
          summary: "Get a user",
          responses: { "200": { description: "User found" } },
        },
      },
    });

    const document = manager.generate();

    expect(document.openapi).toBe("3.1.0");
    expect(document.paths["/users/{id}"]?.get?.operationId).toBe("users.get");
  });

  it("serializes to JSON", () => {
    const manager = new OpenAPIManager("3.1.0");
    manager.addRoute({
      method: "get",
      path: "/health",
      metadata: {
        openapi: {
          responses: { "200": { description: "OK" } },
        },
      },
    });

    const json = manager.toJSON();
    expect(json).toContain('"openapi": "3.1.0"');
    expect(json).toContain('"title": "Lattice API"');
  });

  it("invalidates the cache", () => {
    const manager = new OpenAPIManager("3.1.0");
    manager.addRoute({
      method: "get",
      path: "/health",
      metadata: {
        openapi: {
          responses: { "200": { description: "OK" } },
        },
      },
    });

    manager.generate();
    manager.invalidate();

    expect(manager.getDocument()).toBeDefined();
  });
});

describe("toOpenAPIJSON", () => {
  it("serializes a document to JSON", () => {
    const registry = new OpenAPIRegistryImpl();
    registry.registerRoute({
      method: "get",
      path: "/users",
      operation: {
        responses: { "200": { description: "OK" } },
      },
    });

    const document = registry.generate();
    const json = toOpenAPIJSON(document);

    expect(json).toContain('"openapi"');
    expect(json).toContain('"paths"');
  });
});

describe("toOpenAPIYAML", () => {
  it("returns a string representation", () => {
    const registry = new OpenAPIRegistryImpl();
    const document = registry.generate();
    const yaml = toOpenAPIYAML(document);

    expect(yaml).toContain("openapi");
  });
});
