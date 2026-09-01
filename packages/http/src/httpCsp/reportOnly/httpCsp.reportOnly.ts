/**
 * CSP Report-Only header helpers.
 */

import type { CSPOptions } from "../types/httpCsp.type.js";
import {
  CONTENT_SECURITY_POLICY_HEADER,
  CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER,
} from "../types/httpCsp.constant.js";
import { createCSP } from "../formatting/httpCsp.formatting.js";

export function createCSPReportOnly(options: CSPOptions): string {
  return createCSP(options).policy;
}

export function createCSPHeaders(
  options: CSPOptions,
  reportOnly = false,
): Readonly<Record<string, string>> {
  const policy = createCSP(options).policy;

  return {
    [reportOnly
      ? CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER
      : CONTENT_SECURITY_POLICY_HEADER]: policy,
  };
}
