/**
 * Package manager interface for framework-agnostic package operations.
 *
 * @module adapters/package-managers
 */

/**
 * Package manager contract.
 */
export interface PackageManager {
  readonly name: string;

  /**
   * Checks if the package manager is installed.
   */
  isInstalled(): Promise<boolean>;

  /**
   * Installs all dependencies from package.json.
   */
  install(projectPath: string): Promise<void>;

  /**
   * Adds production dependencies.
   */
  add(projectPath: string, packages: readonly string[]): Promise<void>;

  /**
   * Adds development dependencies.
   */
  addDev(projectPath: string, packages: readonly string[]): Promise<void>;

  /**
   * Runs a script defined in package.json.
   */
  run(projectPath: string, script: string): Promise<void>;

  /**
   * Gets the install command for display purposes.
   */
  getInstallCommand(): string;
}
