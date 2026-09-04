# @zudojs/testing

Test helpers, fixtures, mocks, and utilities for testing Zudojs applications.

## Installation

```bash
npm install @zudojs/testing
```

## Quick Start

```typescript
import { createMockContainer, createTestLogger } from "@zudojs/testing";

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

- Unit testing Zudojs components
- Integration testing
- Mocking dependencies
- Test fixtures
