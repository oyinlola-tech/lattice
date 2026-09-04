/**
 * @zudojs/adapters/metadata
 *
 * Adapter metadata — identification and compatibility information.
 */

/**
 * Adapter metadata.
 *
 * Provides identification, versioning, and compatibility information
 * for diagnostics and tooling.
 */
export interface AdapterMetadata {
  /** Adapter name. */
  readonly name: string;

  /** Adapter version. */
  readonly version: string;

  /** Human-readable description. */
  readonly description?: string;

  /** Adapter author. */
  readonly author?: string;

  /** Adapter homepage URL. */
  readonly homepage?: string;

  /** Repository URL. */
  readonly repository?: string;

  /** License identifier. */
  readonly license?: string;

  /** Zudojs version compatibility range. */
  readonly zudojs?: string;

  /** Runtime version compatibility (e.g., "node >=18", "bun", "deno"). */
  readonly runtime?: string;

  /** Peer dependencies. */
  readonly peerDependencies?: Readonly<Record<string, string>>;
}
