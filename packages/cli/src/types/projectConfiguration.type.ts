/**
 * Project configuration types.
 *
 * @module types/projectConfiguration
 */

/**
 * Project type.
 */
export type ProjectType = "backend" | "frontend" | "fullstack";

/**
 * Backend architecture.
 */
export type BackendArchitecture =
  "monolith" | "modular-monolith" | "microservice";

/**
 * Frontend framework.
 */
export type FrontendFramework =
  | "react"
  | "next"
  | "vue"
  | "nuxt"
  | "angular"
  | "svelte"
  | "sveltekit"
  | "astro"
  | "vanilla"
  | "flutter"
  | "react-native";

/**
 * Frontend architecture.
 */
export type FrontendArchitecture =
  "lattice-standard" | "feature-based" | "minimal" | "framework-default";

/**
 * Database provider.
 */
export type DatabaseProvider = "postgresql" | "mysql" | "sqlite" | "mongodb";

/**
 * API style.
 */
export type ApiStyle = "rest" | "graphql" | "rpc";

/**
 * Package manager.
 */
export type PackageManagerType = "pnpm" | "npm" | "yarn" | "bun";

/**
 * Project configuration.
 */
export interface ProjectConfiguration {
  readonly name: string;
  readonly type: ProjectType;
  readonly backend?: {
    readonly architecture: BackendArchitecture;
    readonly api?: ApiStyle;
    readonly database?: DatabaseProvider;
  };
  readonly frontend?: {
    readonly framework: FrontendFramework;
    readonly architecture: FrontendArchitecture;
    readonly language?: "typescript" | "javascript";
  };
  readonly workspace?: {
    readonly packageManager: PackageManagerType;
  };
  readonly features?: readonly string[];
}

/**
 * Scaffold options for project generation.
 */
export interface ScaffoldOptions {
  readonly projectName: string;
  readonly architecture: BackendArchitecture;
  readonly language?: "typescript" | "javascript";
  readonly packageManager?: PackageManagerType;
  readonly initGit?: boolean;
  readonly installDeps?: boolean;
  readonly features?: readonly string[];
  readonly frontend?: FrontendFramework;
  readonly frontendPath?: string;
}
