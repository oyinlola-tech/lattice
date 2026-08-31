/**
 * Plugin dependency declaration.
 */
export interface PluginDependency {
  readonly name: string;

  readonly version?: string;

  readonly optional?: boolean;
}
