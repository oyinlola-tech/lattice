# @oyinlola141/lattice-permissions

Generic authorization engine with RBAC, ABAC, resource authorization, wildcards, role hierarchy, policies, and abilities.

## Installation

```bash
npm install @oyinlola141/lattice-permissions
```

## Quick Start

```typescript
import { createPermissionEngine } from "@oyinlola141/lattice-permissions";

const engine = createPermissionEngine({
  roles: {
    admin: { permissions: ["user:*", "post:*"] },
    editor: { permissions: ["post:read", "post:write"] },
  },
});

const allowed = await engine.check("admin", "user", "delete");
```

## Features

- Role-Based Access Control (RBAC)
- Attribute-Based Access Control (ABAC)
- Resource authorization with wildcards
- Role hierarchy and inheritance
- Policy engine
- Ability-based checks
- Explain mode for debugging

## Use Cases

- API authorization
- Multi-tenant access control
- Admin panel permissions
- Fine-grained resource policies
