# @zudolib/testing

Test helpers, fixtures, mocks, and utilities for testing Zudo applications.

## Installation

```bash
npm install @zudolib/testing
```

## Quick Start

```typescript
import { createMockContainer, createTestLogger } from "@zudolib/testing";

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

- Unit testing Zudo components
- Integration testing
- Mocking dependencies
- Test fixtures
