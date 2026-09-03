# Basic API Example

A minimal REST API built with Zudo.

## Features

- Modular architecture
- Dependency injection
- Module lifecycle management
- HTTP request handling
- Request validation with Zod
- Configuration from environment variables
- Health checks
- Graceful shutdown

## Project Structure

```
src/
├── main.ts                  # Application entry point
├── config/
│   └── config.ts            # Environment configuration
├── app/
│   └── app.module.ts        # Root module
├── users/
│   ├── users.module.ts      # Users module
│   ├── users.controller.ts  # HTTP request handler
│   ├── users.service.ts     # Business logic
│   ├── users.schema.ts      # Validation schemas
│   └── users.types.ts       # TypeScript types
└── health/
    ├── health.module.ts     # Health module
    └── health.controller.ts # Health check handler
```

## Installation

From the repository root:

```bash
npm install
```

## Run

```bash
# From the examples/basic-api directory
npm run dev

# Or from the repository root
npm run dev --workspace=@zudolib/example-basic-api
```

The server starts at `http://localhost:3000`.

## Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-31T..."
}
```

### List Users

```bash
curl http://localhost:3000/users
```

Response:

```json
[]
```

### Create User

```bash
curl \
  -X POST \
  http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

Response:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-08-31T..."
}
```

### Get User

```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

## Configuration

Environment variables (see `.env.example`):

| Variable   | Default       | Description |
| ---------- | ------------- | ----------- |
| `PORT`     | `3000`        | Server port |
| `HOST`     | `0.0.0.0`     | Server host |
| `NODE_ENV` | `development` | Environment |

## Architecture

This example demonstrates the Zudo module system:

```
AppModule
│
├── UsersModule
│   ├── UsersController (HTTP handler)
│   └── UsersService (business logic)
│
└── HealthModule
    └── HealthController (HTTP handler)
```

Each module:

- Extends `BaseModule` from `@zudolib/core`
- Implements lifecycle hooks (`onInitialize`, `onShutdown`)
- Encapsulates its own controllers and services
- Manages its own dependencies
