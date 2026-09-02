# @oyinlola141/lattice-crypto

Cryptographic primitives — hashing, encryption, signing, password derivation, tokens, and constant-time comparison. Wraps Node's `crypto` with a typed, testable interface.

## When to use

Import this when you need:

- hash passwords (Argon2, scrypt, bcrypt)
- encrypt/decrypt data (AES-256-GCM)
- sign and verify messages (HMAC, Ed25519)
- derive keys (PBKDF2, HKDF)
- generate secure random values
- compare strings in constant time (timing-attack safe)
- issue opaque tokens

## Installation

```bash
npm install @oyinlola141/lattice-crypto
```

## Public API

```typescript
import {
  // Hashing
  sha256,
  sha512,
  blake2b,
  hashPassword,
  verifyPassword,

  // Cipher
  encrypt,
  decrypt,
  generateKey,

  // Signatures
  sign,
  verify,
  createHmac,
  verifyHmac,

  // Key derivation
  deriveKey,
  pbkdf2,
  hkdf,

  // Random
  randomBytes,
  randomUUID,
  randomString,

  // Compare
  timingSafeEqual,

  // Tokens
  generateToken,
  hashToken,
} from "@oyinlola141/lattice-crypto";
```

## Usage

```typescript
import {
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
} from "@oyinlola141/lattice-crypto";

const hash = await hashPassword("hunter2");
const ok = await verifyPassword(hash, "hunter2");

const cipher = encrypt("secret", key);
const plain = decrypt(cipher, key);
```

## License

MIT
