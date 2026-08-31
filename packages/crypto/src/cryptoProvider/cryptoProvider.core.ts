import type {
  RandomProvider,
  HashProvider,
  HmacProvider,
  EncryptionProvider,
  SigningProvider,
  KeyDerivationProvider,
  PasswordProvider,
} from "./cryptoProvider.interface.js";

import type { CryptoCapabilities } from "./cryptoProvider.type.js";

/**
 * Complete crypto provider combining all capabilities.
 */
export interface CryptoProvider
  extends
    RandomProvider,
    HashProvider,
    HmacProvider,
    EncryptionProvider,
    SigningProvider,
    KeyDerivationProvider,
    PasswordProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;
}
