---
"@zudolib/cli": major
"@zudolib/adapters": major
"@zudolib/api": major
"@zudolib/auth": major
"@zudolib/cache": major
"@zudolib/config": major
"@zudolib/constants": major
"@zudolib/container": major
"@zudolib/core": major
"@zudolib/cqrs": major
"@zudolib/crypto": major
"@zudolib/database": major
"@zudolib/docs": major
"@zudolib/errors": major
"@zudolib/events": major
"@zudolib/feature-flags": major
"@zudolib/http": major
"@zudolib/lifecycle": major
"@zudolib/logger": major
"@zudolib/messaging": major
"@zudolib/middleware": major
"@zudolib/observability": major
"@zudolib/openapi": major
"@zudolib/permissions": major
"@zudolib/plugins": major
"@zudolib/queue": major
"@zudolib/rpc": major
"@zudolib/runtime": major
"@zudolib/scheduler": major
"@zudolib/schema": major
"@zudolib/security": major
"@zudolib/serialization": major
"@zudolib/storage": major
"@zudolib/tenancy": major
"@zudolib/testing": major
"@zudolib/transactions": major
"@zudolib/types": major
"@zudolib/validation": major
---

BREAKING CHANGE: Rename all packages from `@zudolib/*` to `@zudolib/*` and `@zudolib/cli` to `zudolib-cli`.

- Scoped packages: `@zudolib/adapters`, `@zudolib/api`, `@zudolib/auth`, etc.
- CLI package: `zudolib-cli` (unscoped)
- All internal imports, docs, CI, and examples updated

Migration:

```bash
# Old
npm install @zudolib/cli
npm install @zudolib/errors

# New
npm install zudolib-cli
npm install @zudolib/errors
```
