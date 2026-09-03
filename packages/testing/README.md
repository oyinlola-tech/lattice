# @oyinlola141/lattice-testing

Test helpers, fixtures, mocks, and utilities for testing Lattice applications.

## Installation

```bash
npm install @oyinlola141/lattice-testing
```

## Quick Start

```typescript
import {
  createMockContainer,
  createTestLogger,
} from "@oyinlola141/lattice-testing";

const container = createMockContainer();
container.register("database", mockDatabase);

const logger = createTestLogger();
```

## Features

- Mock container for testing
- Test fixtures and factories
- In-memory adapters for testing
- Test logger with assertions
- Snapshot testing utilities

## Use Cases

- Unit testing Lattice components
- Integration testing
- Mocking dependencies
- Test fixtures
