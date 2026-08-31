/**
 * Plugin metadata identifying a plugin uniquely.
 */
export interface PluginMetadata {
  readonly name: string;

  readonly version?: string;

  readonly description?: string;

  readonly author?: string;

  readonly homepage?: string;

  readonly keywords?: readonly string[];

  readonly capabilities?: readonly string[];
}
