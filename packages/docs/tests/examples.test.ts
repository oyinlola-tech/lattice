import { describe, it, expect } from "vitest";
import {
  validateExample,
  renderExampleMarkdown,
  exampleToJSON,
} from "../src/examples/index.js";
import type { DocumentationExample } from "../src/examples/index.js";

const validExample: DocumentationExample = {
  id: "basic-router",
  title: "Basic Router",
  language: "typescript",
  code: 'const router = createRouter();',
  description: "Creates a simple router.",
};

describe("validateExample", () => {
  it("passes for valid example", () => {
    const result = validateExample(validExample);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails for missing ID", () => {
    const result = validateExample({
      ...validExample,
      id: "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("ID"))).toBe(true);
  });

  it("fails for missing language", () => {
    const result = validateExample({
      ...validExample,
      language: "",
    });
    expect(result.valid).toBe(false);
  });

  it("fails for missing code", () => {
    const result = validateExample({
      ...validExample,
      code: "",
    });
    expect(result.valid).toBe(false);
  });
});

describe("renderExampleMarkdown", () => {
  it("renders a code block", () => {
    const md = renderExampleMarkdown(validExample);

    expect(md).toContain("### Basic Router");
    expect(md).toContain("Creates a simple router.");
    expect(md).toContain("```typescript");
    expect(md).toContain("const router = createRouter();");
    expect(md).toContain("```");
  });

  it("renders without title or description", () => {
    const example: DocumentationExample = {
      id: "minimal",
      language: "js",
      code: "console.log('hi');",
    };

    const md = renderExampleMarkdown(example);
    expect(md).toContain("```js");
    expect(md).not.toContain("###");
  });
});

describe("exampleToJSON", () => {
  it("serializes to JSON-safe object", () => {
    const json = exampleToJSON(validExample);

    expect(json.id).toBe("basic-router");
    expect(json.title).toBe("Basic Router");
    expect(json.language).toBe("typescript");
    expect(json.code).toBe("const router = createRouter();");
    expect(json.description).toBe("Creates a simple router.");
  });
});
