# Contributing to Lattice

> Thank you for your interest in contributing to Lattice.
> This document explains how to set up the project, follow our conventions, and submit changes.

---

## 1. Code of Conduct

- Be respectful and inclusive.
- Focus on constructive feedback.
- Welcome newcomers.
- Follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

## 2. Getting Started

### 2.1 Prerequisites

- **Node.js** >= 24.0.0
- **npm** >= 11.0.0
- **Git** >= 2.30.0

### 2.2 Clone the Repository

```bash
git clone https://github.com/lattice-framework/lattice.git
cd lattice
```

### 2.3 Install Dependencies

```bash
npm install
```

### 2.4 Verify Setup

```bash
npm run typecheck
npm run architect:check
npm test
```

All checks must pass before starting work.

---

## 3. Project Structure

```
lattice/
├── packages/           # All @lattice/* packages
│   ├── errors/
│   ├── types/
│   ├── constants/
│   ├── container/
│   └── ...
├── examples/           # Integration examples
├── tests/              # Integration and architecture tests
│   └── architect/      # Architecture boundary tests
├── docs/               # Documentation site
├── scripts/            # Build and utility scripts
├── ARCHITECTURE.md     # Conceptual architecture
├── DEPENDENCIES.md     # Package dependency rules
├── PACKAGE_RULES.md    # Package design standards
├── ROADMAP.md          # Implementation status
├── package.json        # Root package.json
└── tsconfig.json       # Root TypeScript config
```

---

## 4. Package Structure

Every package follows this structure:

```
packages/<package-name>/
├── src/
│   ├── index.ts                    # Public API barrel exports
│   ├── <domain>/                   # Domain-specific folders
│   │   ├── index.ts                # Subfolder barrel
│   │   ├── <domain>.<concern>.ts   # Implementation
│   │   └── ...
│   ├── <domain>Errors/
│   │   ├── index.ts
│   │   └── <domain>Error.core.ts
│   └── ...
├── tests/
│   └── <package-name>.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

See `PACKAGE_RULES.md` for detailed rules.

---

## 5. Development Workflow

### 5.1 Choose a Task

Check `ROADMAP.md` for planned work.
Look for `⏳ Planned` or `🔄 In Progress` items.

### 5.2 Create a Branch

```bash
git checkout -b feat/my-new-feature
# or
git checkout -b fix/my-bug-fix
```

Branch naming:
- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation
- `refactor/` — code refactoring
- `test/` — test changes
- `chore/` — maintenance

### 5.3 Implement the Change

1. Read the relevant documentation:
   - `ARCHITECTURE.md` — conceptual overview
   - `DEPENDENCIES.md` — dependency rules
   - `PACKAGE_RULES.md` — package design standards

2. Write code following the conventions.

3. Write tests for all public APIs.

4. Run checks:
   ```bash
   npm run typecheck
   npm run architect:check
   npm run test --workspace=@lattice/<package-name>
   ```

### 5.4 Commit

```bash
git add .
git commit -m "feat(events): add event replay capability"
```

Commit message format:
- `feat(scope): description` — new feature
- `fix(scope): description` — bug fix
- `docs(scope): description` — documentation
- `refactor(scope): description` — refactoring
- `test(scope): description` — tests
- `chore(scope): description` — maintenance

### 5.5 Push and Create PR

```bash
git push origin feat/my-new-feature
```

Create a PR using the GitHub CLI:
```bash
gh pr create --title "feat(events): add event replay capability" --body "Description of changes"
```

### 5.6 Code Review

- Address review comments.
- Ensure CI passes (`architect:check`, `typecheck`, `tests`).
- Squash commits if requested.

---

## 6. Adding a New Package

### 6.1 Proposal

Before implementing a new package:
1. Open an issue describing the package purpose.
2. Discuss the API design and dependencies.
3. Get approval from maintainers.

### 6.2 Determine the Tier

See `DEPENDENCIES.md` for the tier system.

1. Identify which existing `@lattice/*` packages the new package needs.
2. The new package belongs in the highest tier of its dependencies.
3. Document the tier in `DEPENDENCIES.md`.

### 6.3 Create the Package

```bash
mkdir -p packages/<name>/src
mkdir -p packages/<name>/tests
```

Create the required files:
- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `tests/<name>.test.ts`
- `README.md`

### 6.4 Register the Package

1. Add the package to `DEPENDENCIES.md`.
2. Update `architect-check.js` with the package tier.
3. Update `tests/architect/boundaries.test.ts` with the package tier.
4. Update `ROADMAP.md` with the new package.

### 6.5 Implement and Test

Follow `PACKAGE_RULES.md` for implementation standards.

---

## 7. Adding Dependencies

### 7.1 Internal Dependencies

When adding a dependency on another `@lattice/*` package:

1. Verify the dependency is in a lower or equal tier.
2. Use exact version `0.1.0`.
3. Run `npm run architect:check`.
4. Update documentation if needed.

### 7.2 External Dependencies

When adding an external dependency:

1. Justify the dependency in the package README.
2. Prefer lightweight, well-maintained libraries.
3. Avoid adding external dependencies to foundational packages (Tier 0, Tier 1).

---

## 8. Testing Requirements

### 8.1 All New Code Must Have Tests

Every public API must have corresponding tests.

### 8.2 Test Structure

```ts
import { describe, expect, it } from "vitest";
import { createEventBus } from "../src/index.js";

describe("EventBus", () => {
  describe("createEventBus", () => {
    it("creates an event bus with default options", () => {
      const bus = createEventBus();
      expect(bus).toBeDefined();
    });
  });
});
```

### 8.3 Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific package
npm run test --workspace=@lattice/events

# Run tests in watch mode
npm run test:watch --workspace=@lattice/events
```

---

## 9. TypeScript Conventions

### 9.1 Strict Mode

All packages use strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 9.2 No any

Use `unknown` or specific types instead of `any`.

```ts
// ✅ Correct
function parse(input: unknown): Result { ... }

// ❌ Wrong
function parse(input: any): Result { ... }
```

### 9.3 Type Imports

Use `import type` for type-only imports.

```ts
import type { EventBus } from "@lattice/events.js";
```

### 9.4 File Extensions

Use `.js` extensions on all relative imports.

```ts
import { helper } from "./utils/helper.js";
```

---

## 10. Error Handling

### 10.1 Use @lattice/errors

All errors must extend `BaseError` from `@lattice/errors`.

### 10.2 Domain Errors

Each package defines domain-specific errors in a `<domain>Errors/` folder.

```ts
// packages/events/src/eventErrors/eventError.core.ts
export class EventPublishError extends BaseError {
  constructor(message: string) {
    super(message, { code: ErrorCode.EVENT_PUBLISH_ERROR });
  }
}
```

### 10.3 Error Metadata

Errors should carry operational metadata.

```ts
throw new PluginDependencyError(
  "Plugin A depends on Plugin B",
  { pluginName: "A", metadata: { dependencyName: "B" } }
);
```

---

## 11. Performance Guidelines

### 11.1 Minimize Allocations

- Avoid unnecessary object creation in hot paths.
- Use object pools for high-frequency allocations.

### 11.2 Avoid Reflection

- Minimize decorators and metadata reflection.
- Prefer compile-time code generation.

### 11.3 Lazy Initialization

Defer expensive operations until needed.

### 11.4 Concurrency Limits

Limit concurrency to prevent resource exhaustion.

---

## 12. Security Guidelines

### 12.1 Input Validation

All external input must be validated at the boundary using `@lattice/security`.

### 12.2 Secrets

- Never hardcode secrets, tokens, or credentials.
- Use environment variables.
- Configuration values matching sensitive patterns are auto-redacted.

### 12.3 Error Exposure

Never expose internal error details to clients.

### 12.4 Security-Critical Changes

Flag any auth-adjacent code changes immediately.

---

## 13. Documentation

### 13.1 JSDoc

All public APIs must have JSDoc comments.

```ts
/**
 * Creates a new event bus instance.
 *
 * @param options - Optional configuration.
 * @returns A new EventBus instance.
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  ...
}
```

### 13.2 README

Every package must have a `README.md`:
- Package purpose.
- Installation.
- Quick start.
- API reference.
- Examples.

### 13.3 Architecture Docs

- `ARCHITECTURE.md` — conceptual overview.
- `DEPENDENCIES.md` — dependency rules.
- `PACKAGE_RULES.md` — package design standards.
- `ROADMAP.md` — implementation status.

---

## 14. Deprecation Policy

### 14.1 Process

1. Mark the API as deprecated in JSDoc.
2. Emit a warning when used.
3. Keep functional for at least one minor version.
4. Remove in the next major version.

### 14.2 Example

```ts
/**
 * @deprecated Use `createEventBusV2` instead.
 * Will be removed in v2.0.0.
 */
export function createEventBus() {
  console.warn("createEventBus is deprecated. Use createEventBusV2 instead.");
  ...
}
```

---

## 15. CI/CD

### 15.1 Required Checks

Every PR must pass:
- `npm run architect:check` — architecture boundaries
- `npm run typecheck` — TypeScript compilation
- `npm test` — all tests passing

### 15.2 Pre-merge Checklist

- [ ] All CI checks pass.
- [ ] Code review approved.
- [ ] Documentation updated.
- [ ] `ROADMAP.md` updated if needed.

---

## 16. Getting Help

- **Issues:** https://github.com/lattice-framework/lattice/issues
- **Discussions:** https://github.com/lattice-framework/lattice/discussions
- **Documentation:** See `ARCHITECTURE.md`, `DEPENDENCIES.md`, `PACKAGE_RULES.md`

---

## 17. License

By contributing, you agree that your contributions will be licensed under the MIT License.
See `LICENSE` at the repository root.
