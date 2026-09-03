---
"@zudo/cli": major
"@zudo/adapters": major
"@zudo/api": major
"@zudo/auth": major
"@zudo/cache": major
"@zudo/config": major
"@zudo/constants": major
"@zudo/container": major
"@zudo/core": major
"@zudo/cqrs": major
"@zudo/crypto": major
"@zudo/database": major
"@zudo/docs": major
"@zudo/errors": major
"@zudo/events": major
"@zudo/feature-flags": major
"@zudo/http": major
"@zudo/lifecycle": major
"@zudo/logger": major
"@zudo/messaging": major
"@zudo/middleware": major
"@zudo/observability": major
"@zudo/openapi": major
"@zudo/permissions": major
"@zudo/plugins": major
"@zudo/queue": major
"@zudo/rpc": major
"@zudo/runtime": major
"@zudo/scheduler": major
"@zudo/schema": major
"@zudo/security": major
"@zudo/serialization": major
"@zudo/storage": major
"@zudo/tenancy": major
"@zudo/testing": major
"@zudo/transactions": major
"@zudo/types": major
"@zudo/validation": major
---

BREAKING CHANGE: Rename all packages from `@oyinlola141/lattice-*` to `@zudo/*` and `@oyinlola141/lattice-cli` to `zudo-cli`.

- Scoped packages: `@zudo/adapters`, `@zudo/api`, `@zudo/auth`, etc.
- CLI package: `zudo-cli` (unscoped)
- All internal imports, docs, CI, and examples updated

Migration:
```bash
# Old
npm install @oyinlola141/lattice-cli
npm install @oyinlola141/lattice-errors

# New
npm install zudo-cli
npm install @zudo/errors
```
