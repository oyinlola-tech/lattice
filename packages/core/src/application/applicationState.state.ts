/**
 * Represents the lifecycle state of a Lattice application.
 */
export type ApplicationState =
  | "created"
  | "initializing"
  | "initialized"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";