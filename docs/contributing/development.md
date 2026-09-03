# Development

## Setup

```bash
git clone https://github.com/zudolib-framework/zudolib.git
cd zudolib
npm install
```

## Verify

```bash
npm run typecheck
npm run architect:check
npm test
```

## Build

```bash
npm run build
```

## Format

```bash
npm run format
```

## Adding a Package

1. Create the package directory under `packages/`.
2. Add `package.json`, `tsconfig.json`, `src/index.ts`, `tests/`, `README.md`.
3. Determine the tier and add dependencies with `workspace:*`.
4. Update `scripts/architect-check.js` and `tests/architect/boundaries.test.ts`.
5. Update `docs/contributing/architecture.md` and `DEPENDENCIES.md`.

## Adding a Dependency

- Verify the dependency is in a lower or equal tier.
- Use exact version `0.1.0` for internal dependencies.
- Run `npm run architect:check`.

## Conventions

- **Named exports only** — no default exports.
- **`import type`** for type-only imports.
- **`readonly`** on interface properties.
- **No `any`** — use `unknown` or specific types.
- **No `var`** — use `const` or `let`.
- **No inline comments** in implementation code.
- **`.js` extensions** on all relative imports.
- **`Object.freeze()`** for immutable data structures.
- **JSDoc** on all public API surfaces.
