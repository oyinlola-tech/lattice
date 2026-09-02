/**
 * Type definitions for the Lattice CLI scaffolding system.
 */

export type ArchitectureType = "monolith" | "modular-monolith" | "microservice";

export type PackageManager = "npm" | "pnpm" | "yarn";

export type DatabaseEngine = "postgresql" | "mysql" | "sqlite";

export interface ScaffoldOptions {
  readonly projectName: string;
  readonly architecture: ArchitectureType;
  readonly packageManager: PackageManager;
  readonly database: DatabaseEngine;
  readonly services: readonly string[];
  readonly enableCQRS: boolean;
  readonly enableMessaging: boolean;
  readonly enableObservability: boolean;
  readonly enableOpenAPI: boolean;
  readonly enableDatabase: boolean;
  readonly enableQueue: boolean;
  readonly enableDocker: boolean;
  readonly installDeps: boolean;
  readonly initGit: boolean;
}

export interface ProjectTemplate {
  readonly name: ArchitectureType;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
}

export interface GenerateOptions {
  readonly schematic: string;
  readonly name: string;
  readonly service?: string;
  readonly module?: string;
  readonly dryRun: boolean;
}
