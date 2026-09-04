# @zudojs/docs

Documentation infrastructure with structured document model, registry, validation, navigation, frontmatter parsing, and markdown/JSON generation.

## Installation

```bash
npm install @zudojs/docs
```

## Quick Start

```typescript
import { createDocumentRegistry } from "@zudojs/docs";

const registry = createDocumentRegistry();

registry.register({
  id: "getting-started",
  title: "Getting Started",
  content: "# Getting Started\n\nWelcome to Zudojs...",
});
```

## Features

- Document model with frontmatter
- Document registry and discovery
- Navigation tree generation
- Markdown and JSON generation
- Document validation

## Use Cases

- API documentation
- User guides
- Knowledge bases
- Documentation sites
