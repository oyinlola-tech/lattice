/**
 * @zudolib/http/httpCsp
 *
 * Content Security Policy (CSP) utilities — parsing, formatting, validation,
 * and policy helpers for the Content-Security-Policy HTTP response header.
 */

export type {
  CSPDirectiveValue,
  CSPDirectives,
  CSPOptions,
  CSPNonceOptions,
  CSPResult,
} from "./types/httpCsp.type.js";

export type { CSPDirectiveName } from "./types/httpCsp.constant.js";

export {
  CONTENT_SECURITY_POLICY_HEADER,
  CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER,
  DEFAULT_NONCE_LENGTH,
  CSP_DIRECTIVES,
} from "./types/httpCsp.constant.js";

export {
  parseCSP,
  getCSPDirective,
  hasCSPDirective,
  getEffectiveDirective,
} from "./parsing/httpCsp.parsing.js";

export { formatCSP, createCSP } from "./formatting/httpCsp.formatting.js";

export { strictCSP, apiCSP, browserCSP } from "./policies/httpCsp.policies.js";

export {
  generateCSPNonce,
  createNonceSource,
  createHashSource,
  isValidNonce,
} from "./nonce/httpCsp.nonce.js";

export {
  isSelfSource,
  isNoneSource,
  isUnsafeInlineSource,
  isUnsafeEvalSource,
  isNonceSource,
  isHashSource,
} from "./sources/httpCsp.sources.js";

export {
  allowsSource,
  allowsInlineScript,
  allowsEval,
  allowsNonce,
} from "./checks/httpCsp.checks.js";

export { validateCSP } from "./validation/httpCsp.validate.js";

export { isValidDirectiveName } from "./validation/httpCsp.validation.js";

export {
  createCSPReportOnly,
  createCSPHeaders,
} from "./reportOnly/httpCsp.reportOnly.js";
