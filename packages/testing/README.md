# @oyinlola141/lattice-testing

Test helpers — test containers, fakes, spies, fake clocks, fixture builders, HTTP test utilities, and assertions. Everything you need to test a Lattice app without wiring real infrastructure.

## When to use

Import this in your test files (`*.test.ts`) to:

- spin up a container with fakes
- capture log output with a `SpyLogger`
- freeze time with a `TestClock`
- issue test HTTP requests without binding to a port
- load test config from memory

## Installation

```bash
npm install @oyinlola141/lattice-testing
```

## Public API

```typescript
import {
  createTestContainer,
  createTestApplication,
  createTestContext,
  SpyLogger,
  TestClock,
  createTestConfig,
  createTestEventBus,
  createTestMessageBus,
  createTestQueue,
  createHttpTestClient,
  createFixture,
  assertLatticeError,
  assertRejects,
  assertLogContains,
  type CleanupManager,
  type Fixture,
  type TestApplication,
  type TestContainer,
  type TestSerialization,
} from "@oyinlola141/lattice-testing";
```

## Usage

```typescript
import { createTestContainer, SpyLogger } from "@oyinlola141/lattice-testing";

const container = createTestContainer();
const log = new SpyLogger();
container.bind("logger").toValue(log);

const result = await container.resolve("service").doWork();
expect(log.entries).toHaveLength(1);
```

## License

MIT
