/**
 * Options for PBKDF2 key derivation.
 */
export interface Pbkdf2Options {
  readonly iterations?: number;
  readonly keyLength?: number;
  readonly digest?: "sha256" | "sha384" | "sha512";
  readonly salt?: Uint8Array;
  readonly saltLength?: number;
}

/**
 * Options for scrypt key derivation.
 */
export interface ScryptOptions {
  readonly keyLength?: number;
  readonly cost?: number;
  readonly blockSize?: number;
  readonly parallelization?: number;
  readonly salt?: Uint8Array;
  readonly saltLength?: number;
  readonly maxMemory?: number;
}
