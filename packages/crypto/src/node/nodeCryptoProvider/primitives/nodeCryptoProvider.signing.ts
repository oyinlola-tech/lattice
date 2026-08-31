import type { SignatureAlgorithm, CryptoInput } from "../../../cryptoProvider/index.js";
import {
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  sign as signImpl,
  verify as verifyImpl,
} from "node:crypto";
import { toBytes, nodeSignatureAlgorithm } from "../nodeCryptoProvider.helper.js";

export async function sign(options: {
  key: CryptoInput;
  data: CryptoInput;
  algorithm?: SignatureAlgorithm;
}): Promise<Uint8Array> {
  const algorithm = options.algorithm ?? "ed25519";
  const key = toBytes(options.key);
  const data = toBytes(options.data);

  const privateKey = createPrivateKey(key);

  if (algorithm === "ed25519") {
    return new Uint8Array(signImpl(null, data, privateKey));
  }

  const signer = createSign(nodeSignatureAlgorithm(algorithm));
  signer.update(data);
  signer.end();

  return new Uint8Array(signer.sign(privateKey));
}

export async function verify(options: {
  key: CryptoInput;
  data: CryptoInput;
  signature: Uint8Array;
  algorithm?: SignatureAlgorithm;
}): Promise<boolean> {
  const algorithm = options.algorithm ?? "ed25519";
  const key = toBytes(options.key);
  const data = toBytes(options.data);

  const publicKey = createPublicKey(key);

  if (algorithm === "ed25519") {
    return verifyImpl(null, data, publicKey, options.signature);
  }

  const verifier = createVerify(
    nodeSignatureAlgorithm(algorithm),
  );
  verifier.update(data);
  verifier.end();

  return verifier.verify(publicKey, options.signature);
}
