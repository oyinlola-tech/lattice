# @oyinlola141/lattice-permissions

Generic authorization engine — RBAC, ABAC, resource-level checks, wildcards, role hierarchy, policies, abilities, and an explain mode for debugging.

## When to use

Import this when you need:

- roles, permissions, and assignments
- attribute-based decisions (the user can `read` if `record.ownerId === user.id`)
- resource-level checks (`can(user, "update", post)`)
- an explain mode that returns the matched rule for audits

For tenant-scoped authorization, layer `@oyinlola141/lattice-tenancy` on top.

## Installation

```bash
npm install @oyinlola141/lattice-permissions
```

## Public API

```typescript
import {
  createPermissionEngine,
  createPolicy,
  type PermissionEngine,
  type PermissionRule,
  type PermissionActor,
  type PermissionDecision,
  type PermissionString,
  type RoleDefinition,
  type Ability,
  type PolicyContext,
} from "@oyinlola141/lattice-permissions";
```

## Usage

```typescript
import {
  createPermissionEngine,
  createPolicy,
} from "@oyinlola141/lattice-permissions";

const engine = createPermissionEngine();

engine.register(
  createPolicy({
    name: "owner-can-update",
    action: "post:update",
    evaluate: ({ user, resource }) => resource.ownerId === user.id,
  }),
);

const ok = engine.evaluate({ user, action: "post:update", resource: post });
```

## License

MIT
