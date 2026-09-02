# @oyinlola141/lattice-http

HTTP primitives — request/response, headers, status codes, routing, middleware, CORS, CSRF, and security headers. Engine-agnostic (no Fastify/Express coupling).

## When to use

Import this when you need:

- typed request/response, headers, and query parsing
- routing with path params and constraints
- built-in CORS, CSRF, rate limit, CSP, HSTS
- secure defaults (HttpOnly cookies, frame deny, content-type nosniff)

For the higher-level application/router, see `@oyinlola141/lattice-runtime`. For API contracts, see `@oyinlola141/lattice-api`.

## Installation

```bash
npm install @oyinlola141/lattice-http
```

## Public API

```typescript
import {
  // Request / response
  createRequest,
  createResponse,
  type LatticeRequest,
  type LatticeResponse,
  // Methods / status
  HTTP_METHOD,
  HTTP_STATUS,
  // Routing
  Router,
  createRouter,
  type RouteHandler,
  // CORS
  createCorsPolicy,
  isCorsRequest,
  isPreflightRequest,
  // CSP
  createCSP,
  strictCSP,
  apiCSP,
  // HSTS
  strictTransportSecurityHeader,
  // Security Headers
  createSecurityHeaders,
  createRecommendedSecurityHeaders,
  // Cookies
  parseCookies,
  serializeCookie,
  // Negotiation
  acceptContentType,
  acceptEncoding,
  // Validation
  validateQuery,
  validateBody,
} from "@oyinlola141/lattice-http";
```

## Usage

```typescript
import { createRouter, HTTP_STATUS, createCorsPolicy } from "@oyinlola141/lattice-http";

const router = createRouter();
router.get("/health", () => new Response("ok", { status: HTTP_STATUS.OK }));
router.use(createCorsPolicy({ origin: "*" }));
```

## License

MIT
