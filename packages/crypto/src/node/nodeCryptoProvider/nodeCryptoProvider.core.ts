import {
  hash as hashImpl,
  hmac as hmacImpl,
} from "./primitives/nodeCryptoProvider.hash.js";

import {
  encrypt as encryptImpl,
  decrypt as decryptImpl,
} from "./primitives/nodeCryptoProvider.encryption.js";

import {
  sign as signImpl,
  verify as verifyImpl,
} from "./primitives/nodeCryptoProvider.signing.js";

import { deriveKey as deriveKeyImpl } from "./operations/nodeCryptoProvider.derivation.js";

import {
  hashPassword as hashPasswordImpl,
  verifyPassword as verifyPasswordImpl,
} from "./operations/nodeCryptoProvider.password.js";

import {
  randomBytesImpl,
  randomIntImpl,
  randomUUIDImpl,
} from "./primitives/nodeCryptoProvider.random.js";

import type {
  CryptoProvider,
  HashAlgorithm,
  HmacAlgorithm,
  EncryptionAlgorithm,
  SignatureAlgorithm,
  KeyDerivationAlgorithm,
  CryptoInput,
  EncryptedData,
  DeriveKeyOptions,
} from "../../cryptoProvider/index.js";

import type { CryptoCapabilities } from "../../cryptoProvider/cryptoProvider.type.js";

import {
  cryptoHashError,
  cryptoCipherError,
  cryptoSignatureError,
  cryptoKeyDerivationError,
} from "@zudo/errors";

export class NodeCryptoProvider implements CryptoProvider {
  readonly name = "node";
  readonly capabilities: CryptoCapabilities = {
    hash: true,
    hmac: true,
    encryption: true,
    signing: true,
    random: true,
    passwordHashing: true,
    keyDerivation: true,
  };

  async randomBytes(length: number): Promise<Uint8Array> {
    return randomBytesImpl(length);
  }

  async randomInt(min: number, max: number): Promise<number> {
    return randomIntImpl(min, max);
  }

  async randomUUID(): Promise<string> {
    return randomUUIDImpl();
  }

  async hash(algorithm: HashAlgorithm, data: CryptoInput): Promise<Uint8Array> {
    return hashImpl(algorithm, data);
  }

  async hmac(
    algorithm: HmacAlgorithm,
    key: CryptoInput,
    data: CryptoInput,
  ): Promise<Uint8Array> {
    return hmacImpl(algorithm, key, data);
  }

  async encrypt(options: {
    key: CryptoInput;
    plaintext: CryptoInput;
    associatedData?: CryptoInput;
    nonce?: Uint8Array;
  }): Promise<EncryptedData> {
    return encryptImpl(options);
  }

  async decrypt(options: {
    key: CryptoInput;
    encrypted: EncryptedData;
    associatedData?: CryptoInput;
  }): Promise<Uint8Array> {
    return decryptImpl(options);
  }

  async sign(options: {
    key: CryptoInput;
    data: CryptoInput;
    algorithm?: SignatureAlgorithm;
  }): Promise<Uint8Array> {
    return signImpl(options);
  }

  async verify(options: {
    key: CryptoInput;
    data: CryptoInput;
    signature: Uint8Array;
    algorithm?: SignatureAlgorithm;
  }): Promise<boolean> {
    return verifyImpl(options);
  }

  async deriveKey(options: DeriveKeyOptions): Promise<Uint8Array> {
    return deriveKeyImpl(options);
  }

  async hashPassword(
    password: CryptoInput,
    options?: {
      algorithm?: KeyDerivationAlgorithm;
      memoryCost?: number;
      timeCost?: number;
      parallelism?: number;
    },
  ): Promise<string> {
    return hashPasswordImpl(password, options);
  }

  async verifyPassword(password: CryptoInput, hash: string): Promise<boolean> {
    return verifyPasswordImpl(password, hash);
  }
}
