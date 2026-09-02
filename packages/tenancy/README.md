# @oyinlola141/lattice-tenancy

Multi-tenant context and isolation — tenant resolution, `AsyncLocalStorage` propagation, resolver chains, trust levels, and guard middleware.

## When to use

Import this when you need:

- resolve the current tenant from a request (subdomain, header, JWT claim, path)
- propagate tenant context through every async call without passing it manually
- guard middleware that rejects requests without a tenant
- multi-tenant data isolation patterns

## Installation

```bash
npm install @oyinlola141/lattice-tenancy
```

## Public API

```typescript
import {
  createTenantContextManager,
  getCurrentTenant,
  withTenant,
  type Tenant,
  type TenantId,
  type TenantContext,
  type TenantResolver,
  type TenantRepository,
  type TenantContextStorage,
  type TenantResolverChain,
  type TrustLevel,
  type GuardOptions,
} from "@oyinlola141/lattice-tenancy";
```

## Usage

```typescript
import { createTenantContextManager, withTenant } from "@oyinlattice-tenancy";

const manager = createTenantContextManager({
  resolvers: [headerResolver("x-tenant-id"), subdomainResolver()],
});

await withTenant({ id: "t_1", name: "Acme" }, async () => {
  const tenant = getCurrentTenant();
  console.log(tenant.id);
});
```

## License

MIT
