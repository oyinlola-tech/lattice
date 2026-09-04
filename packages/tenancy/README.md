# @zudojs/tenancy

Multi-tenant context and isolation with tenant resolution, AsyncLocalStorage propagation, resolver chains, trust levels, and guard middleware.

## Installation

```bash
npm install @zudojs/tenancy
```

## Quick Start

```typescript
import { createTenantContextManager } from "@zudojs/tenancy";

const manager = createTenantContextManager({
  resolvers: [headerResolver, subdomainResolver, jwtResolver],
});

const tenant = await manager.resolve(request);
```

## Features

- Tenant resolution from headers, subdomains, JWT, or custom resolvers
- AsyncLocalStorage context propagation
- Tenant isolation and data scoping
- Trust levels (trusted, untrusted, isolated)
- Guard middleware for route protection

## Use Cases

- SaaS multi-tenant applications
- Data isolation per tenant
- Tenant-aware routing
- Compliance and data separation
