# Project Structure

Zudolib projects follow a consistent layout regardless of architecture.

## Standard Layout

```
my-app/
├── src/
│   ├── modules/              # Feature modules
│   │   └── <feature>/
│   │       ├── <feature>.module.ts
│   │       ├── <feature>.controller.ts
│   │       └── <feature>.service.ts
│   ├── main.ts               # Application entry point
│   └── config/               # Environment-specific config
├── tests/
│   └── <feature>.test.ts
├── package.json
├── tsconfig.json
└── zudolib.config.ts
```

## Architecture Variants

### Monolith

Single deployable unit. Modules live under `src/modules/`.

### Modular Monolith

Modules are isolated by domain. Still a single deployable unit.

### Microservice

Multiple services under `apps/` or separate packages.

```
apps/
├── gateway/
├── identity/
├── enrollment/
└── assessment/
```

## Configuration

`zudolib.config.ts` defines the application architecture:

```typescript
export default {
  architecture: "monolith",
  database: "postgresql",
  api: "rest",
};
```

## Zudolib Manifest

The CLI generates `.zudolib/manifest.json` to track generated code:

```json
{
  "version": "0.1.0",
  "architecture": "monolith",
  "capabilities": ["database", "events", "http"],
  "generatedAt": "2026-09-03T00:00:00.000Z"
}
```

## Package Structure

Each Zudolib package follows the same internal layout:

```
packages/<name>/
├── src/
│   ├── index.ts
│   ├── <domain>/
│   │   ├── index.ts
│   │   ├── <domain>.<concern>.ts
│   │   └── ...
│   └── <domain>Errors/
├── tests/
├── package.json
├── tsconfig.json
└── README.md
```
