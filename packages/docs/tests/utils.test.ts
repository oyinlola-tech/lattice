import { describe, it, expect } from "vitest";
import {
  normalizeDocumentId,
  documentIdFromPath,
  resolveDocumentLink,
  extractTitleFromMarkdown,
  extractHeadings,
  stripMarkdown,
} from "../src/utils/index.js";

describe("normalizeDocumentId", () => {
  it("removes leading and trailing dots", () => {
    expect(normalizeDocumentId(".test.")).toBe("test");
  });

  it("collapses consecutive dots", () => {
    expect(normalizeDocumentId("a..b...c")).toBe("a.b.c");
  });

  it("trims whitespace", () => {
    expect(normalizeDocumentId("  test  ")).toBe("test");
  });
});

describe("documentIdFromPath", () => {
  it("converts path to dot notation", () => {
    expect(documentIdFromPath("guides/http/routing")).toBe(
      "guides.http.routing",
    );
  });

  it("strips file extension", () => {
    expect(documentIdFromPath("guides/http/routing.md")).toBe(
      "guides.http.routing",
    );
  });

  it("handles backslashes", () => {
    expect(documentIdFromPath("guides\\http\\routing")).toBe(
      "guides.http.routing",
    );
  });
});

describe("resolveDocumentLink", () => {
  it("resolves relative link", () => {
    const result = resolveDocumentLink("guides.http.routing", "./middleware");
    expect(result).toBe("guides.http.middleware");
  });

  it("resolves parent link", () => {
    const result = resolveDocumentLink("guides.http.routing", "../db");
    expect(result).toBe("guides.db");
  });

  it("resolves absolute link", () => {
    const result = resolveDocumentLink("guides.http.routing", "/api");
    expect(result).toBe("api");
  });
});

describe("extractTitleFromMarkdown", () => {
  it("extracts first heading", () => {
    expect(extractTitleFromMarkdown("# Hello World")).toBe("Hello World");
  });

  it("returns undefined when no heading", () => {
    expect(extractTitleFromMarkdown("No heading here")).toBeUndefined();
  });

  it("ignores non-first headings", () => {
    expect(extractTitleFromMarkdown("text\n## Second\n# First")).toBe("First");
  });
});

describe("extractHeadings", () => {
  it("extracts all headings with levels", () => {
    const md = "# H1\n## H2\n### H3\n## Another H2";
    const headings = extractHeadings(md);

    expect(headings).toHaveLength(4);
    expect(headings[0]).toEqual({ level: 1, text: "H1" });
    expect(headings[1]).toEqual({ level: 2, text: "H2" });
    expect(headings[2]).toEqual({ level: 3, text: "H3" });
  });

  it("returns frozen array", () => {
    const headings = extractHeadings("# H1");
    expect(Object.isFrozen(headings)).toBe(true);
  });
});

describe("stripMarkdown", () => {
  it("strips heading markers", () => {
    expect(stripMarkdown("# Hello")).toBe("Hello");
  });

  it("strips bold and italic", () => {
    expect(stripMarkdown("**bold** and *italic*")).toBe("bold and italic");
  });

  it("strips code blocks", () => {
    expect(stripMarkdown("`code`")).toBe("code");
  });

  it("strips links", () => {
    expect(stripMarkdown("[text](url)")).toBe("text");
  });

  it("strips list markers", () => {
    expect(stripMarkdown("- item")).toBe("item");
  });
});
