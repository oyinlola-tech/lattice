/**
 * Tenant identity types.
 *
 * @module tenancyTypes/tenantIdentity
 */

/** Branded tenant ID type. */
declare const TenantIdBrand: unique symbol;

/** A unique, validated tenant identifier. */
export type TenantId = string & { readonly [TenantIdBrand]: true };

/** Create a validated TenantId. */
export function createTenantId(value: string): TenantId {
  if (!value || value.trim().length === 0) {
    throw new Error("TenantId cannot be empty");
  }
  return value as TenantId;
}

/** Tenant lifecycle status. */
export type TenantStatus =
  | "provisioning"
  | "active"
  | "inactive"
  | "suspended"
  | "deleting"
  | "deleted";

/** Database isolation strategy for tenant data. */
export type TenantIsolationStrategy =
  | "shared"
  | "schema"
  | "database"
  | "hybrid";

/** Tenancy execution mode. */
export type TenancyMode = "tenant" | "system";
