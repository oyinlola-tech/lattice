import { NodeCryptoProvider } from "./nodeCryptoProvider.core.js";
import type { CryptoProvider } from "../../cryptoProvider/index.js";

export function createNodeCryptoProvider(): CryptoProvider {
  return new NodeCryptoProvider();
}
