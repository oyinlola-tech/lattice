# @oyinlola141/lattice-serialization

Data translation layer — JSON serializer with type transformers for `Date`, `BigInt`, `Map`, `Set`, `Buffer`, `Error`, and a transformer registry for custom types.

## When to use

Import this when you need:

- serialize/deserialize values that contain `Date`, `BigInt`, `Map`, ...
- register custom transformers for your own types
- wrap payloads in versioned envelopes
- safely round-trip unknown JSON

## Installation

```bash
npm install @oyinlola141/lattice-serialization
```

## Public API

```typescript
import {
  JSONSerializer,
  SerializerRegistry,
  TransformerRegistry,
  DateTransformer,
  BigIntTransformer,
  MapTransformer,
  SetTransformer,
  BufferTransformer,
  ErrorTransformer,
  type Serializer,
  type TypeTransformer,
  type SerializedEnvelope,
} from "@oyinlola141/lattice-serialization";
```

## Usage

```typescript
import {
  JSONSerializer,
  DateTransformer,
  BigIntTransformer,
} from "@oyinlola141/lattice-serialization";

const serializer = new JSONSerializer();
serializer.transformers.register(new DateTransformer());
serializer.transformers.register(new BigIntTransformer());

const json = serializer.serialize({ when: new Date(), n: 10n });
const back = serializer.deserialize<{ when: Date; n: bigint }>(json);
```

## License

MIT
