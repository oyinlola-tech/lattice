# @zudoliblib/crypto

Cryptographic primitives for hashing, encryption, tokens, and secure random generation.

## Installation

```bash
npm install @zudoliblib/crypto
```

## Quick Start

```typescript
import { hash, encrypt, decrypt, randomBytes } from "@zudoliblib/crypto";

const hashed = await hash("password", "salt");
const token = randomBytes(32);
const encrypted = await encrypt("secret", key);
const decrypted = await decrypt(encrypted, key);
```

## Features

- Hashing (SHA-256, SHA-512, bcrypt, argon2)
- Symmetric encryption (AES-GCM)
- Secure random generation
- Token generation
- Key derivation functions

## Use Cases

- Password hashing
- API token generation
- Data encryption at rest
- Secure random values
