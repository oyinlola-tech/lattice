# Dependency Direction

> Dependencies in Zudolib flow inward, from higher-level packages to lower-level packages.
> This document explains why this matters, how to evaluate dependency decisions,
> and how to recognize and fix violations.

---

## 1. The Core Principle

Dependencies must flow from higher-level packages to lower-level packages.

```
Foundation → Runtime Primitives → Application Architecture → Transport → Developer Experience
```

No package may depend on a package in a higher tier.

This is sometimes called **"inward dependency direction"** or **"dependency inversion at the package level."**

---

## 2. Why This Matters for a Framework

Zudolib is a framework. Applications depend on it. That means:

- **Breaking changes propagate outward.** If `@zudoliblib/core` depends on `@zudoliblib/http`, then every application using `@zudoliblib/core` indirectly depends on `@zudoliblib/http`. A breaking change in `@zudoliblib/http` breaks `@zudoliblib/core`, which breaks every application.
- **Circular dependencies become inevitable.** If `@zudoliblib/http` depends on `@zudoliblib/core`, and `@zudoliblib/core` depends on `@zudoliblib/events`, and `@zudoliblib/events` depends on `@zudoliblib/http` (to publish request events), you have a cycle. Cycles make builds fragile, testing difficult, and refactoring dangerous.
- **Foundation code must remain stable.** The packages at the bottom of the dependency graph (`@zudoliblib/errors`, `@zudoliblib/types`, `@zudoliblib/constants`) are imported by everything. If they depend on higher-level packages, they become unstable and drag the entire framework down with them.
- **Replaceability requires abstraction.** If `@zudoliblib/http` directly imports `@zudoliblib/postgres`, you cannot swap databases without modifying the HTTP package. By depending on `@zudoliblib/database` abstractions instead, `@zudoliblib/http` stays platform-agnostic.

---

## 3. Visualizing the Dependency Graph

The Zudolib dependency graph is a directed acyclic graph (DAG) flowing inward:

```
 Tier 4 (DX)          testing, docs
      │
      ▼
 Tier 3 (Transport)   http, cli
      │
      ▼
 Tier 2 (Application) core, cqrs, auth, runtime, rpc, api, openapi
      │
      ▼
 Tier 1 (Foundation)  container, logger, events, config, security,
      │               transactions, permissions, plugins, tenancy,
      │               cache, storage, queue, scheduler, database,
      │               observability, adapters, ...
      ▼
 Tier 0 (Leaf)        errors, types
```

Every arrow points downward. There are no upward arrows.

---

## 4. What "Depends On" Means

A package A **depends on** package B when A imports from B:

```ts
// @zudoliblib/http imports from @zudoliblib/core
import { ApplicationContext } from "@zudoliblib/core";
```

This means:

- `@zudoliblib/http` → `@zudoliblib/core` is allowed (higher → lower)
- `@zudoliblib/core` → `@zudoliblib/http` is forbidden (lower → higher)

---

## 5. Evaluating a New Dependency

Before adding a dependency, ask:

### 5.1 What tier is the target package?

| Question                 | Answer → Action                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| Is it in the same tier?  | Usually OK. Verify no circular dependency.                           |
| Is it in a lower tier?   | OK. This is the expected direction.                                  |
| Is it in a higher tier?  | Forbidden. Find a lower-tier alternative or extract the shared code. |
| Is it a peer dependency? | Allowed only if optional, documented, and justified.                 |

### 5.2 Does this create a circular dependency?

Trace the dependency chain:

```
@zudoliblib/http → @zudoliblib/core → @zudoliblib/events → @zudoliblib/http
```

If you can follow imports from the new dependency back to the original package, you have a cycle.

### 5.3 Is there a lower-tier alternative?

Before depending on a higher-tier package, ask:

- Can the shared code move to a lower-tier package?
- Can the interface be defined in a lower-tier package?
- Can this be a peer dependency instead?

### 5.4 Will this affect applications?

If `@zudoliblib/http` depends on `@zudoliblib/database`, then every application using `@zudoliblib/http` must also install and configure `@zudoliblib/database`. That is a hidden coupling that violates the framework's modularity.

---

## 6. Common Violations

### 6.1 Foundation Depending on Application

```
❌ @zudoliblib/core → @zudoliblib/http
```

`@zudoliblib/core` is the application context. It should not know about HTTP.

**Fix:** Move HTTP-specific logic to `@zudoliblib/http` or a lower-tier package.

### 6.2 Transport Depending on Transport

```
❌ @zudoliblib/http → @zudoliblib/rpc
❌ @zudoliblib/rpc → @zudoliblib/http
```

Transport packages must be independent. They translate external requests into internal calls.

**Fix:** Extract shared transport logic into `@zudoliblib/adapters` or a new lower-tier package.

### 6.3 Application Depending on Transport

```
❌ @zudoliblib/cqrs → @zudoliblib/http
```

CQRS commands and queries should not know about HTTP.

**Fix:** Use `@zudoliblib/adapters` or event-driven integration instead of direct imports.

### 6.4 Infrastructure Depending on Transport

```
❌ @zudoliblib/database → @zudoliblib/http
❌ @zudoliblib/queue → @zudoliblib/http
```

Infrastructure packages must not know about transport.

**Fix:** Keep infrastructure packages transport-agnostic.

### 6.5 Leaf Packages Depending on Anything

```
❌ @zudoliblib/errors → @zudoliblib/types
❌ @zudoliblib/types → @zudoliblib/constants
```

Leaf packages must have no `@zudoliblib/*` dependencies.

**Fix:** Move shared code to the leaf package or create a new leaf package.

---

## 7. The Tier System

### 7.1 Tier Definitions

| Tier | Name                     | Can Import From         | Examples                                                   |
| ---- | ------------------------ | ----------------------- | ---------------------------------------------------------- |
| 0    | Leaf                     | Nothing (external only) | `@zudoliblib/errors`, `@zudoliblib/types`                        |
| 1    | Foundation               | Tier 0                  | `@zudoliblib/container`, `@zudoliblib/logger`, `@zudoliblib/events` |
| 2    | Application Architecture | Tier 0, Tier 1          | `@zudoliblib/core`, `@zudoliblib/cqrs`, `@zudoliblib/runtime`       |
| 3    | Transport                | Tier 0, Tier 1, Tier 2  | `@zudoliblib/http`, `@zudoliblib/cli`                            |
| 4    | Developer Experience     | Any                     | `@zudoliblib/testing`, `@zudoliblib/docs`                        |

### 7.2 Determining a Package's Tier

A package's tier is determined by the **highest tier of its dependencies**.

```
If @zudoliblib/http imports from:
  - @zudoliblib/core (Tier 2)
  - @zudoliblib/errors (Tier 0)
  - @zudoliblib/logger (Tier 1)

Then @zudoliblib/http belongs in Tier 3 (Transport)
```

### 7.3 Current Package Tiers

See `docs/dependencies/INDEX.md` for the complete package dependency table.

---

## 8. Peer Dependencies

Peer dependencies are allowed when:

1. The dependency is in a higher or equal tier.
2. The dependency is truly optional (the package functions without it).
3. The peer dependency is explicitly documented with its purpose.

### 8.1 Current Peer Dependencies

| Package                | Peer            | Tier | Purpose                         |
| ---------------------- | --------------- | ---- | ------------------------------- |
| `@zudoliblib/permissions` | `@zudoliblib/http` | 3    | HTTP-specific permission guards |
| `@zudoliblib/tenancy`     | `@zudoliblib/http` | 3    | HTTP-specific tenant resolution |

### 8.2 Peer Dependency Rules

- Peer dependencies must be declared in `peerDependencies` with `"optional": true` in `peerDependenciesMeta`.
- Peer dependencies must not create circular dependency chains.
- Peer dependencies must not be required for the package's core functionality.

---

## 9. Circular Dependencies

### 9.1 Definition

A circular dependency occurs when package A depends on package B, and package B (directly or transitively) depends on package A.

### 9.2 Detection

Circular dependencies are detected by:

- `architect-check.js` — manual script.
- `tests/architect/boundaries.test.ts` — automated test.
- CI pipeline — must pass before merging.

### 9.3 Resolution

When a circular dependency is detected:

1. Identify the cycle.
2. Determine which dependency is "incorrect" (usually the one violating tier rules).
3. Extract the shared code into a lower-tier package.
4. Update imports in both packages.

Example:

```
Before (circular):
  @zudoliblib/http → @zudoliblib/permissions → @zudoliblib/http

After (resolved):
  @zudoliblib/permissions-core (Tier 1) — shared authorization logic
  @zudoliblib/permissions (Tier 1) — imports permissions-core
  @zudoliblib/http (Tier 3) — imports permissions
```

### 9.4 Prevention

- Run `npm run architect:check` before committing.
- Review dependency changes in PRs.
- Use the tier system to guide package design.

---

## 10. Practical Examples

### 10.1 Good: HTTP depending on Core

```
@zudoliblib/http → @zudoliblib/core → @zudoliblib/events → @zudoliblib/errors
```

HTTP imports core for application context. Core imports events for event emission. Events import errors for error handling.

This is correct. Dependencies flow inward.

### 10.2 Bad: Core depending on HTTP

```
@zudoliblib/core → @zudoliblib/http → @zudoliblib/core
```

Core should not know about HTTP. This creates a circular dependency and violates the tier system.

**Fix:** Move HTTP-specific context into `@zudoliblib/http`. Core provides generic context interfaces.

### 10.3 Good: Database depending on Storage

```
@zudoliblib/database → @zudoliblib/storage → @zudoliblib/serialization → @zudoliblib/errors
```

Database imports storage abstractions. Storage imports serialization. Serialization imports errors.

This is correct.

### 10.4 Bad: Storage depending on Database

```
@zudoliblib/storage → @zudoliblib/database → @zudoliblib/storage
```

Storage should provide abstractions that database implements. Database should not depend on storage.

**Fix:** Define storage interfaces in `@zudoliblib/storage`. Implement them in `@zudoliblib/database`.

---

## 11. When to Break the Rules

The tier system exists to serve the framework, not the other way around.

### 11.1 Acceptable Exceptions

| Exception         | Condition                        | Example                                           |
| ----------------- | -------------------------------- | ------------------------------------------------- |
| Peer dependencies | Optional, documented, justified  | `@zudoliblib/permissions` peers with `@zudoliblib/http` |
| Testing imports   | Tier 4 only, never in production | `@zudoliblib/testing` imports any package            |
| Developer tooling | Not part of production bundle    | Build scripts, CLI tools                          |

### 11.2 Unacceptable Excuses

| Excuse                        | Reality                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------- |
| "It's just one small import"  | Small imports create hidden coupling that grows over time.                    |
| "We need it for convenience"  | Convenience for one package becomes maintenance burden for all.               |
| "It's only used in tests"     | If it's only used in tests, put it in `@zudoliblib/testing` or a dev dependency. |
| "The other package is stable" | Stability is not a reason to violate architecture.                            |
| "We'll refactor it later"     | Dependency direction is hard to refactor after the fact.                      |

---

## 12. Checklist for Dependency Changes

Before merging any PR that adds, removes, or changes a dependency:

- [ ] The target package is in the same or lower tier.
- [ ] No circular dependency is created.
- [ ] The dependency is justified in the PR description.
- [ ] `npm run architect:check` passes.
- [ ] `npm run typecheck` passes in the affected package.
- [ ] Documentation is updated if a new tier relationship is established.

---

## 13. Quick Reference

| Action                           | Rule                                                      |
| -------------------------------- | --------------------------------------------------------- |
| Adding a dependency              | Target must be same or lower tier.                        |
| Removing a dependency            | Remove import and dependency entry.                       |
| Changing a dependency            | Update version, verify tier, run checks.                  |
| Creating a new package           | Determine tier, update docs, register in architect-check. |
| Encountering a cycle             | Extract shared code to lower-tier package.                |
| Wanting a higher-tier dependency | Find lower-tier alternative or use peer dependency.       |

| Command                                        | Purpose                                     |
| ---------------------------------------------- | ------------------------------------------- |
| `npm run architect:check`                      | Verify dependency direction and tier rules. |
| `npm run typecheck --workspace=@zudoliblib/<pkg>` | Verify TypeScript compilation.              |
| `npm test`                                     | Run all tests.                              |
| `pnpm install`                                 | Install dependencies and update lockfile.   |
