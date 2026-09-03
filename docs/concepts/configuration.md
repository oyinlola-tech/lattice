# Configuration

Zudo uses a layered configuration system with clear precedence.

## Sources

Configuration is loaded from multiple sources in order of priority:

1. **Environment variables** — highest priority
2. **`.env` files**
3. **`zudo.config.ts` / `zudo.config.js`**
4. **`package.json#zudo`**
5. **Defaults** — lowest priority

## Example

```typescript
// zudo.config.ts
export default {
  architecture: "monolith",
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  http: {
    port: Number(process.env.PORT ?? 3000),
  },
};
```

## Validation

Configuration values are validated at bootstrap. Invalid values produce clear errors before the application starts.

## Sensitive Values

Values matching sensitive patterns (`password`, `secret`, `token`, `api_key`) are auto-redacted in logs and diagnostics.

## Type Safety

Configuration schemas are defined with `@zudolib/schema` or `@zudolib/validation`, giving compile-time safety and runtime validation.
