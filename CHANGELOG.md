# Changelog

All notable changes to Zudo will be documented in this file.

The format is based on [Keep a Changelog], and this project follows
Semantic Versioning.

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.0] - 2026-08-31

### Added

- Initial Zudo framework release with 38 packages.
- Core runtime with lifecycle orchestration and dependency ordering.
- Dependency injection container with token-based registration.
- Layered configuration system with source resolvers.
- Structured logging with transport abstraction.
- Shared error hierarchy and utilities.
- Validation layer with Zod integration.
- CQRS command and query infrastructure.
- Event bus with middleware pipeline.
- Database client and repository abstractions.
- HTTP server and request/response primitives.
- In-process message bus infrastructure.
- Background job queue and worker infrastructure.
- Storage abstraction layer with lifecycle management.
- Security primitives including input validation, CORS, CSRF, and rate limiting.
- Observability with metrics, tracing, and context propagation.
- Cryptographic primitives for hashing, encryption, and tokens.
- Serialization framework with JSON serializer and type transformers.
- Schema definition and parsing engine.
- Application and component lifecycle orchestration.
- Adapter registry and transport abstractions.
- Generic authorization engine with RBAC and ABAC support.
- Transaction lifecycle and coordination.
- Multi-tenant context and isolation.
- Feature flag system with deterministic rollouts.
- Documentation infrastructure with registry and validation.

### Changed

- Standardized package exports across the monorepo.
- Established 5-tier dependency hierarchy for cross-package rules.
- Defined architecture governance with `architect-check` validation.

### Security

- Added secure defaults for HTTP security headers.
- Established security design principles across framework packages.

[Keep a Changelog]: https://keepachangelog.com/en/1.1.0/
