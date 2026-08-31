import type {
  ModuleId,
} from "./module.js";
import type { Environment } from "@lattice/constants";

/**
 * Environment in which a module is intended to run.
 * Re-exports Environment from @lattice/constants for backwards compatibility.
 */
export type ModuleEnvironment = Environment;

/**
 * Category describing the role of a module.
 */
export type ModuleCategory =
  | "application"
  | "infrastructure"
  | "domain"
  | "integration"
  | "transport"
  | "observability"
  | "security"
  | "system"
  | "custom";

/**
 * Metadata describing a Lattice module.
 *
 * Metadata is descriptive only. It does not control
 * module lifecycle or dependency resolution.
 */
export interface ModuleMetadata {
  /**
   * Human-readable description.
   */
  readonly description?: string;

  /**
   * Module author or owning team.
   */
  readonly author?: string;

  /**
   * Optional homepage or documentation URL.
   */
  readonly homepage?: string;

  /**
   * Optional source repository URL.
   */
  readonly repository?: string;

  /**
   * Module category.
   */
  readonly category?: ModuleCategory;

  /**
   * Tags used for discovery and filtering.
   */
  readonly tags?: readonly string[];

  /**
   * Environments in which the module is enabled.
   *
   * If omitted, the module is considered valid for
   * every environment.
   */
  readonly environments?:
    readonly ModuleEnvironment[];

  /**
   * Whether this module is considered experimental.
   */
  readonly experimental?: boolean;

  /**
   * Whether this module is deprecated.
   */
  readonly deprecated?: boolean;

  /**
   * Optional deprecation message.
   */
  readonly deprecationMessage?: string;

  /**
   * Optional replacement module identifier.
   */
  readonly replacement?: ModuleId;

  /**
   * Arbitrary metadata extensions.
   *
   * Framework and application modules can use this for
   * additional descriptive information without changing
   * the core contract.
   */
  readonly extra?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Options used to construct normalized module metadata.
 */
export interface ModuleMetadataOptions
  extends ModuleMetadata {}

/**
 * Creates immutable module metadata.
 */
export function createModuleMetadata(
  options: ModuleMetadataOptions = {},
): ModuleMetadata {
  const metadata: ModuleMetadata = {
    description:
      normalizeOptionalString(
        options.description,
      ),

    author:
      normalizeOptionalString(
        options.author,
      ),

    homepage:
      normalizeOptionalString(
        options.homepage,
      ),

    repository:
      normalizeOptionalString(
        options.repository,
      ),

    category:
      options.category,

    tags:
      normalizeTags(
        options.tags,
      ),

    environments:
      normalizeEnvironments(
        options.environments,
      ),

    experimental:
      options.experimental ??
      false,

    deprecated:
      options.deprecated ??
      false,

    deprecationMessage:
      normalizeOptionalString(
        options.deprecationMessage,
      ),

    replacement:
      normalizeOptionalString(
        options.replacement,
      ),

    extra:
      options.extra
        ? Object.freeze({
            ...options.extra,
          })
        : undefined,
  };

  validateModuleMetadata(
    metadata,
  );

  return Object.freeze(
    metadata,
  );
}

/**
 * Merges two metadata objects.
 *
 * Values from `override` take precedence.
 */
export function mergeModuleMetadata(
  base?: ModuleMetadata,
  override?: ModuleMetadata,
): ModuleMetadata {
  if (!base && !override) {
    return createModuleMetadata();
  }

  return createModuleMetadata({
    ...(base ?? {}),
    ...(override ?? {}),

    tags: [
      ...(base?.tags ?? []),
      ...(override?.tags ?? []),
    ],

    environments:
      override?.environments ??
      base?.environments,

    extra: {
      ...(base?.extra ?? {}),
      ...(override?.extra ?? {}),
    },
  });
}

/**
 * Determines whether a module is enabled for an environment.
 */
export function isModuleEnabledForEnvironment(
  metadata: ModuleMetadata | undefined,
  environment: ModuleEnvironment,
): boolean {
  if (
    !metadata?.environments ||
    metadata.environments.length === 0
  ) {
    return true;
  }

  return metadata.environments.includes(
    environment,
  );
}

/**
 * Determines whether a module is deprecated.
 */
export function isModuleDeprecated(
  metadata: ModuleMetadata | undefined,
): boolean {
  return metadata?.deprecated === true;
}

/**
 * Determines whether a module is experimental.
 */
export function isModuleExperimental(
  metadata: ModuleMetadata | undefined,
): boolean {
  return metadata?.experimental === true;
}

/**
 * Creates a compact metadata object suitable for
 * diagnostics and runtime inspection.
 *
 * This intentionally excludes arbitrary `extra` data.
 */
export function getModuleMetadataSummary(
  metadata?: ModuleMetadata,
): Readonly<Record<string, unknown>> {
  if (!metadata) {
    return {};
  }

  return Object.freeze({
    description:
      metadata.description,

    author:
      metadata.author,

    category:
      metadata.category,

    tags:
      metadata.tags,

    environments:
      metadata.environments,

    experimental:
      metadata.experimental,

    deprecated:
      metadata.deprecated,

    replacement:
      metadata.replacement,
  });
}

/**
 * Normalizes an optional string.
 */
function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}

/**
 * Normalizes module tags.
 *
 * Tags are trimmed, empty tags are removed, and duplicates
 * are removed while preserving insertion order.
 */
function normalizeTags(
  tags:
    | readonly string[]
    | undefined,
): readonly string[] | undefined {
  if (
    !tags ||
    tags.length === 0
  ) {
    return undefined;
  }

  const normalized =
    new Set<string>();

  for (const tag of tags) {
    const value =
      tag.trim();

    if (value.length > 0) {
      normalized.add(value);
    }
  }

  if (normalized.size === 0) {
    return undefined;
  }

  return Object.freeze([
    ...normalized,
  ]);
}

/**
 * Normalizes supported environments.
 */
function normalizeEnvironments(
  environments:
    | readonly ModuleEnvironment[]
    | undefined,
):
  | readonly ModuleEnvironment[]
  | undefined {
  if (
    !environments ||
    environments.length === 0
  ) {
    return undefined;
  }

  return Object.freeze([
    ...new Set(
      environments,
    ),
  ]);
}

/**
 * Validates metadata consistency.
 */
function validateModuleMetadata(
  metadata: ModuleMetadata,
): void {
  if (
    metadata.deprecated &&
    metadata.deprecationMessage ===
      undefined &&
    metadata.replacement ===
      undefined
  ) {
    throw new TypeError(
      "Deprecated modules should provide either a deprecationMessage or replacement module.",
    );
  }

  if (
    metadata.homepage &&
    !isValidUrl(
      metadata.homepage,
    )
  ) {
    throw new TypeError(
      `Invalid module homepage URL: ${metadata.homepage}`,
    );
  }

  if (
    metadata.repository &&
    !isValidUrl(
      metadata.repository,
    )
  ) {
    throw new TypeError(
      `Invalid module repository URL: ${metadata.repository}`,
    );
  }
}

/**
 * Validates a URL without requiring network access.
 */
function isValidUrl(
  value: string,
): boolean {
  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}