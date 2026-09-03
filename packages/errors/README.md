# @zudoliblib/errors

Shared error base class, error codes, and error handling utilities for the Zudolib framework.

## Installation

```bash
npm install @zudoliblib/errors
```

## Quick Start

```typescript
import { ApplicationError, ErrorCode } from "@zudoliblib/errors";

throw new ApplicationError("Something went wrong", {
  code: ErrorCode.INTERNAL_SERVER_ERROR,
  statusCode: 500,
});
```

## Features

- Base error class with code and status code support
- Error categories (validation, authentication, authorization, etc.)
- Error code constants
- Error context and metadata
- Stack trace preservation

## Use Cases

- Consistent error handling across packages
- HTTP status code mapping
- Error categorization for monitoring
- User-friendly error messages
