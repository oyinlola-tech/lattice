# @zudolib/serialization

Data translation layer with JSON serializer, type transformers, envelopes, and registry for Zudo applications.

## Installation

```bash
npm install @zudolib/serialization
```

## Quick Start

```typescript
import { createSerializer } from "@zudolib/serialization";

const serializer = createSerializer({
  format: "json",
  transformers: [dateTransformer, bigIntTransformer],
});

const json = serializer.stringify({ id: "123", createdAt: new Date() });
const obj = serializer.parse(json);
```

## Features

- JSON serialization with type transformers
- Envelope pattern for API responses
- Transformer registry
- Support for BigInt, Date, Buffer, and custom types
- Circular reference detection

## Use Cases

- API response serialization
- Event payload serialization
- Cache serialization
- Cross-service data transfer
