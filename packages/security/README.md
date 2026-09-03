# @zudolib/security

Security primitives for input validation, header security, CORS, CSRF protection, rate limiting, and security headers.

## Installation

```bash
npm install @zudolib/security
```

## Quick Start

```typescript
import { createRateLimiter, cors, securityHeaders } from "@zudolib/security";

const limiter = createRateLimiter({ windowMs: 60000, max: 100 });

app.use(limiter);
app.use(cors({ origin: "https://example.com" }));
app.use(securityHeaders());
```

## Features

- Input validation and sanitization
- CORS configuration
- CSRF token generation and validation
- Rate limiting with sliding window
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- URL normalization and SSRF protection

## Use Cases

- Securing HTTP endpoints
- Preventing injection attacks
- Rate limiting public APIs
- Compliance with security headers standards
