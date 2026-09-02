# @oyinlola141/lattice-types

Shared type guards, utility types, and type converters. Pure TypeScript — no runtime cost, no dependencies.

## When to use

Import this when you need:

- type guards (`isPlainObject`, `isDate`, `isEmail`, `isUUID`)
- utility types (`Maybe`, `DeepReadonly`, `DeepPartial`, `Prettify`)
- type converters (`toNumber`, `toBoolean`, `toJson`)
- branded-type constructors

## Installation

```bash
npm install @oyinlola141/lattice-types
```

## Public API

```typescript
import {
  // Type guards
  isPlainObject,
  isDate,
  isString,
  isNumber,
  isBoolean,
  isNullOrUndefined,
  isArray,
  isFunction,
  isPromise,
  isEmail,
  isURL,
  isUUID,
  isEmpty,

  // Utility types
  type Maybe,
  type DeepReadonly,
  type DeepPartial,
  type DeepRequired,
  type Nullable,
  type NonNullableFields,
  type Prettify,
  type Primitive,
  type JSONObject,
  type Awaitable,
  type Constructor,
  type AbstractConstructor,

  // Converters
  toBoolean,
  toNumber,
  toString,
  toJson,
  fromJson,
} from "@oyinlola141/lattice-types";
```

## Usage

```typescript
import {
  isPlainObject,
  type Maybe,
  type DeepReadonly,
} from "@oyinlola141/lattice-types";

function findUser(id: string): Maybe<User> {
  if (isPlainObject(cache[id])) return cache[id] as User;
  return null;
}

const frozen: DeepReadonly<Config> = config as DeepReadonly<Config>;
```

## License

MIT
