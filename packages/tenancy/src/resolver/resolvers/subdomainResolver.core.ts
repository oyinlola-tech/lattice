/**
 * Subdomain-based tenant resolver.
 *
 * @module resolvers/subdomainResolver
 */

import type {
  TenantResolver,
  TenantResolution,
} from "../../tenancyTypes/resolverTypes.js";
import { createTenantId } from "../../tenancyTypes/tenantIdentity.js";

/** Context type with a getHost method. */
interface SubdomainContext {
  getHost(): string | undefined;
}

/** Options for the subdomain resolver. */
export interface SubdomainResolverOptions {
  /** Base domain to strip (e.g. "example.com"). If not set, uses first segment. */
  readonly baseDomain?: string;
  readonly priority?: number;
}

/**
 * Create a tenant resolver that extracts tenant from subdomain.
 *
 * Example: "acme.example.com" → tenant "acme"
 */
export function createSubdomainResolver(
  options?: SubdomainResolverOptions,
): TenantResolver<SubdomainContext> {
  const priority = options?.priority ?? 70;

  return {
    name: "subdomain",
    priority,

    async resolve(
      context: SubdomainContext,
    ): Promise<TenantResolution | undefined> {
      const host = context.getHost();
      if (!host) return undefined;

      // Strip port
      const hostname = host.split(":")[0]!;
      if (!hostname) return undefined;

      let subdomain: string | undefined;

      if (options?.baseDomain) {
        if (hostname.endsWith(`.${options.baseDomain}`)) {
          subdomain = hostname.slice(0, -(options.baseDomain.length + 1));
        }
      } else {
        // Use first segment
        const parts = hostname.split(".");
        if (parts.length > 2) {
          subdomain = parts[0];
        }
      }

      if (!subdomain || subdomain === "www") return undefined;

      return {
        tenantId: createTenantId(subdomain),
        source: "subdomain",
        trust: "verified",
      };
    },
  };
}
