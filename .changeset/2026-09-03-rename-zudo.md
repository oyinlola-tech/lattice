---
"@zudoliblib/cli": major
"@zudoliblib/adapters": major
"@zudoliblib/api": major
"@zudoliblib/auth": major
"@zudoliblib/cache": major
"@zudoliblib/config": major
"@zudoliblib/constants": major
"@zudoliblib/container": major
"@zudoliblib/core": major
"@zudoliblib/cqrs": major
"@zudoliblib/crypto": major
"@zudoliblib/database": major
"@zudoliblib/docs": major
"@zudoliblib/errors": major
"@zudoliblib/events": major
"@zudoliblib/feature-flags": major
"@zudoliblib/http": major
"@zudoliblib/lifecycle": major
"@zudoliblib/logger": major
"@zudoliblib/messaging": major
"@zudoliblib/middleware": major
"@zudoliblib/observability": major
"@zudoliblib/openapi": major
"@zudoliblib/permissions": major
"@zudoliblib/plugins": major
"@zudoliblib/queue": major
"@zudoliblib/rpc": major
"@zudoliblib/runtime": major
"@zudoliblib/scheduler": major
"@zudoliblib/schema": major
"@zudoliblib/security": major
"@zudoliblib/serialization": major
"@zudoliblib/storage": major
"@zudoliblib/tenancy": major
"@zudoliblib/testing": major
"@zudoliblib/transactions": major
"@zudoliblib/types": major
"@zudoliblib/validation": major
---

BREAKING CHANGE: Rename all packages from `@zudoliblib/*` to `@zudoliblib/*` and `@zudoliblib/cli` to `zudolib-cli`.

- Scoped packages: `@zudoliblib/adapters`, `@zudoliblib/api`, `@zudoliblib/auth`, etc.
- CLI package: `zudolib-cli` (unscoped)
- All internal imports, docs, CI, and examples updated

Migration:
```bash
# Old
npm install @zudoliblib/cli
npm install @zudoliblib/errors

# New
npm install zudolib-cli
npm install @zudoliblib/errors
```
