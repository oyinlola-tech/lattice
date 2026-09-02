# @oyinlola141/lattice-docs

Documentation infrastructure — document model, registry, frontmatter parser, navigation, validation, examples, and markdown/JSON generation.

## When to use

Import this when you need:

- a typed document model (frontmatter + body + examples)
- a registry to discover and validate your docs
- generate navigation trees
- render to markdown or JSON
- validate that examples still type-check

## Installation

```bash
npm install @oyinlola141/lattice-docs
```

## Public API

```typescript
import {
  createDocumentRegistry,
  createFrontmatterParser,
  createNavigation,
  createValidator,
  createGenerator,
  type DocumentationDocument,
  type DocumentationContent,
  type DocumentationNavigationItem,
  type DocumentRegistry,
  type DocumentationExample,
  type ValidationResult,
} from "@oyinlattice141/lattice-docs";
```

## Usage

```typescript
import {
  createDocumentRegistry,
  createFrontmatterParser,
} from "@oyinlola141/lattice-docs";

const parser = createFrontmatterParser();
const registry = createDocumentRegistry();

const doc = parser.parseFile("./docs/getting-started.md");
registry.register(doc);
const nav = registry.navigation();
```

## License

MIT
