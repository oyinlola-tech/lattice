# @oyinlola141/lattice-security

Input validation, header security, URL normalization, CORS, CSRF, rate limiting, and security headers. All the cross-cutting security primitives in one place.

## When to use

Import this when you need:

- `sanitizeString`, `sanitizeObject`, `containsSqlInjection`, `containsXss`
- secure default headers (CSP, HSTS, X-Frame-Options, nosniff, referrer policy)
- CORS configuration with typed policies
- CSRF token generation and verification
- rate limiting (token bucket, fixed window, sliding window)

## Installation

```bash
npm install @oyinlola141/lattice-security
```

## Public API

```typescript
import {
  // Input
  sanitizeString,
  sanitizeObject,
  containsSqlInjection,
  containsXss,
  // Headers
  securityHeaders,
  hsts,
  csp,
  referrerPolicy,
  SECURITY_HEADER_NAMES,
  // CORS / CSRF
  cors,
  csrf,
  type CorsHeaders,
  type CorsOptions,
  // Rate limit
  rateLimit,
  tokenBucket,
  fixedWindow,
  slidingWindow,
  type RateLimitOptions,
  type RateLimitResult,
  // URL
  normalizeUrl,
  isSafeRedirectUrl,
} from "@oyinlola141/lattice-security";
```

## Usage

```typescript
import {
  cors,
  rateLimit,
  securityHeaders,
} from "@oyinlola141/lattice-security";

router.use(cors({ origin: ["https://app.example.com"] }));
router.use(rateLimit({ window: 60_000, max: 100 }));
router.use(securityHeaders());
```

## License

MIT
