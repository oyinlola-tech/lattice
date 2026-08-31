/**
 * Header-based tenant resolver.
 *
 * @module resolvers/headerResolver
 */

import type { TenantResolver, TenantResolution } from "../../tenancyTypes/resolverTypes.js";
import { createTenantId } from "../../tenancyTypes/tenantIdentity.js";

/** Context type with a getHeader method. */
interface HeaderContext {
  getHeader(name: string): string | undefined;
}

/** Options for the header resolver. */
export interface HeaderResolverOptions {
  readonly headerName?: string;
  readonly priority?: number;
}

/**
 * Create a tenant resolver that reads from an HTTP header.
 */
export function createHeaderResolver(
  options?: HeaderResolverOptions,
): TenantResolver<HeaderContext> {
  const headerName = options?.headerName ?? "x-tenant-id";
  const priority = options?.priority ?? 80;

  return {
    name: "header",
    priority,

    async resolve(context: HeaderContext): Promise<TenantResolution | undefined> {
      const value = context.getHeader(headerName);
      if (!value) return undefined;

      return {
        tenantId: createTenantId(value),
        source: "header",
        trust: "verified",
      };
    },
  };
}
