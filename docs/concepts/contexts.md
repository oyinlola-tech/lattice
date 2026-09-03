# Contexts

Zudolib uses `AsyncLocalStorage` to propagate context through async call chains.

## Execution Context

The execution context carries request-scoped values:

- Request ID
- Correlation ID
- Tenant ID
- User ID
- Logger context

Context flows automatically. Application code never passes it manually.

```typescript
import { getContext } from "@zudoliblib/core";

const requestId = getContext().requestId;
```

## Tenant Context

Multi-tenant applications use tenant context to isolate data:

```typescript
import { getTenantContext } from "@zudoliblib/tenancy";

const tenantId = getTenantContext().tenantId;
```

## Transaction Context

Transactions propagate through the call chain:

```typescript
import { getTransactionContext } from "@zudoliblib/transactions";

const tx = getTransactionContext();
await tx.commit();
```

## Logger Context

Logger context enriches logs with request metadata:

```typescript
import { withContext } from "@zudoliblib/logger";

const child = logger.withContext({ requestId, userId });
child.info("Processing request");
```

## Principle

Contexts are:
- **Implicit** — flow through async calls without manual passing
- **Controlled** — only the values that need to propagate are stored
- **Isolated** — each context type is independent
